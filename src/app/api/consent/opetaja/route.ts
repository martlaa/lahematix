import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const action = String(form.get('action') ?? '');

  if (action === 'give') {
    const details = {
      osalemine: form.get('osalemine') === 'on',
      vaatlus: form.get('vaatlus') === 'on',
      intervjuu: form.get('intervjuu') === 'on',
    };
    await prisma.consentRecord.create({
      data: {
        subjectType: 'OPETAJA',
        subjectId: session.userId,
        formVersion: 'v1',
        status: 'ANTUD',
        authMethod: 'EMAIL_LINK',
        detailsJson: JSON.stringify(details),
      },
    });
  } else if (action === 'withdraw') {
    await prisma.consentRecord.create({
      data: {
        subjectType: 'OPETAJA',
        subjectId: session.userId,
        formVersion: 'v1',
        status: 'TAGASI_VOETUD',
        withdrawnAt: new Date(),
        authMethod: 'EMAIL_LINK',
      },
    });
    // Kõik selle õpetaja õpilased märgitakse analüüsist väljajäetuks (otsus 9).
    const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
    if (teacher) {
      await prisma.student.updateMany({
        where: { teacherId: teacher.id },
        data: { excludedFromAnalysis: true, excludedAt: new Date() },
      });
    }
  }

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: `CONSENT_${action.toUpperCase()}`, entity: 'User', entityId: session.userId },
  });

  return NextResponse.redirect(new URL('/opetaja/nousolek', process.env.APP_BASE_URL || req.url), 303);
}
