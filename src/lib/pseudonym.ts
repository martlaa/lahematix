import { customAlphabet } from 'nanoid';

// Väldime segadust tekitavaid tähemärke (0/O, 1/I) pseudonüümikoodides,
// kuna neid kirjutatakse mõnikord käsitsi paberil üles.
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const generate = customAlphabet(alphabet, 6);

/** Genereerib kordumatu pseudonüümi kujul "OP-4F7A2B". */
export function generatePseudonym(): string {
  return `OP-${generate()}`;
}

/** Genereerib õpetajale-uurijale kordumatu pseudonüümi kujul "OU-4F7A2B". */
export function generateTeacherPseudonym(): string {
  return `OU-${generate()}`;
}
