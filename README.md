# Themixify — website, licence portal and admin

The marketing site and customer portal for **Themixify**, the zero-plugin,
agentic-optimized WordPress theme.

Built with Next.js (App Router), Tailwind CSS v4 and Supabase.

---

## What is in here

| Area | Route | Notes |
|---|---|---|
| Marketing | `/`, `/features`, `/zero-plugin`, `/agentic`, `/pricing`, `/checklist`, `/docs`, `/faq`, `/affiliate`, `/changelog`, `/contact` | Static, prerendered |
| Legal | `/privacy`, `/terms` | |
| Auth | `/login` | Sign in, sign up, password reset |
| Customer | `/dashboard`, `/dashboard/licenses`, `/dashboard/downloads`, `/dashboard/orders` | Licence keys, site activations, builds |
| Admin | `/dashboard/admin`, `/dashboard/admin/license`, `/dashboard/admin/users` | Overview stats, licence management, user management |
| Machine | `/llms.txt`, `/robots.txt`, `/sitemap.xml` | The site practises what the product preaches |

---

## Getting started

```bash
npm install
cp .env.example .env.local   # then fill in your Supabase keys
npm run dev
```

Open <http://localhost:3000>.

The site renders fully without a database — every marketing page is static. The
dashboard shows a clear "database not connected" state until Supabase is wired
up, rather than failing silently.

### Environment

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR-PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR-ANON-KEY
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Only the anon key is ever used. The service-role key is deliberately not
imported anywhere in this application — authorisation is enforced by row-level
security in the database, not by which key the caller happens to hold.

---

## Database

Everything lives in **one runnable file**: `supabase/schema.sql`.

1. Open the Supabase SQL editor.
2. Paste the whole file and run it.

That creates the tables, views, functions, triggers, RLS policies, grants and
seed data in a single pass. The file is idempotent, so you can paste it again
after an edit rather than hunting for the delta.

To make yourself an administrator, sign up through the site first, then run the
last (commented) line of the file with your own email address.

### Schema at a glance

- `plans` — the four pricing tiers
- `profiles` — one row per auth user, created by trigger
- `orders` — purchase records
- `licenses` — issued keys, with a per-plan site limit
- `license_activations` — one row per site a key is installed on
- `releases` — version history and download links
- `contact_messages` — contact form submissions

Functions: `admin_overview()`, `admin_issue_license()`, `activate_license()`
(called by the WordPress theme), `is_admin()`, `generate_license_key()`.

---

## Data access

Every database call the application makes lives in **`lib/queries.ts`** — a
single file. Components never talk to Supabase directly; they import a named
function from there.

That keeps the entire data surface of the product auditable in one scroll, and
means a schema change has exactly one place to land. Each function returns a
discriminated result (`{ ok: true, data }` or `{ ok: false, error }`) rather
than throwing, because these are called from form handlers where a rejected
promise is a blank screen with no explanation.

---

## Content

All marketing copy, pricing, feature lists, the plugin-replacement table and the
capability comparison live in **`lib/site.ts`**.

A claim only ever appears once. Change a price or a module count there and every
page that quotes it follows.

---

## Design

The palette is a single hue sweep taken from the brand mark — violet, through
magenta, into amber. Tokens are defined once in `app/globals.css` under
`@theme`; components reference them, never raw hex.

The logo is inline SVG (`components/ui/Logo.tsx`) rather than an image, so it
costs no request and stays crisp at any size.

---

## Scripts

```bash
npm run dev        # development server
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
```

---

## Deployment

Any Node host. On Vercel, point it at this repository, set the three environment
variables, and deploy — no build configuration is required.

Set `NEXT_PUBLIC_SITE_URL` to the production domain so canonical URLs, the
sitemap and auth redirects resolve correctly.
