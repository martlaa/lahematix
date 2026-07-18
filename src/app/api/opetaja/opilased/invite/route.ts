import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { nanoid } from 'nanoid';
import { sendMail, consentInviteEmailHtml, questionnaireInviteEmailHtml } from '@/lib/mail';

const INVITE_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 730; // ~2 aastat

type Purpose = 'CONSENT' | 'QUESTIONNAIRE_EEL' | 'QUESTIONNAIRE_JAREL';

const QUESTIONNAIRE_CODE_BY_PURPOSE: Record<'QUESTIONNAIRE_EEL' | 'QUESTIONNAIRE_JAREL', string> = {
  QUESTIONNAIRE_EEL: 'lisa4-eel',
  QUESTIONNAIRE_JAREL: 'lisa4-jarel',
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) {
    return NextResponse.json({ error: 'Õpetaja profiili ei leitud' }, { status: 404 });
  }

  const form = await req.formData();
  const classCode = String(form.get('classCode') ?? '').trim();
  const selectedIds = form.getAll('studentIds').map(String).filter(Boolean);
  const purpose = (String(form.get('purpose') ?? 'CONSENT') as Purpose) || 'CONSENT';

  if (!classCode && selectedIds.length === 0) {
    return NextResponse.json({ error: 'Vali vähemalt üks õpilane või klass, kellele kutse saata' }, { status: 400 });
  }

  const isQuestionnaire = purpose === 'QUESTIONNAIRE_EEL' || purpose === 'QUESTIONNAIRE_JAREL';
  const questionnaireCode = isQuestionnaire ? QUESTIONNAIRE_CODE_BY_PURPOSE[purpose] : undefined;

  const students = await prisma.student.findMany({
    where: classCode
      ? { teacherId: teacher.id, classCode }
      : { teacherId: teacher.id, id: { in: selectedIds } },
    include: {
      consentRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
      inviteTokens: { where: { purpose }, orderBy: { createdAt: 'desc' }, take: 1 },
      questionnaireResponses: questionnaireCode ? { where: { questionnaireCode } } : false,
    },
  });

  let sent = 0;
  let skipped = 0;
  const errors: { name: string; message: string }[] = [];

  for (const student of students) {
    const hasConsent = student.consentRecords[0]?.status === 'ANTUD';

    if (isQuestionnaire) {
      if (!hasConsent) {
        errors.push({ name: student.name, message: 'Nõusolek uuringus osalemiseks puudub' });
        continue;
      }
      if (student.questionnaireResponses.length > 0) {
        skipped++;
        continue;
      }
    } else if (hasConsent) {
      skipped++;
      continue;
    }

    const isMinor = !student.isFifteenOrOlder;
    // Küsimustik käib alati õpilase enda e-postile, olenemata vanusest — nõusolek
    // seevastu käib alla 15a puhul lapsevanemale (vt arendusplaan punkt 1a).
    const recipientEmail = isQuestionnaire ? student.email : isMinor ? student.parentEmail : student.email;
    const recipientName = isQuestionnaire ? student.name : isMinor ? student.parentName : student.name;

    if (!recipientEmail) {
      errors.push({ name: student.name, message: 'Lapsevanema e-post puudub' });
      continue;
    }

    let token = student.inviteTokens[0];
    if (!token || token.expiresAt < new Date()) {
      token = await prisma.inviteToken.create({
        data: {
          token: nanoid(24),
          studentId: student.id,
          purpose,
          expiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
        },
      });
    }

    const link = isQuestionnaire
      ? `${process.env.APP_BASE_URL}/opilane/kysimustik/${token.token}`
      : isMinor
        ? `${process.env.APP_BASE_URL}/lapsevanem/nousolek/${token.token}`
        : `${process.env.APP_BASE_URL}/opilane/nousolek/${token.token}`;

    if (process.env.NODE_ENV !== 'production') {
      // Kohalikus arenduses, kui SMTP pole seadistatud, saab lingi siit konsoolist kopeerida.
      const kind = isQuestionnaire ? 'küsimustik' : isMinor ? 'lapsevanem' : 'õpilane';
      console.log(`[DEV] Kutse (${kind}) ${student.name}: ${link}`);
    }

    try {
      await sendMail({
        to: recipientEmail,
        subject: isQuestionnaire
          ? 'LAHEMATE projekt — kutse küsimustiku täitmiseks'
          : 'LAHEMATE projekt — kutse nõusolekuvormi täitmiseks',
        html: isQuestionnaire
          ? questionnaireInviteEmailHtml({ name: recipientName ?? '', link })
          : consentInviteEmailHtml({
              name: recipientName ?? '',
              link,
              forChildName: isMinor ? student.name : undefined,
              formal: isMinor, // 15+ õpilasele endale pöördutakse mitteformaalselt ("Sul")
            }),
      });
      sent++;
    } catch (err) {
      console.error('Kutse saatmine ebaõnnestus:', err);
      errors.push({ name: student.name, message: 'E-kirja saatmine ebaõnnestus' });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'SEND_INVITE',
      entity: 'Student',
      entityId: teacher.id,
      meta: `purpose=${purpose}, sent=${sent}, skipped=${skipped}, errors=${errors.length}`,
    },
  });

  const params = new URLSearchParams();
  params.set('sent', String(sent));
  params.set('skipped', String(skipped));
  if (errors.length > 0) {
    params.set('inviteErrors', JSON.stringify(errors.slice(0, 25)));
  }

  return NextResponse.redirect(new URL(`/opetaja/opilased?${params.toString()}`, req.url), 303);
}
