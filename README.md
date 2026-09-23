# Zapify Designs — Rebuilt

This project is a rebuilt version of the supplied Zapify Designs website.

## Frontend

- Responsive Zapify Designs brand system with the original logo treatment retained.
- Photography-led homepage hero with light/white sections and hot-pink accents.
- Eight homepage services with visual cards and direct WhatsApp CTAs.
- Expanded Services page with detailed inclusions, use cases, FAQs and service-specific WhatsApp links.
- Projects/demo gallery with Zapify AutoZone removed from public presentation.
- 30 website features (15 included and 15 paid) plus 50 scrapbook-focused features (35 included and 15 paid).
- SEO metadata, canonical URLs, Open Graph tags, JSON-LD, robots.txt and sitemap.xml.
- FAQ/AEO content written as direct, extractable answers.
- Accessible labels, focus states, skip link, responsive layouts and reduced-motion handling.

## Payment architecture


The flow is:

2. Customer clicks purchase and enters customer details inside the same customisation panel — there is no separate checkout page.
3. Browser sends only the order configuration to `/api/create-checkout`.
8. The server verifies the checkout status and accepts the webhook as the authoritative payment event.
9. The order is recorded in `data/orders.json` when using the included Node server.


## Environment variables

Copy `.env.example` and configure the server:

- `PUBLIC_SITE_URL` — normally `https://zapifydesigns.co.za`.
- `CORS_ORIGIN` — frontend origin.
- `ORDER_STORE_PATH` — persistent path for order storage.

Never commit `.env`.

## Hosting

The existing site is structured for static hosting/GitHub Pages, but the payment API requires a server runtime.

Options:

- Host the entire project on a Node-capable host, or
- Keep the frontend on GitHub Pages and deploy `server/` separately.

If the API is separate, set `window.ZAPIFY_API_BASE` in `js/payment-config.js` to the public API origin.

For production order persistence, use a persistent disk or replace the JSON store with a database.


Register the webhook endpoint:



The included server uses the hosted Checkout API and does not process or store card details.

## Testing

Run locally:

```bash
npm install
npm start
```

Open the static site from the same Node host or a local static server and set `window.ZAPIFY_API_BASE` if the API is on another origin.


Before going live:

- Configure the live secret key only on the server.
- Configure the webhook signing secret.
- Confirm the webhook URL is publicly reachable over HTTPS.
- Make a successful test purchase and verify the order status server-side.
- Confirm the order store/database is persistent.



### Asset boundaries

- `marketing-assets/` — marketing website imagery only.
- `user-uploads/` — reserved runtime destination for customer uploads.

### Payment configuration

Set these environment variables in the hosting environment (never commit the secret):

- `PUBLIC_SITE_URL`
- `CORS_ORIGIN`
- `ORDER_STORE_PATH`


### Local checks

- `npm test` — pricing/catalog smoke tests.
- `npm run check` — JavaScript syntax checks.


## Current builder/payment notes

- Five images are included; each additional image is R15.
- Custom colour palette is a paid R50 feature and lets the customer choose accent, background and text colours.
- The editor lists premium features by category without a search box.
- The purchase summary is at the bottom of the left editor panel; there is no separate checkout page or sticky price box.
- If the frontend is hosted separately from the Node API, set `window.ZAPIFY_API_BASE` in `js/payment-config.js` to the API origin.


## Builder fixes in this version

- The editor initializes immediately from a local catalog fallback instead of waiting indefinitely for `/api/catalog`; the live catalog refreshes in the background when available.
- Website feature pricing is server-enforced: 15 website features are included and 15 are paid; free features cannot add a charge.
- The Digital Scrapbook has exactly 50 scrapbook-focused feature choices, including 35 included and 15 paid options.


