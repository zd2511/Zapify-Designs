# Zapify + Supabase backend

This directory adds a Supabase backend layer to Zapify while keeping the existing static frontend and legacy Node/Express payment API intact. It is designed as the migration path to Supabase, not a destructive rewrite.

## Included

- PostgreSQL schema and seed data for all templates/features.
- RLS policies for customer-owned projects, images, orders and payments.
- Private Storage bucket for project assets.
- Edge Functions for Yoco checkout creation, webhook handling, checkout verification and catalog reads.
- Server-side pricing: template price, paid feature prices and R15 extra-image pricing are read from Postgres rather than trusted from the browser.
- Yoco secret is read only from Edge Function environment variables.

## Supabase setup

1. Create a Supabase project.
2. Run `supabase/migrations/001_zapify_schema.sql` in the Supabase SQL Editor (or use Supabase CLI migrations).
3. Set Edge Function secrets:

   - `YOCO_SECRET_KEY`
   - `YOCO_CHECKOUT_ENDPOINT` (optional; defaults to Yoco's checkout endpoint)
   - `PUBLIC_SITE_URL`
   - `CORS_ORIGIN` (optional)
   - `YOCO_WEBHOOK_SECRET` (required for signed webhook verification)

4. Deploy the four functions under `supabase/functions/`.
5. In Yoco, point the webhook to the deployed `yoco-webhook` function URL.
6. Test with Yoco test credentials before switching to live credentials.

## Pricing rules

- All six current templates are R100.
- Website catalog: 30 general features, 15 included and 15 paid.
- Scrapbook catalog: 50 scrapbook-focused features, 35 included and 15 paid.
- First 5 images are included; each additional image costs R15.

The checkout Edge Function recalculates the total from the database and does not trust a browser-supplied price.

## Frontend migration

The existing `js/customize.js` can continue using the legacy API while the Supabase backend is deployed. After deployment, replace catalog fetching and checkout calls with the Edge Function endpoints. Do not put `YOCO_SECRET_KEY` in frontend code, `.env` committed to source control, or GitHub Pages.

## Important security note

The project may contain local test configuration from development. Before pushing this ZIP to a public repository, remove local `.env` files and use Supabase secrets instead. Never commit a Yoco secret key.
