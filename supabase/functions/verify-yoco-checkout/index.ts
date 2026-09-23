import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
const ENDPOINT = Deno.env.get('YOCO_CHECKOUT_ENDPOINT') || 'https://payments.yoco.com/api/checkouts';
Deno.serve(async req => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const url = new URL(req.url); const checkoutId = url.searchParams.get('checkoutId');
  if (!checkoutId) return new Response(JSON.stringify({error:'Missing checkoutId.'}), {status:400,headers:{...corsHeaders,'Content-Type':'application/json'}});
  const secret = Deno.env.get('YOCO_SECRET_KEY'); if (!secret) return new Response(JSON.stringify({error:'Payment server is not configured.'}), {status:503,headers:{...corsHeaders,'Content-Type':'application/json'}});
  const r = await fetch(`${ENDPOINT}/${encodeURIComponent(checkoutId)}`, { headers: { Authorization: `Bearer ${secret}` } });
  const d = await r.json().catch(()=>({})); if (!r.ok) return new Response(JSON.stringify({error:'Could not verify checkout with Yoco.'}), {status:502,headers:{...corsHeaders,'Content-Type':'application/json'}});
  const status = String(d.status || d.paymentStatus || '').toLowerCase(); const paid = ['succeeded','paid','completed','success'].includes(status);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const orderReference = d.metadata?.orderReference || d.reference;
  if (orderReference) { const { data: order } = await admin.from('orders').select('id').eq('order_reference',orderReference).maybeSingle(); if(order) { await admin.from('orders').update({status:paid?'paid':status||'pending',updated_at:new Date().toISOString()}).eq('id',order.id); await admin.from('payments').update({status:paid?'paid':status||'pending',raw_status:status,paid_at:paid?new Date().toISOString():null,updated_at:new Date().toISOString()}).eq('order_id',order.id).eq('provider_checkout_id',checkoutId); } }
  return new Response(JSON.stringify({paid,checkoutId,orderReference,status:status||'unknown'}), {headers:{...corsHeaders,'Content-Type':'application/json'}});
});
