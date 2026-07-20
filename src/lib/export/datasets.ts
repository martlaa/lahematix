import { prisma } from '@/lib/prisma';
import type { Dataset, DatasetDefinition, CellValue } from './types';
import { OBSERVATION_DOMAINS } from '@/lib/observation/lisa6';
import { LESSON_PART_TYPE_LABEL } from '@/lib/lessonplan/types';
import type {
  ObservationRatings,
  IncidentLogRow,
  ObservationSummary,
} from '@/lib/observation/lisa6';

// Uurimisandmestiku eksport (eetikataotlus p 4.1-4.2): kõik allolevad
// andmestikud on pseudonümiseeritud — kusagil ei kuvata õpilase, õpetaja ega
// lapsevanema nime, ainult pseudonüümikoodid. Teaduri enda instrumendi-
// katsetused (InstrumentTrial) ja näidistunnikavad (SampleLessonPlan) ei ole
// päris uurimisandmestik, seetõttu neid siin ei ekspordita.

async function teacherPseudonymByUserId(): Promise<Map<string, string>> {
  const teachers = await prisma.teacher.findMany({ select: { userId: true, pseudonymCode: true } });
  return new Map(teachers.map((t) => [t.userId, t.pseudonymCode]));
}

async function schoolNameById(): Promise<Map<string, string>> {
  const schools = await prisma.school.findMany({ select: { id: true, name: true } });
  return new Map(schools.map((s) => [s.id, s.name]));
}

function isoOrNull(d: Date | null | undefined): string | null {
  return d ? d.toISOString() : null;
}

async function buildNousolekud(): Promise<Dataset> {
  const [records, teacherByUserId, schoolByIdMap] = await Promise.all([
    prisma.consentRecord.findMany({
      include: { student: true },
      orderBy: { createdAt: 'asc' },
    }),
    teacherPseudonymByUserId(),
    schoolNameById(),
  ]);

  const rows: CellValue[][] = records.map((r) => {
    let subject: string | null = null;
    if (r.subjectType === 'OPETAJA') subject = teacherByUserId.get(r.subjectId) ?? null;
    else if (r.subjectType === 'KOOLIJUHT') subject = `KOOL: ${schoolByIdMap.get(r.subjectId) ?? r.subjectId}`;
    else subject = r.student?.pseudonymCode ?? null;

    return [
      subject,
      r.subjectType,
      r.formVersion,
      r.status,
      isoOrNull(r.givenAt),
      isoOrNull(r.withdrawnAt),
      r.authMethod,
    ];
  });

  return {
    headers: ['Andmesubjekt', 'Andmesubjekti tüüp', 'Vormi versioon', 'Staatus', 'Antud', 'Tagasi võetud', 'Autentimisviis'],
    rows,
  };
}

async function buildOpilased(): Promise<Dataset> {
  const [students, schoolByIdMap] = await Promise.all([
    prisma.student.findMany({ include: { teacher: true }, orderBy: { pseudonymCode: 'asc' } }),
    schoolNameById(),
  ]);

  const rows: CellValue[][] = students.map((s) => [
    s.pseudonymCode,
    schoolByIdMap.get(s.teacher.schoolId) ?? null,
    s.classCode,
    s.group,
    s.gender,
    s.birthYear,
    s.isFifteenOrOlder,
    s.excludedFromAnalysis,
    isoOrNull(s.excludedAt),
  ]);

  return {
    headers: [
      'Pseudonüüm',
      'Kool',
      'Klass',
      'Rühm',
      'Sugu',
      'Sünniaasta',
      '15+ vanuses',
      'Väljajäetud analüüsist',
      'Väljajätmise aeg',
    ],
    rows,
  };
}

