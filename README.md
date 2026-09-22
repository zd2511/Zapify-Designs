# Zapify Designs — rebuilt website

Static production-oriented rebuild for `zapifydesigns.co.za`.

## Architecture
- Semantic HTML5
- One responsive stylesheet
- Vanilla JavaScript for interactions, quote flow, chatbot and product prototypes
- No framework/runtime dependency required for GitHub Pages
- Existing demo projects retained under `/demo/`
- Existing Zapify logo markup retained rather than redesigned

## External configuration
- Quote form intentionally opens a pre-filled WhatsApp message instead of pretending to save data.
- Zapify Assistant is a structured local FAQ/intent assistant. Replace the `answer()` function in `app.js` with a server-side AI endpoint when a real AI provider is configured.
- Google Fonts are loaded remotely; the site still renders using system fallbacks if unavailable.

## Deployment
Upload the contents of this folder to the site's web root / GitHub Pages repository. Keep `CNAME`, `robots.txt` and `sitemap.xml` at the root.
