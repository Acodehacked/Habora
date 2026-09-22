# Habora Project-Building Checklist

Use this file as the project checkpoint. Check an item only when the outcome exists, has been reviewed, and is usable by the next phase.

## 1. What You Are Going to Build

- [ ] Define Habora in one clear sentence.
- [ ] Document the core problem: scattered ownership records, bills, warranties, repairs, maintenance, and documents.
- [ ] Define the initial MVP audience: homeowners, tenants, families, or individuals.
- [ ] Define what is in scope for the first release.
- [ ] Define what is explicitly out of scope.

## 2. The Product-Building Mindset

- [ ] Focus each feature on a real user problem.
- [ ] Prefer a small usable workflow over a large feature list.
- [ ] Validate assumptions before building expensive functionality.
- [ ] Keep decisions documented and reversible where possible.
- [ ] Review progress against user value, not only technical completion.

## 3. The Full Product Journey

- [ ] Complete problem and customer discovery.
- [ ] Validate the market and proposed solution.
- [ ] Define the business model and MVP.
- [ ] Map the user flow and wireframes.
- [ ] Finalize UI/UX and technical architecture.
- [ ] Build, test, deploy, and collect feedback.

## 4. The 45-Minute Workshop Version

- [ ] Write the problem in 5 minutes.
- [ ] Identify the primary user in 5 minutes.
- [ ] List current alternatives and competitors in 5 minutes.
- [ ] Define the solution and unique value proposition in 5 minutes.
- [ ] Select the smallest MVP in 10 minutes.
- [ ] Sketch the main user flow in 5 minutes.
- [ ] Choose the first validation experiment in 5 minutes.

## 5. Your Master Project Brief

- [ ] Record the product name: Habora.
- [ ] Record the one-sentence startup description.
- [ ] Record the target users.
- [ ] Record the problem and why it matters.
- [ ] Record the proposed solution.
- [ ] Record competitors and existing alternatives.
- [ ] Record the primary success metric.
- [ ] Record the current product assumptions.
- [ ] Add the brief to the project documentation.

## 6. Phase 1 - Problem & Idea

- [ ] Describe the problem in specific user language.
- [ ] Document how users solve the problem today.
- [ ] Identify the cost of the problem in time, money, stress, or risk.
- [ ] Identify the most urgent use case.
- [ ] Confirm that the problem is frequent enough to justify a product.
- [ ] Write the initial problem hypothesis.

**Checkpoint:** The problem is specific, costly, and experienced by a clearly defined user.

## 7. Phase 2 - Customer

- [ ] Define the primary customer profile.
- [ ] Define secondary customer profiles.
- [ ] Document customer goals and frustrations.
- [ ] List where customers currently search for solutions.
- [ ] Conduct customer interviews or surveys.
- [ ] Record exact customer language and repeated patterns.
- [ ] Update the customer profile based on evidence.

**Checkpoint:** At least one customer segment has a confirmed recurring problem.

## 8. Phase 3 - Validation & Market

- [ ] List direct competitors such as HomeZada.
- [ ] List indirect alternatives such as Google Drive, Notion, spreadsheets, and paper records.
- [ ] Compare competitor workflows, pricing, and limitations.
- [ ] Identify Habora's underserved niche.
- [ ] Define the riskiest product assumption.
- [ ] Run a validation experiment.
- [ ] Record evidence, results, and next decision.

**Checkpoint:** Evidence supports continuing, changing direction, or stopping the idea.

## 9. Phase 4 - Solution & UVP

- [ ] Define the core Habora workflow.
- [ ] Define the unique value proposition.
- [ ] Identify the user's first meaningful success.
- [ ] Prioritize centralized records, reminders, and document access.
- [ ] Define what makes Habora simpler than general-purpose tools.
- [ ] Write the homepage and onboarding message.
- [ ] Test the value proposition with target users.

**Checkpoint:** A target user can explain why Habora is useful after one short description.

## 10. Phase 5 - Business Model

- [ ] Define the free product experience.
- [ ] Decide whether Habora will use subscription, freemium, or another model.
- [ ] Identify possible premium features.
- [ ] Estimate infrastructure and storage costs.
- [ ] Define a sustainable pricing hypothesis.
- [ ] Identify acquisition channels.
- [ ] Define activation, retention, and conversion metrics.

## 11. Phase 6 - MVP & Features

- [ ] Define authentication and account creation.
- [ ] Define the personal or household workspace.
- [ ] Define assets and asset categories.
- [ ] Define subscriptions and recurring bills.
- [ ] Define reminders and maintenance schedules.
- [ ] Define warranties and important dates.
- [ ] Define document metadata and uploads.
- [ ] Define search and filtering.
- [ ] Define the dashboard overview.
- [ ] Remove features that are not needed for the first successful workflow.

