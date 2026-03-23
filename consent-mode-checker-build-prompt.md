# Build Prompt: Consent Mode Checker
### Netlify + Supabase + React + TypeScript — March 2026

---

## Role

You are an expert full-stack engineer specialising in React, TypeScript, and privacy-compliance tooling.
Build a production-ready web application called **Consent Mode Checker**.

The app helps non-technical users understand and audit their Google Consent Mode v2 implementation
by decoding `gcs` and `gcd` parameter values from network requests and presenting clear,
jargon-free explanations alongside actionable next steps.

Target audience: **non-technical marketers and site owners**, not developers.

---

## 1. Objectives

1. Let users **quickly check** a single GCS or GCD value and see whether Consent Mode is active
   and how each consent signal (`analytics_storage`, `ad_storage`, `ad_user_data`,
   `ad_personalization`, `personalization_storage`, `functionality_storage`, `security_storage`)
   is currently set.

2. Guide users through a **4-step audit wizard** covering "before banner", "after accept",
   and "after reject" states, producing a scored report card and quality index.

3. Allow authenticated users to **save audits** and track compliance changes over time,
   with all Supabase configuration injected as **Netlify environment variables only** —
   no settings forms in the UI.

---

## 2. Tech Stack

| Layer | Choice |
|---|---|
| Framework | React 18 + TypeScript |
| Build tool | Vite (latest stable) |
| Routing | React Router v6 |
| Styling | Tailwind CSS v3 + custom component library |
| Async state | TanStack Query v5 |
| Auth & DB | Supabase (Postgres, Auth, RLS) |
| Hosting | Netlify (static SPA, env vars) |
| Testing | Vitest + React Testing Library |
| Linting | ESLint + Prettier |

No other third-party UI libraries unless they are zero-config (e.g. Headless UI for
accessible dropdown/modal primitives is acceptable).

---

## 3. Environment Variables & Security

### 3.1 Rules

- **Never** hard-code Supabase URLs or keys anywhere in the codebase.
- **Never** render any UI form that accepts Supabase credentials from the user.
- All configuration is injected at build time by Netlify environment variables.
- The service-role key must **never** appear in the frontend bundle; the anon key +
  Row Level Security is sufficient.

### 3.2 Required variables

```
VITE_SUPABASE_URL        # e.g. https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY   # public anon key only
```

Both are set in:
- **Local development**: `.env.local` (git-ignored, never committed).
- **Production**: Netlify → Site configuration → Environment variables, marked as sensitive.

### 3.3 Supabase client

```ts
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseEnabled = Boolean(url && key);

export const supabase = supabaseEnabled
  ? createClient<Database>(url, key)
  : null;
```

### 3.4 Fallback mode

If either variable is absent at build time:
- App runs in **Local mode**.
- Audits are stored in `localStorage` under key `cmc_audits`.
- A subtle, non-blocking banner reads: "Local demo — audits are saved in this browser only."
- Auth pages are hidden from navigation.
- All other features remain fully functional.

---

## 4. Project Structure

