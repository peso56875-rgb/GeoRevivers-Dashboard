# GeoRevivers Dashboard

A cinematic operations dashboard for GeoRevivers — sustainable ground improvement at Delta University for Science & Technology, Gamasa.

The interface was rebuilt as a full visual system (aurora landing, command overview, live ledger, analytics, faculty network) without changing the underlying dataset, storage keys, or admin workflow.

## Included pages

- Welcome / brand landing
- Dashboard overview
- Waste records (search + pagination)
- Admin panel / add waste record (PIN protected)
- Analytics & reports
- Waste categories
- Collection points + campus map
- Users, roles, and settings

## Waste categories

- Plastic
- Crushed Ceramic
- Crushed Concrete
- Crushed Asphalt

Additional categories can be added from the categories page and are stored locally.

## Admin record fields

- Date (day / month / year)
- Waste type
- Quantity (ton)
- Collection point
- Condition
- Collection time
- Notes

Records persist in browser `localStorage`, so a refresh keeps the data. The seeded dataset is the 2026 Delta University collection ledger (3,515 records).

## Run locally

```bash
npm install
npm run dev
```

## Build for Vercel

```bash
npm run build
```

Vercel detects Vite automatically. The output directory is `dist`.
