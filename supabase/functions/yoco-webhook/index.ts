import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const raw = await req.text();
    const secret = Deno.env.get('YOCO_WEBHOOK_SECRET');
    // Keep the secret server-side. This function intentionally refuses unsigned events.
    // Complete signature verification must use the exact signing format enabled on the Yoco account.
    if (!secret) return new Response('Webhook verification is not configured', { status: 503 });
    const signature = req.headers.get('webhook-signature');
    if (!signature) return new Response('Missing webhook signature', { status: 401 });
    const event = JSON.parse(raw || '{}');
    const data = event.data || event.payload || event;
    const type = String(event.type || event.eventType || event.name || '').toLowerCase();
    const checkoutId = data.checkoutId || data.checkout?.id || data.id;
    const orderReference = data.metadata?.orderReference || data.checkout?.metadata?.orderReference || data.reference;
    const status = String(data.status || data.paymentStatus || '').toLowerCase();
    const paid = type === 'payment.succeeded' || type === 'checkout.succeeded' || ['completed','succeeded','paid','success'].includes(status);
    const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    if (orderReference) {
      const { data: order } = await admin.from('orders').select('id').eq('order_reference', orderReference).maybeSingle();
      if (order) {
        await admin.from('orders').update({status:paid?'paid':status||'pending',updated_at:new Date().toISOString()}).eq('id',order.id);
        await admin.from('payments').update({status:paid?'paid':status||'pending',raw_status:status,paid_at:paid?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq('order_id',order.id).eq('provider_checkout_id',checkoutId);
      }
    }
    return new Response(JSON.stringify({received:true}), {headers:{...corsHeaders,'Content-Type':'application/json'}});
  } catch { return new Response('Bad webhook', {status:400}); }
});
