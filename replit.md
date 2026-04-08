# Modovate POC — Build Reference

## Overview

Modovate is an 8-screen, investor-focused conversational AI web app for the Canadian energy-upgrade market (Ontario launch market). This POC is 90% investor pitch demo, 10% internal alignment. The full journey runs in 3–5 minutes.

## Monorepo

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9

## Modovate Tech Stack

- **Framework**: React + Vite (in pnpm monorepo)
- **Styling**: Tailwind CSS + shadcn/ui
- **Routing**: wouter (client-side)
- **Charts**: recharts (AreaChart on Summary dashboard)
- **State management**: `HomeownerContext` synced to `sessionStorage` — no database, no backend
- **Data layer**: Static JSON files in `src/data/` — no live data fetching
- **Calculation logic**: `src/lib/energy-calculator.ts` — deterministic, rule-based formulas
- **Fonts**: Manrope (display/headline) + Inter (body/label)

## Artifact Location

- **Path**: `artifacts/modovate/`
- **Preview Path**: `/` (root)
- **Port**: 22788 (via PORT env var)

## Key Commands

- `pnpm --filter @workspace/modovate run dev` — run Modovate locally
- `pnpm run typecheck` — full typecheck across all packages

## Design System — "Architectural Advisor"

- **Primary**: Deep Teal `#002428` (HSL 186 100% 8%)
- **Secondary/CTA**: Warm Amber `#795900` (HSL 43 100% 24%)
- **Background**: Off-white `#faf9f6`
- **Cards**: `#ffffff`
- **Surface Container Low**: `#f4f3f0`
- Tonal layering preferred over hard borders
- Generous white space, editorial feel
- Ambient shadows: 24–32px blur, 4–6% opacity, tinted teal

## 8-Screen Journey (All Built and Working)

1. **`/` — Welcome / Address Entry** — Address input + satellite placeholder + amber CTA
2. **`/intake` — Conversational Intake** — Chat-bubble wizard, selectable chips, 400ms delay, progress bar
3. **`/assessment` — Property Assessment** — Satellite placeholder + 6 property data cards + EnerGuide rating bar
4. **`/recommendations` — Upgrade Recommendations** — Two-column card grid, prioritized by intake, rebate badges
5. **`/equipment` — Equipment Options** — 3 heat pump product cards with Best Match badge, specs, pricing
6. **`/rebates` — Rebate Summary** — Hero banner with total + individual program cards (grants + loans)
7. **`/contractors` — Contractor Match** — 3 GTA contractor cards + Request Quote modal with form
8. **`/summary` — ROI Dashboard** — Hero metrics, payback timeline, 10-year savings chart, CO2 reduction badge

## File Structure

```
artifacts/modovate/src/
├── App.tsx                    # Router with all 8 routes
├── index.css                  # Design system CSS custom properties
├── context/
│   └── HomeownerContext.tsx    # Global state + sessionStorage sync
├── lib/
│   └── energy-calculator.ts   # Savings, rebates, recommendations, project summary
├── components/
│   └── layout.tsx             # Shared nav header with back button + step indicator
├── pages/
│   ├── welcome.tsx            # Screen 1
│   ├── intake.tsx             # Screen 2
│   ├── assessment.tsx         # Screen 3
│   ├── recommendations.tsx    # Screen 4
│   ├── equipment.tsx          # Screen 5
│   ├── rebates.tsx            # Screen 6
│   ├── contractors.tsx        # Screen 7
│   └── summary.tsx            # Screen 8
└── data/
    ├── equipment-catalog.json      # 7 categories, 3 products each
    ├── contractor-profiles.json    # 3 GTA contractors
    ├── rebate-programs.json        # 6 real Ontario/federal programs
    ├── mock-energy-savings.json    # ~30 savings lookup records
    └── mock-address-profiles.json  # 5 demo addresses + default
```

## State Management

- `HomeownerContext` stores: address, intakeAnswers, homeProfile, selectedUpgrades, selectedProducts, currentScreen
- State persisted to sessionStorage for bidirectional navigation
- Welcome page resets all state on entry (clean demo restart)
- Summary "Start Over" also resets state

## Real Rebate Programs (exact names/amounts)

- **Canada Greener Homes Grant** (NRCan) — up to $5,000
- **Canada Greener Homes Loan** (NRCan) — up to $40,000 interest-free
- **Enbridge HER+** — up to $10,000
- **IESO saveONenergy** — $50–$500
- **Toronto Hydro** — up to $75 thermostat rebate
- **Ontario Renovates** — up to $25,000 forgivable loan

## Environment Variables

- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps API key (not yet configured, satellite view uses placeholder UI)

## What's NOT Built (by design)

- No backend server / API
- No database / ORM
- No authentication
- No Google Maps integration (placeholder UI ready for API key)
- No PDF download (toast placeholder)
- No Docker/containerization
