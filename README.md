# Zapify Designs

A static Zapify Designs website with a fully client-side **Zapify Toolbox**.

## Toolbox

The Toolbox works in the browser and currently includes:

- VAT calculator
- Profit and margin calculator
- Project pricing calculator
- Business-name generator
- Social-caption generator
- QR-code generator
- Printable invoice / quote builder with multiple line items and logo support
- Image compressor
- Favicon generator

This build is a static website and browser-based toolbox with no payment or database dependency.

## Run locally

Requires Node.js 18+.

```bash
npm start
```

Then open `http://127.0.0.1:8080`.

Run the JavaScript checks with:

```bash
npm run check
```

## Deployment

The site is static and can be deployed to GitHub Pages, Netlify, Vercel, Cloudflare Pages, or another static host. The included `local-server.js` is only for local preview.

## Privacy

The calculators, caption generator, invoice builder, image compressor and favicon generator run locally in the browser. The QR generator uses an external QR image service when a QR code is requested.
