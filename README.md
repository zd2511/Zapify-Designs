# Zapify Designs v2

Multi-page static site rebuild for GitHub Pages / standard hosting.

## Highlights
- Three.js 3D hero workstation (`js/hero3d.js`)
- Separate Services, Projects, Packages, About, FAQ and Contact pages
- Product pages for Zapify OS, Website Roast, Templates, Design Packs, AI, Toolbox and Dev
- Five ready-made template preview pages under `/templates/`
- Actual SVG design-pack previews
- Functional browser-based Toolbox utilities
- Interactive Zapify OS dashboard prototype
- Website Roast uses Google PageSpeed when available and a clearly-labelled content fallback when it is not
- Structured FAQ, sitemap, robots, canonical/OG basics
- Existing client demo projects retained under `/demo/` and shown as visual thumbnails on Projects

## External dependencies
- Three.js is loaded from jsDelivr for the 3D hero.
- QRCode.js is loaded from jsDelivr for QR generation.
- Website Roast attempts Google's PageSpeed endpoint and then a public text-fetch fallback. For guaranteed production scanning, connect a server-side scanner/API and set it as the integration endpoint.
- Quote form intentionally opens WhatsApp rather than pretending an email/backend exists.

## Deploy
Upload the contents of this folder to the GitHub Pages repository for `zapifydesigns.co.za`.