async function buildOpetajad(): Promise<Dataset> {
  const [teachers, schoolByIdMap] = await Promise.all([
    prisma.teacher.findMany({ orderBy: { pseudonymCode: 'asc' } }),
    schoolNameById(),
  ]);

  const rows: CellValue[][] = teachers.map((t) => [
    t.pseudonymCode,
    schoolByIdMap.get(t.schoolId) ?? null,
    t.gradeBand,
    t.method,
    t.group,
  ]);

  return {
    headers: ['Pseudonüüm', 'Kool', 'Vanuseaste', 'Meetod', 'Rühm'],
    rows,
  };
}

async function buildTestitulemused(): Promise<Dataset> {
  const submissions = await prisma.testSubmission.findMany({
    include: { student: true, grading: true },
    orderBy: [{ testCode: 'asc' }, { phase: 'asc' }],
  });

  const rows: CellValue[][] = [];
  for (const sub of submissions) {
    const scores: Record<string, Record<string, number>> = sub.grading?.scoresJson
      ? JSON.parse(sub.grading.scoresJson)
      : {};
    const answers: Record<string, Record<string, { choice?: string; explanation?: string }>> = sub.answersJson
      ? JSON.parse(sub.answersJson)
      : {};
    const problemKeys = new Set([...Object.keys(scores), ...Object.keys(answers)]);
    for (const problemKey of problemKeys) {
      const subKeys = new Set([
        ...Object.keys(scores[problemKey] ?? {}),
        ...Object.keys(answers[problemKey] ?? {}),
      ]);
      for (const subKey of subKeys) {
        rows.push([
          sub.student.pseudonymCode,
          sub.testCode,
          sub.phase,
          problemKey,
          subKey,
          answers[problemKey]?.[subKey]?.choice ?? null,
          answers[problemKey]?.[subKey]?.explanation ?? null,
          scores[problemKey]?.[subKey] ?? null,
          sub.grading?.totalScore ?? null,
          isoOrNull(sub.submittedAt),
          isoOrNull(sub.grading?.gradedAt ?? null),
        ]);
      }
    }
    if (problemKeys.size === 0) {
      // paberil sooritus, mida pole veel hinnatud — ikkagi kirje, et sooritus oleks nähtav
      rows.push([
        sub.student.pseudonymCode,
        sub.testCode,
        sub.phase,
        null,
        null,
        null,
        null,
        null,
        sub.grading?.totalScore ?? null,
        isoOrNull(sub.submittedAt),
        isoOrNull(sub.grading?.gradedAt ?? null),
      ]);
    }
  }

  return {
    headers: [
      'Õpilase pseudonüüm',
      'Testi kood',
      'Faas',
      'Ülesanne',
      'Alaküsimus',
      'Valik',
      'Selgitus',
      'Punktid',
      'Koondskoor',
      'Sooritatud',
      'Hinnatud',
    ],
    rows,
  };
}

async function buildKysimustikud(): Promise<Dataset> {
  const responses = await prisma.questionnaireResponse.findMany({
    include: { student: true, teacherUser: { include: { teacherProfile: true } } },
    orderBy: { submittedAt: 'asc' },
  });

  const rows: CellValue[][] = [];
  for (const r of responses) {
    const respondentType = r.studentId ? 'OPILANE' : 'OPETAJA';
    const pseudonym = r.studentId ? r.student?.pseudonymCode ?? null : r.teacherUser?.teacherProfile?.pseudonymCode ?? null;
    const answers: Record<string, Record<string, string>> = JSON.parse(r.answersJson);
    for (const blockKey of Object.keys(answers)) {
      for (const itemKey of Object.keys(answers[blockKey])) {
        rows.push([
          respondentType,
          pseudonym,
          r.questionnaireCode,
          blockKey,
          itemKey,
          answers[blockKey][itemKey],
          isoOrNull(r.submittedAt),
        ]);
      }
    }
  }

  return {
    headers: ['Vastaja tüüp', 'Vastaja pseudonüüm', 'Küsimustiku kood', 'Plokk', 'Väide', 'Vastus', 'Esitatud'],
    rows,
  };
}

