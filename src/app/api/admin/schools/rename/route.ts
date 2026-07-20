import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const schoolId = String(form.get('schoolId') ?? '');
  const name = String(form.get('name') ?? '').trim();

  if (!schoolId || !name) {
    return NextResponse.json({ error: 'Kooli nimi on kohustuslik' }, { status: 400 });
  }

  const school = await prisma.school.update({ where: { id: schoolId }, data: { name } });

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'UPDATE', entity: 'School', entityId: school.id, meta: 'rename' },
  });

  return NextResponse.redirect(new URL('/admin/kasutajad#koolid', process.env.APP_BASE_URL || req.url), 303);
}