```
consent-mode-checker/
├── .env.example
├── .eslintrc.cjs
├── .prettierrc
├── netlify.toml
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── postcss.config.cjs
├── vitest.config.ts
├── README.md
└── src/
    ├── main.tsx
    ├── App.tsx                          # Routes + AuthProvider + QueryClientProvider
    ├── components/
    │   └── ui/
    │       ├── Button.tsx
    │       ├── Card.tsx
    │       ├── Badge.tsx
    │       ├── Alert.tsx
    │       ├── Modal.tsx
    │       ├── Tabs.tsx
    │       ├── Table.tsx
    │       ├── Tooltip.tsx
    │       ├── ProgressBar.tsx
    │       └── Spinner.tsx
    ├── features/
    │   ├── quick-check/
    │   │   ├── QuickCheckPage.tsx
    │   │   ├── ConsentGrid.tsx          # Traffic-light card grid
    │   │   ├── SummaryBanner.tsx
    │   │   ├── NextStepsPanel.tsx
    │   │   └── HowToFindCode.tsx        # DevTools instructions modal
    │   ├── audit-wizard/
    │   │   ├── AuditWizardPage.tsx
    │   │   ├── steps/
    │   │   │   ├── Step1SiteDetails.tsx
    │   │   │   ├── Step2AfterAccept.tsx
    │   │   │   ├── Step3AfterReject.tsx
    │   │   │   └── Step4Summary.tsx
    │   │   ├── ScorecardTable.tsx
    │   │   ├── QualityGauge.tsx
    │   │   ├── ComparisonGrid.tsx
    │   │   └── PrintSummary.tsx         # Print-to-PDF layout
    │   ├── audits/
    │   │   ├── SavedAuditsPage.tsx
    │   │   ├── AuditDetail.tsx
    │   │   ├── AuditListItem.tsx
    │   │   ├── AuditFilters.tsx
    │   │   └── AuditDiffView.tsx        # Change log vs previous audit
    │   └── auth/
    │       ├── AuthPage.tsx             # Combined login/signup tabs
    │       ├── AuthProvider.tsx
    │       ├── useAuth.ts
    │       └── PasswordReset.tsx
    ├── lib/
    │   ├── supabaseClient.ts
    │   ├── consentDecoders.ts           # Pure TS, no DOM, fully tested
    │   ├── scoring.ts                   # Pure TS, deterministic, fully tested
    │   └── database.types.ts            # Generated Supabase types
    ├── constants/
    │   └── text.ts                      # ALL user-visible copy in one file
    ├── hooks/
    │   ├── useLocalAudits.ts
    │   └── useSupabaseAudits.ts
    └── pages/
        ├── HomePage.tsx
        └── HelpPage.tsx
```

---

## 5. Pages & Features

### 5.1 Navigation

Responsive top nav:
- Logo + app name on left.
- Links: Home, Quick Check, Guided Audit, Saved Audits, Help.
- Right: "Log in / Sign up" when logged out; avatar dropdown with "My audits" + "Sign out" when logged in.
- On mobile: hamburger menu collapsing all links.
- "Saved Audits" link is hidden from nav when `supabaseEnabled` is false or user is not logged in.

### 5.2 Home Page

- Hero headline (from `constants/text.ts`): "See if your Google Consent Mode is working — no code required."
- Sub-copy explaining paste-and-analyse.
- Two primary CTAs: "Start Quick Check" and "Run Guided Audit".
- 3-step explainer (numbered cards):
  1. Open your site in Chrome and copy the code from the Network tab.
  2. Paste it here.
  3. Read your plain-language report and know what to fix.
- No images required; use icon + text cards.

### 5.3 Quick Check Page

#### Input area

Three tabs:
1. **GCS code** — textarea, placeholder `G100`
2. **GCD parameter** — textarea, placeholder `11x1x1x1x5`
3. **How to find this** — opens `HowToFindCode` modal with step-by-step DevTools instructions

"Analyse" primary button triggers decode.

#### Behaviour

On submit:
1. Detect input type (GCS vs GCD) by pattern matching.
2. Decode using `consentDecoders.ts`.
3. If unrecognised format: show inline friendly error "That doesn't look like a valid code — see the 'How to find this' tab for guidance."
4. Render results below without page reload.

#### Results UI

- **`SummaryBanner`**: Large status pill — one of:
  - 🟢 "Consent Mode: Active" — all signals detected
  - 🟡 "Consent Mode: Incomplete" — some signals present
  - 🔴 "Consent Mode: Not detected"
  - Short sentence in plain language below the pill.

- **`ConsentGrid`**: Card grid (2-col desktop, 1-col mobile) — one card per signal:
  - Signal display name (e.g. "Analytics Storage")
  - Coloured badge: green "Allowed", red "Denied", amber "Mixed", grey "Unknown"
  - One-line plain status: "On after consent", "Always off", "On even when users say no", etc.
  - Two-sentence implication in body text.
  - A small info icon with tooltip defining the technical term.

