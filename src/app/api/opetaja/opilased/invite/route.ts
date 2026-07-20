import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { nanoid } from 'nanoid';
import { sendMail, consentInviteEmailHtml, questionnaireInviteEmailHtml, testInviteEmailHtml } from '@/lib/mail';
import { getTestByGradeBand } from '@/lib/tests';

const INVITE_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 730; // ~2 aastat

type Purpose = 'CONSENT' | 'QUESTIONNAIRE_EEL' | 'QUESTIONNAIRE_JAREL' | 'TEST_EEL' | 'TEST_JAREL';

const QUESTIONNAIRE_CODE_BY_PURPOSE: Record<'QUESTIONNAIRE_EEL' | 'QUESTIONNAIRE_JAREL', string> = {
  QUESTIONNAIRE_EEL: 'lisa4-eel',
  QUESTIONNAIRE_JAREL: 'lisa4-jarel',
};

const TEST_PHASE_BY_PURPOSE: Record<'TEST_EEL' | 'TEST_JAREL', 'EEL' | 'JAREL'> = {
  TEST_EEL: 'EEL',
  TEST_JAREL: 'JAREL',
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

  const isTest = purpose === 'TEST_EEL' || purpose === 'TEST_JAREL';
  const testPhase = isTest ? TEST_PHASE_BY_PURPOSE[purpose] : undefined;
  const testDefinition = isTest && teacher.gradeBand ? getTestByGradeBand(teacher.gradeBand) : undefined;

  if (isTest && !testDefinition) {
    return NextResponse.json(
      { error: 'Määra enne testi kutse saatmist oma vanuseaste töölaual ("Minu andmed" plokis).' },
      { status: 400 },
    );
  }

  const students = await prisma.student.findMany({
    where: classCode
      ? { teacherId: teacher.id, classCode }
      : { teacherId: teacher.id, id: { in: selectedIds } },
    include: {
      consentRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
      inviteTokens: { where: { purpose }, orderBy: { createdAt: 'desc' }, take: 1 },
      questionnaireResponses: questionnaireCode ? { where: { questionnaireCode } } : false,
      testSubmissions: testDefinition ? { where: { testCode: testDefinition.code, phase: testPhase } } : false,
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
    } else if (isTest) {
      if (!hasConsent) {
        errors.push({ name: student.name, message: 'Nõusolek uuringus osalemiseks puudub' });
        continue;
      }
      if (student.testSubmissions.length > 0) {
        skipped++;
        continue;
      }
    } else if (hasConsent) {
      skipped++;
      continue;
    }

    const isMinor = !student.isFifteenOrOlder;
    // Küsimustik/test käib alati õpilase enda e-postile, olenemata vanusest —
    // nõusolek seevastu käib alla 15a puhul lapsevanemale (vt arendusplaan punkt 1a).
    const recipientEmail = isQuestionnaire || isTest ? student.email : isMinor ? student.parentEmail : student.email;
    const recipientName = isQuestionnaire || isTest ? student.name : isMinor ? student.parentName : student.name;

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
      : isTest
        ? `${process.env.APP_BASE_URL}/opilane/test/${token.token}`
        : isMinor
          ? `${process.env.APP_BASE_URL}/lapsevanem/nousolek/${token.token}`
          : `${process.env.APP_BASE_URL}/opilane/nousolek/${token.token}`;

    if (process.env.NODE_ENV !== 'production') {
      // Kohalikus arenduses, kui SMTP pole seadistatud, saab lingi siit konsoolist kopeerida.
      const kind = isQuestionnaire ? 'küsimustik' : isTest ? 'test' : isMinor ? 'lapsevanem' : 'õpilane';
      console.log(`[DEV] Kutse (${kind}) ${student.name}: ${link}`);
    }

    try {
      await sendMail({
        to: recipientEmail,
        subject: isQuestionnaire
          ? 'LAHEMATE projekt — kutse küsimustiku täitmiseks'
          : isTest
            ? 'LAHEMATE projekt — kutse testi sooritamiseks'
            : 'LAHEMATE projekt — kutse nõusolekuvormi täitmiseks',
        html: isQuestionnaire
          ? questionnaireInviteEmailHtml({ name: recipientName ?? '', link })
          : isTest
            ? testInviteEmailHtml({ name: recipientName ?? '', link })
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

  return NextResponse.redirect(new URL(`/opetaja/opilased?${params.toString()}`, process.env.APP_BASE_URL || req.url), 303);
}
