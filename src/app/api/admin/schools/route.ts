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
  const name = String(form.get('name') ?? '').trim();
  const directorName = String(form.get('directorName') ?? '').trim() || null;
  const directorEmail = String(form.get('directorEmail') ?? '').trim().toLowerCase() || null;

  if (!name) {
    return NextResponse.json({ error: 'Kooli nimi on kohustuslik' }, { status: 400 });
  }

  const school = await prisma.school.create({ data: { name, directorName, directorEmail } });

  if (directorEmail) {
    await prisma.inviteToken.create({
      data: {
        token: nanoid(24),
        schoolId: school.id,
        expiresAt: new Date(Date.now() + INVITE_TOKEN_TTL_MS),
      },
    });
  }

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'CREATE', entity: 'School', entityId: school.id, meta: name },
  });

  return NextResponse.redirect(new URL('/admin/kasutajad', process.env.APP_BASE_URL || req.url), 303);
}
