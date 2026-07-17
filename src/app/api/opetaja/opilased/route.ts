import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { generatePseudonym } from '@/lib/pseudonym';
import { nanoid } from 'nanoid';
import { sendMail, inviteEmailHtml } from '@/lib/mail';

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
  const group = String(form.get('group') ?? 'INTERVENTSIOON');
  const birthYearRaw = form.get('birthYear');
  const birthYear = birthYearRaw ? Number(birthYearRaw) : null;
  const gender = String(form.get('gender') ?? '') || null;
  const isFifteenOrOlder = form.get('isFifteenOrOlder') === 'on';
  const parentName = String(form.get('parentName') ?? '').trim();
  const parentEmail = String(form.get('parentEmail') ?? '').trim().toLowerCase();

  // Genereeri kordumatu pseudonüüm (proovi paar korda, kui juhtub kokkulangevus).
  let pseudonymCode = generatePseudonym();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.student.findUnique({ where: { pseudonymCode } });
    if (!exists) break;
    pseudonymCode = generatePseudonym();
  }

  let parentId: string | null = null;

  if (!isFifteenOrOlder) {
    if (!parentName || !parentEmail) {
      return NextResponse.json(
        { error: 'Alla 15-aastase õpilase puhul on lapsevanema nimi ja e-post kohustuslikud' },
        { status: 400 },
      );
    }
    const parentUser = await prisma.user.upsert({
      where: { email: parentEmail },
      update: { name: parentName },
      create: { name: parentName, email: parentEmail, role: 'LAPSEVANEM', status: 'INVITED' },
    });
    const parent = await prisma.parent.upsert({
      where: { userId: parentUser.id },
      update: {},
      create: { userId: parentUser.id },
    });
    parentId = parent.id;

    try {
      await sendMail({
        to: parentEmail,
        subject: 'LAHEMATE projekt — nõusoleku vorm Teie lapse osalemiseks',
        html: inviteEmailHtml({
          name: parentName,
          link: `${process.env.APP_BASE_URL}/login`,
          roleLabel: 'lapsevanem',
        }),
      });
    } catch (err) {
      console.error('Lapsevanema kutse saatmine ebaõnnestus:', err);
    }
  }

  const student = await prisma.student.create({
    data: {
      pseudonymCode,
      teacherId: teacher.id,
      group: group as any,
      birthYear,
      gender,
      isFifteenOrOlder,
      parentId,
    },
  });

  if (isFifteenOrOlder) {
    await prisma.inviteToken.create({
      data: {
        token: nanoid(24),
        studentId: student.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120), // 120 päeva
      },
    });
  }

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'CREATE', entity: 'Student', entityId: student.id },
  });

  return NextResponse.redirect(new URL('/opetaja/opilased', req.url), 303);
}
