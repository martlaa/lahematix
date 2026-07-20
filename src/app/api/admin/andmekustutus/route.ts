import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const type = String(form.get('type') ?? '');
  const id = String(form.get('id') ?? '');

  if (type === 'student') {
    const student = await prisma.student.findUnique({ where: { id } });
    if (!student || student.identityDeletedAt || !student.excludedFromAnalysis) {
      return NextResponse.json({ error: 'Õpilast ei saa kustutada' }, { status: 400 });
    }

    await prisma.student.update({
      where: { id },
      data: {
        name: '[Kustutatud]',
        email: `deleted-${student.id}@lahematix.invalid`,
        parentName: null,
        parentEmail: null,
        identityDeletedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'DATA_DELETE',
        entity: 'Student',
        entityId: student.id,
        meta: student.pseudonymCode,
      },
    });
  } else if (type === 'teacher') {
    const teacher = await prisma.teacher.findUnique({ where: { id }, include: { user: true } });
    if (!teacher || teacher.user.identityDeletedAt) {
      return NextResponse.json({ error: 'Õpetajat ei saa kustutada' }, { status: 400 });
    }
    const hasWithdrawal = await prisma.consentRecord.findFirst({
      where: { subjectType: 'OPETAJA', subjectId: teacher.userId, status: 'TAGASI_VOETUD' },
    });
    if (!hasWithdrawal) {
      return NextResponse.json({ error: 'Õpetaja pole nõusolekut tagasi võtnud' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: teacher.userId },
      data: {
        name: '[Kustutatud]',
        email: `deleted-${teacher.userId}@lahematix.invalid`,
        status: 'DISABLED',
        identityDeletedAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: session.userId,
        action: 'DATA_DELETE',
        entity: 'Teacher',
        entityId: teacher.id,
        meta: teacher.pseudonymCode,
      },
    });
  } else {
    return NextResponse.json({ error: 'Vale tüüp' }, { status: 400 });
  }

  return NextResponse.redirect(new URL('/admin/andmekustutus', process.env.APP_BASE_URL || req.url), 303);
}
