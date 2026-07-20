import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getDatasetDefinition } from '@/lib/export/datasets';
import { isGatedDataset } from '@/lib/export/types';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const datasetKey = String(form.get('datasetKey') ?? '');

  if (!getDatasetDefinition(datasetKey) || !isGatedDataset(datasetKey)) {
    return NextResponse.json({ error: 'Andmestikku ei leitud' }, { status: 404 });
  }

  const existing = await prisma.exportRequest.findFirst({
    where: { requestedByUserId: session.userId, datasetKey, status: { in: ['PENDING', 'APPROVED'] } },
  });
  if (existing) {
    return NextResponse.json({ error: 'Sellel andmestikul on juba pooleliolev taotlus' }, { status: 409 });
  }

  const request = await prisma.exportRequest.create({
    data: { requestedByUserId: session.userId, datasetKey },
  });

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'EXPORT_REQUEST_CREATE',
      entity: 'ExportRequest',
      entityId: request.id,
      meta: datasetKey,
    },
  });

  return NextResponse.redirect(new URL('/teadur/eksport', process.env.APP_BASE_URL || req.url), 303);
}
