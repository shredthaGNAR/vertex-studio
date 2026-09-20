# Vertex — Web Development & Growth Studio

A dark-mode, single-page studio site built with Astro. Near-black palette, electric-lime accents, bespoke generative SVG artwork, and scroll-reveal motion throughout.

## Stack

- **Astro 5** — static output, zero JS shipped by default
- **TypeScript** — content and asset generation scripts
- Custom generative SVG artwork (no stock photos) — see `scripts/gen-art.ts`

## Structure

```text
src/
├── assets/        # logo + generative artwork (SVG)
├── components/    # Nav, Hero, Ticker, Stats, About, Receipts,
│                  # Services, Work, Mission, Footer
├── layouts/       # Layout.astro (global styles, fonts, reveal observer)
└── pages/         # index.astro
scripts/
└── gen-art.ts     # regenerates the SVG artwork in src/assets
```

## Commands

| Command        | Action                                      |
| :------------- | :------------------------------------------ |
| `pnpm install` | Install dependencies                        |
| `pnpm dev`     | Start local dev server at `localhost:4321`  |
| `pnpm build`   | Build production site to `./dist/`          |
| `pnpm preview` | Preview the production build locally        |

Regenerate artwork: `ts scripts/gen-art.ts`