- **`NextStepsPanel`**: Bullet list of plain-language recommendations generated from
  decoded state. Example: "Ad personalisation is still active when users reject — ask
  your cookie banner provider to check this."

- If logged in: "Save as audit" button → modal to set site name + URL → save to Supabase/localStorage.

### 5.4 Guided Audit Wizard

4 steps, persistent state via React context, progress bar showing current step.
"Back" button always visible from step 2 onwards. "Next" disabled until required inputs complete.

**Step 1 — Site Details**
- Site URL input (required, validated).
- Site name input (optional).
- Toggle: "Does your site show a consent banner before Google tags load?"
  - Yes / No / Not sure — each option shows a one-sentence explanation of its implications.

**Step 2 — After Accept**
- Label: "Paste the code you saw after clicking 'Accept all cookies'".
- Textarea with same GCS/GCD detection.
- Live decoded `ConsentGrid` renders as the user types (debounced 300ms).

**Step 3 — After Reject**
- Label: "Paste the code you saw after clicking 'Reject' or 'Only necessary cookies'".
- Textarea with live decode.
- `ComparisonGrid`: side-by-side Accept vs Reject card view, highlighting differences.

**Step 4 — Summary & Scorecard**
- Plain-language diagnostic paragraphs (generated from scoring module).
- `ScorecardTable`:
  | Area | Status | Explanation |
  |---|---|---|
  | Privacy & Consent compliance | 🟢/🟡/🔴 | Short phrase |
  | Google Analytics tracking | … | … |
  | Google Ads tracking | … | … |
  | Ad personalisation | … | … |
  | E-commerce tracking | … | … |
  | Data validity | … | … |
- `QualityGauge`: large numeric quality index (0–100) with colour coding.
- Historical bar chart of Quality Index for this site if multiple saved audits exist.
- Two action buttons:
  - "Download PDF summary" — triggers `window.print()` against `PrintSummary.tsx` layout.
  - "Save audit" — if logged in, write to Supabase; if not, prompt sign-up.

### 5.5 Saved Audits Page (authenticated only)

- Redirect to `/login` if not authenticated.
- List of current user's audits:
  - Site name, URL, date, quality index, status pill.
  - Sortable by date or quality index.
  - Filter by site URL and date range.
- Clicking an audit opens `AuditDetail`:
  - Full decoded results.
  - `AuditDiffView`: change log compared to the previous audit for the same site URL,
    e.g. "analytics_storage changed from denied → allowed after consent."

### 5.6 Help Page

Static content page:
- "What is Google Consent Mode?" — plain-language explanation.
- "What are GCS and GCD codes?" — plain-language with visual example.
- "How do I find my codes in Chrome?" — step-by-step with screenshots (use placeholder cards).
- Short FAQ (5–7 questions).
- All text sourced from `constants/text.ts`.

---

## 6. Consent Decoding Module

**File**: `src/lib/consentDecoders.ts`

### Requirements

- Pure TypeScript functions — no DOM access, no network calls, no side effects.
- Fully covered by Vitest unit tests.
- Exported TypeScript types used by all UI components.

### Types

```ts
export type ConsentState = 'allowed' | 'denied' | 'unknown';
export type ConsentSource = 'default' | 'update';
export type ConsentMode = 'basic' | 'advanced' | 'unknown';
export type OverallStatus = 'active' | 'incomplete' | 'missing';

export interface SignalResult {
  name: string;               // e.g. 'analytics_storage'
  displayName: string;        // e.g. 'Analytics Storage'
  state: ConsentState;
  source: ConsentSource;
  mode: ConsentMode;
  statusLabel: string;        // Plain one-liner for UI
  implication: string;        // Two-sentence plain explanation
}

export interface DecodeResult {
  inputType: 'gcs' | 'gcd' | 'unknown';
  overallStatus: OverallStatus;
  overallSummary: string;     // One plain-language sentence
  signals: SignalResult[];
  rawInput: string;
}
```

