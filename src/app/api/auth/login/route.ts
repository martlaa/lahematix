import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma';
import { sendMail, magicLinkEmailHtml } from '@/lib/mail';
import { isAppClosed } from '@/lib/appSettings';

// E-posti-põhine autentimine, versioon 3 (magic link — vt
// LAHEMATIX_arendusnouded_ja_plaan.md punkt 4). Kasutaja sisestab e-posti,
// saab ühekordse 15 min kehtiva lingi, kliki lingile loob sessiooni
// (vt /api/auth/verify). Admin loob kasutajad ette (vt /admin), seega see
// endpoint lubab linki saata ainult juba andmebaasis oleva e-postiga.

const TOKEN_TTL_MS = 15 * 60 * 1000;

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

  if (user.role !== 'ADMIN' && (await isAppClosed())) {
    return NextResponse.json(
      { error: 'LAHEMATIX rakendus on suletud — uuring on lõppenud. Küsimuste korral võta ühendust projekti meeskonnaga.' },
      { status: 403 },
    );
  }

  // Varasemad kasutamata lingid muutuvad kehtetuks, et korraga kehtiks alati üks link.
  await prisma.loginToken.deleteMany({ where: { userId: user.id, usedAt: null } });

  const token = nanoid(32);
  await prisma.loginToken.create({
    data: {
      token,
      userId: user.id,
      expiresAt: new Date(Date.now() + TOKEN_TTL_MS),
    },
  });

  const link = `${process.env.APP_BASE_URL}/api/auth/verify?token=${token}`;

  if (process.env.NODE_ENV !== 'production') {
    // Kohalikus arenduses, kui SMTP pole seadistatud, saab lingi siit konsoolist kopeerida.
    console.log(`[DEV] Sisselogimislink kasutajale ${user.email}: ${link}`);
  }

  try {
    await sendMail({
      to: user.email,
      subject: 'LAHEMATIX sisselogimislink',
      html: magicLinkEmailHtml({ name: user.name, link }),
    });
  } catch (err) {
    console.error('Sisselogimislingi saatmine ebaõnnestus:', err);
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json({ error: 'E-kirja saatmine ebaõnnestus. Palun proovi hiljem uuesti.' }, { status: 500 });
    }
  }

  return NextResponse.json({ ok: true });
}
