// The script side of src/components/Tool.astro: the choices the course and the speed test share
// (language, keyboard), the drawing, and the box that takes the keys.
import { thumbLayer, keyFor, thumbFor, type Lang } from '../data/keyboard';
import { board, type Picture } from './board';
import { loadPrefs, savePrefs, choose, onChoice, backToTyping } from './prefs';
import type { Mode } from './typer';

export function tool(changed: (what: 'lang' | 'kb') => void) {
  const frame = document.querySelector<HTMLElement>('[data-tool]')!;
  const area = frame.querySelector<HTMLElement>('[data-area]')!;
  const drawing = frame.querySelector<HTMLElement>('.tool-kb')!;
  const bar = frame.querySelector<HTMLElement>('[data-bar]')!;
  const langList = document.querySelector<HTMLElement>('[data-pick="lang"]')!;
  const kbList = document.querySelector<HTMLElement>('[data-pick="kb"]')!;
  const prefs = loadPrefs();
  const keys = board(frame);

  choose(langList, prefs.lang);
  choose(kbList, prefs.kb);
  frame.dataset.kb = prefs.kb;
  keys.relabel(prefs.lang);
  onChoice(langList, (v) => { prefs.lang = v as Lang; savePrefs(prefs); keys.relabel(prefs.lang); changed('lang'); });
  onChoice(kbList, (v) => { prefs.kb = v as Mode; savePrefs(prefs); frame.dataset.kb = prefs.kb; changed('kb'); });
  backToTyping(area, langList, kbList, bar);
  area.focus({ preventScroll: true });

  return {
    frame, area, drawing, bar, prefs, keys,
    save: () => savePrefs(prefs),
    /**
     * Draws the keys now down and, when `next` is given, rings the key that types it (and the
     * thumb key to hold with it). `rest` is the layer shown while no thumb key is held.
     */
    paint(p: Picture, next: string | null, rest: string) {
      const at = next && next !== ' ' ? keyFor(prefs.lang, next) : null;
      keys.show({ ...p, next: next === ' ' ? { k: -1, thumb: 'space' } : at ? { k: at.k, thumb: thumbFor(at.slot) } : null });
      frame.dataset.layer = p.held ? thumbLayer[p.held] : rest;
    },
  };
}
