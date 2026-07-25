# Plakoro Dice Calculator

A responsive web app for the Pokémon Plakoro board game: browse Pokémon, build
your Energy Dice loadout, and calculate exact win/damage probabilities before
you roll.

## Tech Stack

React · TypeScript · Vite · Tailwind CSS · shadcn/ui-style components ·
React Router · static JSON "database" (no backend) · Firebase Hosting ready.

## Getting Started

```bash
npm install
npm run dev       # local dev server
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

## Folder Structure

```
src/
├── types/        Strict TypeScript interfaces — the single source of truth
│                 for data shapes (energy, dice, pokemon, attack, probability).
│                 Energy types are NOT a hardcoded union — see data/energyTypes.json.
│
├── data/         Static "database". Adding a new Pokémon = add one JSON file
│                 + one import line in data/index.ts. No other code changes.
│                 energyTypes.json is the admin-editable energy registry —
│                 add/remove/edit elements here, the whole app picks it up.
│
├── utils/        Pure, framework-free business logic:
│                 - probability.ts: the core dice-probability engine
│                 - dice.ts: random rolling helpers (used by the Simulator)
│                 - energy.ts / energyRegistry.ts / pokemonFilters.ts / cn.ts
│
├── hooks/        React bindings over the data/logic layers (usePokemonData,
│                 usePokemonFilters, useDiceLoadout, useDiceCalculator, useDiceRoll,
│                 useTheme).
│
├── components/
│   ├── ui/       Small reusable primitives (Button, Card, Badge, Input, Select).
│   ├── layout/   Navbar, ThemeToggle.
│   ├── pokemon/  Pokédex browsing components (cards, search, filters, attack list).
│   └── dice/     Dice configuration, probability display, roll animation.
│
└── pages/        Route-level screens: HomePage, PokemonDetailPage,
                  CalculatorPage, SimulatorPage.
```

## Game Model Notes

- **Energy Dice (3 per roll):** each die has 6 faces on 3 fixed axes —
  A↔B (fixed element faces), C↔C (dual-option chips), D↔D (single-option
  chips). Sockets are universal: any chip/energy fits any matching face
  type across every Pokémon.
- **Character Die (1 per roll):** the figure itself, landing on one of 6
  poses. Each attack (admin-authored JSON) maps pose groups to damage
  bonuses via `characterDieOutcomes`.
- **Paying a cost:** succeeds when rolled energy is **≥** required for
  every listed type; Colorless is fully wild and covers any shortfall.
- **Dice loadouts are per-Pokémon** ("tuned like a car"), saved in
  `localStorage` since there is no backend.

## Deploying to Vercel

```bash
npm i -g vercel   # once, if not already installed
vercel             # first deploy, follow the prompts (or `vercel --prod` directly)
```
`vercel.json` is already set up with the correct build command, output
directory (`dist`), and a catch-all rewrite to `index.html` so that direct
links like `/pokemon/004-pikachu/calculator` work correctly with React
Router's client-side routing.

You can also deploy without the CLI: push this project to a GitHub repo and
import it on [vercel.com/new](https://vercel.com/new) — Vercel auto-detects
the Vite framework preset, and `vercel.json` covers the SPA rewrite either way.

## Deploying to Firebase Hosting (alternative)

```bash
npm run build
firebase deploy --only hosting
```
(Update the project id in `.firebaserc` first.)

## Roadmap (architecture already supports these without refactoring)

Team Builder · Battle Simulator · Reroll Calculator · Expansion database ·
Statistics · Offline PWA support.