### GCS decoding

GCS strings follow the format `G` followed by characters representing consent states.
Implement decoding based on the current public documentation and community-verified
behaviour for Consent Mode v2:
- Position 1: analytics_storage
- Position 2: ad_storage
- Position 3: ad_user_data
- Position 4: ad_personalization
- `1` = allowed, `0` = denied, `x` or absent = unknown

Comment the mapping table clearly for future maintainability.

### GCD decoding

GCD strings encode consent per storage type using positional characters.
Decode each position according to the latest verified community documentation for
Google Consent Mode v2 GCD parameter encoding.
Derive: state (granted/denied), source (default/update), mode (basic/advanced).

### Validation

- If input does not match expected GCS or GCD patterns, return a result with
  `overallStatus: 'missing'` and a user-friendly `overallSummary` explaining
  the input was unrecognised.

---

## 7. Scoring Module

**File**: `src/lib/scoring.ts`

### Input

```ts
export interface AuditInput {
  beforeBanner: boolean;        // Does banner fire before tags?
  afterAccept: DecodeResult;
  afterReject: DecodeResult;
}
```

### Output

```ts
export interface ScorecardRow {
  area: string;
  status: 'pass' | 'warn' | 'fail';
  statusLabel: string;          // Plain phrase for UI
  explanation: string;
}

export interface ScoreResult {
  qualityIndex: number;         // 0–100
  scorecard: ScorecardRow[];
  recommendations: string[];    // Plain-language bullets
}
```

### Scoring rules (deterministic)

Implement and document these rules clearly in code comments:

| Condition | Points impact |
|---|---|
| Banner fires before Google tags | +10 |
| analytics_storage denied by default | +10 |
| analytics_storage correctly allowed after accept | +10 |
| analytics_storage correctly denied after reject | +15 |
| ad_storage denied by default | +10 |
| ad_storage correctly denied after reject | +15 |
| ad_user_data denied after reject | +10 |
| ad_personalization denied after reject | +10 |
| All signals use `update` source (not just default) | +10 |
| ad_storage allowed after reject | -20 (compliance risk) |
| ad_personalization allowed after reject | -20 (compliance risk) |
| No signals detected at all | 0 total |

- Cap result between 0 and 100.
- Derive scorecard row statuses from the same rules.
- Generate plain-language `recommendations` for each failing rule.

Include Vitest tests covering: perfect score, all-fail score, partial score, edge cases.

---

## 8. Database & Auth (Supabase)

### 8.1 SQL — tables

```sql
-- Profiles (auto-created on sign-up via trigger)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  created_at timestamptz default now()
);

-- Audits
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
```

### 8.2 SQL — Row Level Security

```sql
-- Enable RLS
alter table public.audits enable row level security;
alter table public.profiles enable row level security;

-- Audits: users can only access their own rows
create policy "Users manage own audits"
  on public.audits
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- Profiles: users can only access their own profile
create policy "Users manage own profile"
  on public.profiles
  for all
  using (id = auth.uid())
  with check (id = auth.uid());
```

### 8.3 SQL — auto-create profile trigger

```sql
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

### 8.4 Auth flows

- Email + password sign-up with email confirmation enabled.
- Magic link login as an alternative on the login form.
- Password reset via email (Supabase handles the email, app handles the callback URL).
- `AuthProvider` wraps the app root, listens to `supabase.auth.onAuthStateChange`,
  exposes `{ user, session, loading, signIn, signUp, signOut, resetPassword }`.
- All Supabase calls wrapped in try/catch; errors surfaced as user-facing `Alert` components,
  never as raw error strings.

---

## 9. Configuration Files

### netlify.toml

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### .env.example

```
# Copy to .env.local and fill in your values.
# Never commit .env.local to version control.

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### .gitignore additions

