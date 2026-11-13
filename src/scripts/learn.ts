// The typing course (/learn/). The teaching method is keyzen's (public domain): every level adds
// one character, the words are made of the characters still in training, and a character typed
// wrong goes back into training.
import { courseChars } from '../data/course';
import { keyFor, type Lang } from '../data/keyboard';
import { tool } from './tool';
import { typer } from './typer';
import { STORE, read, write, backToTyping } from './prefs';
import type { Picture } from './board';

const WORD = 7; // characters in a practice word
const KNOWN = 9; // a count no "in a row" setting is above: a character at it is learned

interface Progress {
  /** The place in the language's list of the newest character. */
  level: number;
  /** How many times in a row a character was typed right; a character not listed is learned. */
  row: Record<string, number>;
}

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];

const t = tool(() => { open(); hands.reset(); hands.draw(); });
const wordEl = $('[data-word]');
const barEl = $('[data-level-bar]');
const levelsEl = $('[data-levels]');
const rigorEl = $('[data-rigor-now]');
const stat = (name: string) => $(`[data-stat="${name}"]`);

const saved = read<Partial<Record<Lang, Progress>>>(STORE.course, {});
let chars: string[] = [];
let now: Progress = { level: 1, row: {} };
let word = '';
let at = 0; // the place in the word of the character to type
let wrong: boolean[] = [];
let nextWord = 0; // the timer that brings the next word
let last: Picture = {};
// Speed and accuracy since the page opened. Time counts only while typing: a pause adds 3 seconds at most.
const run = { hits: 0, misses: 0, ms: 0, t: 0 };
let undo: null | { at: number; wrong: boolean[]; row: Record<string, number>; run: typeof run } = null;

const inRow = (c: string) => now.row[c] ?? KNOWN;
const count = (c: string, n: number) => { if (n >= KNOWN) delete now.row[c]; else now.row[c] = n; };
const levelChars = () => chars.slice(0, now.level + 1);
const training = () => levelChars().filter((c) => inRow(c) < t.prefs.rigor);

function setLevel(level: number) {
  now.level = Math.min(chars.length - 1, Math.max(1, level));
  now.row = { [chars[now.level]]: 0 };
}

// Opens the chosen language at the level it was left at.
function open() {
  chars = courseChars(t.prefs.lang);
  const was = saved[t.prefs.lang];
  if (was && Number.isInteger(was.level) && was.level >= 1 && was.level < chars.length && was.row) now = was;
  else { now = { level: 1, row: {} }; setLevel(1); }
  saved[t.prefs.lang] = now;
  levelsEl.replaceChildren(
    ...chars.slice(1).map((c, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'lv';
      b.dataset.level = String(i + 1);
      b.textContent = c;
      return b;
    }),
  );
  newWord();
}

function newWord() {
  clearTimeout(nextWord);
  const all = levelChars();
  const hard = training();
  const noSpace = all.filter((c) => c !== ' ');
  word = '';
  for (let i = 0; i < WORD; i++) {
    const before = word[i - 1];
    let c = pick(hard);
    if (c === undefined || c === before) c = pick(all);
    if (c === ' ' && (i === 0 || i === WORD - 1 || before === ' ')) c = pick(noSpace); // a space only between two characters
    word += c;
  }
  at = 0;
  wrong = [];
  undo = null;
  render();
}

function render() {
  wordEl.querySelectorAll('.ch').forEach((el) => el.remove());
  [...word].forEach((c, i) => {
    const s = document.createElement('span');
    s.className = 'ch' + (c === ' ' ? ' ch--sp' : '') + (i < at ? (wrong[i] ? ' is-bad' : ' is-ok') : i === at ? ' is-now' : '');
    s.textContent = c === ' ' ? '' : c;
    wordEl.append(s);
  });
  const hard = training();
  const rigor = t.prefs.rigor;
  barEl.style.width = `${hard.length ? (Math.min(...hard.map(inRow)) / rigor) * 100 : 100}%`;
  levelsEl.querySelectorAll<HTMLButtonElement>('.lv').forEach((b) => {
    const i = Number(b.dataset.level);
    b.classList.toggle('is-in', i <= now.level);
    b.classList.toggle('is-hard', i <= now.level && inRow(chars[i]) < rigor);
    b.toggleAttribute('aria-current', i === now.level);
    b.tabIndex = i === now.level ? 0 : -1;
  });
  rigorEl.textContent = String(rigor);
  const keys = run.hits + run.misses;
  stat('level').textContent = `${now.level} / ${chars.length - 1}`;
  stat('wpm').textContent = keys >= 10 && run.ms > 0 ? String(Math.round(keys / 5 / (run.ms / 60000))) : '0';
  stat('acc').textContent = keys ? `${Math.round((run.hits / keys) * 100)}%` : '–';
  paint(last);
}

function paint(p: Picture) {
  last = p;
  const next = at < word.length ? word[at] : null;
  const key = next && next !== ' ' ? keyFor(t.prefs.lang, next) : null;
  t.paint(p, next, key ? key.slot : 'letters');
}

function typed(c: string, again = false) {
  if (at >= word.length) return;
  const stamp = performance.now();
  if (!again) {
    undo = { at, wrong: [...wrong], row: { ...now.row }, run: { ...run } };
    if (run.t) run.ms += Math.min(stamp - run.t, 3000);
    run.t = stamp;
  }
  const want = word[at];
  if (c === want) {
    count(want, inRow(want) + 1);
    run.hits++;
  } else {
    now.row[want] = 0;
    if (levelChars().includes(c)) now.row[c] = 0;
    wrong[at] = true;
    run.misses++;
  }
  at++;
  if (at === word.length) {
    nextWord = window.setTimeout(() => {
      if (!training().length && now.level < chars.length - 1) { now.level++; now.row[chars[now.level]] = 0; }
      write(STORE.course, saved);
      newWord();
    }, 120);
  }
  render();
}

const hands = typer({
  keys: t.area,
  drawing: t.drawing,
  lang: () => t.prefs.lang,
  mode: () => t.prefs.kb,
  live: () => true,
  type: (c) => typed(c),
  // The thumb key came a moment after its key: the last character is taken back and typed again.
  swap: (c) => {
    if (!undo) return;
    clearTimeout(nextWord);
    at = undo.at;
    wrong = undo.wrong;
    now.row = undo.row;
    Object.assign(run, undo.run, { t: run.t });
    typed(c, true);
  },
  erase: () => {}, // nothing is taken back in the course: a miss counts, and the word goes on
  draw: paint,
});

// A click on a character starts the course from it; the arrow keys walk along the row.
levelsEl.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLElement>('.lv');
  if (!b) return;
  setLevel(Number(b.dataset.level));
  write(STORE.course, saved);
  newWord();
});
levelsEl.addEventListener('keydown', (e) => {
  const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
  const all = [...levelsEl.querySelectorAll<HTMLElement>('.lv')];
  const to = all[all.indexOf(e.target as HTMLElement) + d];
  if (!d || !to) return;
  e.preventDefault();
  to.focus();
});
t.bar.addEventListener('click', (e) => {
  const b = (e.target as Element).closest<HTMLElement>('[data-rigor]');
  if (!b) return;
  t.prefs.rigor = Math.min(9, Math.max(2, t.prefs.rigor + Number(b.dataset.rigor)));
  t.save();
  render();
});
backToTyping(t.area, levelsEl);

open();
hands.draw();