**MVP checkpoint:** A user can sign in, add an item, attach useful details, create a reminder, and find that information later.

## 12. Phase 7 - User Flow

- [ ] Map first visit to account creation.
- [ ] Map email confirmation and sign-in.
- [ ] Map onboarding and workspace setup.
- [ ] Map adding a first asset.
- [ ] Map adding a bill, warranty, or maintenance reminder.
- [ ] Map uploading or linking a document.
- [ ] Map reviewing the dashboard.
- [ ] Map completing a reminder.
- [ ] Map editing and deleting records.
- [ ] Map sign-out and session expiration.
- [ ] Identify empty, loading, error, and success states.

## 13. Phase 8 - Wireframes

- [ ] Sketch login and account creation.
- [ ] Sketch onboarding.
- [ ] Sketch dashboard overview.
- [ ] Sketch asset list and asset detail.
- [ ] Sketch reminder list and reminder detail.
- [ ] Sketch subscription and bill views.
- [ ] Sketch document view.
- [ ] Sketch settings and account management.
- [ ] Review mobile layouts.
- [ ] Review the wireframes with a potential user.

## 14. Phase 9 - UI/UX

- [ ] Preserve Habora's calm, warm visual language.
- [ ] Define typography, color, spacing, and component tokens.
- [ ] Ensure primary actions are visually clear.
- [ ] Add useful empty states and concise feedback.
- [ ] Add accessible labels to icon-only controls.
- [ ] Verify keyboard navigation and focus states.
- [ ] Verify color contrast.
- [ ] Verify responsive layouts on mobile, tablet, and desktop.
- [ ] Verify text does not overlap or overflow.
- [ ] Review the interface for unnecessary complexity.

## 15. Phase 10 - Technical Architecture

- [x] Use Next.js App Router and TypeScript.
- [x] Use Supabase for authentication and Postgres.
- [x] Use Supabase RLS for user-owned data.
- [x] Use Drizzle ORM and Drizzle Kit for typed schema and migrations.
- [x] Keep browser Supabase access in `src/lib/supabase/client.ts`.
- [x] Keep cookie-aware server access in `src/lib/supabase/server.ts`.
- [x] Refresh sessions in `src/middleware.ts`.
- [ ] Define feature and data-access boundaries.
- [ ] Define error logging and observability.
- [ ] Define backup and recovery expectations.
- [ ] Define file storage strategy.
- [ ] Define notification strategy.

**Checkpoint:** The architecture supports authenticated, RLS-protected user data without exposing privileged secrets.

## 16. Phase 11 - Database

- [x] Create the initial `assets` table.
- [x] Create the initial `reminders` table.
- [x] Add `user_id` to user-owned records.
- [x] Enable RLS on user-owned tables.
- [x] Add ownership policies for assets and reminders.
- [x] Add Drizzle TypeScript schema definitions.
- [ ] Add indexes for user lookups and due dates.
- [ ] Add subscriptions and billing fields.
- [ ] Add warranties and maintenance fields.
- [ ] Add documents and storage references.
- [ ] Add updated-at automation where needed.
- [ ] Generate and review Drizzle migrations.
- [ ] Test authorized and unauthorized database access.

**Checkpoint:** Each user can read and mutate only their own records.

## 17. Phase 12 - API & AI

- [ ] Define server actions or route handlers for each core workflow.
- [ ] Validate all input at the server boundary.
- [ ] Return consistent success and error shapes.
- [ ] Handle authorization for every mutation.
- [ ] Add pagination for growing lists.
- [ ] Add search and filtering APIs.
- [ ] Define reminder scheduling behavior.
- [ ] Decide whether AI is needed for document extraction or categorization.
- [ ] Define AI input, output, privacy, and failure behavior.
- [ ] Keep AI optional to the core product workflow.

## 18. Phase 13 - Development

- [x] Create the Next.js project foundation.
- [x] Add Supabase publishable-key configuration.
- [x] Add login and account creation flow.
- [x] Add auth callback handling.
- [x] Add protected dashboard routing.
- [ ] Connect dashboard data to authenticated records.
- [ ] Build create, read, update, and delete workflows.
- [ ] Build reminders and recurring responsibilities.
- [ ] Build document upload and retrieval.
- [ ] Add loading, error, and empty states.
- [ ] Keep secrets out of source control.
- [ ] Update documentation as features change.

## 19. Phase 14 - Testing & Debugging

- [ ] Run `npm run lint`.
- [ ] Run TypeScript checks.
- [ ] Run `npm run build` with Node.js 20.9 or newer.
- [ ] Test sign-up.
- [ ] Test email confirmation.
- [ ] Test sign-in and sign-out.
- [ ] Test protected route redirects.
- [ ] Test session refresh.
- [ ] Test CRUD operations under RLS.
- [ ] Test invalid and missing input.
- [ ] Test mobile and desktop layouts.
- [ ] Test keyboard navigation and accessibility.
- [ ] Test document upload failures.
- [ ] Record and resolve critical bugs.

