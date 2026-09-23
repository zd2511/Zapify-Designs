import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!);
  const [{ data: templates, error: te }, { data: features, error: fe }] = await Promise.all([
    supabase.from('templates').select('*').eq('active', true).order('slug'),
    supabase.from('features').select('*').eq('active', true).order('category').order('name')
  ]);
  if (te || fe) return new Response(JSON.stringify({ error: te?.message || fe?.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  return new Response(JSON.stringify({ templates, features, imagesIncluded: 5, additionalImagePrice: 15, currency: 'ZAR' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
});
