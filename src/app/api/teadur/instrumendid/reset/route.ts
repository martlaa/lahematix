import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Üldine "proovi uuesti" toiming teaduri instrumendikatsetuste jaoks —
// kustutab enda salvestatud katsetuse antud instrumentCode'i alt, et saaks
// vormi tühjalt uuesti täita. Ei mõjuta päris uuringuandmestikku.
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session.userId || session.role !== 'TEADUR') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const instrumentCode = String(form.get('instrumentCode') ?? '');
  const redirectTo = String(form.get('redirectTo') ?? '/teadur/instrumendid');

  await prisma.instrumentTrial.deleteMany({
    where: { authorUserId: session.userId, instrumentCode },
  });

  return NextResponse.redirect(new URL(redirectTo, process.env.APP_BASE_URL || req.url), 303);
}
