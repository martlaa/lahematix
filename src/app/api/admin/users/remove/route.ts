import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// Ainult need rollid, mida admin saab siit deaktiveerida. ADMIN-i ennast ja
// LAPSEVANEMAT/KOOLIJUHTI (mida hallatakse vastavalt õpilase eemaldamise ja
// kooli-tasandi voo kaudu, versioon 4/5) siin ei näidata.
const removableRoles = ['TEADUR', 'OPETAJA'];

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Ligipääs keelatud' }, { status: 403 });
  }

  const form = await req.formData();
  const userId = String(form.get('userId') ?? '');

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return NextResponse.json({ error: 'Kasutajat ei leitud' }, { status: 404 });
  }
  if (!removableRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Seda kasutajat ei saa siit eemaldada' }, { status: 400 });
  }

  await prisma.user.update({ where: { id: user.id }, data: { status: 'DISABLED' } });

  await prisma.auditLog.create({
    data: { actorId: session.userId, action: 'DISABLE', entity: 'User', entityId: user.id, meta: user.role },
  });

  return NextResponse.redirect(new URL('/admin', req.url), 303);
}
