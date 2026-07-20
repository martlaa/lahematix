import { test, expect } from '@playwright/test';
import {
  prisma,
  createTeacherFixture,
  createStudentFixture,
  latestInviteToken,
  cleanupFixtures,
  type TeacherFixture,
} from './support/db';
import { postForm, redirectPath, loginAs } from './support/http';

// Kriitiline teekond 2: nõusoleku andmine (vt arendusplaan Faas 7, p 8.2).
// Testib 15+ õpilase enda nõusoleku voogu tervikuna: õpetaja saadab kutse,
// õpilane annab nõusoleku ühekordse tokeni kaudu, hiljem võtab selle tagasi.
test.describe('Nõusoleku andmine (15+ õpilane, token-URL)', () => {
  let teacher: TeacherFixture;
  let studentId: string;

  test.beforeAll(async () => {
    teacher = await createTeacherFixture();
    const student = await createStudentFixture(teacher.teacherId, { isFifteenOrOlder: true });
    studentId = student.studentId;
  });

  test.afterAll(async () => {
    await cleanupFixtures({ studentIds: [studentId], teacherIds: [teacher.teacherId], userIds: [teacher.userId], schoolIds: [teacher.schoolId] });
    await prisma.$disconnect();
  });

  test('õpetaja saadab nõusolekukutse, õpilane annab ja seejärel võtab nõusoleku tagasi', async ({ request }) => {
    // Õpetaja logib sisse (magic link)
    await loginAs(request, teacher.email, teacher.userId);

    // Õpetaja saadab nõusolekukutse valitud õpilasele
    const inviteRes = await postForm(request, '/api/opetaja/opilased/invite', {
      studentIds: studentId,
      purpose: 'CONSENT',
    });
    expect(inviteRes.status()).toBe(303);

    const invite = await latestInviteToken(studentId, 'CONSENT');

    // Õpilane avab lingi ja annab nõusoleku
    const giveRes = await postForm(request, '/api/consent/opilane', {
      token: invite.token,
      action: 'give',
      fullName: 'E2E Õpilane',
      tutvunud: 'on',
      soovin: 'on',
      nousAndmetega: 'on',
    });
    expect(giveRes.status()).toBe(303);
    expect(redirectPath(giveRes)).toBe(`/opilane/nousolek/${invite.token}`);

    const afterGive = await prisma.consentRecord.findFirst({
      where: { studentId, status: 'ANTUD' },
      orderBy: { createdAt: 'desc' },
    });
    expect(afterGive).not.toBeNull();

    const studentAfterGive = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });
    expect(studentAfterGive.excludedFromAnalysis).toBe(false);

    // Õpilane võtab hiljem nõusoleku tagasi
    const withdrawRes = await postForm(request, '/api/consent/opilane', {
      token: invite.token,
      action: 'withdraw',
    });
    expect(withdrawRes.status()).toBe(303);

    const afterWithdraw = await prisma.consentRecord.findFirst({
      where: { studentId, status: 'TAGASI_VOETUD' },
      orderBy: { createdAt: 'desc' },
    });
    expect(afterWithdraw).not.toBeNull();

    const studentAfterWithdraw = await prisma.student.findUniqueOrThrow({ where: { id: studentId } });
    expect(studentAfterWithdraw.excludedFromAnalysis).toBe(true);
  });

  test('aegunud/vale tokeniga nõusoleku andmine ebaõnnestub', async ({ request }) => {
    const res = await postForm(request, '/api/consent/opilane', {
      token: 'see-ei-ole-kehtiv-token',
      action: 'give',
    });
    expect(res.status()).toBe(404);
  });
});
