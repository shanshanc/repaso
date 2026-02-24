# Repaso

A personal web app to collect, organize, and review Spanish example sentences. Extract sentences from phone screenshots using AI, or add them manually. Tag by tense, grammar, verb, or phrase, then search and filter to focus your practice.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 16 (App Router) |
| UI | shadcn/ui, Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| AI Parsing | Google Gemini Vision API |
| Deployment | Vercel |
| Auth | Middleware-based password protection |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm

### Install

```bash
npm install
```

### Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key |
| `GEMINI_API_KEY` | Google AI API key (for image parsing) |
| `UPSTASH_REDIS_REST_URL` | Upstash Redis URL (for rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash Redis token |
| `REPASO_API_KEY` | API key for the external search endpoint |

For deployment on Vercel, also set:

- `APP_PASSWORD` — Password for login protection
- `AUTH_SECRET` — Secret for auth cookies

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
npm start
```

## Project Structure

```
repaso/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                    # Redirects to /sentences
│   ├── login/page.tsx              # Password login
│   ├── sentences/page.tsx          # Main list + search + filter
│   ├── tags/page.tsx               # Tag management (view, merge, rename)
│   └── api/
│       ├── sentences/              # GET, POST, PATCH, DELETE
│       ├── sentences/search/       # External search API (Bearer auth)
│       ├── tags/                   # Tags CRUD + merge
│       ├── parse-image/            # AI image parsing (Gemini)
│       └── auth/                   # Login + rate limiting
├── components/
│   ├── sentences/                  # SentenceCard, SentenceList, SentenceForm, Add/Edit dialogs
│   └── tags/                       # TagBadge, TagFilter, TagCombobox
└── lib/
    ├── supabase/                   # Client, server, queries
    ├── types.ts
    └── sanitize.ts                 # XSS sanitization
```

## Features

- **Sentence list** — Search by sentence or translation; filter by tags (AND logic)
- **Add sentences** — Manual entry or upload a screenshot; AI extracts sentence, translation, and suggests tags
- **Tag management** — View, merge, and rename tags; tag combobox for quick reuse
- **Edit / Delete** — Full CRUD for sentences
- **Protected deployment** — Password login, rate-limited auth API, cookie-based session
- **OpenClaw Skill** — Query sentences and run interactive practice via Telegram bot

## Database Schema

- **sentences** — `id`, `sentence`, `translation`, `source`, `created_at`
- **tags** — `id`, `name`, `category` (tense | grammar | verb | phrase), `created_at`
- **sentence_tags** — Junction table (sentence_id, tag_id)

See `plan.md` for schema details.

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com).
2. Link and push the schema:

   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```

3. Run seeds (optional):

   ```bash
   npx supabase db seed
   ```

4. Copy the project URL and anon key from **Settings → API** into `.env.local`.

Alternatively, run a local Supabase instance (requires Docker):

```bash
npx supabase start
```

Migrations and seeds are in `supabase/migrations/` and `supabase/seed/`.

## Deployment (Vercel)

1. Push the repo to GitHub and import it in [Vercel](https://vercel.com).
2. Add environment variables in **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`
   - `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`
   - `APP_PASSWORD` — password for `/login`
   - `AUTH_SECRET` — random string for auth cookies (e.g. `openssl rand -base64 32`)
3. Deploy. The app will redirect to `/login`; `/api/*` and `/login` remain unprotected for auth to work.

## OpenClaw Skill (Telegram Bot)

The `openclaw-skill/` directory contains an [OpenClaw](https://docs.openclaw.ai/) skill that exposes the sentence database via Telegram. It supports:

- **Query** — Ask for sentences by tag or keyword (e.g. "Check subjuntivo sentences")
- **Practice** — Interactive fill-in-the-blank and translation exercises grounded in your real sentences

### Setup

1. Copy the skill to your OpenClaw instance:
   ```bash
   cp openclaw-skill/SKILL.md ~/.openclaw/skills/repaso/SKILL.md
   ```

2. Add to `skills.entries` in `~/.openclaw/openclaw.json`:
   ```json5
   "repaso": {
     "enabled": true,
     "env": {
       "REPASO_API_KEY": "${REPASO_API_KEY}",
       "REPASO_API_URL": "${REPASO_API_URL}"
     }
   }
   ```

3. Set `REPASO_API_KEY` and `REPASO_API_URL` in your shell environment, then refresh skills or restart the gateway.

## License

MIT — see [LICENSE](LICENSE) for details.
