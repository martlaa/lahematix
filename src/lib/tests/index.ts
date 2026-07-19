import type { TestDefinition } from './types';
import { test4to6 } from './test4to6';
import { test7to9 } from './test7to9';
import { test10to12 } from './test10to12';

const registry: Record<string, TestDefinition> = {
  [test4to6.code]: test4to6,
  [test7to9.code]: test7to9,
  [test10to12.code]: test10to12,
};

const registryByGradeBand: Record<string, TestDefinition> = {
  '4-6': test4to6,
  '7-9': test7to9,
  '10-12': test10to12,
};

export function getTestByCode(code: string): TestDefinition | undefined {
  return registry[code];
}

export function getTestByGradeBand(gradeBand: string): TestDefinition | undefined {
  return registryByGradeBand[gradeBand];
}

export { test4to6, test7to9, test10to12 };
export * from './types';
export * from './parse';
export * from './shuffle';
