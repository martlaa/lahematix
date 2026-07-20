import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getTestByCode } from '@/lib/tests';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads', 'test-photos');
const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20 MB

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
  const testCode = String(form.get('testCode') ?? '');
  const phaseRaw = String(form.get('phase') ?? '');
  const phase = phaseRaw === 'EEL' || phaseRaw === 'JAREL' ? phaseRaw : undefined;

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student || student.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'Õpilast ei leitud' }, { status: 404 });
  }

  const definition = phase ? getTestByCode(testCode) : undefined;
  if (!definition || !phase) {
    return NextResponse.json({ error: 'Testi ei leitud' }, { status: 404 });
  }

  const submission = await prisma.testSubmission.upsert({
    where: { testCode_phase_studentId: { testCode: definition.code, phase, studentId: student.id } },
    update: {},
    create: { testCode: definition.code, phase, studentId: student.id, answersJson: null, submittedAt: null },
  });

  const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);
  const submissionDir = path.join(UPLOADS_ROOT, submission.id);
  await mkdir(submissionDir, { recursive: true });

  for (const file of files) {
    if (!file.type.startsWith('image/') || file.size > MAX_FILE_BYTES) continue;
    const ext = path.extname(file.name) || '';
    const diskName = `${randomUUID()}${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(path.join(submissionDir, diskName), buffer);
    await prisma.testSubmissionPhoto.create({
      data: {
        testSubmissionId: submission.id,
        filePath: path.join(submission.id, diskName),
        originalName: file.name,
      },
    });
  }

  return NextResponse.redirect(
    new URL(`/opetaja/testi-hindamine/${student.id}/${definition.code}/${phase}`, process.env.APP_BASE_URL || req.url),
    303,
  );
}
