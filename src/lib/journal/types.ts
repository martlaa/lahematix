export type JournalLikertItem = {
  key: string;
  label: string;
  reverseScored?: boolean; // pööratud skoorimine (analüüsi jaoks, ei mõjuta vastamist)
};

export type JournalDomain = {
  key: string;
  title: string;
  items: JournalLikertItem[];
};

export type RolfeSection = {
  whatIntro: string;
  whatHelp: string;
  whatStageLabels: [string, string, string];
  soWhatIntro: string;
  soWhatHelp: string;
  nowWhatIntro: string;
  nowWhatHelp: string;
};

export type JournalDefinition = {
  code: string;
  title: string;
  intro: string;
  scaleLabels: [string, string, string, string, string];
  domains: JournalDomain[];
  rolfe: RolfeSection;
};
