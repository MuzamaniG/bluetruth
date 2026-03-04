# TapCheck — Project Guide

## What is this?
TapCheck is a Next.js web app that shows tap-water safety status for a user's city using EPA SDWIS (Safe Drinking Water Information System) data. Users get a Green/Yellow/Red/Gray safety rating with actionable recommendations.

## Tech Stack
- **Framework**: Next.js 16 (App Router) + React 19
- **Styling**: Tailwind CSS v4 (using `@theme inline` in globals.css)
- **Database**: Supabase (optional — app works without it, used for caching)
- **APIs**: EPA Envirofacts REST API, Nominatim (reverse geocoding)
- **Deploy target**: Vercel

## Project Structure
```
src/
  app/
    page.tsx              # Home — location input
    result/page.tsx       # Results — status card + recommendations
    about/page.tsx        # Methodology + disclaimers
    api/
      check-water/route.ts  # POST {city, state} → water status
      geocode/route.ts       # POST {lat, lon} → {city, state}
    layout.tsx            # Root layout with nav + footer
    globals.css           # Tailwind + custom animations
  components/
    StatusCard.tsx         # Color-coded status display
    LocationInput.tsx      # Geolocation + manual city/state form
    RecommendationCard.tsx # Action item cards
  lib/
    supabase.ts           # Supabase client (null-safe if unconfigured)
    water-status.ts       # EPA query + status computation logic
  types/
    index.ts              # All TypeScript interfaces
supabase/
  schema.sql              # DB schema + seed data
```

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build
- `npm run lint` — ESLint

## Setup
1. `npm install`
2. Copy `.env.local.example` to `.env.local` and fill in Supabase credentials (optional — app works without Supabase, just no caching)
3. If using Supabase, run `supabase/schema.sql` against your database
4. `npm run dev`

## Status Logic
| Status | Condition |
|--------|-----------|
| Green  | No violations in past 5 years |
| Yellow | Only non-health violations, or old (>5yr) health violations |
| Red    | Recent health-based violations within 5 years |
| Gray   | Could not match a water system in EPA data |

## Design Notes
- Color palette: navy, cyan, teal, white — water/ocean themed. **No purple.**
- Civic-tech aesthetic: clean, trustworthy, editorial
- Components are self-contained and reusable — easy to restyle independently
- Supabase client returns `null` when env vars missing (graceful degradation)
- EPA API calls use `next: { revalidate: 3600 }` for 1-hour cache
