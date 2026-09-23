(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const money = (value) => `R${Number(value || 0).toFixed(2)}`;
  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const safeNumber = (id) => {
    const n = Number($(id)?.value);
    return Number.isFinite(n) ? n : 0;
  };
  const result = (id, html) => { const el = $(id); if (el) el.innerHTML = html; };

  // VAT: supports both ex-VAT input and a clear inclusive total.
  $('vatA')?.closest('.tool-card')?.querySelector('button')?.addEventListener('click', () => {
    const amount = safeNumber('vatA');
    const rate = Math.max(0, safeNumber('vatRate'));
    if (amount < 0) return result('vatR', '<span class="tool-error">Enter an amount of R0 or more.</span>');
    const vat = amount * rate / 100;
    result('vatR', `<strong>VAT: ${money(vat)}</strong><br><span>Total incl. VAT: ${money(amount + vat)}</span>`);
  });

  $('rev')?.closest('.tool-card')?.querySelector('button')?.addEventListener('click', () => {
    const revenue = safeNumber('rev'), cost = safeNumber('cost');
    if (revenue < 0 || cost < 0) return result('profitR', '<span class="tool-error">Use non-negative amounts.</span>');
    const profit = revenue - cost;
    const margin = revenue ? (profit / revenue) * 100 : 0;
    result('profitR', `<strong>Profit: ${money(profit)}</strong><br><span>Margin: ${margin.toFixed(1)}%</span>`);
  });

  $('hours')?.closest('.tool-card')?.querySelector('button')?.addEventListener('click', () => {
    const hours = safeNumber('hours'), rate = safeNumber('rate'), extra = safeNumber('extra');
    if (hours < 0 || rate < 0 || extra < 0) return result('pricingR', '<span class="tool-error">Use non-negative values.</span>');
    const labour = hours * rate;
    result('pricingR', `<strong>Suggested price: ${money(labour + extra)}</strong><br><span>Labour: ${money(labour)} · Other costs: ${money(extra)}</span>`);
  });

  const nameWords = {
    modern: ['Studio','Works','Lab','Co','Collective','Hub'],
    premium: ['& Co.','House','Group','Atelier','Signature','Select'],
    local: ['Local','SA','Central','Corner','Neighbourhood','Community'],
    friendly: ['Buddy','Bloom','Bright','Happy','Kind','Easy']
  };
  const prefixes = ['Bright','Prime','Urban','Fresh','Bold','Smart','True','Nova','Mosaic','Elevate','Simply','Next'];
  $('seed')?.closest('.tool-card')?.querySelector('button')?.addEventListener('click', () => {
    const seed = $('seed').value.trim() || 'business';
    const style = $('nameStyle').value;
    const endings = nameWords[style] || [...nameWords.modern, ...nameWords.friendly];
    const pool = [];
    for (let i = 0; i < 8; i++) {
      const p = prefixes[(seed.length + i * 3) % prefixes.length];
      const e = endings[(seed.length * 2 + i) % endings.length];
      pool.push(`${p} ${seed.replace(/\s+/g, ' ')} ${e}`.replace(/\s+/g, ' ').trim());
    }
    result('namesR', `<ol class="tool-list">${pool.map(n => `<li>${escapeHtml(n)}</li>`).join('')}</ol>`);
  });

  const captionTemplates = {
    Friendly: 'We’re excited to share {topic}! If you’ve been looking for a simple way to get started, send us a message and let’s chat. 💬',
    Professional: 'Looking for a reliable solution for {topic}? Here are a few practical ways we can help. Contact us to discuss your requirements.',
    Playful: 'Big ideas, small steps, and a little bit of {topic}. ✨ Ready to make it happen? Let’s get started!',
    'Sales-focused': 'Ready for better results with {topic}? Get in touch today and let’s turn your next idea into action.',
    Educational: 'A quick tip about {topic}: start with the outcome you want, then build the simplest path to get there. Save this post for later.'
  };
  $('topic')?.closest('.tool-card')?.querySelector('button')?.addEventListener('click', () => {
    const topic = $('topic').value.trim() || 'your business';
    const tone = $('tone').value;
    const platform = $('platform').value;
    const audience = $('audience').value;
    const base = captionTemplates[tone].replace('{topic}', escapeHtml(topic));
    const captions = [base, `${base} ${platform === 'LinkedIn' ? 'What has worked for your business?' : 'What do you think?'}`, `${base} #smallbusiness #southafrica`, `${base} ${audience.toLowerCase()}, this one is for you.`, `${base} Save this post and share it with someone who needs it.`];
    result('captionR', `<div class="tool-list">${captions.map((c,i)=>`<article><b>${i+1}.</b> ${c}</article>`).join('')}</div>`);
  });

  $('qrText')?.closest('.tool-card')?.querySelector('button')?.addEventListener('click', () => {
    const text = $('qrText').value.trim();
    const size = Math.min(1000, Math.max(100, Number($('qrSize').value) || 320));
    if (!text) return result('qrR', '<span class="tool-error">Enter a URL, WhatsApp link or text first.</span>');
    const src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`;
    result('qrR', `<div class="qr-output"><img src="${src}" alt="Generated QR code" width="${size}" height="${size}" loading="lazy"><a class="btn btn-ghost" href="${src}" target="_blank" rel="noopener">Open QR image</a></div>`);
  });

  let invoiceItems = [];
  const renderInvoiceItems = () => result('invoiceItems', invoiceItems.length
    ? `<div class="invoice-items"><b>Items</b>${invoiceItems.map((x,i)=>`<div class="invoice-item-row"><span>${escapeHtml(x.name)} × ${x.qty}</span><strong>${money(x.amount*x.qty)}</strong><button type="button" data-invoice-remove="${i}" aria-label="Remove ${escapeHtml(x.name)}">×</button></div>`).join('')}</div>`
    : '<span class="muted">No items added yet.</span>');
  $('invoiceLogo')?.addEventListener('change', () => {
    const file = $('invoiceLogo').files?.[0];
    const preview = $('invoiceLogoPreview');
    if (!file || !preview) return;
    const reader = new FileReader();
    reader.onload = () => { preview.src = reader.result; preview.hidden = false; };
    reader.readAsDataURL(file);
  });
  $('amount')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); addInvoiceItem(); } });
  window.addInvoiceItem = () => {
    const name = $('item')?.value.trim();
    const amount = safeNumber('amount');
    if (!name || amount < 0) return result('invoiceR', '<span class="tool-error">Enter an item and a valid amount.</span>');
    invoiceItems.push({name, amount, qty: 1});
    $('item').value = ''; $('amount').value = '';
    result('invoiceR', 'Item added.'); renderInvoiceItems();
  };
  $('invoiceItems')?.addEventListener('click', e => {
    const b = e.target.closest('[data-invoice-remove]');
    if (!b) return;
    invoiceItems.splice(Number(b.dataset.invoiceRemove), 1); renderInvoiceItems();
  });
  window.invoice = () => {
    if (!invoiceItems.length) {
      const name = $('item')?.value.trim(), amount = safeNumber('amount');
      if (name && amount >= 0) { invoiceItems.push({name, amount, qty: 1}); }
    }
    if (!invoiceItems.length) return result('invoiceR', '<span class="tool-error">Add at least one invoice item.</span>');
    const business = escapeHtml($('bizName')?.value.trim() || 'Your Business');
    const email = escapeHtml($('bizEmail')?.value.trim() || '');
    const phone = escapeHtml($('bizPhone')?.value.trim() || '');
    const client = escapeHtml($('client')?.value.trim() || 'Client');
    const clientEmail = escapeHtml($('clientEmail')?.value.trim() || '');
    const number = escapeHtml($('invoiceNo')?.value.trim() || `DOC-${new Date().getTime().toString().slice(-6)}`);
    const notes = escapeHtml($('invoiceNotes')?.value.trim() || '');
    const colour = $('invoiceColor')?.value || '#171717';
    const logo = $('invoiceLogoPreview')?.src && !$('invoiceLogoPreview').hidden ? `<img src="${$('invoiceLogoPreview').src}" alt="Logo" class="print-logo">` : '';
    const subtotal = invoiceItems.reduce((sum,x) => sum + x.amount*x.qty, 0);
    const vat = 0;
    const total = subtotal + vat;
    const rows = invoiceItems.map(x => `<tr><td>${escapeHtml(x.name)}</td><td>${x.qty}</td><td>${money(x.amount)}</td><td>${money(x.amount*x.qty)}</td></tr>`).join('');
    const win = window.open('', '_blank', 'noopener,noreferrer');
    if (!win) return result('invoiceR', '<span class="tool-error">Your browser blocked the printable window. Allow pop-ups for this site.</span>');
    win.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${business} — ${number}</title><style>body{font-family:Arial,sans-serif;color:#171717;max-width:900px;margin:40px auto;padding:0 24px}header{display:flex;justify-content:space-between;border-bottom:3px solid ${colour};padding-bottom:20px;margin-bottom:30px}.print-logo{max-width:150px;max-height:70px;object-fit:contain}.meta{text-align:right}table{width:100%;border-collapse:collapse;margin-top:30px}th,td{padding:12px;border-bottom:1px solid #ddd;text-align:left}th{background:#f5f5f5}.total{text-align:right;font-size:22px;font-weight:800;margin-top:24px}.notes{margin-top:35px;white-space:pre-wrap;color:#555}@media print{body{margin:0;max-width:none}}</style></head><body><header><div>${logo}<h1>${business}</h1><div>${email}${email&&phone?' · ':''}${phone}</div></div><div class="meta"><strong>${number}</strong><br>${new Date().toLocaleDateString('en-ZA')}</div></header><p><strong>Bill to:</strong><br>${client}${clientEmail?`<br>${clientEmail}`:''}</p><table><thead><tr><th>Description</th><th>Qty</th><th>Unit</th><th>Total</th></tr></thead><tbody>${rows}</tbody></table><div class="total">Total: ${money(total)}</div>${notes?`<div class="notes"><strong>Notes</strong><br>${notes}</div>`:''}<script>window.onload=()=>window.print();</script></body></html>`);
    win.document.close();
    result('invoiceR', `<strong>Invoice ready.</strong> The print dialog should open in a new tab.`);
  };

  $('imgFile')?.closest('.tool-card')?.querySelector('button')?.addEventListener('click', async () => {
    const file = $('imgFile').files?.[0];
    if (!file) return result('compressR', '<span class="tool-error">Choose an image first.</span>');
    if (!file.type.startsWith('image/')) return result('compressR', '<span class="tool-error">Please choose a valid image.</span>');
    const image = new Image();
    const url = URL.createObjectURL(file);
    image.onload = () => {
      const max = 1800, scale = Math.min(1, max / Math.max(image.naturalWidth, image.naturalHeight));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(image.naturalWidth*scale); canvas.height = Math.round(image.naturalHeight*scale);
      const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      canvas.toBlob(blob => {
        URL.revokeObjectURL(url);
        if (!blob) return result('compressR', '<span class="tool-error">The browser could not compress this image.</span>');
        const out = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = out; a.download = `zapify-compressed-${file.name.replace(/\.[^.]+$/, '')}.jpg`; a.click(); setTimeout(()=>URL.revokeObjectURL(out), 1000);
        result('compressR', `<strong>${Math.round(file.size/1024)} KB → ${Math.round(blob.size/1024)} KB</strong><br><span>Downloaded as an optimised JPG.</span>`);
      }, 'image/jpeg', 0.82);
    };
    image.onerror = () => { URL.revokeObjectURL(url); result('compressR', '<span class="tool-error">That image could not be read.</span>'); };
    image.src = url;
  });

  $('favText')?.closest('.tool-card')?.querySelector('button')?.addEventListener('click', () => {
    const text = ($('favText').value.trim() || 'Z').slice(0,1).toUpperCase();
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#171717'; ctx.fillRect(0,0,256,256);
    ctx.fillStyle = '#f22b8f'; ctx.font = '900 150px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(text,128,135);
    canvas.toBlob(blob => {
      const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download='favicon.png'; a.click(); setTimeout(()=>URL.revokeObjectURL(url),1000);
      result('favR', `<img class="favicon-preview" src="${url}" alt="Generated favicon preview"><strong>Favicon downloaded.</strong>`);
    }, 'image/png');
  });

  renderInvoiceItems();
})();
