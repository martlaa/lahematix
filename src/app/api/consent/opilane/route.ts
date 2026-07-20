import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        subjectType: 'OPILANE_15PLUS',
        subjectId: invite.studentId,
        studentId: invite.studentId,
        formVersion: 'v1',
        status: 'ANTUD',
        authMethod: 'TOKEN_URL',
        detailsJson: JSON.stringify({
          fullName: String(form.get('fullName') ?? ''),
          tutvunud: form.get('tutvunud') === 'on',
          soovin: form.get('soovin') === 'on',
          nousAndmetega: form.get('nousAndmetega') === 'on',
        }),
      },
    });
    await prisma.student.update({
      where: { id: invite.studentId },
      data: { excludedFromAnalysis: false, excludedAt: null },
    });
    await prisma.inviteToken.update({ where: { token }, data: { usedAt: new Date() } });
  } else if (action === 'withdraw') {
    await prisma.consentRecord.create({
      data: {
        subjectType: 'OPILANE_15PLUS',
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

  return NextResponse.redirect(new URL(`/opilane/nousolek/${token}`, process.env.APP_BASE_URL || req.url), 303);
}
