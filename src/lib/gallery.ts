import { prisma } from '@/lib/prisma';
import type { Method } from '@prisma/client';
import { parseMaterials } from '@/lib/lessonplan/types';

export type GallerySourceType = 'NAIDISTUND' | 'KATSETUND';

export interface GalleryItem {
  id: string; // "naidistund:<id>" | "katsetund:<id>" — unikaalne üle mõlema allika
  sourceType: GallerySourceType;
  refId: string;
  gradeBand: string | null;
  appliedMethods: Method[];
  topic: string | null;
  authorName: string;
  authorRoleLabel: string;
  durationMin: number | null;
  partsCount: number;
  publishedAt: Date;
  avgRating: number | null;
  ratingCount: number;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

// Avalik tunnikavade galerii (Faas 5): koondab teaduri näidistunnikavad
// (automaatselt avalikud, kui hidden=false) ja õpetajate katsetunnikavad
// (avalikud üksnes siis, kui õpetaja on ise andnud loa LessonPlan.
// publishedToGalleryAt kaudu). Kõik siin loetletud read on CC-BY litsentsi
// alla avaldatud.
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const [samples, lessonPlans] = await Promise.all([
    prisma.sampleLessonPlan.findMany({
      where: { hidden: false, publishedToGalleryAt: { not: null } },
      include: { authorUser: true, parts: true, ratings: true },
    }),
    prisma.lessonPlan.findMany({
      where: { publishedToGalleryAt: { not: null }, researchPlanEntry: { hidden: false } },
      include: {
        parts: true,
        ratings: true,
        researchPlanEntry: { include: { teacher: { include: { user: true } } } },
      },
    }),
  ]);

  const sampleItems: GalleryItem[] = samples.map((s) => ({
    id: `naidistund:${s.id}`,
    sourceType: 'NAIDISTUND',
    refId: s.id,
    gradeBand: s.gradeBand,
    appliedMethods: s.appliedMethods,
    topic: s.topic,
    authorName: s.authorUser.name,
    authorRoleLabel: 'Teadur',
    durationMin: s.durationMin,
    partsCount: s.parts.length,
    publishedAt: s.publishedToGalleryAt as Date,
    avgRating: average(s.ratings.map((r) => r.value)),
    ratingCount: s.ratings.length,
  }));

  const lessonPlanItems: GalleryItem[] = lessonPlans.map((lp) => ({
    id: `katsetund:${lp.id}`,
    sourceType: 'KATSETUND',
    refId: lp.id,
    gradeBand: lp.researchPlanEntry.teacher.gradeBand,
    appliedMethods: lp.researchPlanEntry.appliedMethods,
    topic: lp.researchPlanEntry.topic,
    authorName: lp.researchPlanEntry.teacher.user.name,
    authorRoleLabel: 'Õpetaja-uurija',
    durationMin: lp.researchPlanEntry.durationMin,
    partsCount: lp.parts.length,
    publishedAt: lp.publishedToGalleryAt as Date,
    avgRating: average(lp.ratings.map((r) => r.value)),
    ratingCount: lp.ratings.length,
  }));

  return [...sampleItems, ...lessonPlanItems];
}

export async function getGalleryItemByRef(
  sourceType: GallerySourceType,
  refId: string,
): Promise<GalleryItem | null> {
  const items = await getGalleryItems();
  return items.find((i) => i.sourceType === sourceType && i.refId === refId) ?? null;
}

export interface GalleryPart {
  order: number;
  title: string;
  type: string;
  durationMin: number;
  description: string | null;
}

export interface GalleryAdjacent {
  refId: string;
  topic: string | null;
}

export interface GalleryAttachedTask {
  id: string;
  title: string;
}

export interface GalleryDetail extends GalleryItem {
  parts: GalleryPart[];
  materials: Record<string, string[]>;
  homeworkText: string | null;
  homeworkRelated: boolean;
  // Ülesannete pangast tunnikavasse/näidistunnikavasse lisatud ülesanded (vt
  // TaskUsage/SampleTaskUsage) — kuvatakse galeriis "Ülesanded/probleemid"
  // rea juures. Peidetud ülesanded on siit välja jäetud.
  attachedTasks: GalleryAttachedTask[];
  // Eelmine/järgmine seotud katsetund (vt LessonPlan.previousLessonPlanId) —
  // ainult siis täidetud, kui naabertund on ka ise galeriis avaldatud, kuna
  // galerii külastaja ei saa navigeerida avaldamata sisu juurde.
  previous: GalleryAdjacent | null;
  next: GalleryAdjacent | null;
}

