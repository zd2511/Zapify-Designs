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
- Scrapbook pricing: R100 base, 5 images included, R15 per additional image, R25 per selected custom feature.
- 20 scrapbook customisation options.
- Actual template previews use image assets rather than large empty placeholders.
- "Zapify Template" branding removed from the customer-facing website template designs.
- SEO metadata, canonical URLs, Open Graph tags, JSON-LD, robots.txt and sitemap.xml.
- FAQ/AEO content written as direct, extractable answers.
- Accessible labels, focus states, skip link, responsive layouts and reduced-motion handling.

## Payment architecture

GitHub Pages can serve the frontend but cannot safely execute a Yoco secret key. The project therefore includes a small Node/Express payment API in `server/`.

The flow is:

1. Customer customises a template.
2. Customer enters checkout details.
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

- `YOCO_PUBLIC_KEY` — public Yoco key.
- `YOCO_SECRET_KEY` — private Yoco secret key.
- `YOCO_WEBHOOK_SECRET` — webhook signing secret from the Yoco dashboard.
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
