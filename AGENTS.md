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

## Color Palette (Final)
- Primary: #3B82F6 (blue) — buttons, links, active states, AI, charts primary
- Sidebar: bg #0B2340, hover #132D4F, active #1A3760, active border #3B82F6
- Content bg: #F5F6FA, Card border: #E8ECF1
- Text: heading #1A2332, body #5A6578, muted #8C95A6
- Healthy: #2ADE6B — badge bg #DCFCE7 text #166534, health ring 80+
- Warning: #F59E0B — badge bg #FEF3C7 text #92400E, health ring 50-79
- Critical: #F53642 — badge bg #FEE2E2 text #991B1B, health ring <50, danger
- Info: #3B82F6 — badge bg #DBEAFE text #1E40AF

## Code Rules
- Server Components by default. Add "use client" only when needed.
- Use @supabase/ssr for Supabase clients. Never use @supabase/auth-helpers-nextjs.
- RLS on every table. Never expose SUPABASE_SERVICE_ROLE_KEY in frontend.
- Zod for validation. No any types. Handle loading and error states everywhere.
- Recharts for charts. Lucide React for icons. date-fns for dates.
- Tailwind only for styling. No CSS modules. No styled-components.
- Keep components small and composable.