// Nagu getGalleryItemByRef, aga koos tunniosade/õppevara/kodutöö sisuga —
// kasutatakse detailvaates ja DOCX genereerimisel. Kontrollib avaldamise
// tingimusi uuesti (mitte ainult nimekirjavaate põhjal), et otsene URL
// avaldamata sisu ei lekitaks.
export async function getGalleryDetail(
  sourceType: GallerySourceType,
  refId: string,
): Promise<GalleryDetail | null> {
  if (sourceType === 'NAIDISTUND') {
    const s = await prisma.sampleLessonPlan.findUnique({
      where: { id: refId },
      include: {
        authorUser: true,
        parts: { orderBy: { order: 'asc' } },
        previousSampleLessonPlan: true,
        nextSampleLessonPlan: true,
        taskUsages: { include: { task: true } },
        ratings: true,
      },
    });
    if (!s || s.hidden || !s.publishedToGalleryAt) return null;

    const toSampleAdjacent = (
      candidate: { id: string; hidden: boolean; publishedToGalleryAt: Date | null; topic: string | null } | null,
    ): GalleryAdjacent | null =>
      candidate && !candidate.hidden && candidate.publishedToGalleryAt
        ? { refId: candidate.id, topic: candidate.topic }
        : null;

    return {
      id: `naidistund:${s.id}`,
      sourceType: 'NAIDISTUND',
      refId: s.id,
      gradeBand: s.gradeBand,
      appliedMethods: s.appliedMethods,
      topic: s.topic,
      authorName: s.authorUser.name,
      authorRoleLabel: 'Teadur',
      durationMin: s.durationMin,
      partsCount: s.parts.length,
      publishedAt: s.publishedToGalleryAt,
      avgRating: average(s.ratings.map((r) => r.value)),
      ratingCount: s.ratings.length,
      parts: s.parts,
      materials: parseMaterials(s.materialsJson),
      homeworkText: s.homeworkText,
      homeworkRelated: s.homeworkRelated,
      attachedTasks: s.taskUsages.filter((u) => !u.task.hidden).map((u) => ({ id: u.task.id, title: u.task.title })),
      previous: toSampleAdjacent(s.previousSampleLessonPlan),
      next: toSampleAdjacent(s.nextSampleLessonPlan),
    };
  }

  const lp = await prisma.lessonPlan.findUnique({
    where: { id: refId },
    include: {
      parts: { orderBy: { order: 'asc' } },
      researchPlanEntry: { include: { teacher: { include: { user: true } } } },
      previousLessonPlan: { include: { researchPlanEntry: true } },
      nextLessonPlan: { include: { researchPlanEntry: true } },
      taskUsages: { include: { task: true } },
      ratings: true,
    },
  });
  if (!lp || !lp.publishedToGalleryAt || lp.researchPlanEntry.hidden) return null;

  const toAdjacent = (
    candidate: { id: string; publishedToGalleryAt: Date | null; researchPlanEntry: { hidden: boolean; topic: string | null } } | null,
  ): GalleryAdjacent | null =>
    candidate && candidate.publishedToGalleryAt && !candidate.researchPlanEntry.hidden
      ? { refId: candidate.id, topic: candidate.researchPlanEntry.topic }
      : null;

  return {
    id: `katsetund:${lp.id}`,
    sourceType: 'KATSETUND',
    refId: lp.id,
    gradeBand: lp.researchPlanEntry.teacher.gradeBand,
    appliedMethods: lp.researchPlanEntry.appliedMethods,
    topic: lp.researchPlanEntry.topic,
    authorName: lp.researchPlanEntry.teacher.user.name,
    authorRoleLabel: 'Õpetaja-uurija',
    durationMin: lp.researchPlanEntry.durationMin,
    partsCount: lp.parts.length,
    publishedAt: lp.publishedToGalleryAt,
    avgRating: average(lp.ratings.map((r) => r.value)),
    ratingCount: lp.ratings.length,
    parts: lp.parts,
    materials: parseMaterials(lp.materialsJson),
    homeworkText: lp.homeworkText,
    homeworkRelated: lp.homeworkRelated,
    attachedTasks: lp.taskUsages.filter((u) => !u.task.hidden).map((u) => ({ id: u.task.id, title: u.task.title })),
    previous: toAdjacent(lp.previousLessonPlan),
    next: toAdjacent(lp.nextLessonPlan),
  };
}
