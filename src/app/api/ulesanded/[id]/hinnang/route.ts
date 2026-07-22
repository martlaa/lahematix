import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || (session.role !== 'OPETAJA' && session.role !== 'TEADUR')) {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const task = await prisma.task.findUnique({ where: { id: params.id } });
  if (!task || task.hidden) {
    return NextResponse.json({ error: 'Ülesannet ei leitud' }, { status: 404 });
  }

  const form = await req.formData();
  const value = Number(form.get('value') ?? '');
  if (!Number.isInteger(value) || value < 1 || value > 5) {
    return NextResponse.json({ error: 'Hinnang peab olema 1-5' }, { status: 400 });
  }

  await prisma.taskRating.upsert({
    where: { taskId_userId: { taskId: task.id, userId: session.userId } },
    update: { value },
    create: { taskId: task.id, userId: session.userId, value },
  });

  return NextResponse.redirect(new URL(`/ulesanded/${task.id}`, process.env.APP_BASE_URL || req.url), 303);
}