## 20. Phase 15 - Deployment

- [ ] Choose a hosting provider.
- [ ] Configure production environment variables.
- [ ] Confirm the production Supabase URL and publishable key.
- [ ] Configure Supabase authentication redirect URLs.
- [ ] Apply database migrations.
- [ ] Verify production RLS policies.
- [ ] Configure storage buckets and policies.
- [ ] Configure domain and HTTPS.
- [ ] Run a production smoke test.
- [ ] Add monitoring and error alerts.
- [ ] Document rollback steps.

## 21. Phase 16 - User Feedback & Iteration

- [ ] Recruit initial users.
- [ ] Observe users completing the first workflow.
- [ ] Track activation and retention.
- [ ] Collect qualitative feedback.
- [ ] Record friction, confusion, and missing features.
- [ ] Separate bugs from feature requests.
- [ ] Prioritize changes by user impact and effort.
- [ ] Run a second validation cycle.
- [ ] Update the roadmap and product brief.

**Checkpoint:** Every iteration is tied to observed user behavior or measurable product evidence.

## 22. Final Pitch & Form 3

- [ ] Prepare the problem statement.
- [ ] Prepare the customer definition.
- [ ] Prepare the solution and UVP.
- [ ] Prepare the market and competitor summary.
- [ ] Prepare the business model.
- [ ] Prepare the MVP demonstration.
- [ ] Prepare traction or validation evidence.
- [ ] Prepare the technical architecture summary.
- [ ] Prepare the roadmap.
- [ ] Prepare the founder or team story.
- [ ] Complete Form 3 responses.
- [ ] Practice the pitch within the time limit.

## 23. AI Prompt Library

- [ ] Add a problem-discovery prompt.
- [ ] Add a customer-interview prompt.
- [ ] Add a competitor-analysis prompt.
- [ ] Add a value-proposition prompt.
- [ ] Add an MVP-prioritization prompt.
- [ ] Add a user-flow prompt.
- [ ] Add a wireframe-review prompt.
- [ ] Add a database-schema review prompt.
- [ ] Add a testing and debugging prompt.
- [ ] Add a user-feedback synthesis prompt.
- [ ] Add a pitch-writing prompt.
- [ ] Review prompts for privacy and secret handling.

## 24. Tool Guide

- [ ] Document the role of Next.js.
- [ ] Document the role of Supabase Auth.
- [ ] Document the role of Supabase Postgres and RLS.
- [ ] Document the role of Drizzle ORM.
- [ ] Document the role of Drizzle Kit.
- [ ] Document the role of Supabase Storage.
- [ ] Document the role of the deployment platform.
- [ ] Document local development commands.
- [ ] Document migration commands.
- [ ] Document debugging and testing commands.

## 25. Beginner Development Rules

- [ ] Never commit `.env.local` or secrets.
- [ ] Never expose a Supabase service role key in client code.
- [ ] Keep RLS enabled for every user-owned table.
- [ ] Validate input on the server.
- [ ] Test one small change at a time.
- [ ] Read the error message before changing code.
- [ ] Keep commits and feature changes focused.
- [ ] Update the schema and migrations together.
- [ ] Add loading, error, and empty states.
- [ ] Verify mobile behavior before calling a screen complete.
- [ ] Run lint and build before handoff.
- [ ] Record unresolved risks instead of hiding them.

## 26. Final Checklist

- [ ] The problem and target customer are clearly defined.
- [ ] The MVP solves one complete, meaningful workflow.
- [ ] Users can create and access accounts.
- [ ] Protected routes and session refresh work.
- [ ] Supabase RLS prevents cross-user access.
- [ ] Drizzle schema and migrations are current.
- [ ] Assets, reminders, and documents are usable.
- [ ] Core screens work on mobile and desktop.
- [ ] Loading, error, empty, and success states exist.
- [ ] Accessibility checks are complete.
- [ ] Lint passes.
- [ ] TypeScript checks pass.
- [ ] Production build passes on a supported Node.js version.
- [ ] Environment variables are configured securely.
- [ ] Production auth redirects are configured.
- [ ] Database migrations are applied.
- [ ] Monitoring and rollback steps are documented.
- [ ] Initial user feedback has been collected.
- [ ] The final pitch and Form 3 are complete.

## Current Project Status

- **Completed foundation:** Next.js App Router, TypeScript, Supabase client setup, Supabase auth callback, protected routing, initial RLS schema, Drizzle schema, and dashboard shell.
- **Current blocker:** The installed Node.js version is `20.6.1`; the current Next.js version requires Node.js `20.9.0` or newer for `npm run build`.
- **Next implementation checkpoint:** Connect dashboard cards and lists to authenticated Supabase records, then add the first create/edit workflows.
