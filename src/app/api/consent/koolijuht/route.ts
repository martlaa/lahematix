import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Versioon 5: koolijuhil pole enam kasutajakontot ega sisselogimist — ligipääs käib
// ühekordse token-URL-i kaudu (samamoodi nagu lapsevanem ja 15+ õpilase enda nõusolek).

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const token = String(form.get('token') ?? '');
  const action = String(form.get('action') ?? '');

  const invite = await prisma.inviteToken.findUnique({ where: { token } });
  if (!invite || !invite.schoolId || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Link on aegunud või kehtetu' }, { status: 404 });
  }

  const school = await prisma.school.findUnique({ where: { id: invite.schoolId } });
  if (!school) {
    return NextResponse.json({ error: 'Kooli ei leitud' }, { status: 404 });
  }

  if (action === 'give') {
    await prisma.school.update({
      where: { id: school.id },
      data: { consentGiven: true, consentAt: new Date() },
    });
    await prisma.consentRecord.create({
      data: {
        subjectType: 'KOOLIJUHT',
        subjectId: school.id,
        formVersion: 'v1',
        status: 'ANTUD',
        authMethod: 'TOKEN_URL',
      },
    });
  } else if (action === 'withdraw') {
    await prisma.school.update({
      where: { id: school.id },
      data: { consentGiven: false },
    });
    await prisma.consentRecord.create({
      data: {
        subjectType: 'KOOLIJUHT',
        subjectId: school.id,
        formVersion: 'v1',
        status: 'TAGASI_VOETUD',
        withdrawnAt: new Date(),
        authMethod: 'TOKEN_URL',
      },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: `CONSENT_${action.toUpperCase()}`,
      entity: 'School',
      entityId: school.id,
      meta: 'via token_url',
    },
  });

  return NextResponse.redirect(new URL(`/koolijuht/nousolek/${token}`, process.env.APP_BASE_URL || req.url), 303);
}
