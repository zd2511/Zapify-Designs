# Zapify Designs — Rebuilt

This project is a rebuilt version of the supplied Zapify Designs website.

## Frontend

- Responsive Zapify Designs brand system with the original logo treatment retained.
- Photography-led homepage hero with light/white sections and hot-pink accents.
- Eight homepage services with visual cards and direct WhatsApp CTAs.
- Expanded Services page with detailed inclusions, use cases, FAQs and service-specific WhatsApp links.
- Projects/demo gallery with Zapify AutoZone removed from public presentation.
- Templates marketplace with website templates and Digital Scrapbooks.
- Live template customiser: colours, typography, text and images update without refresh.
- Template pricing is centrally configured per template; 5 images are included and every additional image costs R15.
- 30 website features (15 included and 15 paid) plus 50 scrapbook-focused features (35 included and 15 paid).
- Actual template previews use image assets rather than large empty placeholders.
- "Zapify Template" branding removed from the customer-facing website template designs.
- SEO metadata, canonical URLs, Open Graph tags, JSON-LD, robots.txt and sitemap.xml.
- FAQ/AEO content written as direct, extractable answers.
- Accessible labels, focus states, skip link, responsive layouts and reduced-motion handling.

## Payment architecture

GitHub Pages can serve the frontend but cannot safely execute a Yoco secret key. The project therefore includes a small Node/Express payment API in `server/`.

The flow is:

1. Customer customises a template.
2. Customer clicks purchase and enters customer details inside the same customisation panel — there is no separate checkout page.
3. Browser sends only the order configuration to `/api/create-checkout`.
4. The server validates the template/options and recalculates the total.
5. The server creates a Yoco hosted checkout with the secret key.
6. Customer is redirected to Yoco.
7. Yoco returns the customer to `payment-success.html`.
8. The server verifies the checkout status and accepts the webhook as the authoritative payment event.
9. The order is recorded in `data/orders.json` when using the included Node server.

The frontend never receives `YOCO_SECRET_KEY`.

## Environment variables

Copy `.env.example` and configure the server:

- `YOCO_PUBLIC_KEY` — public Yoco key (optional for hosted Checkout redirects).
- `YOCO_SECRET_KEY` — private Yoco secret key.
- `YOCO_WEBHOOK_SECRET` — webhook signing secret from the Yoco dashboard.
- `PUBLIC_SITE_URL` — normally `https://zapifydesigns.co.za`.
- `CORS_ORIGIN` — frontend origin.
- `ORDER_STORE_PATH` — persistent path for order storage.
- `YOCO_CHECKOUT_ENDPOINT` — optional override for testing; defaults to Yoco production Checkout API.

Never commit `.env`.

## Hosting

The existing site is structured for static hosting/GitHub Pages, but the payment API requires a server runtime.

Options:

- Host the entire project on a Node-capable host, or
- Keep the frontend on GitHub Pages and deploy `server/` separately.

If the API is separate, set `window.ZAPIFY_API_BASE` in `js/payment-config.js` to the public API origin.

For production order persistence, use a persistent disk or replace the JSON store with a database.

## Yoco setup

Register the webhook endpoint:

`https://YOUR-API-HOST/api/yoco-webhook`

Use the Yoco Online Payments API credentials in secure server environment variables.

The included server uses the hosted Checkout API and does not process or store card details.

## Testing

Run locally:

```bash
npm install
npm start
```

Open the static site from the same Node host or a local static server and set `window.ZAPIFY_API_BASE` if the API is on another origin.

For payment testing, use Yoco test credentials in the server environment. Do not put a secret key in frontend code.

Before going live:

- Confirm the Yoco account is enabled for Online Payments.
- Configure the live secret key only on the server.
- Configure the webhook signing secret.
- Confirm the webhook URL is publicly reachable over HTTPS.
- Make a successful test purchase and verify the order status server-side.
- Confirm the order store/database is persistent.

## Zapify Template Builder rebuild

The template system now uses a server-owned catalog in `server/catalog.js`. Template base prices, add-on prices, applicability and image pricing are calculated server-side. The browser consumes `/api/catalog` for the editor UI.

### Asset boundaries

- `marketing-assets/` — marketing website imagery only.
- `template-assets/` — template/demo imagery only.
- `user-uploads/` — reserved runtime destination for customer uploads.
- `demo/` — existing portfolio/demo projects; not used by the marketing service/template editor.

### Payment configuration

Set these environment variables in the hosting environment (never commit the secret):

- `YOCO_SECRET_KEY`
- `YOCO_WEBHOOK_SECRET`
- `PUBLIC_SITE_URL`
- `CORS_ORIGIN`
- `ORDER_STORE_PATH`

The checkout endpoint recalculates the amount from template/add-on IDs and the number of uploaded images. Browser-supplied prices are ignored. The webhook requires the configured signing secret.

### Local checks

- `npm test` — pricing/catalog smoke tests.
- `npm run check` — JavaScript syntax checks.

A real Yoco transaction requires the merchant's Yoco credentials and webhook configuration. The live secret key supplied during development is deliberately not embedded in the archive or frontend.

## Current builder/payment notes

- All six website templates are R100 base price.
- Five images are included; each additional image is R15.
- Custom colour palette is a paid R50 feature and lets the customer choose accent, background and text colours.
- The editor lists premium features by category without a search box.
- The purchase summary is at the bottom of the left editor panel; there is no separate checkout page or sticky price box.
- The live preview loads the actual template directly in an iframe (`templates/<template>.html`) and applies changes with `postMessage`.
- The Yoco Checkout API request uses the currently documented `amount`, `currency`, redirect URLs, metadata, `clientReferenceId` and `externalId` fields; the browser never supplies the payable amount to Yoco.
- If the frontend is hosted separately from the Node API, set `window.ZAPIFY_API_BASE` in `js/payment-config.js` to the API origin.


## Builder fixes in this version

- The editor initializes immediately from a local catalog fallback instead of waiting indefinitely for `/api/catalog`; the live catalog refreshes in the background when available.
- Live previews use the real template URL directly in the iframe, avoiding blank `srcdoc` previews on static deployments.
- Website feature pricing is server-enforced: 15 website features are included and 15 are paid; free features cannot add a charge.
- The Digital Scrapbook has exactly 50 scrapbook-focused feature choices, including 35 included and 15 paid options.
- The example environment file contains placeholders rather than a live secret key. Rotate any previously exposed Yoco secret before production use.
- Yoco checkout creation includes a line item, metadata for reconciliation, an idempotency key, and a 30-second request timeout. Payment completion remains server-verified via Yoco checkout status/webhook.

## Supabase backend migration

A Supabase-ready backend is included under `supabase/`. It contains the Postgres schema/seed data, RLS policies, private Storage bucket policy, and Edge Functions for catalog access and Yoco checkout/payment handling. The existing Express server remains available for backwards compatibility during migration.
