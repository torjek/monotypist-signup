// The typing course's characters, in the order they are taught, for each language. Level 1 is
// the first letter; every level adds the next character of the list.
//
// The order is by place on the keyboard, read from src/data/keyboard.ts, so each language gets its
// own list: first the 26 letters (the tapped ones, then the ones with Space held), then the
// language's own letters, then the rest of the blue layer, the numbers and signs of the red layer
// and the symbols of the orange layer.
import { legends, type Lang, type Slot } from './keyboard';

// The 15 letter keys in teaching order (the order of keyzen-monotypist): the home row from the
// index finger, then the row above, then the row below.
const LETTER_KEYS = [16, 15, 14, 13, 17, 10, 9, 8, 7, 11, 22, 21, 20, 19, 23];
const BLUE_KEYS = [...LETTER_KEYS, 6, 12]; // and the two keys left of them, which type on the blue layer only
// The number pad: 4 5 6 and 0 on the home row first, then 7 8 9, then 1 2 3; then every other key.
const RED_KEYS = [14, 15, 16, 13, 8, 9, 10, 20, 21, 22, 17, 12, 7, 11, 6, 19, 23, 0, 1, 2, 3, 4, 5];
const ORANGE_KEYS = [13, 14, 15, 16, 12, 17, 6, 7, 8, 9, 10, 11, 19, 20, 21, 22, 23, 0, 1, 2, 3, 4, 5];

const PLAIN = /^[A-Z]$/;
const LETTER = /^\p{L}$/u;
// Accents that wait for a second key on Danish and Hungarian keyboards: they type nothing alone.
const WAITING = new Set(['¨', '´', '^', '~', '`']);

export function courseChars(lang: Lang): string[] {
  const at = (slot: Slot, keys: number[]) => keys.map((k) => legends[lang][slot][k]);
  const all = [...at('base', LETTER_KEYS), ...at('blue', BLUE_KEYS)];
  const rest = [...at('red', RED_KEYS), ...at('orange', ORANGE_KEYS)];
  const order = [
    ...all.filter((c) => PLAIN.test(c)),
    ...[...all, ...rest].filter((c) => LETTER.test(c) && !PLAIN.test(c)),
    ...all.filter((c) => !LETTER.test(c)),
    ...rest.filter((c) => !LETTER.test(c)),
  ];
  const seen = new Set<string>();
  const out = [' '];
  for (const c of order) {
    if (!c || c === ' ' || c.length > 1 || WAITING.has(c) || seen.has(c)) continue;
    seen.add(c);
    out.push(c.toLowerCase());
  }
  return out;
}
