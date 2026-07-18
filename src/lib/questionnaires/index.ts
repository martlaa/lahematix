import type { QuestionnaireDefinition } from './types';
import { lisa4Eel, lisa4Jarel } from './opilaneLisa4';
import { lisa8 } from './opetajaLisa8';

const registry: Record<string, QuestionnaireDefinition> = {
  [lisa4Eel.code]: lisa4Eel,
  [lisa4Jarel.code]: lisa4Jarel,
  [lisa8.code]: lisa8,
};

export function getQuestionnaireByCode(code: string): QuestionnaireDefinition | undefined {
  return registry[code];
}

export { lisa4Eel, lisa4Jarel, lisa8 };
export * from './types';
export * from './parse';
