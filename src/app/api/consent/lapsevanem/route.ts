import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'LAPSEVANEM') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const parent = await prisma.parent.findUnique({ where: { userId: session.userId } });
  if (!parent) {
    return NextResponse.json({ error: 'Lapsevanema profiili ei leitud' }, { status: 404 });
  }

  const form = await req.formData();
  const studentId = String(form.get('studentId') ?? '');
  const action = String(form.get('action') ?? '');

  const student = await prisma.student.findFirst({ where: { id: studentId, parentId: parent.id } });
  if (!student) {
    return NextResponse.json({ error: 'Õpilast ei leitud' }, { status: 404 });
  }

  if (action === 'give') {
    await prisma.consentRecord.create({
      data: {
        subjectType: 'LAPSEVANEM',
        subjectId: session.userId,
        studentId: student.id,
        formVersion: 'v1',
        status: 'ANTUD',
        authMethod: 'EMAIL_LINK',
        detailsJson: JSON.stringify({
          loaOsaleda: form.get('loaOsaleda') === 'on',
          lapseleTutvustatud: form.get('lapseleTutvustatud') === 'on',
        }),
      },
    });
    await prisma.student.update({
      where: { id: student.id },
      data: { excludedFromAnalysis: false, excludedAt: null },
    });
  } else if (action === 'withdraw') {
    await prisma.consentRecord.create({
      data: {
        subjectType: 'LAPSEVANEM',
        subjectId: session.userId,
        studentId: student.id,
        formVersion: 'v1',
        status: 'TAGASI_VOETUD',
        withdrawnAt: new Date(),
        authMethod: 'EMAIL_LINK',
      },
    });
    await prisma.student.update({
      where: { id: student.id },
      data: { excludedFromAnalysis: true, excludedAt: new Date() },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: `CONSENT_${action.toUpperCase()}`,
      entity: 'Student',
      entityId: student.id,
    },
  });

  return NextResponse.redirect(new URL(`/lapsevanem/nousolek/${student.id}`, req.url), 303);
}
