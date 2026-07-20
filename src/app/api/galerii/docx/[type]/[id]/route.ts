import { NextRequest, NextResponse } from 'next/server';
import { getGalleryDetail, type GallerySourceType } from '@/lib/gallery';
import { buildLessonPlanDocx } from '@/lib/galleryDocx';

const TYPE_PARAM_MAP: Record<string, GallerySourceType> = {
  naidistund: 'NAIDISTUND',
  katsetund: 'KATSETUND',
};

export async function GET(req: NextRequest, { params }: { params: { type: string; id: string } }) {
  const sourceType = TYPE_PARAM_MAP[params.type];
  if (!sourceType) {
    return NextResponse.json({ error: 'Tundmatu tüüp' }, { status: 404 });
  }

  const detail = await getGalleryDetail(sourceType, params.id);
  if (!detail) {
    return NextResponse.json({ error: 'Tunnikava ei leitud' }, { status: 404 });
  }

  const buffer = await buildLessonPlanDocx(detail);
  const filename = `tunnikava_${detail.topic ? detail.topic.replace(/[^a-zA-Z0-9äöüõÄÖÜÕ]+/g, '_').slice(0, 40) : params.id}.docx`;

  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
