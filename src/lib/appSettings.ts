import { prisma } from '@/lib/prisma';

const SINGLETON_ID = 'singleton';

export async function getAppSettings() {
  return prisma.appSettings.upsert({
    where: { id: SINGLETON_ID },
    update: {},
    create: { id: SINGLETON_ID },
  });
}

export async function isAppClosed(): Promise<boolean> {
  const settings = await getAppSettings();
  return settings.closedAt !== null;
}
