import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { readFile } from 'fs/promises';
import path from 'path';

const UPLOADS_ROOT = path.join(process.cwd(), 'uploads', 'task-bank');

// Avalik allalaadimine — ülesannete pank on jagatud avalik ressurss, samamoodi
// nagu tunnikavade galerii, seega ei nõua see sisselogimist. Loeb faili ainult
// vahendatud route'i kaudu (mitte otse public/ alt), et saaks allalaadimisi
// loendada ja kontrollida, et ülesanne pole peidetud.
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task || task.hidden || !task.filePath) {
    return NextResponse.json({ error: 'Ei leitud' }, { status: 404 });
  }

  const filePath = path.join(UPLOADS_ROOT, task.filePath);
  if (!filePath.startsWith(UPLOADS_ROOT)) {
    return NextResponse.json({ error: 'Ei leitud' }, { status: 404 });
  }

  const buffer = await readFile(filePath);

  await prisma.task.update({ where: { id: task.id }, data: { downloadCount: { increment: 1 } } });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': task.fileMime ?? 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${(task.fileName ?? 'ulesanne').replace(/"/g, '')}"`,
      'Cache-Control': 'public, max-age=0, no-cache',
    },
  });
}
