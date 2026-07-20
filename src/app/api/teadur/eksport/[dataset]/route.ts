import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { getDatasetDefinition } from '@/lib/export/datasets';
import { toCsv } from '@/lib/export/csv';
import { toXlsxBuffer } from '@/lib/export/xlsx';

export async function GET(req: NextRequest, { params }: { params: { dataset: string } }) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const definition = getDatasetDefinition(params.dataset);
  if (!definition) {
    return NextResponse.json({ error: 'Andmestikku ei leitud' }, { status: 404 });
  }

  const format = req.nextUrl.searchParams.get('format') === 'xlsx' ? 'xlsx' : 'csv';
  const dataset = await definition.build();

  await prisma.auditLog.create({
    data: {
      actorId: session.userId,
      action: 'DATA_EXPORT',
      entity: 'Dataset',
      entityId: definition.key,
      meta: `format=${format}, rows=${dataset.rows.length}`,
    },
  });

  const filenameBase = `lahematix_${definition.key}`;

  if (format === 'xlsx') {
    const buffer = await toXlsxBuffer(dataset, definition.label);
    return new NextResponse(buffer, {
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
