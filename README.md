# monotypist.com

Website for the MonoTypist one-handed keyboard. Built with [Astro](https://astro.build): the pages in `src/` are
turned into plain HTML files in `dist/`, and that folder is what goes online.

## Run it locally

Needs Node 22.23.4 or newer.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # writes the static site to dist/
```

## Where things are

| Path | What |
|---|---|
| `src/pages/` | One file per URL. `index.astro` is the home page |
| `src/layouts/Base.astro` | The frame every page shares: head, colours, fonts, header, footer |
| `src/components/` | Header, footer, logo, the plain placeholder page |
| `src/components/Keyboard.astro` | The drawing of the keyboard, drawn from `keyboard.ts`. The home page, the course and the speed test all use it |
| `src/components/Tool.astro` | The frame the course and the speed test share: heading, language and keyboard choices, the typing area beside the drawing |
| `src/data/site.ts` | Navigation links, footer links, the main button |
| `src/data/keyboard.ts` | The keyboard as data: where each key sits and what it types on each layer, in English, Danish and Hungarian |
| `src/components/KeyboardTour.astro` | The home page's stepped drawing of how the keys are reached, drawn from `keyboard.ts` |
| `src/data/course.ts` | The order in which the typing course teaches the characters, per language |
| `src/data/words.ts` | The speed test's word lists (200 words per language), with their source and licence |
| `src/scripts/` | What runs in the browser. `board.ts` lights the keys of the drawing; `typer.ts` turns key presses into characters (a real MonoTypist, or an ordinary keyboard standing in); `tool.ts` and `prefs.ts` hold the choices the two typing pages share; `learn.ts` is the course, `test.ts` the speed test, `chart.ts` its chart |
| `public/assets/` | The design kit (CSS and scripts), copied unchanged from the design-taste-frontend skill. Do not edit |
| `public/img/product/` | Product photographs. Files ending in `-480`, `-800`, `-1200` are smaller copies for small screens |
| `public/fonts/` | Geist and Geist Mono, stored here so nothing loads from a font service |
| `public/` | Other files copied as they are: `CNAME`, favicons, `share.jpg` |

Colours and type are the `:root` block in `Base.astro`. It was printed by the kit's `start.mjs brand` command;
change the colours there and paste the result, not by hand.

The light pink housing in the photographs is a recoloured picture of the black one, until real photographs exist.

## The typing course and the speed test

`/learn/` and `/test/` run entirely in the visitor's browser. The chosen language, the course's level and the
speed test's tries are kept in the browser's own storage (names starting with `monotypist.`); nothing is sent
anywhere and there are no accounts.

Both pages work with a MonoTypist plugged in, or with an ordinary keyboard standing in for one: the five keys
from Q, A and Z are the letter keys, and Space, Enter and Delete are the three thumb keys.

Credits: the course's teaching method (one new character per level, missed characters come back) is that of
keyzen, which is in the public domain. The word lists are adapted from FrequencyWords by Hermit Dave, licensed
CC BY-SA 4.0; the speed test's footer says so, and a page passes such a line to the footer through the layout's
`credit` slot.

## The waitlist form

The form on the home page posts to Formspree (`formAddress` in `src/pages/index.astro`). No key or password is
stored in this repository.

## Branches and deployment

- `main`: this site (the Astro source).
- `deploy`: the built site, and nothing else. Never edit it by hand: it is replaced on every push to `main`.
- `legacy-signup`: the old "coming soon" page.

monotypist.com is served by Porkbun's static hosting, which is connected to this repository (Porkbun → the
domain → Static Hosting → GitHub Connect). Porkbun does not build anything: it serves the files of one branch
exactly as they are. `main` holds source files and has no `index.html` at its root, so Porkbun must be set to
the `deploy` branch, never to `main`.

`.github/workflows/deploy.yml` runs on every push to `main`: it builds the site and replaces the `deploy`
branch with the result. A change is live a minute or two after the push.
