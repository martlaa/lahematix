import nodemailer from 'nodemailer';

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: false, // STARTTLS pordil 587
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendMail(opts: { to: string; subject: string; html: string }) {
  const t = getTransporter();
  await t.sendMail({
    from: process.env.SMTP_FROM,
    to: opts.to,
    subject: opts.subject,
    html: opts.html,
  });
}

export function inviteEmailHtml(params: { name: string; link: string; roleLabel: string }) {
  return `
    <p>Tere, ${params.name}!</p>
    <p>Sind on kutsutud LAHEMATE projekti uuringurakendusse rolliga <strong>${params.roleLabel}</strong>.</p>
    <p><a href="${params.link}">Kliki siia, et jätkata</a></p>
    <p>Link kehtib 14 päeva.</p>
    <p>Lugupidamisega,<br/>LAHEMATE projekti meeskond</p>
  `;
}

export function magicLinkEmailHtml(params: { name: string; link: string }) {
  return `
    <p>Tere, ${params.name}!</p>
    <p>Siin on Su ühekordne sisselogimislink LAHEMATE uuringurakendusse:</p>
    <p><a href="${params.link}">Logi sisse</a></p>
    <p>Link kehtib 15 minutit ja töötab ainult üks kord. Kui Sa seda ei küsinud, võid selle e-kirja ignoreerida.</p>
    <p>Lugupidamisega,<br/>LAHEMATE projekti meeskond</p>
  `;
}

export function consentInviteEmailHtml(params: {
  name: string;
  link: string;
  forChildName?: string;
  formal?: boolean; // "Teil" (vaikimisi, täiskasvanule) vs "Sul" (15+ õpilasele endale)
}) {
  const formal = params.formal ?? true;
  const intro = params.forChildName
    ? `<p>Palume Teil täita nõusolekuvorm oma lapse <strong>${params.forChildName}</strong> LAHEMATE uuringus osalemiseks.</p>`
    : formal
      ? `<p>Palume Teil täita nõusolekuvorm LAHEMATE uuringus osalemiseks.</p>`
      : `<p>Palume Sul täita nõusolekuvorm LAHEMATE uuringus osalemiseks.</p>`;
  return `
    <p>Tere, ${params.name}!</p>
    ${intro}
    <p><a href="${params.link}">Ava nõusolekuvorm</a></p>
    <p>Link on isiklik — palun ära jaga seda teistega. See jääb kehtima kogu uuringu vältel,
    nii et kasuta sama linki ka hiljem, kui soovid oma vastust muuta või nõusoleku tagasi võtta.</p>
    <p>Lugupidamisega,<br/>LAHEMATE projekti meeskond</p>
  `;
}

export function questionnaireInviteEmailHtml(params: { name: string; link: string }) {
  return `
    <p>Tere, ${params.name}!</p>
    <p>Palume Sul täita LAHEMATE projekti küsimustik. Vastamine võtab veidi aega, aga on uuringu jaoks väga oluline.</p>
    <p><a href="${params.link}">Ava küsimustik</a></p>
    <p>Link on isiklik — palun ära jaga seda teistega.</p>
    <p>Lugupidamisega,<br/>LAHEMATE projekti meeskond</p>
  `;
}

export function testInviteEmailHtml(params: { name: string; link: string }) {
  return `
    <p>Tere, ${params.name}!</p>
    <p>Palume Sul sooritada LAHEMATE projekti matemaatilise probleemilahenduse test. Testile on aega ette
    nähtud, aga kiirustada pole vaja — vasta rahulikult.</p>
    <p><a href="${params.link}">Ava test</a></p>
    <p>Link on isiklik — palun ära jaga seda teistega.</p>
    <p>Lugupidamisega,<br/>LAHEMATE projekti meeskond</p>
  `;
}
