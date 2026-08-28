# OneMint

> India's knowledge platform for personal finance, technology, and health.

**Live:** [www.onemint.in](https://www.onemint.in)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Vanilla CSS (CSS variables, no Tailwind) |
| Database | Supabase (PostgreSQL) |
| Auth | Custom HMAC session cookie (no NextAuth) |
| Email | Brevo (newsletter delivery) |
| Image storage | Cloudflare R2 |
| Image CDN | Cloudinary (loader) |
| Analytics | Google Analytics 4 |
| Search | Typesense |
| Push notifications | Web Push (VAPID) |
| Hosting | Hostinger (Node.js Web App, standalone output) |
| CI/CD | GitHub → Hostinger auto-deploy |
| Fonts | Self-hosted (Playfair Display, Lora, Source Serif 4, DM Sans) |

---

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required environment variables

Copy `.env.local.example` to `.env.local` and fill in all values. The app will not start without these:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY

ADMIN_PASSWORD_HASH        # bcrypt hash of the admin password
ADMIN_SESSION_SECRET       # random 32+ char string for HMAC signing

CRON_SECRET                # shared secret for cron job requests
SYNC_SECRET                # shared secret for sync API requests

BREVO_API_KEY
BREVO_SENDER_NAME
BREVO_SENDER_EMAIL

NEXT_PUBLIC_VAPID_PUBLIC_KEY
VAPID_PRIVATE_KEY
VAPID_SUBJECT              # mailto:contact@onemint.in

GA4_CLIENT_ID
GA4_CLIENT_SECRET
GA4_REFRESH_TOKEN
GA4_PROPERTY_ID

NVIDIA_API_KEY             # for AI newsletter intro generation

NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY
R2_ENDPOINT
R2_BUCKET_NAME
NEXT_PUBLIC_R2_PUBLIC_URL

TYPESENSE_ADMIN_API_KEY
NEXT_PUBLIC_TYPESENSE_SEARCH_KEY
NEXT_PUBLIC_TYPESENSE_HOST

NEXT_PUBLIC_SITE_URL=https://www.onemint.in
```

> **Hostinger hPanel note:** hPanel's env var editor inserts a literal `\` before every `$` in secret values. All secrets are read via `getCleanEnv()` in `src/lib/env.ts` which strips this automatically.

---

## Project Structure

```
src/
├── app/                   # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── admin/         # Admin API (auth, articles, analytics, upload)
│   │   ├── cron/          # Cron-triggered newsletter sender
│   │   ├── push/          # Web push notification endpoints
│   │   ├── subscribe/     # Newsletter subscription
│   │   └── sync/          # Article sync from admin
│   ├── articles/[slug]/   # Article detail page
│   ├── tools/             # Financial & health calculators (22 tools)
│   ├── topics/[slug]/     # Category pages
│   ├── tag/[slug]/        # Tag pages
│   ├── admin/             # Admin dashboard (protected)
│   └── ...                # Legal, newsletter, search, saved, etc.
├── components/            # Shared React components
├── data/                  # Static fallback data (articles, categories, authors)
├── lib/                   # Utilities: env, supabase, ga4, newsletter engine, etc.
└── middleware.ts           # Edge: canonical redirect + legacy URL handling + admin auth
```

---

## Build & Deploy

### Production build (Hostinger)

Hostinger auto-deploys on push to `main` via GitHub integration.

Build pipeline (runs on Hostinger):
```bash
npm run prebuild   # generates public/redirect-map.json from article slugs
npm run build      # next build → produces .next/standalone/
npm run postbuild  # copies public/ and .next/static/ into .next/standalone/
```

Start command (run by Hostinger's process manager):
```bash
node .next/standalone/server.js
```

> The app uses `output: 'standalone'` — required for non-Vercel hosting. Do not change the start command to `next start`.

### Manual redeploy

Push to `main` → Hostinger picks it up automatically (1–3 min build time).
To force a redeploy without a code change: use **Redeploy** in hPanel.

---

## Newsletter

Three series, sent via cron-job.org → `/api/cron/newsletter?series=<series>`:

| Series | Day | Slug | Description |
|---|---|---|---|
| Monday Money Brief | Monday | `monday` | Markets, investments, tax updates |
| Mint Deep Dive | Wednesday | `wednesday` | One category covered in depth (rotating) |
| Sunday Read | Sunday | `sunday` | Top articles across all categories |

Cron requests must include header `Authorization: Bearer <CRON_SECRET>`.

Newsletter generation: Supabase subscriber list → GA4 top articles → NVIDIA Llama 4 intro → Brevo delivery → log to `newsletter_log`.

---

## Admin Panel

Route: `/admin` (protected by HMAC session cookie).

Features:
- Article create / edit / publish / delete
- Image upload to Cloudflare R2
- Newsletter preview & manual send
- Push notification broadcast
- Analytics dashboard (GA4)
- Subscriber management

---

## Calculators (Tools)

22 financial and health tools at `/tools/*`. Investment calculators (SIP, Lumpsum, Step-up SIP) include:
- 3 return scenarios: Conservative (8%) / Moderate (12%) / Aggressive (15%)
- Inflation-adjusted real value (6% baseline)
- SEBI disclaimer + fee/tax caveats

---

## Slug Redirects

Legacy WordPress URLs (date-based and category-based) are 301-redirected in `src/middleware.ts`.

For article re-slugging: add an entry to the `SLUG_REDIRECTS` map at the top of `middleware.ts`:
```ts
const SLUG_REDIRECTS: Record<string, string> = {
  'old-article-slug': '/articles/new-article-slug',
};
```
**Every slug change needs a redirect entry** — do not change a slug without adding one.

---

## Key Decisions

- **No Vercel** — migrated off Vercel Hobby after hitting ISR/function/bandwidth limits. Now on Hostinger.
- **No Tailwind** — vanilla CSS with CSS custom properties for theming and dark mode.
- **No NextAuth** — custom HMAC cookie auth for the admin panel. Simpler, no dependencies.
- **Standalone output** — `output: 'standalone'` required for Hostinger's process manager to run the app cleanly.
- **Self-hosted fonts** — fonts downloaded as woff2 and served from `/public/fonts/` to avoid Google Fonts network dependency at build time.
