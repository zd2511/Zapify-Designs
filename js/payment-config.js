// Set this to your payment API origin when the static site and Node API are hosted separately.
// Example: window.ZAPIFY_API_BASE = 'https://api.zapifydesigns.co.za';
window.ZAPIFY_API_BASE = window.ZAPIFY_API_BASE || '';

// Public Yoco key is safe to expose, but hosted Checkout redirects do not require it in the browser.
window.ZAPIFY_YOCO_PUBLIC_KEY = window.ZAPIFY_YOCO_PUBLIC_KEY || 'pk_live_14c05324bVwPVyOaa364';
