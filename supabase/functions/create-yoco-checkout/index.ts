import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
const YOCO_ENDPOINT = Deno.env.get('YOCO_CHECKOUT_ENDPOINT') || 'https://payments.yoco.com/api/checkouts';
const SITE = (Deno.env.get('PUBLIC_SITE_URL') || '').replace(/\/$/, '');
const json = (body: unknown, status=200) => new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const secret = Deno.env.get('YOCO_SECRET_KEY');
    if (!secret) return json({ error: 'YOCO_SECRET_KEY is not configured.' }, 503);
    const input = await req.json();
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    const auth = req.headers.get('Authorization');
    const userClient = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth || '' } } });
    const { data: { user } } = await userClient.auth.getUser();
    const { data: template } = await admin.from('templates').select('*').eq('slug', String(input.template || '')).eq('active', true).single();
    if (!template) return json({ error: 'Invalid template.' }, 400);
    const featureIds = [...new Set((input.featureIds || input.customization?.features || []).map((x: any) => typeof x === 'string' ? x : x?.id).filter(Boolean))];
    const { data: features } = await admin.from('features').select('*').in('slug', featureIds).eq('active', true);
    if (features.length !== featureIds.length) return json({ error: 'One or more selected features are invalid.' }, 400);
    const allowedPaid = features.filter((f:any) => f.is_paid);
    const totalImages = Number(input.totalImages ?? input.customization?.images?.length ?? 0);
    const extraImages = Math.max(0, totalImages - 5);
    const featureTotal = allowedPaid.reduce((sum:number, f:any) => sum + Number(f.price), 0);
    const additionalImageTotal = extraImages * 15;
    const total = Number(template.base_price) + featureTotal + additionalImageTotal;
    if (total < 2) return json({ error: 'The payment total must be at least R2.' }, 400);
    const customer = input.customer || {};
    if (!/^\S+@\S+\.\S+$/.test(String(customer.email || ''))) return json({ error: 'Please provide a valid email address.' }, 400);
    if (!customer.name || !customer.email || !customer.phone || !customer.businessName) return json({ error: 'Name, email, phone and business name are required.' }, 400);
    const clientRequestId = String(input.clientRequestId || crypto.randomUUID()).slice(0, 120);
    const { data: existing } = await admin.from('orders').select('order_reference,total_amount').eq('client_request_id', clientRequestId).eq('status', 'pending').maybeSingle();
    if (existing) return json({ orderReference: existing.order_reference, total: existing.total_amount, reused: true });
    const orderReference = `ZAP-${new Date().toISOString().slice(0,10).replaceAll('-','')}-${crypto.randomUUID().slice(0,8).toUpperCase()}`;
    const { data: order, error: oe } = await admin.from('orders').insert({ user_id: user?.id || null, order_reference: orderReference, template_id: template.id, base_price: template.base_price, feature_total: featureTotal, additional_images: extraImages, additional_image_total: additionalImageTotal, total_amount: total, currency: 'ZAR', status: 'pending', customer, customization: input.customization || {}, client_request_id: clientRequestId }).select().single();
    if (oe) return json({ error: oe.message }, 500);
    await admin.from('order_items').insert([
      { order_id: order.id, item_type: 'template', item_id: template.slug, name: template.name, quantity: 1, unit_price: template.base_price, total_price: template.base_price },
      ...allowedPaid.map((f:any) => ({ order_id: order.id, item_type: 'feature', item_id: f.slug, name: f.name, quantity: 1, unit_price: f.price, total_price: f.price })),
      ...(extraImages ? [{ order_id: order.id, item_type: 'additional_images', item_id: null, name: 'Additional images', quantity: extraImages, unit_price: 15, total_price: additionalImageTotal }] : [])
    ]);
    const successUrl = `${SITE}/payment-success.html?status=success&orderReference=${encodeURIComponent(orderReference)}`;
    const cancelUrl = `${SITE}/payment-success.html?status=cancelled&orderReference=${encodeURIComponent(orderReference)}`;
    const failureUrl = `${SITE}/payment-success.html?status=failed&orderReference=${encodeURIComponent(orderReference)}`;
    const yoco = await fetch(YOCO_ENDPOINT, { method: 'POST', headers: { Authorization: `Bearer ${secret}`, 'Content-Type': 'application/json', 'Idempotency-Key': clientRequestId }, body: JSON.stringify({ amount: Math.round(total*100), currency: 'ZAR', description: `Zapify Designs — ${template.name}`, reference: orderReference, successUrl, cancelUrl, failureUrl, metadata: { orderReference, orderId: order.id, template: template.slug, clientRequestId } }) });
    const yd = await yoco.json().catch(()=>({}));
    if (!yoco.ok) return json({ error: 'Yoco could not create the payment session.' }, 502);
    const redirectUrl = yd.redirectUrl || yd.checkoutUrl || yd.hostedUrl;
    if (!redirectUrl) return json({ error: 'Yoco did not return a payment URL.' }, 502);
    await admin.from('payments').insert({ order_id: order.id, provider: 'yoco', provider_checkout_id: yd.id || null, amount: total, currency: 'ZAR', status: 'pending' });
    return json({ redirectUrl, checkoutId: yd.id || null, orderReference, total });
  } catch (e) { console.error(e); return json({ error: 'Unable to create checkout.' }, 500); }
});
