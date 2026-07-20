import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getDatasetDefinition } from '@/lib/export/datasets';
import { isGatedDataset } from '@/lib/export/types';
import { toCsv } from '@/lib/export/csv';
import { toXlsxBuffer } from '@/lib/export/xlsx';

export async function GET(req: NextRequest, props: { params: Promise<{ dataset: string }> }) {
  const params = await props.params;
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const definition = getDatasetDefinition(params.dataset);
  if (!definition) {
    return NextResponse.json({ error: 'Andmestikku ei leitud' }, { status: 404 });
  }

  let approvedRequestId: string | null = null;
  if (isGatedDataset(definition.key)) {
    const approved = await prisma.exportRequest.findFirst({
      where: {
        requestedByUserId: session.userId,
        datasetKey: definition.key,
        status: 'APPROVED',
        fulfilledAt: null,
      },
    });
    if (!approved) {
      return NextResponse.json(
        { error: 'Selle andmestiku allalaadimiseks on vaja admini kinnitatud ekspordiluba.' },
        { status: 403 },
      );
    }
    approvedRequestId = approved.id;
  }

  const format = req.nextUrl.searchParams.get('format') === 'xlsx' ? 'xlsx' : 'csv';
  const dataset = await definition.build();

  if (approvedRequestId) {
    await prisma.exportRequest.update({
      where: { id: approvedRequestId },
      data: { status: 'FULFILLED', fulfilledAt: new Date() },
    });
  }

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'DATA_EXPORT',
      entity: 'Dataset',
      entityId: definition.key,
      meta: `format=${format}, rows=${dataset.rows.length}${approvedRequestId ? `, exportRequestId=${approvedRequestId}` : ''}`,
    },
  });

  const filenameBase = `lahematix_${definition.key}`;

  if (format === 'xlsx') {
    const buffer = await toXlsxBuffer(dataset, definition.label);
    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filenameBase}.xlsx"`,
      },
    });
  }

  const csv = toCsv(dataset);
  return new NextResponse(csv, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="${filenameBase}.csv"`,
    },
  });
}