async function buildPaevik(): Promise<Dataset> {
  const entries = await prisma.journalEntry.findMany({
    include: { teacher: true, researchPlanEntry: true },
    orderBy: { submittedAt: 'asc' },
  });

  const rows: CellValue[][] = [];
  for (const e of entries) {
    const answers: {
      likert: Record<string, Record<string, { value: number; comment?: string }>>;
      rolfe: { what: [string, string, string]; soWhat: string; nowWhat: string };
    } = JSON.parse(e.answersJson);

    for (const domainKey of Object.keys(answers.likert)) {
      for (const itemKey of Object.keys(answers.likert[domainKey])) {
        const item = answers.likert[domainKey][itemKey];
        rows.push([
          e.teacher.pseudonymCode,
          isoOrNull(e.researchPlanEntry.date),
          e.researchPlanEntry.topic,
          'likert',
          domainKey,
          itemKey,
          item.value,
          item.comment ?? null,
          isoOrNull(e.submittedAt),
        ]);
      }
    }
    rows.push([e.teacher.pseudonymCode, isoOrNull(e.researchPlanEntry.date), e.researchPlanEntry.topic, 'rolfe', 'what.1', null, null, answers.rolfe.what[0], isoOrNull(e.submittedAt)]);
    rows.push([e.teacher.pseudonymCode, isoOrNull(e.researchPlanEntry.date), e.researchPlanEntry.topic, 'rolfe', 'what.2', null, null, answers.rolfe.what[1], isoOrNull(e.submittedAt)]);
    rows.push([e.teacher.pseudonymCode, isoOrNull(e.researchPlanEntry.date), e.researchPlanEntry.topic, 'rolfe', 'what.3', null, null, answers.rolfe.what[2], isoOrNull(e.submittedAt)]);
    rows.push([e.teacher.pseudonymCode, isoOrNull(e.researchPlanEntry.date), e.researchPlanEntry.topic, 'rolfe', 'soWhat', null, null, answers.rolfe.soWhat, isoOrNull(e.submittedAt)]);
    rows.push([e.teacher.pseudonymCode, isoOrNull(e.researchPlanEntry.date), e.researchPlanEntry.topic, 'rolfe', 'nowWhat', null, null, answers.rolfe.nowWhat, isoOrNull(e.submittedAt)]);
  }

  return {
    headers: ['Õpetaja pseudonüüm', 'Tunni kuupäev', 'Tunni teema', 'Osa', 'Väide/plokk', 'Alaväide', 'Likert väärtus', 'Vastus/kommentaar', 'Esitatud'],
    rows,
  };
}

async function buildUuringukava(): Promise<Dataset> {
  const entries = await prisma.researchPlanEntry.findMany({
    include: { teacher: true, lessonPlan: { include: { parts: { orderBy: { order: 'asc' } } } } },
    orderBy: { date: 'asc' },
  });

  const rows: CellValue[][] = [];
  for (const e of entries) {
    if (!e.lessonPlan || e.lessonPlan.parts.length === 0) {
      rows.push([
        e.teacher.pseudonymCode,
        isoOrNull(e.date),
        e.startTime,
        e.durationMin,
        e.studentGroup,
        e.appliedMethods.join('/'),
        e.topic,
        e.hidden,
        null,
        null,
        null,
        null,
        null,
      ]);
      continue;
    }
    for (const p of e.lessonPlan.parts) {
      rows.push([
        e.teacher.pseudonymCode,
        isoOrNull(e.date),
        e.startTime,
        e.durationMin,
        e.studentGroup,
        e.appliedMethods.join('/'),
        e.topic,
        e.hidden,
        p.order,
        p.title,
        LESSON_PART_TYPE_LABEL[p.type],
        p.durationMin,
        p.description,
      ]);
    }
  }

  return {
    headers: [
      'Õpetaja pseudonüüm',
      'Kuupäev',
      'Kellaaeg',
      'Kestus (min)',
      'Klass/rühm',
      'Rakendatud meetod(id)',
      'Tunni teema',
      'Peidetud',
      'Tunniosa nr',
      'Tunniosa nimetus',
      'Tunniosa tüüp',
      'Tunniosa kestus (min)',
      'Tunniosa lühikirjeldus',
    ],
    rows,
  };
}

