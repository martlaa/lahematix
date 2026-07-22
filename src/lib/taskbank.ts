import { prisma } from '@/lib/prisma';
import type { Method } from '@prisma/client';

// Ülesannete pank (vt prisma/schema.prisma Task-mudeli kommentaar) — avalik
// jagatud õppematerjalide kogu, struktuurilt ja eesmärgilt paralleelne
// tunnikavade galeriiga (src/lib/gallery.ts). Populaarsuse näitajad
// (downloadCount, usageCount, avgRating) arvutatakse siin ühtemoodi nii
// nimekirja- kui detailvaate jaoks.

export interface TaskBankItem {
  id: string;
  title: string;
  gradeBand: string | null;
  topic: string | null;
  appliedMethods: Method[];
  creditedAuthor: string | null;
  authorName: string;
  authorRoleLabel: string;
  hasFile: boolean;
  hasLink: boolean;
  downloadCount: number;
  usageCount: number;
  avgRating: number | null;
  ratingCount: number;
  createdAt: Date;
}

export interface TaskBankDetail extends TaskBankItem {
  worksheetUrl: string | null;
  fileName: string | null;
  fileSizeBytes: number | null;
}

function average(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

const ITEM_INCLUDE = {
  authorUser: true,
  ratings: true,
  _count: { select: { usages: true } },
} as const;

function toItem(task: {
  id: string;
  title: string;
  gradeBand: string | null;
  topic: string | null;
  appliedMethods: Method[];
  creditedAuthor: string | null;
  authorUser: { name: string; role: string };
  filePath: string | null;
  worksheetUrl: string | null;
  downloadCount: number;
  ratings: { value: number }[];
  _count: { usages: number };
  createdAt: Date;
}): TaskBankItem {
  return {
    id: task.id,
    title: task.title,
    gradeBand: task.gradeBand,
    topic: task.topic,
    appliedMethods: task.appliedMethods,
    creditedAuthor: task.creditedAuthor,
    authorName: task.authorUser.name,
    authorRoleLabel: task.authorUser.role === 'TEADUR' ? 'Teadur' : 'Õpetaja-uurija',
    hasFile: Boolean(task.filePath),
    hasLink: Boolean(task.worksheetUrl),
    downloadCount: task.downloadCount,
    usageCount: task._count.usages,
    avgRating: average(task.ratings.map((r) => r.value)),
    ratingCount: task.ratings.length,
    createdAt: task.createdAt,
  };
}

export async function getTaskBankItems(): Promise<TaskBankItem[]> {
  const tasks = await prisma.task.findMany({
    where: { hidden: false },
    include: ITEM_INCLUDE,
    orderBy: { createdAt: 'desc' },
  });
  return tasks.map(toItem);
}

export async function getTaskBankDetail(id: string): Promise<TaskBankDetail | null> {
  const task = await prisma.task.findUnique({ where: { id }, include: ITEM_INCLUDE });
  if (!task || task.hidden) return null;
  return {
    ...toItem(task),
    worksheetUrl: task.worksheetUrl,
    fileName: task.fileName,
    fileSizeBytes: task.fileSizeBytes,
  };
}
