import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { createStudent, parseStudentsCsv, type CsvError } from '@/lib/studentImport';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const teacherId = String(form.get('teacherId') ?? '');
  const file = form.get('file');

  if (!teacherId) {
    return NextResponse.json({ error: 'Vali õpetaja, kelle klassi õpilased lisada' }, { status: 400 });
  }
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'CSV fail on kohustuslik' }, { status: 400 });
  }

  const teacher = await prisma.teacher.findUnique({ where: { id: teacherId } });
  if (!teacher) {
    return NextResponse.json({ error: 'Õpetajat ei leitud' }, { status: 404 });
  }

  const text = await file.text();
  const { rows, errors } = parseStudentsCsv(text);
  const allErrors: CsvError[] = [...errors];

  let imported = 0;
  let duplicates = 0;
  for (const row of rows) {
    try {
      const result = await createStudent(teacher.id, row);
      if (result.status === 'duplicate') {
        duplicates++;
        allErrors.push({ row: row.rowNumber, message: `Õpilane on juba nimekirjas ("${result.existingName}") — vahele jäetud.` });
      } else {
        imported++;
      }
    } catch (err: any) {
      allErrors.push({ row: row.rowNumber, message: err.message ?? 'Tundmatu viga' });
    }
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'CSV_IMPORT',
      entity: 'Student',
      entityId: teacher.id,
      meta: `imported=${imported}, duplicates=${duplicates}, errors=${allErrors.length}`,
    },
  });

  const params = new URLSearchParams();
  params.set('imported', String(imported));
  if (allErrors.length > 0) {
    params.set('errors', JSON.stringify(allErrors.slice(0, 25)));
  }
  return NextResponse.redirect(new URL(`/admin?${params.toString()}`, process.env.APP_BASE_URL || req.url), 303);
}
