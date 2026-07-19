/** Lihtne stringi hash (djb2), et saada seemet juhuslikkuse jaoks. */
function hashSeed(input: string): number {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 33) ^ input.charCodeAt(i);
  }
  return hash >>> 0;
}

/** Deterministlik pseudojuhuslike arvude generaator (mulberry32) — sama seeme
 *  annab alati sama järjestuse, erinev seeme erineva. Kasutame seda, et iga
 *  õpilane näeks vastusevariante erinevas (aga tema jaoks stabiilses,
 *  lehe uuestilaadimisel muutumatus) järjekorras. */
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Segab massiivi järjekorra deterministlikult, lähtudes seemne-stringist. */
export function seededShuffle<T>(items: T[], seed: string): T[] {
  const random = mulberry32(hashSeed(seed));
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}
