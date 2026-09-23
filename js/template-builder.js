(function(){
  // Compatibility builder retained for older integrations. The customizer now loads the
  // real template HTML directly, so this function is only a fallback API.
  const names=['salon','mechanic','restaurant','photographer','construction','scrapbook'];
  function build(name){
    const safe=names.includes(name)?name:'salon';
    return '<!doctype html><html><head><meta charset="utf-8"><title>Zapify Template</title></head><body><p>Loading template…</p><script>location.replace("templates/'+safe+'.html")<\\/script></body></html>';
  }
  window.ZAPIFY_TEMPLATE_BUILDER={build,content:{}};
})();