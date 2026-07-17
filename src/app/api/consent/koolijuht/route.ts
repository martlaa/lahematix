import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'KOOLIJUHT') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const action = String(form.get('action') ?? '');

  const school = await prisma.school.findUnique({ where: { directorId: session.userId } });
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
        subjectId: session.userId,
        formVersion: 'v1',
        status: 'ANTUD',
        authMethod: 'DEV_LOGIN',
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
        subjectId: session.userId,
        formVersion: 'v1',
        status: 'TAGASI_VOETUD',
        withdrawnAt: new Date(),
        authMethod: 'DEV_LOGIN',
      },
    });
  }

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: `CONSENT_${action.toUpperCase()}`, entity: 'School', entityId: school.id },
  });

  return NextResponse.redirect(new URL('/koolijuht/nousolek', req.url), 303);
}
