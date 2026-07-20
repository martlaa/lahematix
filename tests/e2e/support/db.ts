import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

// Jagatud Prisma klient testide jaoks — loeb sama DATABASE_URL-i, mida rakendus
// ise kasutab (vt global-setup.ts turvakontrolli, mis tagab, et see on DDEV, mitte tootmine).
export const prisma = new PrismaClient();

// Iga testijooksu ja iga üksiku kutsungi jaoks unikaalne e-posti suffiks, et
// vältida unikaalsuse piirangute konflikte (nii korduvatel käivitustel kui
// mitmel samanimelisel fixture'il ühe jooksu sees) ilma keerulise koristuseta.
const RUN_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
let callCounter = 0;
export function testEmail(prefix: string): string {
  callCounter += 1;
  return `e2e-${prefix}-${RUN_ID}-${callCounter}@test.lahematix.local`;
}

export interface TeacherFixture {
  schoolId: string;
  userId: string;
  teacherId: string;
  email: string;
}

export async function createTeacherFixture(opts: { gradeBand?: string } = {}): Promise<TeacherFixture> {
  const school = await prisma.school.create({
    data: { name: `E2E kool ${RUN_ID}` },
  });
  const email = testEmail('opetaja');
  const user = await prisma.user.create({
    data: { email, name: 'E2E Õpetaja', role: 'OPETAJA', status: 'ACTIVE' },
  });
  const teacher = await prisma.teacher.create({
    data: {
      userId: user.id,
      schoolId: school.id,
      pseudonymCode: `E2E-${nanoid(6)}`,
      gradeBand: opts.gradeBand,
    },
  });
  return { schoolId: school.id, userId: user.id, teacherId: teacher.id, email };
}

export async function createTeadurFixture(): Promise<{ userId: string; email: string }> {
  const email = testEmail('teadur');
  const user = await prisma.user.create({
    data: { email, name: 'E2E Teadur', role: 'TEADUR', status: 'ACTIVE' },
  });
  return { userId: user.id, email };
}

export async function createStudentFixture(
  teacherId: string,
  opts: { isFifteenOrOlder?: boolean } = {},
): Promise<{ studentId: string; email: string }> {
  const email = testEmail('opilane');
  const student = await prisma.student.create({
    data: {
      pseudonymCode: `E2E-${nanoid(6)}`,
      name: 'E2E Õpilane',
      email,
      teacherId,
      group: 'INTERVENTSIOON',
      isFifteenOrOlder: opts.isFifteenOrOlder ?? true,
    },
  });
  return { studentId: student.id, email };
}

export async function getAdminUser() {
  const admin = await prisma.user.findUnique({ where: { email: 'admin@lahemate.ee' } });
  if (!admin) {
    throw new Error(
      'admin@lahemate.ee ei leitud — käivita enne teste "ddev exec npm run seed", et luua seemne-admin.',
    );
  }
  return admin;
}

export async function latestLoginToken(userId: string) {
  const token = await prisma.loginToken.findFirst({
    where: { userId, usedAt: null },
    orderBy: { createdAt: 'desc' },
  });
  if (!token) throw new Error(`LoginToken puudub kasutajale ${userId} — kas /api/auth/login tõesti õnnestus?`);
  return token;
}

export async function latestInviteToken(studentId: string, purpose: string) {
  const token = await prisma.inviteToken.findFirst({
    where: { studentId, purpose: purpose as never },
    orderBy: { createdAt: 'desc' },
  });
  if (!token) throw new Error(`InviteToken (${purpose}) puudub õpilasele ${studentId}`);
  return token;
}

// Kustutab testi loodud kirjed sõltuvuste järjekorras (lapsed enne vanemaid),
// et vältida FK-piirangute rikkumist. Parimal jõul (best-effort) — üks
// ebaõnnestunud kustutus ei tohi jätta ülejäänud koristust tegemata.
export async function cleanupFixtures(ids: {
  studentIds?: string[];
  teacherIds?: string[];
  userIds?: string[];
  schoolIds?: string[];
}) {
  const { studentIds = [], teacherIds = [], userIds = [], schoolIds = [] } = ids;
  const steps: Array<() => Promise<unknown>> = [
    () => prisma.testGrading.deleteMany({ where: { testSubmission: { studentId: { in: studentIds } } } }),
    () => prisma.testSubmissionPhoto.deleteMany({ where: { testSubmission: { studentId: { in: studentIds } } } }),
    () => prisma.testSubmission.deleteMany({ where: { studentId: { in: studentIds } } }),
    () => prisma.questionnaireResponse.deleteMany({ where: { studentId: { in: studentIds } } }),
    () => prisma.consentRecord.deleteMany({ where: { studentId: { in: studentIds } } }),
    () => prisma.inviteToken.deleteMany({ where: { studentId: { in: studentIds } } }),
    () => prisma.loginToken.deleteMany({ where: { userId: { in: userIds } } }),
    () => prisma.exportRequest.deleteMany({ where: { requestedByUserId: { in: userIds } } }),
    () => prisma.student.deleteMany({ where: { id: { in: studentIds } } }),
    () => prisma.teacher.deleteMany({ where: { id: { in: teacherIds } } }),
    () => prisma.user.deleteMany({ where: { id: { in: userIds } } }),
    () => prisma.school.deleteMany({ where: { id: { in: schoolIds } } }),
  ];
  for (const step of steps) {
    try {
      await step();
    } catch (err) {
      console.error('Koristus ebaõnnestus (jätkame):', err);
    }
  }
}
