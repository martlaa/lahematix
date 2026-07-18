import { prisma } from '@/lib/prisma';
import { generatePseudonym } from '@/lib/pseudonym';
import { nanoid } from 'nanoid';
import { sendMail, inviteEmailHtml } from '@/lib/mail';

export type StudentGroupValue = 'INTERVENTSIOON' | 'KONTROLL';

export type StudentInput = {
  name: string;
  email: string;
  classCode: string | null;
  group: StudentGroupValue;
  birthYear: number | null;
  gender: string | null;
  isFifteenOrOlder: boolean;
  parentName: string;
  parentEmail: string;
};

export type CreateStudentResult =
  | { status: 'created'; student: Awaited<ReturnType<typeof prisma.student.create>> }
  | { status: 'duplicate'; existingName: string };

/** Loob õpilase (ja vajadusel lapsevanema kasutaja + kutse) — jagatud loogika
 *  ükshaaval lisamise vormi ja CSV-importi vahel. Kui e-postiga õpilane on juba
 *  olemas, ei looda duplikaati, vaid tagastatakse "duplicate" tulemus. */
export async function createStudent(teacherId: string, input: StudentInput): Promise<CreateStudentResult> {
  if (!input.name) {
    throw new Error('Õpilase nimi on kohustuslik');
  }
  const email = input.email.toLowerCase().trim();
  if (!email || !email.includes('@')) {
    throw new Error('Õpilase e-post on kohustuslik ja peab olema kehtiv');
  }
  if (!input.isFifteenOrOlder && (!input.parentName || !input.parentEmail)) {
    throw new Error('Alla 15-aastase õpilase puhul on lapsevanema nimi ja e-post kohustuslikud');
  }

  const existing = await prisma.student.findUnique({ where: { email } });
  if (existing) {
    return { status: 'duplicate', existingName: existing.name };
  }

  let pseudonymCode = generatePseudonym();
  for (let i = 0; i < 5; i++) {
    const exists = await prisma.student.findUnique({ where: { pseudonymCode } });
    if (!exists) break;
    pseudonymCode = generatePseudonym();
  }

  let parentId: string | null = null;

  if (!input.isFifteenOrOlder) {
    const parentEmail = input.parentEmail.toLowerCase();
    const parentUser = await prisma.user.upsert({
      where: { email: parentEmail },
      update: { name: input.parentName },
      create: { name: input.parentName, email: parentEmail, role: 'LAPSEVANEM', status: 'INVITED' },
    });
    const parent = await prisma.parent.upsert({
      where: { userId: parentUser.id },
      update: {},
      create: { userId: parentUser.id },
    });
    parentId = parent.id;

    try {
      await sendMail({
        to: parentEmail,
        subject: 'LAHEMATE projekt — nõusoleku vorm Teie lapse osalemiseks',
        html: inviteEmailHtml({
          name: input.parentName,
          link: `${process.env.APP_BASE_URL}/login`,
          roleLabel: 'lapsevanem',
        }),
      });
    } catch (err) {
      console.error('Lapsevanema kutse saatmine ebaõnnestus:', err);
    }
  }

  const student = await prisma.student.create({
    data: {
      pseudonymCode,
      name: input.name,
      email,
      classCode: input.classCode,
      teacherId,
      group: input.group,
      birthYear: input.birthYear,
      gender: input.gender,
      isFifteenOrOlder: input.isFifteenOrOlder,
      parentId,
    },
  });

  if (input.isFifteenOrOlder) {
    await prisma.inviteToken.create({
      data: {
        token: nanoid(24),
        studentId: student.id,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 120), // 120 päeva
      },
    });
  }

  return { status: 'created', student };
}

export type CsvRow = StudentInput & { rowNumber: number };
export type CsvError = { row: number; message: string };

