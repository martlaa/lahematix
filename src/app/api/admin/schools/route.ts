import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const name = String(form.get('name') ?? '').trim();
  if (!name) {
    return NextResponse.json({ error: 'Kooli nimi on kohustuslik' }, { status: 400 });
  }

  await prisma.school.create({ data: { name } });

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'CREATE', entity: 'School', entityId: name, meta: null },
  });

  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
