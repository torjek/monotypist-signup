# monotypist.com

Website for the MonoTypist one-handed keyboard. Built with [Astro](https://astro.build), hosted on GitHub Pages.

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
| `src/pages/` | One file per URL |
| `src/layouts/Base.astro` | The frame every page shares: head, header, footer |
| `src/components/` | Header, footer, logo |
| `src/styles/tokens.css` | Colours, fonts and sizes; change them here only |
| `src/data/site.ts` | Navigation links |
| `public/` | Files copied as they are: `CNAME`, favicons |

## Branches and deployment

- `main`: this site.
- `legacy-signup`: the old "coming soon" page. GitHub Pages serves this branch until launch.

`.github/workflows/deploy.yml` builds and deploys the site. It only runs when started by hand. At launch, set
Settings → Pages → Source to "GitHub Actions" and turn on the push trigger in that file.
