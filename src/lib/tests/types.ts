export type MCOption = { key: string; label: string };

export type SubQuestion = {
  key: string; // "a" | "b" | "c"
  prompt: string;
  options: MCOption[];
  correctChoice: string; // vastab MCOption.key väärtusele, nt "A"
  requiresExplanation?: boolean;
  explanationPrompt?: string; // nt "Näita oma arvutuskäiku:"
  bonusPrompt?: string; // hindamata lisaväljakutse, nt "Kirjuta veel kaks sobivat varianti"
  maxPoints: number; // 1 (ainult valik) või 2 (valik + selgitus)
  rationale: string; // hindamisjuhendi tekst õpetajale (õige vastuse põhjendus)
};

export type Problem = {
  key: string; // "1" | "2" | "3" | "4"
  title: string;
  story: string;
  subQuestions: SubQuestion[];
};

export type TestDefinition = {
  code: string; // "test-4-6" | "test-7-9" | "test-10-12"
  title: string;
  gradeBand: '4-6' | '7-9' | '10-12';
  instructions: string; // "Juhend õpilasele"
  timeLimitMinutes: number;
  gradingIntro: string; // skoorimispõhimõtte kokkuvõte
  maxScore: number;
  problems: Problem[];
};
