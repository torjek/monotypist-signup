// The speed test (/test/): type a run of common words, by count or against the clock, and see the
// speed and the accuracy. Finished tries are kept in the browser and drawn as a chart.
import { words } from '../data/words';
import { keyFor, langs, type Lang } from '../data/keyboard';
import { tool } from './tool';
import { typer, type Mode } from './typer';
import { STORE, read, write, choose, onChoice } from './prefs';
import { chart } from './chart';
import type { Picture } from './board';

/** One finished test, as it is stored. */
interface Try {
  /** When it ended (milliseconds since 1970). */
  t: number;
  /** Words per minute: the characters of the words typed right, with their spaces, by five. */
  wpm: number;
  /** Per cent of the keys that were the right ones. */
  acc: number;
  /** Keys per minute, right or wrong. */
  kpm: number;
  /** Seconds it took. */
  s: number;
  /** 'w25': 25 words; 't30': 30 seconds. */
  set: string;
  lang: Lang;
  kb: Mode;
  /** Numbers and symbols were mixed in. */
  adv: boolean;
}

const KEEP = 500; // tries kept; the oldest go first
const EXTRA = 8; // characters that may be typed past a word's end
const AHEAD = 40; // words made in advance in a test against the clock
const LAST = 10; // tries in the running average

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
const one = (n: number) => Math.round(n * 10) / 10;

const t = tool((what) => { if (what === 'lang') fresh(); else { hands.reset(); hands.draw(); } });
const boxEl = $('[data-words]');
const runEl = $('[data-run]');
const liveEl = $('[data-live]');
const howEl = $('[data-how]');
const resultEl = $('[data-result]');
const wordsList = $('[data-pick="words"]');
const timeList = $('[data-pick="time"]');
const stat = (name: string) => $(`[data-stat="${name}"]`);

let list: string[] = []; // the words of this test
let els: HTMLElement[] = [];
let done: string[] = []; // what was typed for each word left behind
let buf = ''; // what is typed of the word in hand
let keys = 0; // every character key and space pressed
let good = 0; // the ones that were right
let t0 = 0; // when the first key came; 0 before it
let over = false; // no more keys are taken
let shown = false; // the result is on the screen
let clock = 0;
let ending = 0;
let rest = 'letters'; // the legends shown at full strength while no thumb key is held
let last: Picture = {};
let undo: null | { done: string[]; buf: string; keys: number; good: number } = null;

// ---- the words ----

// Advanced: numbers and signs join the words. Only signs this language's keyboard has are used.
function extras(lang: Lang) {
  const has = (c: string) => !!keyFor(lang, c);
  return {
    after: [',', '.', '?', '!', ':', ';'].filter(has),
    pairs: [['(', ')'], ['[', ']'], ['{', '}'], ['"', '"'], ["'", "'"]].filter(([a, b]) => has(a) && has(b)),
    alone: ['+', '=', '*', '/', '-', '&', '%', '#', '@'].filter(has),
    digits: '0123456789'.split('').filter(has),
  };
}
function make(n: number, before?: string) {
  const all = words[t.prefs.lang];
  const x = t.prefs.advanced ? extras(t.prefs.lang) : null;
  const out: string[] = [];
  while (out.length < n) {
    let w = pick(all);
    if (w === (out[out.length - 1] ?? before)) continue;
    const dice = Math.random();
    if (x) {
      if (dice < 0.12 && x.digits.length) w = Array.from({ length: 1 + Math.floor(Math.random() * 4) }, () => pick(x.digits)).join('');
      else if (dice < 0.3 && x.after.length) w += pick(x.after);
      else if (dice < 0.37 && x.pairs.length) { const [a, b] = pick(x.pairs); w = a + w + b; }
      else if (dice < 0.42 && x.alone.length) w = pick(x.alone);
    }
    out.push(w);
  }
  return out;
}
// The red and the orange legends stay pale unless the text needs them.
function setRest() {
  const far = (w: string) => [...w].some((c) => { const k = keyFor(t.prefs.lang, c); return !!k && (k.slot === 'red' || k.slot === 'orange'); });
  rest = t.prefs.advanced || words[t.prefs.lang].some(far) ? 'all' : 'letters';
}

// ---- the picture of the text ----