```
.env.local
.env.*.local
```

---

## 10. Tooling Scripts (`package.json`)

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src --ext .ts,.tsx --report-unused-disable-directives",
    "format": "prettier --write src"
  }
}
```

---

## 11. UX & Accessibility Requirements

- **Tone**: calm, trustworthy, plain language. No jargon without a tooltip.
- **Colours**: neutral/white background, blue-600 primary, green-500/amber-400/red-500 status colours.
- **Typography**: inter or system-ui, readable body text (16px+), strong heading hierarchy.
- **Tooltips**: every technical term (GCS, GCD, storage type name) has an `?` info icon with a
  `Tooltip` component providing a plain-language definition. No tooltip on hover alone — also
  accessible on keyboard focus.
- **Accessibility**:
  - All interactive elements reachable and operable by keyboard.
  - ARIA labels on icon-only buttons.
  - Colour-coded states always paired with text labels (never colour alone).
  - Min contrast ratio 4.5:1 for normal text, 3:1 for large text.
- **Mobile**:
  - Cards stack to full-width single column below `md` breakpoint.
  - Wizard steps remain single-column and usable at 375px width.
  - No horizontal scrolling.
- **Loading states**: Spinners on async operations, skeleton cards where content loads.
- **Error states**: Friendly `Alert` component, never raw stack traces.

---

## 12. Demo / Example Data

Create `src/features/demo/DemoData.ts` containing realistic fake decoded results:
- A "good" result (high quality index, all signals correct).
- A "mixed" result (some signals wrong after reject).
- A "bad" result (consent mode missing or all denied by default).

Used by `DemoPage.tsx` which is accessible at `/demo` — renders the Quick Check result UI
and Step 4 scorecard using the demo data so non-developers can see the tool without needing
real codes.

---

## 13. README

Generate a complete README.md containing:

### Local Development
```bash
git clone <repo>
cd consent-mode-checker
npm install
cp .env.example .env.local
# Edit .env.local with your Supabase credentials
npm run dev
```

### Running Tests
```bash
npm test
```

### Supabase Setup
1. Create a new project at supabase.com.
2. In Authentication → Settings: enable Email confirmations and set Site URL to
   `http://localhost:5173` (add Netlify URL after deployment).
3. In SQL Editor: run the SQL from sections 8.1, 8.2, and 8.3 of this spec.
4. Copy your project URL and anon key from Project Settings → API.

### Netlify Deployment
1. Push repo to GitHub.
2. In Netlify: New site → Import from Git → select repo.
3. Build command: `npm run build`; Publish directory: `dist`.
4. Site configuration → Environment variables → Add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   (Mark both as sensitive / secret in Netlify's UI.)
5. Trigger redeploy.

### Common Issues
- **Supabase 401 errors**: Check that `VITE_SUPABASE_ANON_KEY` is set correctly in Netlify env vars and redeploy.
- **SPA 404 on refresh**: Ensure `netlify.toml` redirect rule is present.
- **Magic link redirects fail**: Add your Netlify domain to Supabase → Authentication → Redirect URLs.
- **App shows "Local demo"**: One or both Vite env vars are missing — check Netlify environment variables.

---

## 14. Output Requirements

Generate every file listed in section 4 with full, working TypeScript/TSX content.

After generating all files:

1. Confirm the project will build cleanly with `npm run build`.
2. List all `npm` commands required to install, test, build, and deploy.
3. Restate the complete SQL (sections 8.1–8.3) as a single copyable block.
4. Note any Supabase dashboard settings that must be configured manually
   (auth redirect URLs, email confirmations, SMTP if custom email is needed).

When writing code:
- Add inline comments only where logic is non-obvious.
- Keep functions small and single-purpose.
- Prefer explicit types over inference for exported interfaces.
- No `any` types.
- Handle all async errors with try/catch and surface them via the `Alert` component.
