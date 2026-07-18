import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

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
  const studentId = String(form.get('studentId') ?? '');

  const student = await prisma.student.findFirst({ where: { id: studentId, teacherId: teacher.id } });
  if (!student) {
    return NextResponse.json({ error: 'Õpilast ei leitud' }, { status: 404 });
  }

  await prisma.student.delete({ where: { id: student.id } });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'DELETE',
      entity: 'Student',
      entityId: student.id,
      meta: student.pseudonymCode,
    },
  });

  return NextResponse.redirect(new URL('/opetaja/opilased', req.url), 303);
}