function addWords(more: string[]) {
  more.forEach((w) => {
    const el = document.createElement('span');
    el.className = 'w';
    els.push(el);
    list.push(w);
    runEl.append(el);
    drawWord(list.length - 1);
  });
}
function drawWord(i: number) {
  const el = els[i];
  if (!el) return;
  const w = list[i];
  const behind = i < done.length;
  const got = behind ? done[i] : i === done.length ? buf : '';
  const here = i === done.length && !shown;
  const parts: HTMLElement[] = [];
  const add = (text: string, cls: string) => {
    const c = document.createElement('span');
    c.className = 'c' + cls;
    c.textContent = text;
    parts.push(c);
  };
  [...w].forEach((c, j) => add(c, (j < got.length ? (got[j] === c ? ' is-ok' : ' is-bad') : behind ? ' is-left' : '') + (here && j === got.length ? ' is-now' : '')));
  [...got.slice(w.length)].forEach((c) => add(c, ' is-bad'));
  add(' ', ' c--gap' + (here && got.length >= w.length ? ' is-now' : ''));
  el.classList.toggle('is-wrong', behind && got !== w);
  el.replaceChildren(...parts);
}
// Redraws the word in hand and its neighbours, and keeps its line the middle one of the three.
function drawNear() {
  const i = done.length;
  drawWord(i - 1);
  drawWord(i);
  drawWord(i + 1);
  const el = els[Math.min(i, els.length - 1)];
  const line = parseFloat(getComputedStyle(runEl).lineHeight) || 38;
  const row = el ? Math.floor((el.offsetTop + el.offsetHeight / 2) / line) : 0;
  runEl.style.transform = `translateY(${-Math.max(0, row - 1) * line}px)`;
}
function live() {
  if (t.prefs.time) {
    const left = t0 ? Math.max(0, Math.ceil(t.prefs.time - (performance.now() - t0) / 1000)) : t.prefs.time;
    liveEl.textContent = `${left} s left`;
  } else liveEl.textContent = `${done.length} / ${list.length} words`;
}
function paint(p: Picture) {
  last = p;
  const w = list[done.length];
  const next = shown || !t.prefs.hint || !w ? null : buf.length < w.length ? w[buf.length] : ' ';
  t.paint(p, next, rest);
}

// ---- a test ----

function fresh() {
  clearInterval(clock);
  clearTimeout(ending);
  list = [];
  els = [];
  done = [];
  buf = '';
  keys = good = t0 = 0;
  over = shown = false;
  undo = null;
  setRest();
  runEl.replaceChildren();
  addWords(make(t.prefs.time ? AHEAD : t.prefs.words));
  boxEl.hidden = false;
  resultEl.hidden = true;
  howEl.textContent = 'Esc starts a new test';
  t.frame.toggleAttribute('data-timed', !!t.prefs.time);
  drawNear();
  live();
  paint(last);
}

function typed(c: string, again = false) {
  if (over) return;
  const stamp = performance.now();
  const i = done.length;
  const w = list[i];
  if (c === ' ' && !buf) return; // a space before a word: nothing to leave behind
  if (!again) undo = { done: [...done], buf, keys, good };
  if (!t0) {
    t0 = stamp;
    if (t.prefs.time) clock = window.setInterval(() => { if (performance.now() - t0 >= t.prefs.time * 1000) finish(t0 + t.prefs.time * 1000); else live(); }, 100);
  }
  keys++;
  if (c === ' ') {
    if (buf.length >= w.length) good++;
    done.push(buf);
    buf = '';
    if (!t.prefs.time && done.length === list.length) { finish(stamp); return; }
    if (t.prefs.time && list.length - done.length < AHEAD / 2) addWords(make(AHEAD / 2, list[list.length - 1]));
  } else {
    if (c === w[buf.length]) good++;
    if (buf.length < w.length + EXTRA) buf += c;
    // The last word typed right ends the test. It waits a moment: a thumb key may still change the character.
    if (!t.prefs.time && i === list.length - 1 && buf === w) {
      over = true;
      ending = window.setTimeout(() => finish(stamp), 80);
    }
  }
  drawNear();
  live();
  paint(last);
}

function erase() {
  if (over) return;
  if (buf) buf = buf.slice(0, -1);
  else if (done.length && done[done.length - 1] !== list[done.length - 1]) buf = done.pop()!; // back into a word left wrong
  else return;
  undo = null;
  drawNear();
  live();
  paint(last);
}

function finish(stamp: number) {
  clearInterval(clock);
  clearTimeout(ending);
  over = shown = true;
  const s = t.prefs.time || Math.max((stamp - t0) / 1000, 0.2);
  // Right: every word typed as shown, with the space after it, and the right start of the word in hand.
  let right = 0;
  done.forEach((w, i) => { if (w === list[i]) right += w.length + 1; });
  if (buf && list[done.length]?.startsWith(buf)) right += buf.length;
  const made: Try = {
    t: Date.now(),
    wpm: one(right / 5 / (s / 60)),
    acc: keys ? one((good / keys) * 100) : 0,
    kpm: Math.round(keys / (s / 60)),
    s: one(s),
    set: t.prefs.time ? `t${t.prefs.time}` : `w${t.prefs.words}`,
    lang: t.prefs.lang,
    kb: t.prefs.kb,
    adv: t.prefs.advanced,
  };
  stat('wpm').textContent = String(Math.round(made.wpm));
  stat('acc').textContent = `${Math.round(made.acc)}%`;
  stat('time').textContent = `${made.s.toFixed(1)} s`;
  stat('kpm').textContent = String(made.kpm);
  boxEl.hidden = true;
  resultEl.hidden = false;
  liveEl.textContent = 'Done';
  howEl.textContent = 'Enter or Esc starts a new test';
  paint(last);
  tries.push(made);
  if (tries.length > KEEP) tries.splice(0, tries.length - KEEP);
  write(STORE.tries, tries);
  showTries();
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
    if (!undo || shown) return;
    clearTimeout(ending);
    over = false;
    ({ done, buf, keys, good } = undo);
    typed(c, true);
  },
  erase,
  tap: (id) => { if (id === 'enter' && shown) fresh(); },
  escape: fresh,
  draw: paint,
});

