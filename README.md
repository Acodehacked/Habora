# Habora

Habora is a personal management platform for organizing everything you own, subscribe to, maintain, and pay for in one place.

The starter app is a Next.js dashboard backed by Supabase. It gives homeowners, tenants, families, and individuals one calm place to track properties, appliances, subscriptions, bills, warranties, repairs, maintenance schedules, receipts, and important documents.

## Why Habora

Ownership records and recurring responsibilities are often split between email, cloud folders, notes, and physical paperwork. That makes it easy to miss a renewal, lose a warranty, or forget a maintenance task. Habora brings those details together with reminders and a clear view of what needs attention.

## Stack

- Next.js with the App Router and TypeScript
- React and Tailwind CSS
- Supabase for authentication, Postgres data, RLS, and future file storage
- Drizzle ORM and Drizzle Kit for typed schema management and migrations
- Lucide React for interface icons

## Local setup

1. Install Node.js 20 or newer.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env.local` and add the Supabase URL, publishable key, and Postgres connection string. The publishable key is safe for browser use; never put a service role key in `NEXT_PUBLIC_*` variables.
4. In the Supabase SQL editor, run [`supabase/schema.sql`](supabase/schema.sql) to create the first `assets` and `reminders` tables with row-level security.
5. Generate or apply Drizzle migrations when the TypeScript schema changes:

   ```bash
   npm run db:generate
   npm run db:migrate
   ```

   Use `npm run db:push` only for local prototyping. Keep RLS policies in Supabase SQL migrations.
6. Start the app:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:3000`.

## Scripts

- `npm run dev` starts the Turbopack development server.
- `npm run lint` checks the code with ESLint.
- `npm run build` creates a production build.
- `npm run start` serves the production build.
- `npm run db:generate` creates a migration from `src/lib/db/schema.ts`.
- `npm run db:migrate` applies generated migrations using `DATABASE_URL`.
- `npm run db:push` pushes the Drizzle schema directly to the database.

## Project structure

```text
src/app/                 App Router pages, layout, and global styles
src/lib/supabase/        Browser and cookie-aware server Supabase clients
src/lib/db/              Drizzle schema and server database client
src/middleware.ts        Session refresh and dashboard protection
src/app/login/           Email/password sign-in and account creation
supabase/schema.sql      Starter Postgres schema and RLS policies
agent.md                 Product and engineering context for future agents
.github/                 Workspace-specific Copilot instructions
```

## Product roadmap

- Add household onboarding and connect dashboard cards to live assets, subscriptions, and reminders.
- Connect dashboard cards to live assets, subscriptions, and reminders.
- Add document uploads using Supabase Storage with private buckets.
- Add recurring reminder generation and email or push notifications.
- Add household members with scoped permissions.

## Security notes

Only the public Supabase URL and publishable key belong in browser-exposed environment variables. Never expose a Supabase service role key in the client or commit local environment files. Keep row-level security enabled for every user-owned table. Runtime user queries should use the Supabase clients so the authenticated session is available to RLS; Drizzle is used for typed schema access and migrations.
