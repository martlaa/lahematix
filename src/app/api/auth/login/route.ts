import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

// AJUTINE (Faas 1): kasutaja saab sisse logida ainult oma e-postiga,
// ilma paroolita. See EI OLE turvaline lõplik lahendus — see on
// asendatav HarID SAML-vooga Faasis 5, ilma et ülejäänud rakendust
// peaks muutma (sessioon jääb samaks, muutub ainult see fail).
//
// Praktikas: admin loob kasutajad ette (vt /admin), seega DEV_LOGIN
// lubab sisse ainult juba andmebaasis oleva e-postiga.

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'E-post on kohustuslik' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } });

  if (!user || user.status === 'DISABLED') {
    return NextResponse.json(
      { error: 'Sellise e-postiga kasutajat ei leitud. Palun kontrolli aadressi või võta ühendust projekti meeskonnaga.' },
      { status: 401 },
    );
  }

  const session = await getSession();
  session.userId = user.id;
  session.role = user.role;
  session.email = user.email;
  session.name = user.name;
  await session.save();

  if (user.status === 'INVITED') {
    await prisma.user.update({ where: { id: user.id }, data: { status: 'ACTIVE' } });
  }

  return NextResponse.json({ ok: true, role: user.role });
}
