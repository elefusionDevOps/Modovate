# Modovate POC — Build Reference

## Overview

Modovate is an 8-screen, investor-focused conversational AI web app for the Canadian energy-upgrade market (Ontario launch market). This POC is 90% investor pitch demo, 10% internal alignment. The full journey runs in 3–5 minutes.

## Monorepo

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **Build**: esbuild (CJS bundle)
- **API codegen**: Orval (from OpenAPI spec)

## Modovate Tech Stack

- **Framework**: React + Vite (in pnpm monorepo)
- **Styling**: Tailwind CSS + shadcn/ui
- **State management**: `HomeownerContext` synced to `sessionStorage` — no database, no ORM, no backend persistence
- **APIs (real)**: Google Places API (address autocomplete), Google Maps JavaScript API (satellite imagery on Screens 1 & 3)
- **Data layer**: Static JSON files in `/data` — no live data fetching
- **Calculation logic**: `lib/energy-calculator.ts` — deterministic, rule-based formulas
- **Fonts**: Manrope (display/headline) + Inter (body/label)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/api-server run dev` — run API server locally

## Design System — "Architectural Advisor"

- **Primary**: Deep Teal `#002428`
- **Secondary**: Warm Amber `#795900`
- **Tertiary**: Muted Sage `#022600`
- **Background**: Off-white `#faf9f6`
- **Surface Container Low**: `#f4f3f0`
- **Surface Container Lowest**: `#ffffff`
- Tonal layering (background color shifts) preferred over borders, but the "No-Line" rule is not strictly required (per Mark's clarification)
- Generous white space, editorial feel, asymmetrical padding
- Glassmorphism for floating overlays (semi-transparent + backdrop-blur 12–20px)
- Ambient shadows: 24–32px blur at 4–6% opacity, tinted teal (not gray)

## 8-Screen Journey

1. **Welcome / Address Entry** — Google Places Autocomplete + satellite map preview
2. **Conversational Intake** — Chat-bubble wizard, selectable chips, 400ms delay, progress bar
3. **Property Assessment Results** — Satellite map (40% height) + 6 property data cards + energy rating bar
4. **Upgrade Recommendations** — Two-column card grid, personalized by intake answers, rebate badges
5. **Equipment Options (Heat Pump)** — 3 product cards (Mitsubishi Zuba, Lennox XP25-H, Bosch IDS Ultra Quiet)
6. **Rebate & Incentive Summary** — Hero total + individual program cards with real names/amounts/URLs
7. **Contractor Match** — 3 GTA contractor profiles + "Request Quote" modal
8. **ROI / Project Summary Dashboard** — Hero metrics, payback timeline, 10-year savings chart, CO2 badge, CTAs

## Clarifications from Mark (Lead)

These override or supplement the build guide:

1. **Desktop first** — Primary investor demos are on desktop/laptop. Desktop breakpoints are the priority. Mobile (390px) is a later iteration, not a blocker.
2. **Navigation is bidirectional** — The app must support backward and forward navigation. If a user goes back (e.g., Screen 8 → Screen 5), state should update accordingly. Not a one-way walkthrough.
3. **Download Report = mock PDF** — Use a placeholder formatted PDF (can contain placeholder text). Not a `window.print()`. Low priority — implement after the core flow is working.
4. **Non-demo addresses are fine** — Fallback data is acceptable with a disclaimer. The satellite image is the real "wow moment" regardless of address.
5. **Rebates filter dynamically** — Only show rebates that match the equipment the user has actually selected.
6. **"No-Line" rule is flexible** — The border rule from the design system was internal reference. Not strictly required in implementation.

## Data Files (in `/data` inside artifact)

| File | Purpose | Screen(s) |
|------|---------|-----------|
| `equipment-catalog.json` | 7 categories, ~25-30 products with specs | 5 |
| `contractor-profiles.json` | 3 fictional GTA contractors | 7 |
| `rebate-programs.json` | 5-7 real Ontario/federal programs | 6, 8 |
| `mock-energy-savings.json` | ~20-40 savings lookup records | 8 |
| `mock-address-profiles.json` | 3-5 demo addresses + default fallback | 3 |

## Real Rebate Programs (use exact names/amounts)

- **Canada Greener Homes Grant** (NRCan) — up to $5,000
- **Canada Greener Homes Loan** (NRCan) — up to $40,000 interest-free
- **Enbridge HER+** — up to $10,000
- **IESO saveONenergy** — $50–$500
- **Toronto Hydro** (Toronto only) — up to $75 thermostat rebate
- **Ontario Renovates** — up to $25,000 forgivable loan (income-qualified)

## Contractor Profiles (fictional)

1. **GreenHome HVAC Solutions** — Toronto, GTA. Rating 4.9, 14 yrs, 1,240 projects. Top Match.
2. **EcoRenovate Ontario** — Toronto, GTA+Hamilton. Rating 4.8, 8 yrs, 620 projects.
3. **Volta Energy Systems** — Toronto East. Rating 4.7, 5 yrs, 280 projects.

## What NOT to Build

- No EnergyPlus/OpenStudio simulation
- No LangChain/LangGraph/multi-agent AI
- No Docker/containerization
- No PostgreSQL/Redis/any database
- No authentication/user accounts
- No separate backend server (Express/FastAPI)
- No automated rebate application submission

## Environment Variables Needed

- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps API key (Vite public prefix for client-side access)
