# PredictIQ — AGENTS.md

## Project
PredictIQ is an AI-powered predictive maintenance platform for manufacturers. It monitors equipment health via sensor data, predicts failures, manages alerts, and tracks maintenance work orders.

## Stack (strict — do not change)
- Next.js 15 (App Router, TypeScript, src/ directory)
- Supabase (Auth, PostgreSQL, Row Level Security)
- Tailwind CSS (utility classes only — no CSS modules, no styled-components)
- Recharts (for sensor time-series charts)
- Lucide React (icons)
- Zod (form/input validation)
- Deployed on Vercel

## Commands
- Dev server: npm run dev
- Build: npm run build
- Lint: npm run lint

## Color Palette (Augury-inspired)
- Navy (structure): #0B2340 — sidebar, dark sections, headings
- Teal (data/trust): #0D8070 — charts, healthy status, links, data UI
- Orange (action): #E07A5F — CTA buttons, AI features, attention
- Sidebar: bg #0B2340, hover #132D4F, active #1A3760, active border #E07A5F
- Content bg: #F5F6FA, Card border: #E8ECF1
- Text: heading #1A2332, body #5A6578, muted #8C95A6
- Healthy: bg #E6F5F0, text #0A5E52
- Warning: bg #FFF0EB, text #8B3A1F
- Critical: bg #F0E4E8, text #6B1D3A, accent #8B2252
- Info: bg #DBEAFE, text #1E40AF
- Buttons: CTA #E07A5F, data/view #0D8070, danger #8B2252

## Code Rules
- Server Components by default. Add "use client" only when needed.
- Use @supabase/ssr for Supabase clients. Never use @supabase/auth-helpers-nextjs.
- RLS on every table. Never expose SUPABASE_SERVICE_ROLE_KEY in frontend.
- Zod for validation. No any types. Handle loading and error states everywhere.
- Recharts for charts. Lucide React for icons. date-fns for dates.
- Tailwind only for styling. No CSS modules. No styled-components.
- Keep components small and composable.
