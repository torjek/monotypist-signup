// Turns key presses into the characters MonoTypist would type. Used by the home page tour's last
// step, the typing course and the speed test.
//
// Two ways of typing:
//   'standin'  an ordinary keyboard stands in for MonoTypist. Keys count by their place, not their
//              letter: the five keys from Q, A and Z (and 1 to 5 above them) are the block's keys,
//              and Space, Enter and Delete are the three thumb keys. Held, a thumb key turns on its
//              layer; tapped alone, it does its own job on release, as on the real keyboard.
//   'direct'   a real MonoTypist is plugged in and already sends finished characters, so they are
//              taken as they come.
// A mouse or a finger on the drawing works the same in both.
import { legends, thumbLayer, keyFor, thumbFor, type Lang } from '../data/keyboard';
import type { Picture, Thumb } from './board';

export type Mode = 'standin' | 'direct';

interface Options {
  /** The box that has the keyboard focus while typing. */
  keys: HTMLElement;
  /** The drawing, for a mouse or a finger. */
  drawing: Element;
  lang: () => Lang;
  mode: () => Mode;
  /** False while typing is switched off (another step of the tour is showing). */
  live: () => boolean;
  /** A character was typed. */
  type: (c: string) => void;
  /** The last typed character turns into `c`: its thumb key landed a moment after the key itself. */
  swap: (c: string) => void;
  /** Backspace. */
  erase: () => void;
  /** Enter or Delete tapped alone. (Space tapped alone types a space.) */
  tap?: (id: Thumb) => void;
  /** Escape. Left to the browser when not given. */
  escape?: () => void;
  /** The keys now down, to show on the drawing. */
  draw: (p: Picture) => void;
}

// An ordinary keyboard's keys by their place. Tab stands for the key left of Q only while a thumb
// key is held, so that alone it still moves between the page's controls.
const CODES: Record<string, number> = {
  Backquote: 0, Digit1: 1, Digit2: 2, Digit3: 3, Digit4: 4, Digit5: 5,
  Tab: 6, KeyQ: 7, KeyW: 8, KeyE: 9, KeyR: 10, KeyT: 11,
  Backspace: 12, KeyA: 13, KeyS: 14, KeyD: 15, KeyF: 16, KeyG: 17,
  KeyZ: 19, KeyX: 20, KeyC: 21, KeyV: 22, KeyB: 23,
};
const THUMBS: Record<string, Thumb> = { Space: 'space', Enter: 'enter', Delete: 'delete' };
const BACKSPACE = 12;
const TOGETHER = 60; // milliseconds within which a key and a thumb key count as pressed together

export function typer(o: Options) {
  const T = {
    down: new Set<number>(),
    held: [] as Thumb[], // thumb keys held on the keyboard, the last one pressed wins
    latch: null as Thumb | null, // a thumb key clicked on the drawing, waiting for its key
    used: false, // the held thumb key has typed something, so its release types nothing
    last: null as { k: number; t: number } | null,
  };
  let flash: Picture | null = null;
  let flashTimer = 0;

  const heldNow = () => T.held[T.held.length - 1] || T.latch;
  const ch = (k: number, layer: 'base' | 'blue' | 'red' | 'orange') => {
    const s = legends[o.lang()][layer][k] || '';
    return s.length === 1 ? s.toLowerCase() : s;
  };
  const draw = () => o.draw(flash ?? { held: heldNow() ?? null, down: [...T.down] });

  function reset() {
    T.down.clear();
    T.held = [];
    T.latch = null;
    T.used = false;
    T.last = null;
    flash = null;
    clearTimeout(flashTimer);
  }

  function press(k: number) {
    const h = heldNow();
    if (h) T.used = true;
    T.last = null;
    if (k === BACKSPACE && !h) { o.erase(); return; }
    const c = ch(k, h ? thumbLayer[h] : 'base');
    if (!c) return;
    o.type(c);
    if (!h) T.last = { k, t: performance.now() };
  }
  function tapThumb(id: Thumb) {
    if (id === 'space') o.type(' ');
    else o.tap?.(id);
  }

  // A real MonoTypist: the character arrives finished; the drawing shows the keys that made it.
  function direct(e: KeyboardEvent) {
    if (e.key === 'Backspace') o.erase();
    else if (e.key === 'Enter') o.tap?.('enter');
    else if (e.key.length === 1) {
      o.type(e.key);
      const at = keyFor(o.lang(), e.key);
      flash = e.key === ' ' ? { held: 'space' } : at ? { held: thumbFor(at.slot), down: [at.k] } : null;
      clearTimeout(flashTimer);
      flashTimer = window.setTimeout(() => { flash = null; draw(); }, 140);
    } else return;
    e.preventDefault();
    draw();
  }

  o.keys.addEventListener('keydown', (e) => {
    if (!o.live() || e.target !== o.keys) return;
    // AltGr counts as Ctrl and Alt together; it types the brackets on Danish and Hungarian keyboards.
    if ((e.ctrlKey || e.metaKey || e.altKey) && !e.getModifierState('AltGraph')) return;
    if (e.code === 'Escape' && o.escape) { e.preventDefault(); o.escape(); return; }
    if (o.mode() === 'direct') { direct(e); return; }

    const id = THUMBS[e.code];
    const k = e.code === 'Tab' && !heldNow() ? undefined : CODES[e.code];
    if (!id && k === undefined) return; // Tab, Escape and the rest keep their own jobs
    e.preventDefault();
    if (e.repeat) return;
    if (id) {
      T.latch = null;
      if (!T.held.includes(id)) T.held.push(id);
      T.used = false;
      // Pressed together with a key that went down a moment earlier and is still down: that key's
      // character moves to this thumb key's layer.
      if (T.last && T.down.has(T.last.k) && performance.now() - T.last.t < TOGETHER) {
        const c = ch(T.last.k, thumbLayer[id]);
        if (c) o.swap(c);
        T.used = true;
        T.last = null;
      }
    } else {
      T.down.add(k!);
      press(k!);
    }
    draw();
  });

  o.keys.addEventListener('keyup', (e) => {
    if (!o.live() || o.mode() === 'direct') return;
    const id = THUMBS[e.code];
    const k = CODES[e.code];
    if (id) {
      const i = T.held.indexOf(id);
      if (i < 0) return;
      T.held.splice(i, 1);
      if (!T.used) tapThumb(id);
    } else if (k !== undefined && T.down.has(k)) T.down.delete(k);
    else return;
    draw();
  });

  o.keys.addEventListener('blur', () => {
    if (!o.live()) return;
    T.held = [];
    T.down.clear();
    draw();
  });

  // With a mouse or a finger: a thumb key stays down for the next key; tapped twice, it does its own job.
  o.drawing.addEventListener('pointerdown', (e) => {
    if (!o.live()) return;
    const el = (e.target as Element).closest<SVGElement>('[data-key]');
    if (!el) return;
    const id = el.dataset.key!;
    if (id in thumbLayer) {
      if (T.latch === id) { T.latch = null; tapThumb(id as Thumb); } else T.latch = id as Thumb;
    } else {
      const k = Number(id.slice(1));
      T.down.add(k);
      press(k);
      setTimeout(() => { T.down.delete(k); T.latch = null; if (o.live()) draw(); }, 180);
    }
    draw();
  });

  return { reset, draw };
}
