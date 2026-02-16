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
- **AI:** OpenAI API (`/api/generate-bullets`)
- **PDF:** `pdf-lib`

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
- Live preview with multiple templates (Classic + Modern)
- PDF export endpoint
- Shareable public resume links
- Autosave every few seconds

## Security Notes

- Passwords are hashed with `bcrypt`
- Auth uses secure cookies in production (`useSecureCookies`)
- Input validation uses `zod`
- Input sanitization removes unsafe text patterns
- Login and AI endpoints are rate-limited
- Same-origin checks are used on mutating endpoints
- Prisma parameterized queries reduce SQL injection risk

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
  resume/
lib/
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

Optional:

- `OPENAI_API_KEY` - enables OpenAI bullet generation
- `OPENAI_MODEL` - defaults to `gpt-4.1-mini`
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` - enables Google login

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
