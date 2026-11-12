// The MonoTypist layout as data: where every key sits and what it types on each layer.
// One source for every drawing of the keyboard on the site (the home page tour now; the shop
// preview, the course and the editor later). Taken from the firmware keymaps (zmk_2025, shields
// v4_2_da and v4_2_hu) and from the typing test's layout tables.

export type Lang = 'us' | 'da' | 'hu';
export type Slot = 'base' | 'blue' | 'red' | 'orange';

export const langs: { id: Lang; name: string }[] = [
  { id: 'us', name: 'English' },
  { id: 'da', name: 'Danish' },
  { id: 'hu', name: 'Hungarian' },
];

// Which thumb key, held, turns on which layer. The layer is named after the colour of its legends.
export const thumbLayer = { space: 'blue', enter: 'red', delete: 'orange' } as const;

// Key positions in key units (1 = the pitch from one key to the next), from the circuit board.
// The first 24 are the block of 4 rows by 6 columns, row by row from the top left.
export const blockKeys = [
  { x: 0.0, y: 0.472 }, { x: 0.997, y: 0.394 }, { x: 1.995, y: 0.184 }, { x: 2.992, y: 0.0 }, { x: 3.99, y: 0.341 }, { x: 4.987, y: 0.525 },
  { x: 0.0, y: 1.47 }, { x: 0.997, y: 1.391 }, { x: 1.995, y: 1.181 }, { x: 2.992, y: 0.998 }, { x: 3.99, y: 1.339 }, { x: 4.987, y: 1.522 },
  { x: 0.0, y: 2.467 }, { x: 0.997, y: 2.388 }, { x: 1.995, y: 2.178 }, { x: 2.992, y: 1.995 }, { x: 3.99, y: 2.336 }, { x: 4.987, y: 2.52 },
  { x: 0.0, y: 3.465 }, { x: 0.997, y: 3.386 }, { x: 1.995, y: 3.176 }, { x: 2.992, y: 2.992 }, { x: 3.99, y: 3.349 }, { x: 4.987, y: 3.532 },
];

// The keys below the block. The three thumb keys are turned by 20 degrees round their own centres;
// Enter and Delete are one and a quarter keys tall.
export const lowerKeys = [
  { id: 'ctrl', label: 'CTRL', x: 0.289, y: 4.462 },
  { id: 'alt', label: 'ALT', x: 1.286, y: 4.462 },
  { id: 'enter', x: 4.165, y: 4.484, h: 1.25, r: 20, rx: 4.665, ry: 5.109 },
  { id: 'space', x: 5.132, y: 4.882, r: 20, rx: 5.632, ry: 5.382 },
  { id: 'delete', x: 6.008, y: 5.248, h: 1.25, r: 20, rx: 6.508, ry: 5.873 },
];

// The knob sits beside ALT; the 5-way switch is a cross turned by 20 degrees; the touchpad is right of the block.
// Measured on the top-down photograph (x and y of the knob and the switch are their centres).
export const knob = { x: 2.7, y: 5.0, r: 0.4 };
export const fiveWay = { x: 6.5, y: 4.65, arm: 0.3, r: 20 };
export const touchpad = { x: 6.13, y: 1.65, w: 2.1, h: 2.25 };

// What is printed in the top left corner of a key that types no character there:
// a symbol on the four keys of the first column, M1 to M5 on the macro keys.
export const caps: Record<number, { icon?: 'esc' | 'tab' | 'backspace' | 'shift'; label?: string }> = {
  0: { icon: 'esc' }, 1: { label: 'M1' }, 2: { label: 'M2' }, 3: { label: 'M3' }, 4: { label: 'M4' }, 5: { label: 'M5' },
  6: { icon: 'tab' }, 12: { icon: 'backspace' }, 18: { icon: 'shift' },
};

// The letters of the base layer and the key codes of the blue layer (Space held): the right half
// of Colemak, mirrored, so each finger keeps its letter.
const BASE = ['', '', '', '', '', '', '', 'Q', 'W', 'F', 'P', 'G', '', 'A', 'R', 'S', 'T', 'D', '', 'Z', 'X', 'C', 'V', 'B'];
const BLUE = ['', '', '', '', '', '', 'LBKT', 'SEMI', 'Y', 'U', 'L', 'J', 'SQT', 'O', 'I', 'E', 'N', 'H', '', 'FSLH', 'DOT', 'COMMA', 'M', 'K'];

// A key code is one position on the computer's own layout, so what it types depends on the
// language the computer is set to. English first, then what Danish and Hungarian change.
const CODE_US: Record<string, string> = { LBKT: '[', SEMI: ';', SQT: "'", FSLH: '/', DOT: '.', COMMA: ',' };
const CODE_BY_LANG: Record<Lang, Record<string, string>> = {
  us: {},
  da: { LBKT: 'Å', SEMI: 'Æ', SQT: 'Ø', FSLH: '-' },
  hu: { Y: 'Z', Z: 'Y', LBKT: 'Ő', SEMI: 'É', SQT: 'Á', FSLH: '-' },
};
const typed = (code: string, lang: Lang) => (code ? (CODE_BY_LANG[lang][code] ?? CODE_US[code] ?? code) : '');

// The red layer (Enter held, a number pad) and the orange layer (Delete held, symbols), as printed
// on the keycaps of each language. ' ' is the Space character.
const RED: Record<Lang, string[]> = {
  us: ['', ' ', '', '', '', '', '"', '*', '7', '8', '9', '>', '', '0', '4', '5', '6', '=', '', '+', '1', '2', '3', '<'],
  da: ['¨', ' ', '£', '€', '$', '~', '"', '*', '7', '8', '9', '>', "'", '0', '4', '5', '6', '=', '', '+', '1', '2', '3', '<'],
  hu: ['', ' ', 'Ü', 'Ö', 'Á', 'Í', 'Á', '*', '7', '8', '9', '>', 'Á', '0', '4', '5', '6', '=', '', '+', '1', '2', '3', '<'],
};
const ORANGE: Record<Lang, string[]> = {
  us: ['', '', '', '', '', '', '%', '\\', '|', '/', '!', '&', '{', '[', '(', ')', ']', '}', '', '_', ':', '?', '#', '@'],
  da: ['½', '¨', '?', '§', '^', '´', '%', '\\', '|', '/', '!', '&', '/', '[', '(', ')', ']', '}', '', '+', ':', ';', '#', '@'],
  hu: ['0', 'Ú', 'Ű', 'Ő', 'É', 'Ó', '%', '\\', '|', '/', '!', '&', '{', '[', '(', ')', ']', '}', '', '_', ':', '?', '#', '@'],
};

// legends[language][layer][key 0..23]: the character a block key types, '' where it types none.
export const legends = Object.fromEntries(
  langs.map(({ id }) => [
    id,
    {
      base: BASE.map((code) => typed(code, id)),
      blue: BLUE.map((code) => typed(code, id)),
      red: RED[id],
      orange: ORANGE[id],
    },
  ]),
) as Record<Lang, Record<Slot, string[]>>;
