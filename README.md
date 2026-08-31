# GeoRevivers Dashboard

React + Vite dashboard based on the GeoRevivers logo and blue/green visual identity.

## Included pages
- Dashboard Overview
- Waste Records
- Admin Panel / Add Waste Record
- Analytics & Reports
- Waste Categories
- Collection Points
- Users & Roles
- Settings

## Waste categories
- Crushed Ceramic
- Crushed Concrete
- Crushed Asphalt
- Crushed Glass
- Steel
- Plastic

## Admin record fields
- Date (Day / Month / Year)
- Waste Type
- Quantity (Ton)
- Collection Point
- Condition

Records are saved to browser `localStorage` for the prototype, so refreshing the page keeps the data.

## Run locally

```bash
npm install
npm run dev
```

## Build for Vercel

```bash
npm run build
```

Vercel will detect Vite automatically. The output directory is `dist`.
