import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { sendMail, inviteEmailHtml } from '@/lib/mail';
import { generateTeacherPseudonym } from '@/lib/pseudonym';

const roleLabels: Record<string, string> = {
  TEADUR: 'teadur',
  OPETAJA: 'õpetaja-uurija',
};

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const role = String(form.get('role') ?? '');
  const schoolId = String(form.get('schoolId') ?? '') || null;

  if (!name || !email || !['TEADUR', 'OPETAJA'].includes(role)) {
    return NextResponse.json({ error: 'Puuduvad kohustuslikud väljad' }, { status: 400 });
  }
  if (role === 'OPETAJA' && !schoolId) {
    return NextResponse.json({ error: 'Õpetajale tuleb kool valida' }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: { name, role: role as any },
    create: { name, email, role: role as any, status: 'INVITED' },
  });

  if (role === 'OPETAJA' && schoolId) {
    let pseudonymCode = generateTeacherPseudonym();
    for (let i = 0; i < 5; i++) {
      const exists = await prisma.teacher.findUnique({ where: { pseudonymCode } });
      if (!exists) break;
      pseudonymCode = generateTeacherPseudonym();
    }

    await prisma.teacher.upsert({
      where: { userId: user.id },
      update: { schoolId },
      create: { userId: user.id, schoolId, pseudonymCode },
    });
  }

  const loginLink = `${process.env.APP_BASE_URL}/login`;
  try {
    await sendMail({
      to: email,
      subject: 'Kutse LAHEMATE uuringurakendusse',
      html: inviteEmailHtml({ name, link: loginLink, roleLabel: roleLabels[role] }),
    });
  } catch (err) {
    // E-posti saatmine ei tohi katkestada kasutaja loomist — logime vea, aga jätkame.
    console.error('Kutse e-kirja saatmine ebaõnnestus:', err);
  }

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'INVITE', entity: 'User', entityId: user.id, meta: role },
  });

  return NextResponse.redirect(new URL('/admin/kasutajad', process.env.APP_BASE_URL || req.url), 303);
}
