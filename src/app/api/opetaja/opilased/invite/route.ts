import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { nanoid } from 'nanoid';
import { sendMail, consentInviteEmailHtml } from '@/lib/mail';

const INVITE_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 730; // ~2 aastat

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

  if (!classCode && selectedIds.length === 0) {
    return NextResponse.json({ error: 'Vali vähemalt üks õpilane või klass, kellele kutse saata' }, { status: 400 });
  }

  const students = await prisma.student.findMany({
    where: classCode
      ? { teacherId: teacher.id, classCode }
      : { teacherId: teacher.id, id: { in: selectedIds } },
    include: {
      consentRecords: { orderBy: { createdAt: 'desc' }, take: 1 },
      inviteTokens: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
  });

  let sent = 0;
  let skipped = 0;
  const errors: { name: string; message: string }[] = [];

  for (const student of students) {
    const alreadyConsented = student.consentRecords[0]?.status === 'ANTUD';
    if (alreadyConsented) {
      skipped++;
      continue;
    }

    const isMinor = !student.isFifteenOrOlder;
    const recipientEmail = isMinor ? student.parentEmail : student.email;
    const recipientName = isMinor ? student.parentName : student.name;

    if (!recipientEmail) {
      errors.push({ name: student.name, message: 'Lapsevanema e-post puudub' });
      continue;
    }

    let token = student.inviteTokens[0];
    if (!token || token.expiresAt < new Date()) {
      token = await prisma.inviteToken.create({
        data: { token: nanoid(24), studentId: student.id, expiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS) },
      });
    }

    const link = isMinor
      ? `${process.env.APP_BASE_URL}/lapsevanem/nousolek/${token.token}`
      : `${process.env.APP_BASE_URL}/opilane/nousolek/${token.token}`;

    if (process.env.NODE_ENV !== 'production') {
      // Kohalikus arenduses, kui SMTP pole seadistatud, saab lingi siit konsoolist kopeerida.
      console.log(`[DEV] Nõusolekukutse (${isMinor ? 'lapsevanem' : 'õpilane'}) ${student.name}: ${link}`);
    }

    try {
      await sendMail({
        to: recipientEmail,
        subject: 'LAHEMATE projekt — kutse nõusolekuvormi täitmiseks',
        html: consentInviteEmailHtml({
          name: recipientName ?? '',
          link,
          forChildName: isMinor ? student.name : undefined,
          formal: isMinor, // 15+ õpilasele endale pöördutakse mitteformaalselt ("Sul")
        }),
      });
      sent++;
    } catch (err) {
      console.error('Nõusolekukutse saatmine ebaõnnestus:', err);
      errors.push({ name: student.name, message: 'E-kirja saatmine ebaõnnestus' });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'SEND_INVITE',
      entity: 'Student',
      entityId: teacher.id,
      meta: `sent=${sent}, skipped=${skipped}, errors=${errors.length}`,
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
