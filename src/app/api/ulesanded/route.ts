import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { randomUUID } from 'crypto';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import type { Method } from '@prisma/client';
import { MAX_FILE_BYTES, isAllowedFileExtension, fileExtension, MIME_BY_EXT } from '@/lib/tasks/types';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads', 'task-bank');
const VALID_METHODS: Method[] = ['BOALER', 'LILJEDAHL', 'TOH'];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const title = String(form.get('title') ?? '').trim();
  if (!title) {
    return NextResponse.json({ error: 'Pealkiri on kohustuslik' }, { status: 400 });
  }

  const worksheetUrl = String(form.get('worksheetUrl') ?? '').trim() || null;
  const file = form.get('file');
  const hasFile = file instanceof File && file.size > 0;

  if (!worksheetUrl && !hasFile) {
    return NextResponse.json({ error: 'Lisa kas link töölehele või laadi üles fail' }, { status: 400 });
  }

  if (hasFile) {
    const f = file as File;
    if (!isAllowedFileExtension(f.name)) {
      return NextResponse.json({ error: 'Lubatud failitüübid: docx, jpg, pdf' }, { status: 400 });
    }
    if (f.size > MAX_FILE_BYTES) {
      return NextResponse.json({ error: 'Fail on liiga suur (maksimum 50 MB)' }, { status: 400 });
    }
  }

  const appliedMethods = form.getAll('appliedMethods').map(String).filter((m): m is Method =>
    VALID_METHODS.includes(m as Method),
  );

  const task = await prisma.task.create({
    data: {
      authorUserId: session.userId,
      title,
      gradeBand: String(form.get('gradeBand') ?? '').trim() || null,
      topic: String(form.get('topic') ?? '').trim() || null,
      appliedMethods,
      creditedAuthor: String(form.get('creditedAuthor') ?? '').trim() || session.name || null,
      worksheetUrl,
    },
  });

  if (hasFile) {
    const f = file as File;
    const ext = fileExtension(f.name);
    const diskName = `${randomUUID()}${ext}`;
    const taskDir = path.join(UPLOADS_ROOT, task.id);
    await mkdir(taskDir, { recursive: true });
    const buffer = Buffer.from(await f.arrayBuffer());
    await writeFile(path.join(taskDir, diskName), buffer);

    await prisma.task.update({
      where: { id: task.id },
      data: {
        filePath: path.join(task.id, diskName),
        fileName: f.name,
        fileMime: MIME_BY_EXT[ext] ?? 'application/octet-stream',
        fileSizeBytes: f.size,
      },
    });
  }

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'CREATE', entity: 'Task', entityId: task.id },
  });

  const redirectTo = session.role === 'TEADUR' ? '/teadur/ulesanded' : '/opetaja/ulesanded';
  return NextResponse.redirect(new URL(redirectTo, process.env.APP_BASE_URL || req.url), 303);
}
