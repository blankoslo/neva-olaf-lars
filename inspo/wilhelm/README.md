# Wilhelm — PWA travel companion (Next.js)

A working Next.js 14 (App Router) PWA built from Direction A · "Feltdagbok".
Wilhelm is a warm grandfatherly trip-guide who appears in the margins of a
cabin-to-cabin Norwegian forest trip.

## Run locally

```bash
npm install
npm run dev
```

Then open <http://localhost:3000>.

## Routes

| Path        | Screen                  |
| ----------- | ----------------------- |
| `/`         | Hjem (planning)         |
| `/tur`      | Turoversikt             |
| `/tur/dag-2`| Dag 2 detalj            |
| `/live`     | På tur · live           |
| `/dagbok`   | Etter turen — dagbok    |

## PWA

`public/manifest.webmanifest` ships an installable PWA shell. Add an actual
service-worker (e.g. via `next-pwa`) for full offline support — left as a
deliberate stub so the demo runs without extra configuration.

## Design system

- **Type**: Spectral (display), DM Sans (UI), JetBrains Mono (metadata),
  Caveat (Wilhelm's hand)
- **Palette**: forest #1a1f1a · bone #ede4d3 · ember #d97757 · sage #5b6b5a
- All in `app/globals.css` as CSS custom properties.

## Files of interest

- `app/_components/wilhelm-avatar.tsx` — Wilhelm character (soft cap, bushy beard)
- `app/_components/route-map.tsx` — abstract field-journal map
- `app/_components/contour-map.tsx` — topographic ambient art
- `app/_components/elevation.tsx`, `glyph.tsx`, `stamp.tsx`, `tab-bar.tsx`