// ---- the controls above the text ----

choose(wordsList, String(t.prefs.words));
choose(timeList, String(t.prefs.time));
onChoice(wordsList, (v) => { t.prefs.words = Number(v); t.save(); fresh(); });
onChoice(timeList, (v) => { t.prefs.time = Number(v); t.save(); fresh(); });
// A word count picked while the clock is on switches the clock off.
wordsList.addEventListener('click', (e) => { if (t.prefs.time && (e.target as Element).closest('[role="tab"]')) (timeList.querySelector<HTMLElement>('[data-value="0"]'))?.click(); });
t.bar.querySelectorAll<HTMLElement>('[data-toggle]').forEach((b) => {
  const name = b.dataset.toggle as 'hint' | 'advanced';
  b.setAttribute('aria-pressed', String(t.prefs[name]));
  b.addEventListener('click', () => {
    t.prefs[name] = !t.prefs[name];
    b.setAttribute('aria-pressed', String(t.prefs[name]));
    t.save();
    if (name === 'advanced') fresh(); else paint(last);
  });
});
$('[data-new]').addEventListener('click', fresh);

// ---- the tries so far ----

const triesEl = $('[data-tries]');
const tableEl = $('[data-tries-rows]');
const clearEl = $('[data-clear]');
const plot = chart($('[data-chart]'));
const when = new Intl.DateTimeFormat('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const langName = (id: Lang) => langs.find((l) => l.id === id)?.name ?? id;
const kbName = (kb: Mode) => (kb === 'direct' ? 'MonoTypist' : 'Ordinary keyboard');
const setName = (x: Try) => (x.set[0] === 't' ? `${x.set.slice(1)} seconds` : `${x.set.slice(1)} words`) + (x.adv ? ', with symbols' : '');

const sound = (x: Try) => !!x && Number.isFinite(x.t) && Number.isFinite(x.wpm) && Number.isFinite(x.acc) && typeof x.set === 'string';
const stored = read<Try[]>(STORE.tries, []);
const tries: Try[] = Array.isArray(stored) ? stored.filter(sound) : [];

function showTries() {
  triesEl.hidden = !tries.length;
  if (!tries.length) return;
  const avgs = tries.map((_, i) => {
    const part = tries.slice(Math.max(0, i + 1 - LAST), i + 1);
    return part.reduce((sum, x) => sum + x.wpm, 0) / part.length;
  });
  stat('tries').textContent = String(tries.length);
  stat('best').textContent = String(Math.round(Math.max(...tries.map((x) => x.wpm))));
  stat('avg').textContent = String(Math.round(avgs[avgs.length - 1]));
  plot.set(
    tries.map((x, i) => ({
      value: x.wpm,
      avg: avgs[i],
      lines: [
        `${Math.round(x.wpm)} words per minute`,
        `Average of ${Math.min(LAST, i + 1)}: ${Math.round(avgs[i])}`,
        `Accuracy ${Math.round(x.acc)}%`,
        setName(x),
        `${langName(x.lang)}, ${kbName(x.kb)}`,
        `Try ${i + 1}, ${when.format(x.t)}`,
      ],
    })),
  );
  tableEl.replaceChildren(
    ...tries.map((x, i) => {
      const row = document.createElement('tr');
      [String(i + 1), when.format(x.t), String(Math.round(x.wpm)), `${Math.round(x.acc)}%`, `${Number(x.s).toFixed(1)} s`, setName(x), langName(x.lang), kbName(x.kb)].forEach((text, j) => {
        const cell = document.createElement('td');
        cell.textContent = text;
        if (j >= 2 && j <= 4) cell.className = 'num';
        row.append(cell);
      });
      return row;
    }).reverse(),
  );
}

// Clearing takes two clicks: the first one asks.
let armed = 0;
const disarm = () => { clearTimeout(armed); armed = 0; clearEl.textContent = 'Clear the tries'; };
clearEl.addEventListener('click', () => {
  if (!armed) {
    clearEl.textContent = `Click again to clear ${tries.length === 1 ? 'the one try' : `all ${tries.length} tries`}`;
    armed = window.setTimeout(disarm, 4000);
    return;
  }
  disarm();
  tries.length = 0;
  write(STORE.tries, tries);
  showTries();
});
clearEl.addEventListener('blur', disarm);

fresh();
hands.draw();
showTries();