const ALL_ITEM_KEYS = OBSERVATION_DOMAINS.flatMap((d) => d.items.map((i) => ({ key: i.key, label: i.label })));

async function buildVaatlusprotokollHinnangud(): Promise<Dataset> {
  const [protocols, teacherByUserId] = await Promise.all([
    prisma.observationProtocol.findMany({
      include: {
        lessonPlan: { include: { researchPlanEntry: { include: { teacher: true } }, parts: true } },
      },
      orderBy: { createdAt: 'asc' },
    }),
    teacherPseudonymByUserId(),
  ]);

  const partsById = new Map<string, { order: number; title: string }>();
  const rows: CellValue[][] = [];

  for (const protocol of protocols) {
    const entry = protocol.lessonPlan.researchPlanEntry;
    const observerPseudonym = teacherByUserId.get(protocol.observerUserId) ?? 'TEADUR';
    const ratings: ObservationRatings = protocol.ratingsJson ? JSON.parse(protocol.ratingsJson) : {};

    for (const part of protocol.lessonPlan.parts) {
      partsById.set(part.id, { order: part.order, title: part.title });
    }

    for (const partId of Object.keys(ratings)) {
      const part = partsById.get(partId);
      for (const { key, label } of ALL_ITEM_KEYS) {
        const item = ratings[partId][key];
        if (!item) continue;
        rows.push([
          entry.teacher.pseudonymCode,
          isoOrNull(entry.date),
          entry.topic,
          observerPseudonym,
          part?.order ?? null,
          part?.title ?? null,
          key,
          label,
          item.value,
          item.note || null,
          protocol.publishedAt ? true : false,
        ]);
      }
    }
  }

  return {
    headers: [
      'Õpetaja pseudonüüm',
      'Tunni kuupäev',
      'Tunni teema',
      'Vaatleja pseudonüüm',
      'Checkpoint nr',
      'Checkpointi nimetus',
      'Tunnus',
      'Tunnuse kirjeldus',
      'Hinnang (1-4)',
      'Märkus',
      'Avalikustatud',
    ],
    rows,
  };
}

async function buildVaatlusprotokollIntsidendid(): Promise<Dataset> {
  const [protocols, teacherByUserId] = await Promise.all([
    prisma.observationProtocol.findMany({
      include: { lessonPlan: { include: { researchPlanEntry: { include: { teacher: true } } } } },
      orderBy: { createdAt: 'asc' },
    }),
    teacherPseudonymByUserId(),
  ]);

  const rows: CellValue[][] = [];
  for (const protocol of protocols) {
    const entry = protocol.lessonPlan.researchPlanEntry;
    const observerPseudonym = teacherByUserId.get(protocol.observerUserId) ?? 'TEADUR';
    const incidents: IncidentLogRow[] = protocol.incidentsJson ? JSON.parse(protocol.incidentsJson) : [];
    for (const incident of incidents) {
      rows.push([
        entry.teacher.pseudonymCode,
        isoOrNull(entry.date),
        entry.topic,
        observerPseudonym,
        incident.timeMin,
        incident.description,
        incident.construct,
        incident.whoWith,
      ]);
    }
  }

  return {
    headers: ['Õpetaja pseudonüüm', 'Tunni kuupäev', 'Tunni teema', 'Vaatleja pseudonüüm', 'Aeg (min)', 'Mis juhtus', 'Konstrukt', 'Kellega seotud'],
    rows,
  };
}

