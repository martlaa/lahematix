import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Loeb lingipõhise ülesande "allalaadimise" (klõps välisele lingile) enne
// suunamist, et populaarsuse näitaja downloadCount kataks nii faili- kui
// lingipõhiseid ülesandeid ühtemoodi.
export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task || task.hidden || !task.worksheetUrl) {
    return NextResponse.json({ error: 'Ei leitud' }, { status: 404 });
  }

  await prisma.task.update({ where: { id: task.id }, data: { downloadCount: { increment: 1 } } });

  return NextResponse.redirect(task.worksheetUrl, 302);
}
