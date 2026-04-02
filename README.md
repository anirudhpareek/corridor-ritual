# Corridor Ritual

Corridor Ritual is a mobile-first prototype for a travel corridor membership network that later expands into a crypto neobank.

The wedge is not generic fintech, cards, or FX optimization. The current product direction is:

- corridor membership before banking
- partner venue spend before broad money tools
- perks, status, and city ritual before dashboards
- embedded rails under the hood, with crypto complexity hidden from primary UX

The current prototype is built around the `Bangalore -> Dubai` corridor.

## Current Scope

This repo contains the first polished frontend slice of the product in Expo / React Native.

Implemented surfaces:

- `Home`
- `Wallet`
- `Pay`
- `Trips`
- `Profile`
- `Membership` (pushed route, not a tab)

Implemented interaction layers:

- guest -> member preview -> verified spend state model
- partner pay flow with confirm and status states
- first-class split flow with `/split/[id]`
- split summary overlays from home and wallet activity
- venue detail sheets
- perk detail sheets
- saved venue / perk action rails across home, trips, and membership
- tonight reminder flow that pins one saved move back onto home
- curated trip briefing
- membership destination with city benefits and partner venues
- receipt detail and receipt-linked support flow
- repository seam between app queries and mock implementations

Still mocked:

- auth
- KYC / verification providers
- funding rails
- merchant settlement
- backend APIs

## Product Notes

This app should feel like:

- a premium members club for repeat travelers
- a spend + perks + belonging network
- a calm travel utility with money embedded underneath

It should not feel like:

- a crypto wallet
- a generic neobank
- a DeFi app
- a booking marketplace

## Tech Stack

- Expo
- React Native
- Expo Router
- TypeScript
- TanStack Query
- Zustand
- React Hook Form
- Zod
- Jest + React Native Testing Library

## Repo Structure

```text
apps/
  mobile/         Expo app
packages/
  domain/         shared types and contracts
  mocks/          mock repositories and fixtures
```

Important mobile folders:

```text
apps/mobile/app/              routes
apps/mobile/src/components/   reusable product components
apps/mobile/src/features/     screen composition
apps/mobile/src/ui/           design system primitives
apps/mobile/src/lib/          formatting, queries, state helpers
apps/mobile/src/providers/    app-wide providers
```

## Getting Started

From the repo root:

```bash
pnpm install
pnpm mobile
```

Useful commands:

```bash
pnpm typecheck
pnpm test
pnpm --filter mobile start
pnpm --filter mobile typecheck
pnpm --filter mobile test
```

## Routes in the Current Prototype

- `/`
- `/wallet`
- `/trips`
- `/profile`
- `/membership`
- `/pay`
- `/pay/confirm`
- `/pay/status`
- `/split/[id]`

## Design Direction

The visual system is intentionally restrained:

- warm editorial surfaces
- deep ink text
- brass / forest accent system
- sheet-first interactions
- calm money states
- subtle status treatment

The app avoids:

- loud gradients
- crypto-native visual language
- dense activity dashboards
- tacky reward gamification

## Testing Notes

The mobile app test suite is currently green.

Last validated commands:

```bash
corepack pnpm --filter mobile typecheck
corepack pnpm --filter mobile test
corepack pnpm --filter mobile exec expo export --platform web
```

Known caveat:

- Jest still sometimes logs a worker shutdown warning after a successful parallel run. `--runInBand --detectOpenHandles` completes cleanly enough to confirm the suite passes, but there is still an unresolved teardown issue in the test environment.

## What’s Next

Likely next product/frontend steps:

- make the tonight reminder more time-aware based on actual arrival/trip context
- make split and support states optionally actionable from lightweight summary sheets
- live provider integration behind the current contracts and repositories
- admin / ops tooling in a separate app
- replacing mocks with real data sources while preserving the current UX tone
