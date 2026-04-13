# Modovate POC — Build Reference

## Stable Checkpoint (April 2026)

All 8 screens complete, navigable, and mobile-responsive. Dynamic recommendation engine, rebate calculations, and summary dashboard all working with real Ontario data. Google Places autocomplete and real satellite imagery fully integrated and working.

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

1. **`/` — Welcome / Address Entry** — Address input + satellite placeholder + amber CTA + "Continue where you left off" link when session exists
2. **`/intake` — Conversational Intake** — Chat-bubble wizard, selectable chips, 400ms delay, progress bar, back button navigates through questions then to welcome
3. **`/assessment` — Property Assessment** — Back to intake + satellite placeholder + 6 property data cards + EnerGuide rating bar
4. **`/recommendations` — Upgrade Recommendations** — Sidebar back to assessment + two-column card grid, prioritized by intake, rebate badges
5. **`/equipment/:category` — Equipment Options** — Back to recommendations + dynamic category routing for all 7 upgrade types
6. **`/rebates` — Rebate Summary** — Back to recommendations + hero banner with total + individual program cards (grants + loans)
7. **`/contractors` — Contractor Match** — Back to rebates + 3 GTA contractor cards + Request Quote modal with form
8. **`/summary` — ROI Dashboard** — Back to contractors + hero metrics, payback timeline, 10-year savings chart, CO2 reduction badge, downloadable HTML report

## Navigation & State

- **Back/Forward**: Every screen has a back button returning to the previous step in the linear flow
- **State Persistence**: `HomeownerContext` stores all data in `sessionStorage` — survives page refreshes
- **Session Resume**: Welcome page detects existing session and offers "Continue where you left off" link
- **New Assessment**: Starting a new address explicitly resets state before navigating to intake
- **Report Download**: Summary page generates a styled HTML report with actual calculated data

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

- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps API key (configured, powers Places autocomplete + satellite imagery)

## Google Maps Integration

- **Places Autocomplete**: Custom `use-places-autocomplete.ts` hook with dual-API support (new `AutocompleteSuggestion` + legacy `AutocompleteService` fallback)
- **Satellite Imagery**: Static Maps API renders real satellite view on Welcome + Assessment pages after address selection
- **Coords**: Stored in `sessionStorage` key `modovate_coords` as `{lat, lng}` JSON
- **Script Loading**: `index.html` loads Google Maps JS with Places library + cache-busting param
- **Required APIs** (Google Cloud Console): Maps JavaScript API, Places API (New), Maps Static API, Geocoding API

## Functional Status

### Working (8/8 requirements)
- All 8 screens navigable in full sequence with back/forward navigation
- Google Places autocomplete on address entry (Screen 1)
- Real satellite imagery per address on Screen 1 and Screen 3
- Intake answers feed recommendation engine: different heating types produce different recommendations and financials
- Screen 5: 3+ equipment options per category with realistic specs, pricing, rebate badges
- Screen 6: 3+ real rebate programs with dynamic running total derived from selected upgrades
- Screen 7: 3 GTA contractor profiles with working Request Quote modal
- Screen 8: Total cost, net cost, annual savings, payback period all dynamically calculated from homeowner inputs
- Mobile responsive across all screens (390px tested)
- Session persistence with "Continue where you left off"
- HTML report download from summary page

## What's NOT Built (by design)

- No backend server / API
- No database / ORM
- No authentication
- No PDF download (HTML report available; PDF generation not implemented)
- No Docker/containerization
