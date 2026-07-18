export type LikertItem = {
  key: string;
  label: string;
  reverseScored?: boolean; // pööratud skoorimine (analüüsi jaoks, ei mõjuta vastamist)
};

export type LikertBlock = {
  type: 'likert';
  key: string;
  title: string;
  allowEoh?: boolean; // lisab "EOH — ei oska hinnata" valiku iga väite juurde
  items: LikertItem[];
};

export type MethodComparisonBlock = {
  type: 'method_comparison';
  key: string;
  title: string;
  intro?: string;
  methods: { key: string; label: string }[];
  items: LikertItem[]; // samad väited kehtivad iga meetodi kohta
};

export type TextItem = { key: string; label: string };

export type TextBlock = {
  type: 'text';
  key: string;
  title: string;
  items: TextItem[];
};

export type FieldItem = { key: string; label: string; inputType: 'text' | 'number' | 'textarea' };

export type FieldsBlock = {
  type: 'fields';
  key: string;
  title: string;
  items: FieldItem[];
};

export type QuestionnaireBlock = LikertBlock | MethodComparisonBlock | TextBlock | FieldsBlock;

export type QuestionnaireDefinition = {
  code: string;
  title: string;
  intro: string;
  scaleLabels: [string, string, string, string, string];
  blocks: QuestionnaireBlock[];
};
