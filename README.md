# Wusool · وصول

**Arrival, in the right order.** Wusool plans a move to Abu Dhabi as a chain of dependent steps (company setup, visas, housing, schools, travel) and shows which date actually sets your arrival.

A short questionnaire (5–9 questions, depending on the answers) produces a plan in two layers:

- **Layer A — establish the company** (new founders only): jurisdiction, trade name, initial approval, premises, ADAFSA approval for food businesses, licence, establishment card, corporate bank account.
- **Layer B — relocate the people**: entry permit, medical, Emirates ID, health cover, residence visa, home lease, family sponsorship, school place, arrival, settling in.

The engine schedules the graph, finds the critical path and compares the arrival estimate with your target date. The key insight it surfaces: for a new company, *the licence date, not the start date, decides when a family can arrive*.

## Stack

- [Next.js 16](https://nextjs.org) (App Router, Turbopack), React 19, TypeScript
- Tailwind CSS v4, with design tokens in `app/globals.css`
- IBM Plex Sans, Sans Condensed, Mono and Sans Arabic via `next/font`
- Vitest for the planning engine

## Getting started

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script              | What it does                                   |
| ------------------- | ---------------------------------------------- |
| `npm run dev`       | Development server                             |
| `npm run build`     | Production build                               |
| `npm start`         | Serve the production build                     |
| `npm test`          | Run the engine tests once (`test:watch` to watch) |
| `npm run lint`      | ESLint                                         |
| `npm run typecheck` | Generate route types and run `tsc`             |

Requires Node.js 20.9 or later.

## How it works

```
app/
  page.tsx            onboarding (reads ?…&revise=<question> to resume)
  plan/page.tsx       the plan; tabs via ?tab=…, demos via ?demo=founder|employee
components/
  onboarding/         questionnaire (client): choices, payroll stepper, answer ledger
  plan/               plan overview, task cards, timeline (client), housing, directories
lib/
  questions.ts        questions, options and the branching sequence
  answers.ts          parse, validate and serialise answers to the query string
  plan.ts             the engine: tasks, dependencies, schedule, critical path
  plan-view.ts        words and figures for each screen (status, verdict, title block)
  catalogue.ts        provider directories and the HR package sheet
  housing.ts          sample listings
  dates.ts            date arithmetic, with "today" taken in Abu Dhabi time
```

- **The URL is the state.** Answers are kept in the query string, so a plan can be shared and reloaded and nothing is stored on a server. Untrusted params are validated in `parseAnswers`, and anything unrecognised is dropped.
- **The engine is pure.** `buildPlan(answers)` has no I/O, which keeps it easy to test. `lib/plan.test.ts` checks scheduling invariants and copy rules across every combination of answers (~9,000 plans).
- **Copy lives apart from scheduling.** `plan-view.ts` turns a plan into the text on screen, so the wording can change without touching the engine.
- **Dates are relative.** Target-date options, day counts and the "generated" stamp are worked out from today's date in Abu Dhabi, not hard-coded.

## Provider logos

Logos in the directory tabs live in `public/logos/` as 192×192 PNGs. They're mapped by provider name in `lib/provider-logos.json`, which also records the URL each file came from. To refresh them, or to add a logo for a new provider, run:

```bash
node scripts/fetch-logos.mjs              # every provider
node scripts/fetch-logos.mjs adgm kezad   # only these slugs
```

The script takes each logo from the provider's own website, trying the SVG icon, then web-app manifest icons, then the apple-touch-icon. Where that picks the wrong image, a URL is pinned in `SOURCES` instead. Logos that are white on a transparent background are flagged `onDark` and shown on a dark tile. A provider without a logo shows its initials. A test fails if any provider in `lib/catalogue.ts` has no logo file.

Logos are the trademarks of their owners and are shown only to identify each provider.

## Data status

All durations, fees and package values are **estimates pending verification**. They are marked `TODO(verify)` and always shown as ranges. Housing listings and HR package values are **sample data**. Providers in the directories are real organisations, listed for reference only: there are no partnerships, they are not ranked and no prices are shown. Primary sources are TAMM, ADDED, ADGM, ICP, MOHRE and ADAFSA.

## Changes from the original design prototype

- Founders whose company is already licensed no longer see wording written for employees ("your employer…").
- When a company is routed to the mainland, the explanation now gives the real reason (invoicing UAE customers, walk-in premises or food service) instead of always assuming invoicing.
- For founders, the home lease is scheduled after the residence visa, as the plan's own advice says.
- Keyboard focus is visible, and dimmed text meets contrast guidelines.
- "Today" is no longer fixed at 2 October 2026.
