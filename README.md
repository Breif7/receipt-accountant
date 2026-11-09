# Receipt Accountant

Your own personal AI accountant: snap a photo of a receipt, Claude reads it and sorts the spending into a category, and the dashboard shows where your money went this month. At month end it writes a short report with three savings tips.

![Concept](docs/concept.jpeg)

**Status:** MVP implemented, not yet run (no Node.js on the machine that built it — see Known issues). See [PLAN.md](PLAN.md) for the full feature list, data model and milestones.

## Stack
Next.js 15 (App Router, TypeScript) · Tailwind · Supabase (Auth, Postgres, Storage) · Claude API (`claude-sonnet-5-5`) · Recharts · Vercel + Vercel Cron.

## Setup

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Create a Supabase project** (supabase.com) → Settings → API for the URL and keys.
3. **Create the `receipts` storage bucket** — SQL editor:
   ```sql
   insert into storage.buckets (id, name, public) values ('receipts', 'receipts', false);
   ```
4. **Run the schema** — paste [`supabase/schema.sql`](supabase/schema.sql) into the Supabase SQL editor and run it (creates tables, RLS policies, storage policies).
5. **Enable email magic-link auth** — Supabase → Authentication → Providers → Email (on by default). Add `http://localhost:3000/auth/callback` to Authentication → URL Configuration → Redirect URLs (and your production URL once deployed).
6. **Environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in `ANTHROPIC_API_KEY` (console.anthropic.com), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (used only by the monthly cron job), and a random `CRON_SECRET` string.
7. **Run it**
   ```bash
   npm run dev
   ```
   Open http://localhost:3000, sign in with a magic link, and upload a receipt photo.

## Deploy
Push to GitHub (already done) → import into Vercel → set the same environment variables there → Vercel picks up `vercel.json`'s monthly cron automatically.

## Known issues / not verified
- Built without a working Node.js install, so `npm install`/`npm run dev`/`npm run build` have **not been run** — there may be small type or import errors to fix on first build.
- No automated tests yet.
- Claude's receipt extraction can fail on blurry/handwritten receipts; the review screen lets you fill in blanks manually, but accuracy on real receipts is unverified.
