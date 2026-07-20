import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const requestId = String(form.get('requestId') ?? '');
  const decision = String(form.get('decision') ?? '');
  const note = String(form.get('note') ?? '').trim();

  if (!['approve', 'deny'].includes(decision)) {
    return NextResponse.json({ error: 'Vale otsus' }, { status: 400 });
  }

  const exportRequest = await prisma.exportRequest.findUnique({ where: { id: requestId } });
  if (!exportRequest || exportRequest.status !== 'PENDING') {
    return NextResponse.json({ error: 'Taotlust ei leitud või on juba otsustatud' }, { status: 404 });
  }

  const status = decision === 'approve' ? 'APPROVED' : 'DENIED';

  await prisma.exportRequest.update({
    where: { id: requestId },
    data: {
      status,
      decidedByUserId: session.userId,
      decidedAt: new Date(),
      decisionNote: note || null,
    },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: decision === 'approve' ? 'EXPORT_REQUEST_APPROVE' : 'EXPORT_REQUEST_DENY',
      entity: 'ExportRequest',
      entityId: requestId,
      meta: exportRequest.datasetKey,
    },
  });

  return NextResponse.redirect(new URL('/admin/eksporditaotlused', req.url), 303);
}
