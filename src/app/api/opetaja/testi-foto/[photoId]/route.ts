import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { readFile } from 'fs/promises';
import path from 'path';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads', 'test-photos');

const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.heic': 'image/heic',
};

export async function GET(req: NextRequest, props: { params: Promise<{ photoId: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || session.role !== 'OPETAJA') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const teacher = await prisma.teacher.findUnique({ where: { userId: session.userId } });
  if (!teacher) {
    return NextResponse.json({ error: 'Õpetaja profiili ei leitud' }, { status: 404 });
  }

  const photo = await prisma.testSubmissionPhoto.findUnique({
    where: { id: params.photoId },
    include: { testSubmission: { include: { student: true } } },
  });

  if (!photo || photo.testSubmission.student.teacherId !== teacher.id) {
    return NextResponse.json({ error: 'Ei leitud' }, { status: 404 });
  }

  const filePath = path.join(UPLOADS_ROOT, photo.filePath);
  if (!filePath.startsWith(UPLOADS_ROOT)) {
    return NextResponse.json({ error: 'Ei leitud' }, { status: 404 });
  }

  const buffer = await readFile(filePath);
  const ext = path.extname(photo.filePath).toLowerCase();
  const contentType = MIME_BY_EXT[ext] ?? 'application/octet-stream';

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': contentType,
      'Content-Disposition': `inline; filename="${photo.originalName.replace(/"/g, '')}"`,
      'Cache-Control': 'private, max-age=0, no-cache',
    },
  });
}
