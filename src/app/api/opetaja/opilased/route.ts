import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { createStudent, type StudentGroupValue } from '@/lib/studentImport';

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
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const classCode = String(form.get('classCode') ?? '').trim() || null;
  const group = String(form.get('group') ?? 'INTERVENTSIOON') as StudentGroupValue;
  const birthYearRaw = form.get('birthYear');
  const birthYear = birthYearRaw ? Number(birthYearRaw) : null;
  const gender = String(form.get('gender') ?? '') || null;
  const isFifteenOrOlder = form.get('isFifteenOrOlder') === 'on';
  const parentName = String(form.get('parentName') ?? '').trim();
  const parentEmail = String(form.get('parentEmail') ?? '').trim().toLowerCase();

  let result;
  try {
    result = await createStudent(teacher.id, {
      name,
      email,
      classCode,
      group,
      birthYear,
      gender,
      isFifteenOrOlder,
      parentName,
      parentEmail,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Viga õpilase lisamisel' }, { status: 400 });
  }

  if (result.status === 'duplicate') {
    return NextResponse.json(
      { error: `Selle e-postiga õpilane on juba nimekirjas ("${result.existingName}").` },
      { status: 409 },
    );
  }

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'CREATE', entity: 'Student', entityId: result.student.id },
  });

  return NextResponse.redirect(new URL('/opetaja/opilased', req.url), 303);
}
