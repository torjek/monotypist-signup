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
| `src/data/site.ts` | Navigation links, footer links, the main button |
| `src/data/keyboard.ts` | The keyboard as data: where each key sits and what it types on each layer, in English, Danish and Hungarian |
| `src/components/KeyboardTour.astro` | The home page's stepped drawing of how the keys are reached, drawn from `keyboard.ts` |
| `public/assets/` | The design kit (CSS and scripts), copied unchanged from the design-taste-frontend skill. Do not edit |
| `public/img/product/` | Product photographs. Files ending in `-480`, `-800`, `-1200` are smaller copies for small screens |
| `public/fonts/` | Geist and Geist Mono, stored here so nothing loads from a font service |
| `public/` | Other files copied as they are: `CNAME`, favicons, `share.jpg` |

Colours and type are the `:root` block in `Base.astro`. It was printed by the kit's `start.mjs brand` command;
change the colours there and paste the result, not by hand.

The light pink housing in the photographs is a recoloured picture of the black one, until real photographs exist.

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
