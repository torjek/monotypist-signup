// A line chart of values in the order they happened: one grey dot per value, a dark line for the
// running average, and a marker that follows the mouse, a finger or the arrow keys.
// Used by the speed test for its saved tries. Colours and type come from the page's own tokens
// (the styles are in src/pages/test.astro).

export interface ChartPoint {
  value: number;
  /** The average up to and including this point. */
  avg: number;
  /** The lines of the note shown beside the marked point; the first one stands out. */
  lines: string[];
}

const NS = 'http://www.w3.org/2000/svg';
const M = { top: 12, right: 44, bottom: 28, left: 40 }; // room for the numbers round the plot
const EDGE = 10; // from the plot's side to the first and the last dot

function el<K extends keyof SVGElementTagNameMap>(name: K, attrs: Record<string, string | number>, cls?: string) {
  const e = document.createElementNS(NS, name);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
  if (cls) e.setAttribute('class', cls);
  return e;
}

/** A round step (1, 2 or 5 times a power of ten) near `raw`. */
function step(raw: number) {
  const p = 10 ** Math.floor(Math.log10(Math.max(raw, 1)));
  const f = Math.max(raw, 1) / p;
  return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10) * p;
}

/** `box` is an empty, positioned element with a height; the chart fills it. */
export function chart(box: HTMLElement) {
  const svg = el('svg', { role: 'presentation', focusable: 'false' });
  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.setAttribute('role', 'status');
  tip.hidden = true;
  box.append(svg, tip);
  box.tabIndex = 0;

  let points: ChartPoint[] = [];
  let at = -1; // the marked point, -1 for none
  let xs: number[] = [];
  let y = (_v: number) => 0;
  let mark: { line: SVGElement; dot: SVGElement } | null = null;

  function draw() {
    const W = box.clientWidth;
    const H = box.clientHeight;
    svg.replaceChildren();
    mark = null;
    if (!points.length || W < 120 || H < 100) return;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    const n = points.length;
    const left = M.left;
    const right = W - M.right;
    const top = M.top;
    const bottom = H - M.bottom;

    // up: from zero to a round number above the highest value
    const high = Math.max(...points.map((p) => p.value), 1);
    const yStep = step(high / 4);
    const yMax = Math.ceil(high / yStep) * yStep;
    y = (v) => bottom - (v / yMax) * (bottom - top);
    for (let v = 0; v <= yMax; v += yStep) {
      svg.append(el('line', { x1: left, x2: right, y1: y(v), y2: y(v) }, v ? 'chart-grid' : 'chart-base'));
      const t = el('text', { x: left - 8, y: y(v), 'text-anchor': 'end', 'dominant-baseline': 'middle' }, 'chart-tick');
      t.textContent = String(v);
      svg.append(t);
    }

    // across: one place per value, oldest first
    const span = right - left - EDGE * 2;
    xs = points.map((_, i) => left + EDGE + (n === 1 ? span / 2 : (i / (n - 1)) * span));
    const xStep = n <= 10 ? 1 : step(n / 6);
    for (let i = 1; i <= n; i += i === 1 && xStep > 1 ? xStep - 1 : xStep) {
      const t = el('text', { x: xs[i - 1], y: bottom + 18, 'text-anchor': 'middle' }, 'chart-tick');
      t.textContent = String(i);
      svg.append(t);
    }

    // one dot per value: with a ring in the ground's colour while there is room for one
    const r = n <= 80 ? 4 : n <= 250 ? 2.5 : 2;
    const dots = el('g', {}, n <= 80 ? 'chart-dots chart-dots--ring' : 'chart-dots');
    points.forEach((p, i) => dots.append(el('circle', { cx: xs[i], cy: y(p.value), r })));
    svg.append(dots);

    // the average: one line, named once at its end
    if (n > 1) {
      svg.append(el('path', { d: points.map((p, i) => `${i ? 'L' : 'M'}${xs[i].toFixed(1)} ${y(p.avg).toFixed(1)}` ).join('') }, 'chart-line'));
      const t = el('text', { x: xs[n - 1] + 10, y: y(points[n - 1].avg), 'dominant-baseline': 'middle' }, 'chart-end');
      t.textContent = String(Math.round(points[n - 1].avg));
      svg.append(t);
    }

    mark = { line: el('line', { y1: top, y2: bottom }, 'chart-cross'), dot: el('circle', { r: 6 }, 'chart-mark') };
    svg.append(mark.line, mark.dot);
    show(at);
  }

  // Marks point `i` and puts its note beside it; -1 takes both away.
  function show(i: number) {
    at = i >= 0 && i < points.length ? i : -1;
    if (!mark) return;
    const on = at >= 0;
    mark.line.style.display = mark.dot.style.display = on ? '' : 'none';
    tip.hidden = !on;
    if (!on) return;
    const p = points[at];
    const px = xs[at];
    const py = y(p.value);
    mark.line.setAttribute('x1', String(px));
    mark.line.setAttribute('x2', String(px));
    mark.dot.setAttribute('cx', String(px));
    mark.dot.setAttribute('cy', String(py));
    tip.replaceChildren(
      ...p.lines.map((text, j) => {
        const row = document.createElement(j ? 'span' : 'strong');
        row.textContent = text;
        return row;
      }),
    );
    const w = tip.offsetWidth;
    const h = tip.offsetHeight;
    const x = px + 14 + w > box.clientWidth ? px - 14 - w : px + 14;
    tip.style.left = `${Math.max(0, x)}px`;
    tip.style.top = `${Math.min(Math.max(0, py - h / 2), box.clientHeight - h)}px`;
  }

  // The point nearest to the pointer, left to right.
  const nearest = (clientX: number) => {
    const x = clientX - box.getBoundingClientRect().left;
    let best = 0;
    xs.forEach((v, i) => { if (Math.abs(v - x) < Math.abs(xs[best] - x)) best = i; });
    return best;
  };
  box.addEventListener('pointermove', (e) => show(nearest(e.clientX)));
  box.addEventListener('pointerdown', (e) => show(nearest(e.clientX)));
  box.addEventListener('pointerleave', () => { if (document.activeElement !== box) show(-1); });
  box.addEventListener('focus', () => { if (at < 0) show(points.length - 1); });
  box.addEventListener('blur', () => show(-1));
  box.addEventListener('keydown', (e) => {
    const to =
      e.key === 'ArrowLeft' ? Math.max(0, (at < 0 ? points.length : at) - 1)
      : e.key === 'ArrowRight' ? Math.min(points.length - 1, at + 1)
      : e.key === 'Home' ? 0
      : e.key === 'End' ? points.length - 1
      : e.key === 'Escape' ? -1
      : null;
    if (to === null) return;
    e.preventDefault();
    show(to);
  });
  new ResizeObserver(draw).observe(box);

  return {
    set(next: ChartPoint[]) {
      points = next;
      at = -1;
      draw();
    },
  };
}
