# Jotlinks

Jotlinks is an AI-powered resume builder designed for students and entry-level job seekers.

It helps users:

- Create resumes with simple forms (no blank page stress)
- Generate accomplishment-focused bullet points with AI
- Preview templates live while editing
- Autosave changes continuously
- Export resumes as PDF
- Share a public resume link

## Tech Stack

- **Frontend / Backend:** Next.js (App Router + API routes)
- **UI:** Tailwind CSS
- **Auth:** NextAuth (credentials + optional Google OAuth)
- **Database:** PostgreSQL with Prisma ORM
- **AI:** Vercel AI SDK with xAI (Grok) + OpenAI fallback (`/api/generate-bullets`)
- **PDF:** `pdf-lib`
- **Integrations:** Firebase (Web + Admin SDK) and Supabase client/server SDKs

## Features Implemented

- Email/password signup + login (bcrypt password hashing)
- Optional Google login (enabled only when Google env vars are present)
- JWT-based authenticated sessions
- Student dashboard with resume list:
  - Create
  - Edit
  - Duplicate
  - Delete
  - Publish/unpublish
- Form-based resume builder for:
  - Personal Information
  - Education
  - Work Experience
  - Projects
  - Skills
  - Activities / Clubs / Volunteering
- AI bullet generation per experience/project entry
- AI provider routing (`AI_PROVIDER=auto|xai|openai`)
- Live preview with multiple templates (Classic + Modern)
- PDF export endpoint
- Shareable public resume links
- Autosave every few seconds
- Dashboard integration status panel (`/api/integrations/status`)

## Security Notes

- Passwords are hashed with `bcrypt`
- Auth uses secure cookies in production (`useSecureCookies`)
- Input validation uses `zod`
- Input sanitization removes unsafe text patterns
- Login and AI endpoints are rate-limited
- Same-origin checks are used on mutating endpoints
- Prisma parameterized queries reduce SQL injection risk
- Supabase service-role usage is server-only (never exposed to client)

## Project Structure

```text
app/
  api/
    auth/
    generate-bullets/
    resumes/
  dashboard/
  login/
  signup/
  templates/
  r/[slug]/
components/
  auth/
  builder/
  dashboard/
  firebase/
  resume/
lib/
  app-url.ts
  auth-options.ts
  integrations.ts
  firebase/
  supabase/
  prisma.ts
  validation.ts
  sanitize.ts
  rate-limit.ts
  pdf.ts
prisma/
  schema.prisma
```

## Environment Variables

Copy `.env.example` to `.env` and fill in values:

```bash
cp .env.example .env
```

Required:

- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - long random secret
- `NEXTAUTH_URL` - app base URL (`http://localhost:3000` locally)
- `NEXT_PUBLIC_APP_URL` - canonical public URL used for sharing + domain checks

Optional:

- `AI_PROVIDER` - `auto` (default), `xai`, or `openai`
- `XAI_API_KEY` - enables xAI via Vercel AI SDK
- `XAI_MODEL` - defaults to `grok-2-1212`
- `OPENAI_API_KEY` - OpenAI fallback when xAI is not configured
- `OPENAI_MODEL` - defaults to `gpt-4.1-mini`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - enables Google login
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase browser client
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase server client (API/server only)
- Firebase Web SDK:
  - `NEXT_PUBLIC_FIREBASE_API_KEY`
  - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
  - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
  - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
  - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
  - `NEXT_PUBLIC_FIREBASE_APP_ID`
  - `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`
- Firebase Admin SDK:
  - `FIREBASE_PROJECT_ID`
  - `FIREBASE_CLIENT_EMAIL`
  - `FIREBASE_PRIVATE_KEY`

## Local Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create env file:

   ```bash
   cp .env.example .env
   ```

3. Generate Prisma client:

   ```bash
   npx prisma generate
   ```

4. Run database migrations:

   ```bash
   npx prisma migrate dev --name init
   ```

5. Start development server:

   ```bash
   npm run dev
   ```

6. Open:

   [http://localhost:3000](http://localhost:3000)

## Integration Setup Guide

### 1) Connect Supabase

1. Create a Supabase project.
2. Copy values from **Project Settings -> API**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server only)
3. For Prisma on Supabase Postgres, set `DATABASE_URL` to your Supabase Postgres connection string.
4. Run migrations:

   ```bash
   npx prisma migrate deploy
   ```

### 2) Connect Firebase

1. Create a Firebase project.
2. Add a Web app and copy Firebase config values into the `NEXT_PUBLIC_FIREBASE_*` variables.
3. (Optional server/admin features) Create a service account and set:
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_CLIENT_EMAIL`
   - `FIREBASE_PRIVATE_KEY`
4. Firebase analytics initializes automatically when Web SDK vars are configured.

### 3) Connect xAI (Vercel AI SDK)

1. Add `XAI_API_KEY`.
2. Optional: change model with `XAI_MODEL` (default: `grok-2-1212`).
3. Set `AI_PROVIDER=auto` (recommended) or `AI_PROVIDER=xai`.
4. `POST /api/generate-bullets` will use xAI first and fallback safely when needed.

### 4) Connect Custom Domain on Vercel

1. In Vercel project settings, open **Domains**.
2. Add your domain (e.g. `jotlinks.com`).
3. Configure DNS records exactly as Vercel instructs (A/ALIAS/CNAME depending registrar).
4. After verification, set:
   - `NEXT_PUBLIC_APP_URL=https://your-domain.com`
   - `NEXTAUTH_URL=https://your-domain.com`
5. Redeploy so the app uses your production canonical URL.

## Database Schema

Main models:

- `User`
  - email/password (or Google)
  - profile info
- `Resume`
  - template + metadata
  - JSON resume data
  - public sharing toggle + slug

Schema file:

- `prisma/schema.prisma`

## API Endpoints

- `POST /api/auth/signup`
- `POST /api/auth/[...nextauth]` (NextAuth handlers)
- `GET/POST /api/resumes`
- `GET/PATCH/DELETE /api/resumes/:id`
- `POST /api/resumes/:id/duplicate`
- `POST /api/resumes/:id/publish`
- `GET /api/resumes/:id/pdf`
- `POST /api/generate-bullets`
- `GET /api/integrations/status`

## Deployment (Vercel Recommended)

1. Push repository to GitHub
2. Import project into Vercel
3. Set environment variables in Vercel project settings
4. Configure a PostgreSQL database (Neon, Supabase, Railway, RDS, etc.)
5. Run migration in production:

   ```bash
   npx prisma migrate deploy
   ```

6. Deploy

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - start production server
- `npm run lint` - lint code
