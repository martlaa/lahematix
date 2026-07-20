import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { nanoid } from 'nanoid';
import { sendMail, consentInviteEmailHtml } from '@/lib/mail';

const INVITE_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 730; // ~2 aastat

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const schoolId = String(form.get('schoolId') ?? '');

  const school = await prisma.school.findUnique({ where: { id: schoolId } });
  if (!school) {
    return NextResponse.json({ error: 'Kooli ei leitud' }, { status: 404 });
  }
  if (!school.directorEmail) {
    return NextResponse.json({ error: 'Koolijuhi e-post puudub' }, { status: 400 });
  }

  let token = await prisma.inviteToken.findFirst({ where: { schoolId: school.id }, orderBy: { createdAt: 'desc' } });
  if (!token || token.expiresAt < new Date()) {
    token = await prisma.inviteToken.create({
      data: { token: nanoid(24), schoolId: school.id, expiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS) },
    });
  }

  const link = `${process.env.APP_BASE_URL}/koolijuht/nousolek/${token.token}`;

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEV] Nõusolekukutse (koolijuht) ${school.name}: ${link}`);
  }

  try {
    await sendMail({
      to: school.directorEmail,
      subject: 'LAHEMATE projekt — kutse nõusolekuvormi täitmiseks',
      html: consentInviteEmailHtml({ name: school.directorName ?? '', link }),
    });
  } catch (err) {
    console.error('Nõusolekukutse saatmine ebaõnnestus:', err);
    return NextResponse.json({ error: 'E-kirja saatmine ebaõnnestus' }, { status: 502 });
  }

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'SEND_INVITE', entity: 'School', entityId: school.id },
  });

  return NextResponse.redirect(new URL('/admin', process.env.APP_BASE_URL || req.url), 303);
}
