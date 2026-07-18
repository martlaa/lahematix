import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { nanoid } from 'nanoid';

const INVITE_TOKEN_TTL_MS = 1000 * 60 * 60 * 24 * 730; // ~2 aastat

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const schoolId = String(form.get('schoolId') ?? '');
  const directorName = String(form.get('directorName') ?? '').trim();
  const directorEmail = String(form.get('directorEmail') ?? '').trim().toLowerCase();

  if (!schoolId || !directorName || !directorEmail) {
    return NextResponse.json({ error: 'Kooli, koolijuhi nime ja e-posti väljad on kohustuslikud' }, { status: 400 });
  }

  const school = await prisma.school.update({
    where: { id: schoolId },
    data: { directorName, directorEmail },
  });

  const existingToken = await prisma.inviteToken.findFirst({
    where: { schoolId: school.id },
    orderBy: { createdAt: 'desc' },
  });
  if (!existingToken || existingToken.expiresAt < new Date()) {
    await prisma.inviteToken.create({
      data: { token: nanoid(24), schoolId: school.id, expiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS) },
    });
  }

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'UPDATE', entity: 'School', entityId: school.id, meta: 'director' },
  });

  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
