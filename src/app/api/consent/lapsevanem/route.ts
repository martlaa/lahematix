import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Versioon 4: lapsevanemal pole enam kasutajakontot ega sisselogimist — ligipääs
// käib ühekordse token-URL-i kaudu (samamoodi nagu 15+ õpilase enda nõusolek).

export async function POST(req: NextRequest) {
  const form = await req.formData();
  const token = String(form.get('token') ?? '');
  const action = String(form.get('action') ?? '');

  const invite = await prisma.inviteToken.findUnique({ where: { token } });
  if (!invite || !invite.studentId || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Link on aegunud või kehtetu' }, { status: 404 });
  }

  if (action === 'give') {
    await prisma.consentRecord.create({
      data: {
        subjectType: 'LAPSEVANEM',
        subjectId: invite.studentId,
        studentId: invite.studentId,
        formVersion: 'v1',
        status: 'ANTUD',
        authMethod: 'TOKEN_URL',
        detailsJson: JSON.stringify({
          loaOsaleda: form.get('loaOsaleda') === 'on',
          lapseleTutvustatud: form.get('lapseleTutvustatud') === 'on',
        }),
      },
    });
    await prisma.student.update({
      where: { id: invite.studentId },
      data: { excludedFromAnalysis: false, excludedAt: null },
    });
  } else if (action === 'withdraw') {
    await prisma.consentRecord.create({
      data: {
        subjectType: 'LAPSEVANEM',
        subjectId: invite.studentId,
        studentId: invite.studentId,
        formVersion: 'v1',
        status: 'TAGASI_VOETUD',
        withdrawnAt: new Date(),
        authMethod: 'TOKEN_URL',
      },
    });
    await prisma.student.update({
      where: { id: invite.studentId },
      data: { excludedFromAnalysis: true, excludedAt: new Date() },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: null,
      action: `CONSENT_${action.toUpperCase()}`,
      entity: 'Student',
      entityId: invite.studentId,
      meta: 'via token_url',
    },
  });

  return NextResponse.redirect(new URL(`/lapsevanem/nousolek/${token}`, process.env.APP_BASE_URL || req.url), 303);
}
