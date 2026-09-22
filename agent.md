# Habora Agent Context

## Product

Habora helps people manage everything they own, subscribe to, maintain, and pay for in one place. The target users are homeowners, tenants, families, and individuals who currently rely on scattered apps, inboxes, cloud folders, and paper records.

The core promise is a calmer household: know what you have, what it costs, what is covered, what needs attention, and where the proof lives.

## Product vocabulary

- **Asset:** Anything a user owns or tracks, including a property, appliance, vehicle, subscription, warranty, or document.
- **Reminder:** A dated or recurring responsibility such as a bill, service, renewal, inspection, or warranty expiry.
- **Workspace:** A personal or household space that can eventually be shared with members.
- **Document:** A receipt, manual, contract, invoice, warranty, registration, or other supporting record.

## Architecture

- Next.js App Router and TypeScript power the web application.
- The UI currently uses local sample data to establish the product experience.
- Supabase is the source of truth for Auth, Postgres, RLS, and private Storage.
- Browser Supabase access belongs in `src/lib/supabase/client.ts`; cookie-aware server access belongs in `src/lib/supabase/server.ts`.
- Drizzle ORM and Drizzle Kit own the typed Postgres schema and migration workflow. User-facing runtime queries should use the Supabase clients so RLS receives the authenticated session.
- `src/middleware.ts` refreshes auth cookies and redirects anonymous users to `/login`.
- User-owned records must include `user_id` and use row-level security policies.
- The initial schema lives in `supabase/schema.sql`.

## Design direction

Habora should feel warm, composed, and quietly useful. Prefer a soft botanical palette with coral and golden accents, generous whitespace, compact data-dense panels, and clear next actions. Avoid generic SaaS gradients, dark dashboards, and decorative UI that competes with household information.

The app should work well for repeated daily use. Use familiar icons with accessible labels, clear empty states, responsive layouts, and concise copy. Preserve the existing visual language when adding screens.

## Development workflow

1. Install dependencies with `npm install`.
2. Add `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and `DATABASE_URL` in `.env.local` using `.env.example` as the template.
3. Run `npm run dev` while building.
4. Run `npm run lint` and `npm run build` before handoff.
5. Keep secrets out of source control and update `README.md` when setup changes.

## Implementation rules

- Prefer server components unless a component needs browser state or event handlers.
- Keep data access separate from presentational components.
- Do not use a Supabase service role key in client code.
- Add schema changes to `src/lib/db/schema.ts` and generate a Drizzle migration. Add corresponding RLS policies to `supabase/schema.sql` or a Supabase migration.
- Keep feature changes focused and avoid unrelated refactors.
