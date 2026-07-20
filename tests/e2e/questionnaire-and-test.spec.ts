import { test, expect } from '@playwright/test';
import { getQuestionnaireByCode } from '../../src/lib/questionnaires';
import { getTestByGradeBand } from '../../src/lib/tests';
import {
  prisma,
  createTeacherFixture,
  createStudentFixture,
  latestInviteToken,
  cleanupFixtures,
  type TeacherFixture,
} from './support/db';
import { postForm, redirectPath, loginAs } from './support/http';

// Kriitiline teekond 3: küsimustiku ja testi täitmine (vt arendusplaan Faas 7, p 8.2).
// Mõlemad nõuavad kehtivat nõusolekut — testime seda ka negatiivse juhtumina.
test.describe('Küsimustiku ja testi täitmine', () => {
  let teacher: TeacherFixture;
  let studentId: string;

  test.beforeAll(async () => {
    teacher = await createTeacherFixture({ gradeBand: '4-6' });
    const student = await createStudentFixture(teacher.teacherId, { isFifteenOrOlder: true });
    studentId = student.studentId;

    // Õpetaja logib sisse ja annab õpilase eest nõusoleku eeltingimuseks —
    // siin kasutame otse Prisma't, kuna nõusolekuvoog on juba omaette testitud
    // consent.spec.ts failis; see fail keskendub küsimustiku/testi teekonnale.
    await prisma.consentRecord.create({
      data: {
        subjectType: 'OPILANE_15PLUS',
        subjectId: studentId,
        studentId,
        status: 'ANTUD',
        authMethod: 'TOKEN_URL',
      },
    });
  });

  test.afterAll(async () => {
    await cleanupFixtures({ studentIds: [studentId], teacherIds: [teacher.teacherId], userIds: [teacher.userId], schoolIds: [teacher.schoolId] });
    await prisma.$disconnect();
  });

  async function loginAsTeacher(request: import('@playwright/test').APIRequestContext) {
    await loginAs(request, teacher.email, teacher.userId);
  }

  test('õpilane täidab küsimustiku (Lisa 4 eeltest) kehtiva nõusolekuga', async ({ request }) => {
    await loginAsTeacher(request);

    const inviteRes = await postForm(request, '/api/opetaja/opilased/invite', {
      studentIds: studentId,
      purpose: 'QUESTIONNAIRE_EEL',
    });
    expect(inviteRes.status()).toBe(303);

    const invite = await latestInviteToken(studentId, 'QUESTIONNAIRE_EEL');
    const definition = getQuestionnaireByCode('lisa4-eel');
    expect(definition).toBeDefined();

    // Ei täida iga plokki/väidet — smoke-test kontrollib teekonna tervikuna
    // (kutse → esitamine → salvestamine), mitte küsimustiku täielikku katvust.
    const firstBlock = definition!.blocks[0];
    const firstItemKey = firstBlock.type === 'method_comparison' ? undefined : firstBlock.items[0].key;
    expect(firstItemKey).toBeDefined();
    const fieldName = `${firstBlock.key}.${firstItemKey}`;

    const submitRes = await postForm(request, '/api/kysimustik/opilane', {
      token: invite.token,
      [fieldName]: '3',
    });
    expect(submitRes.status()).toBe(303);
    expect(redirectPath(submitRes)).toBe(`/opilane/kysimustik/${invite.token}`);

    const response = await prisma.questionnaireResponse.findUnique({
      where: { questionnaireCode_studentId: { questionnaireCode: 'lisa4-eel', studentId } },
    });
    expect(response).not.toBeNull();
    const answers = JSON.parse(response!.answersJson);
    expect(answers[firstBlock.key][firstItemKey!]).toBe('3');
  });

  test('õpilane sooritab matemaatikatesti (4.-6. klass) kehtiva nõusolekuga', async ({ request }) => {
    await loginAsTeacher(request);

    const inviteRes = await postForm(request, '/api/opetaja/opilased/invite', {
      studentIds: studentId,
      purpose: 'TEST_EEL',
    });
    expect(inviteRes.status()).toBe(303);

    const invite = await latestInviteToken(studentId, 'TEST_EEL');
    const definition = getTestByGradeBand('4-6');
    expect(definition).toBeDefined();

    const problem = definition!.problems[0];
    const sub = problem.subQuestions[0];

    const submitRes = await postForm(request, '/api/test/opilane', {
      token: invite.token,
      [`${problem.key}.${sub.key}.choice`]: sub.correctChoice,
    });
    expect(submitRes.status()).toBe(303);
    expect(redirectPath(submitRes)).toBe(`/opilane/test/${invite.token}`);

    const submission = await prisma.testSubmission.findUnique({
      where: { testCode_phase_studentId: { testCode: definition!.code, phase: 'EEL', studentId } },
    });
    expect(submission).not.toBeNull();
    expect(submission!.submittedAt).not.toBeNull();
    const answers = JSON.parse(submission!.answersJson!);
    expect(answers[problem.key][sub.key].choice).toBe(sub.correctChoice);
  });

  test('nõusolekuta õpilasele ei saa testi/küsimustiku kutset saata', async ({ request }) => {
    // Uus õpilane, ilma nõusolekuta.
    const noConsentStudent = await createStudentFixture(teacher.teacherId, { isFifteenOrOlder: true });
    try {
      await loginAsTeacher(request);
      const res = await postForm(request, '/api/opetaja/opilased/invite', {
        studentIds: noConsentStudent.studentId,
        purpose: 'QUESTIONNAIRE_EEL',
      });
      // Kutse "õnnestub" (303), aga õpilane jääb errors nimekirja, kuna nõusolek puudub.
      expect(res.status()).toBe(303);
      const location = new URL(res.headers()['location'] ?? '', 'http://localhost:3000');
      const inviteErrors = JSON.parse(location.searchParams.get('inviteErrors') ?? '[]');
      expect(inviteErrors).toEqual([
        { name: 'E2E Õpilane', message: 'Nõusolek uuringus osalemiseks puudub' },
      ]);

      const tokenCount = await prisma.inviteToken.count({
        where: { studentId: noConsentStudent.studentId, purpose: 'QUESTIONNAIRE_EEL' },
      });
      expect(tokenCount).toBe(0);
    } finally {
      await cleanupFixtures({ studentIds: [noConsentStudent.studentId] });
    }
  });
});
