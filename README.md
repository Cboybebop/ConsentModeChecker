# Consent Mode Checker

A web application that helps non-technical users understand and audit their Google Consent Mode v2 implementation by decoding `gcs` and `gcd` parameter values and presenting clear, jargon-free explanations.

## Features

- **Quick Check** — Paste a single GCS or GCD value and instantly see your consent signal status
- **Guided Audit** — 4-step wizard comparing before/after consent states with a scored report card
- **Saved Audits** — Track compliance changes over time with diff views between audits
- **Demo Mode** — Preview results without real codes at `/demo`
- **Local Mode** — Works fully without Supabase, saving audits in localStorage

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router v6
- Tailwind CSS v3
- TanStack Query v5
- Supabase (Auth + Postgres + RLS)
- Vitest + React Testing Library

## Local Development

```bash
git clone <repo>
cd consent-mode-checker
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials (or leave empty for local mode)
npm run dev
```

The app runs at `http://localhost:5173`.

## Running Tests

```bash
npm test
```

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start development server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Lint source files |
| `npm run format` | Format source with Prettier |

## Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. In **Authentication → Settings**: enable Email confirmations and set Site URL to `http://localhost:5173` (add your Netlify URL after deployment).
3. In **SQL Editor**: run the SQL below (sections for tables, RLS, and trigger).
4. Copy your project URL and anon key from **Project Settings → API**.

### Complete SQL Setup

```sql
-- 1. Tables
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

create table if not exists public.audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  site_url text not null,
  site_name text,
  quality_index integer not null default 0,
  summary text,
  raw_input jsonb not null default '{}',
  decoded jsonb not null default '{}',
  created_at timestamptz default now()
);

create index audits_user_id_idx on public.audits(user_id);
create index audits_site_url_idx on public.audits(user_id, site_url);

-- 2. Row Level Security
alter table public.audits enable row level security;
alter table public.profiles enable row level security;

create policy "Users manage own audits"
  on public.audits
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users manage own profile"
  on public.profiles
  for all
  using (id = auth.uid())
  with check (id = auth.uid());

-- 3. Auto-create profile trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

### Supabase Dashboard Settings

- **Authentication → Redirect URLs**: Add your Netlify domain (e.g. `https://your-site.netlify.app`)
- **Authentication → Email Templates**: Customise if you want branded emails
- **SMTP**: Configure custom SMTP under Authentication → SMTP if you need branded sending

## Netlify Deployment

1. Push repo to GitHub.
2. In Netlify: **New site → Import from Git → select repo**.
3. Build command: `npm run build` — Publish directory: `dist`.
4. **Site configuration → Environment variables** → Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

   These are **public client-side values** in a Vite app, so do **not** use your Supabase service-role key.
   If Netlify secrets scanning flags these public values, prefer adding an allowlist in the Netlify UI for the
   specific detected values (smart-detection omit values) rather than disabling scans for whole env var names in repo config.
5. Trigger redeploy.

## Common Issues

- **Supabase 401 errors**: Check that `VITE_SUPABASE_ANON_KEY` is set correctly in Netlify env vars and redeploy.
- **SPA 404 on refresh**: Ensure `netlify.toml` redirect rule is present.
- **Magic link redirects fail**: Add your Netlify domain to Supabase → Authentication → Redirect URLs.
- **App shows "Local demo"**: One or both Vite env vars are missing — check Netlify environment variables.

## Environment Variables

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase public anon key (never the service-role key) |

Both are set in `.env.local` for local development and in Netlify environment variables for production.
