// Marks keys on a drawing of the keyboard (src/components/Keyboard.astro): which keys are down,
// which thumb key is held, which key comes next, and the language of the legends.
import { legends, thumbLayer, type Lang } from '../data/keyboard';

export type Thumb = keyof typeof thumbLayer;

export interface Picture {
  /** The thumb key held down, if any. */
  held?: Thumb | null;
  /** Block keys that are down, by number (row x 6 + column). */
  down?: number[];
  /** The key to press next, with the thumb key to hold for it. */
  next?: { k: number; thumb: Thumb | null } | null;
}

/** `root` is any box that holds the drawing; its legends follow `relabel`. */
export function board(root: Element) {
  const blocks = Array.from({ length: 24 }, (_, k) => root.querySelector(`[data-key="k${k}"]`));
  const thumbs = (Object.keys(thumbLayer) as Thumb[]).map((id) => [id, root.querySelector(`[data-key="${id}"]`)] as const);

  return {
    show({ held = null, down = [], next = null }: Picture) {
      thumbs.forEach(([id, el]) => {
        el?.classList.toggle('is-held', held === id);
        el?.classList.toggle('is-next', !!next && next.thumb === id && held !== id);
      });
      blocks.forEach((el, k) => {
        el?.classList.toggle('is-down', down.includes(k));
        el?.classList.toggle('is-next', !!next && next.k === k);
      });
    },
    relabel(lang: Lang) {
      root.querySelectorAll<SVGElement>('[data-slot]').forEach((el) => {
        el.textContent = legends[lang][el.dataset.slot as keyof (typeof legends)[Lang]][Number(el.dataset.k)] || '';
      });
    },
  };
}
