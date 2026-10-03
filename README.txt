ZAPIFY DESIGNS — OCTOBER 2026 BUILD

BusinessHub was rebuilt as an interactive local-first business workspace.

Includes:
- Dashboard
- Invoice maker + downloadable branded PDF
- Quote maker + downloadable branded PDF
- Logo and stamp uploads embedded into PDFs
- Customers
- Expenses
- Budget
- VAT, profit, markup, break-even and budget calculators
- Business settings and payment details

Zapify Bot is available site-wide. Configure OPENAI_API_KEY on the server before using the AI chat endpoint.

Run:
npm start

Check:
npm run check

TEMPORARY CHATBOT NOTE
----------------------
For the temporary test requested by the owner, Zapify Bot currently includes a browser-side OpenAI API key in js/site.js. This is NOT secure for production because visitors can inspect frontend JavaScript. Rotate/revoke that key after testing and move the key back to Render/server environment variables.