function normalizeHeader(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // eemalda diakriitikud (õ→o, ü→u, ä→a, ö→o)
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

/** Parsib CSV teksti õpilaste ridadeks. Toetab nii koma- kui semikoolonjaotusega
 *  faile (Eesti Exceli vaikeseade ekspordib semikooloniga) ja on tolerantne
 *  päiseveergude täpitähtede kodeeringu suhtes. */
export function parseStudentsCsv(text: string): { rows: CsvRow[]; errors: CsvError[] } {
  const errors: CsvError[] = [];
  const rows: CsvRow[] = [];

  const lines = text
    .replace(/^﻿/, '') // eemalda Exceli lisatud UTF-8 BOM, kui esineb
    .split(/\r?\n/)
    .filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    errors.push({ row: 1, message: 'CSV fail on tühi.' });
    return { rows, errors };
  }

  const delimiter = (lines[0].match(/;/g)?.length ?? 0) >= (lines[0].match(/,/g)?.length ?? 0) ? ';' : ',';
  const header = lines[0].split(delimiter).map(normalizeHeader);

  const idxName = header.indexOf('nimi');
  const idxEmail = header.indexOf('e_post');
  const idxClassCode = header.indexOf('klass');
  const idxGroup = header.indexOf('ruhm');
  const idxBirthYear = header.indexOf('sunniaasta');
  const idxGender = header.indexOf('sugu');
  const idxFifteen = header.indexOf('vanune_15_voi_enam');
  const idxParentName = header.indexOf('lapsevanema_nimi');
  const idxParentEmail = header.indexOf('lapsevanema_e_post');

  if (idxName === -1 || idxEmail === -1 || idxGroup === -1) {
    errors.push({
      row: 1,
      message: 'Veerud "nimi", "e-post" või "rühm" puuduvad päisereast. Kasuta allalaaditud näidis-CSV struktuuri.',
    });
    return { rows, errors };
  }

  const cell = (cells: string[], idx: number) => (idx >= 0 ? (cells[idx] ?? '').trim().replace(/^"|"$/g, '') : '');

  for (let i = 1; i < lines.length; i++) {
    const rowNumber = i + 1; // 1-indexed, päis on rida 1
    const cells = lines[i].split(delimiter);

    const name = cell(cells, idxName);
    if (!name) {
      errors.push({ row: rowNumber, message: 'Õpilase nimi on kohustuslik.' });
      continue;
    }

    const email = cell(cells, idxEmail).toLowerCase();
    if (!email || !email.includes('@')) {
      errors.push({ row: rowNumber, message: `Õpilase e-post puudub või on vigane (leitud: "${cell(cells, idxEmail)}").` });
      continue;
    }

    const classCode = cell(cells, idxClassCode) || null;

    const groupRaw = cell(cells, idxGroup).toLowerCase();
    const group: StudentGroupValue | null =
      groupRaw === 'kontroll' ? 'KONTROLL' : groupRaw === 'sekkumine' ? 'INTERVENTSIOON' : null;
    if (!group) {
      errors.push({ row: rowNumber, message: `Rühm peab olema "sekkumine" või "kontroll" (leitud: "${cell(cells, idxGroup)}").` });
      continue;
    }

    const birthYearRaw = cell(cells, idxBirthYear);
    const birthYear = birthYearRaw ? Number(birthYearRaw) : null;
    if (birthYearRaw && Number.isNaN(birthYear)) {
      errors.push({ row: rowNumber, message: `Sünniaasta ei ole number (leitud: "${birthYearRaw}").` });
      continue;
    }

    const gender = cell(cells, idxGender) || null;
    const isFifteenOrOlder = cell(cells, idxFifteen).toLowerCase() === 'jah';
    const parentName = cell(cells, idxParentName);
    const parentEmail = cell(cells, idxParentEmail).toLowerCase();

    if (!isFifteenOrOlder && (!parentName || !parentEmail)) {
      errors.push({ row: rowNumber, message: 'Alla 15-aastase õpilase puhul on lapsevanema nimi ja e-post kohustuslikud.' });
      continue;
    }

    rows.push({ rowNumber, name, email, classCode, group, birthYear, gender, isFifteenOrOlder, parentName, parentEmail });
  }

  return { rows, errors };
}
