# West Coast Property Co

Short-term rental management website: public marketing and listings, an owner portal, and an admin back end.

Stack: Next.js (App Router), TypeScript, Tailwind. Planned: Clerk (auth), Supabase (database and storage), Stripe Connect (payments and owner payouts), Resend (email).

## Develop
```bash
npm install
npm run dev
```
The app currently runs on mock data in `src/lib/data.ts`. No API keys are needed yet.

## Docs
- `docs/SETUP-CHECKLIST.md`: accounts to create and build status
- `supabase/schema.sql`: database schema and row level security
- `.env.example`: environment variables