async function buildVaatlusprotokollKokkuvote(): Promise<Dataset> {
  const [protocols, teacherByUserId] = await Promise.all([
    prisma.observationProtocol.findMany({
      include: { lessonPlan: { include: { researchPlanEntry: { include: { teacher: true } } } } },
      orderBy: { createdAt: 'asc' },
    }),
    teacherPseudonymByUserId(),
  ]);

  const rows: CellValue[][] = protocols.map((protocol) => {
    const entry = protocol.lessonPlan.researchPlanEntry;
    const observerPseudonym = teacherByUserId.get(protocol.observerUserId) ?? 'TEADUR';
    const summary: Partial<ObservationSummary> = protocol.summaryJson ? JSON.parse(protocol.summaryJson) : {};
    return [
      entry.teacher.pseudonymCode,
      isoOrNull(entry.date),
      entry.topic,
      observerPseudonym,
      summary.shortSummary ?? null,
      summary.methodFidelity ?? null,
      summary.surprises ?? null,
      summary.recommendations ?? null,
      isoOrNull(protocol.submittedAt),
      isoOrNull(protocol.publishedAt),
    ];
  });

  return {
    headers: [
      'Õpetaja pseudonüüm',
      'Tunni kuupäev',
      'Tunni teema',
      'Vaatleja pseudonüüm',
      'Lühikokkuvõte',
      'Meetodi järgimine',
      'Üllatused',
      'Soovitused',
      'Salvestatud',
      'Avalikustatud',
    ],
    rows,
  };
}

export const DATASET_DEFINITIONS: DatasetDefinition[] = [
  {
    key: 'nousolekud',
    label: 'Nõusolekud',
    description: 'Kõikide andmesubjektide nõusolekute staatus ja ajalugu.',
    build: buildNousolekud,
  },
  {
    key: 'opilased',
    label: 'Õpilased (demograafia)',
    description: 'Õpilaste sotsiaaldemograafilised andmed, pseudonümiseeritud.',
    build: buildOpilased,
  },
  {
    key: 'opetajad',
    label: 'Õpetajad-uurijad (demograafia)',
    description: 'Õpetajate-uurijate kool, vanuseaste ja meetod, pseudonümiseeritud.',
    build: buildOpetajad,
  },
  {
    key: 'testitulemused',
    label: 'Testitulemused',
    description: 'Matemaatilise probleemilahenduse testi vastused ja hinded, alaküsimuste kaupa.',
    build: buildTestitulemused,
  },
  {
    key: 'kysimustikud',
    label: 'Küsimustiku vastused',
    description: 'Õpilaste (Lisa 4) ja õpetajate (Lisa 8) küsimustiku vastused, väidete kaupa.',
    build: buildKysimustikud,
  },
  {
    key: 'paevik',
    label: 'Uurijapäevik',
    description: 'Õpetajate uurijapäeviku Likert-vastused ja Rolfe refleksioon, katsetunni kaupa.',
    build: buildPaevik,
  },
  {
    key: 'uuringukava',
    label: 'Uuringukava ja tunnikavad',
    description: 'Katsetunnid koos rakendatud meetodi ja tunnikava osadega.',
    build: buildUuringukava,
  },
  {
    key: 'vaatlusprotokoll_hinnangud',
    label: 'Tunnivaatlusprotokoll — hinnangud',
    description: 'Struktureeritud hinnangud checkpointide ja tunnuste kaupa (reliaablusanalüüsiks sobivas kujus).',
    build: buildVaatlusprotokollHinnangud,
  },
  {
    key: 'vaatlusprotokoll_intsidendid',
    label: 'Tunnivaatlusprotokoll — intsidendid',
    description: 'Vaba vormis intsidentide ja tähelepanekute logi.',
    build: buildVaatlusprotokollIntsidendid,
  },
  {
    key: 'vaatlusprotokoll_kokkuvote',
    label: 'Tunnivaatlusprotokoll — üldkokkuvõte',
    description: 'Vaatluse lõpus täidetud üldkokkuvõte iga protokolli kohta.',
    build: buildVaatlusprotokollKokkuvote,
  },
];

export function getDatasetDefinition(key: string): DatasetDefinition | undefined {
  return DATASET_DEFINITIONS.find((d) => d.key === key);
}
