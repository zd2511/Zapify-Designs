# Zapify Designs

## Zapify BusinessHub

BusinessHub is a fully interactive, local-first business workspace. It includes:

- Dashboard with live metrics based on saved records
- Branded invoice builder with line items, VAT, discounts, payment status and downloadable PDF
- Quote builder with downloadable PDF and quote-to-invoice conversion
- Business logo upload and business stamp upload; both are embedded into generated PDFs
- Customer management with contact details and activity counts
- Expense tracking
- Monthly budget tracking and category breakdown
- General, VAT, profit, markup/margin, break-even and budget-variance calculators
- Business profile, bank/payment details and document branding settings
- Local browser persistence without Supabase or Yoco dependencies

### Important storage note
BusinessHub stores records in the browser's localStorage. This means data is tied to the browser/device where it was created. A future cloud account system can be added without changing the document-building UI.

## Zapify Bot

The site now includes **Zapify Bot** throughout the public website and inside BusinessHub. The browser sends chat messages to `/api/chat`; the OpenAI API key remains server-side.

Set the key in a local `.env` or deployment environment:

```text
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-6-luna
PORT=8080
```

Do not commit `.env` or put an API key in frontend JavaScript. The server uses the OpenAI Responses API for new chat requests. The previous Assistants API should not be used for this integration.

## Run locally

Requires Node.js 18+.

```bash
npm start
```

Then open `http://127.0.0.1:8080`.

Run checks:

```bash
npm run check
```

## Deployment

For the AI chatbot to work, deploy the Node server (or move the `/api/chat` handler to a serverless function) and set `OPENAI_API_KEY` as a secret environment variable. A purely static GitHub Pages deployment cannot safely hold an OpenAI API key, so the chatbot endpoint must run on a server/serverless platform.
