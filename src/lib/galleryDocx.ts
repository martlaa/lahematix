import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  ShadingType,
  LevelFormat,
  AlignmentType,
  ExternalHyperlink,
} from 'docx';
import type { GalleryDetail } from './gallery';
import { LESSON_PART_TYPE_LABEL, MATERIAL_OPTIONS } from './lessonplan/types';

const METHOD_LABEL: Record<string, string> = {
  BOALER: 'Boaler',
  LILJEDAHL: 'Liljedahl',
  TOH: 'Toh',
};

const GRADE_BAND_LABEL: Record<string, string> = {
  '4-6': '4.–6. klass',
  '7-9': '7.–9. klass',
  '10-12': '10.–12. klass',
};

const TABLE_WIDTH_DXA = 9000;
const COL_WIDTHS = [600, 1800, 1800, 1000, 3800];

function headerCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: { type: ShadingType.CLEAR, fill: 'E2E8F0' },
    children: [new Paragraph({ children: [new TextRun({ text, bold: true })] })],
  });
}

function bodyCell(text: string, width: number): TableCell {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    children: [new Paragraph(text)],
  });
}

export async function buildLessonPlanDocx(detail: GalleryDetail): Promise<Buffer> {
  const materialsEntries = MATERIAL_OPTIONS.filter((m) => m.key in detail.materials);

  const doc = new Document({
    numbering: {
      config: [
        {
          reference: 'materials-bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 720, hanging: 360 } } },
            },
          ],
        },
      ],
    },
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({ text: detail.topic ?? 'Tunnikava', heading: HeadingLevel.HEADING_1 }),
          new Paragraph({
            children: [
              new TextRun({
                text: `Vanuseaste: ${detail.gradeBand ? GRADE_BAND_LABEL[detail.gradeBand] : '—'}`,
              }),
            ],
          }),
          new Paragraph(
            `Meetod: ${detail.appliedMethods.map((m) => METHOD_LABEL[m]).join(', ') || '—'}`,
          ),
          new Paragraph(`Kestus: ${detail.durationMin ? `${detail.durationMin} min` : '—'}`),
          new Paragraph(`Autor: ${detail.authorName} (${detail.authorRoleLabel})`),
          new Paragraph(`Tüüp: ${detail.sourceType === 'NAIDISTUND' ? 'Näidistund' : 'Katsetund'}`),

          new Paragraph({ text: 'Tunni osad', heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }),
          new Table({
            width: { size: TABLE_WIDTH_DXA, type: WidthType.DXA },
            columnWidths: COL_WIDTHS,
            rows: [
              new TableRow({
                children: [
                  headerCell('#', COL_WIDTHS[0]),
                  headerCell('Osa nimetus', COL_WIDTHS[1]),
                  headerCell('Tüüp', COL_WIDTHS[2]),
                  headerCell('Kestus', COL_WIDTHS[3]),
                  headerCell('Lühikirjeldus', COL_WIDTHS[4]),
                ],
              }),
              ...detail.parts.map(
                (p) =>
                  new TableRow({
                    children: [
                      bodyCell(String(p.order), COL_WIDTHS[0]),
                      bodyCell(p.title, COL_WIDTHS[1]),
                      bodyCell(LESSON_PART_TYPE_LABEL[p.type as keyof typeof LESSON_PART_TYPE_LABEL] ?? p.type, COL_WIDTHS[2]),
                      bodyCell(`${p.durationMin} min`, COL_WIDTHS[3]),
                      bodyCell(p.description ?? '—', COL_WIDTHS[4]),
                    ],
                  }),
              ),
            ],
          }),

          new Paragraph({ text: 'Kasutatav õppevara', heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }),
          ...(materialsEntries.length > 0
            ? materialsEntries.map(
                (m) =>
                  new Paragraph({
                    text: detail.materials[m.key]?.length ? `${m.label}: ${detail.materials[m.key].join(', ')}` : m.label,
                    numbering: { reference: 'materials-bullets', level: 0 },
                  }),
              )
            : [new Paragraph('Õppevara pole märgitud.')]),

          new Paragraph({ text: 'Kodutöö', heading: HeadingLevel.HEADING_2, spacing: { before: 300 } }),
          new Paragraph(
            detail.homeworkText
              ? `${detail.homeworkText}${detail.homeworkRelated ? ' (seotud tänase teemaga)' : ''}`
              : 'Kodutööd pole määratud.',
          ),

          new Paragraph({ text: '', spacing: { before: 400 } }),
          new Paragraph({
            border: { top: { color: 'CBD5E1', space: 4, style: 'single', size: 6 } },
            children: [
              new TextRun({
                text: `Autor: ${detail.authorName}. Litsents: CC BY 4.0 (`,
                size: 18,
                color: '64748B',
              }),
              new ExternalHyperlink({
                link: 'https://creativecommons.org/licenses/by/4.0/deed.et',
                children: [
                  new TextRun({
                    text: 'creativecommons.org/licenses/by/4.0',
                    size: 18,
                    color: '2563EB',
                    underline: {},
                  }),
                ],
              }),
              new TextRun({
                text: '). Allikas: LAHEMATIX tunnikavade galerii.',
                size: 18,
                color: '64748B',
              }),
            ],
          }),
        ],
      },
    ],
  });

  return Packer.toBuffer(doc);
}
