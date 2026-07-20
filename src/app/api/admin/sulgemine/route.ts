import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getAppSettings } from '@/lib/appSettings';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const action = String(form.get('action') ?? '');
  if (!['close', 'reopen'].includes(action)) {
    return NextResponse.json({ error: 'Vale toiming' }, { status: 400 });
  }

  await getAppSettings(); // tagab, et singleton rida eksisteerib

  if (action === 'close') {
    await prisma.appSettings.update({
      where: { id: 'singleton' },
      data: { closedAt: new Date(), closedByUserId: session.userId },
    });
    await prisma.auditLog.create({
      data: { actorId: session.userId, action: 'APP_CLOSE', entity: 'AppSettings', entityId: 'singleton' },
    });
  } else {
    await prisma.appSettings.update({
      where: { id: 'singleton' },
      data: { closedAt: null, reopenedAt: new Date() },
    });
    await prisma.auditLog.create({
      data: { actorId: session.userId, action: 'APP_REOPEN', entity: 'AppSettings', entityId: 'singleton' },
    });
  }

  return NextResponse.redirect(new URL('/admin/sulgemine', req.url), 303);
}
