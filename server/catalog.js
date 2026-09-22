const templates={
  salon:{name:"Lumi Beauty",category:"Salon / Beauty",price:100},
  mechanic:{name:"Vaal Auto",category:"Automotive",price:100},
  restaurant:{name:"Casa Vero",category:"Restaurant / Café",price:100},
  photographer:{name:"Nova Studio",category:"Photography / Creative",price:100},
  construction:{name:"Build Vaal",category:"Construction",price:100},
  scrapbook:{name:"Digital Scrapbook",category:"Personal / Creative",price:100}
};
const scrapbookFeatureIds=new Set([
"custom-font","font-style","custom-palette","colour-match","custom-background","extra-page",
"custom-title","custom-date","photo-layout","frame-style","sticker-pack","decorative-elements",
"custom-cover","quote-section","memory-section","dedication-page","custom-footer","navigation-style",
"page-theme","layout-modification"
]);
function calculateOrder(input){
 const template=templates[input.template];
 if(!template) throw new Error("Unknown template.");
 const c=input.customization||{};
 const extraImages=input.template==="scrapbook" && Array.isArray(c.extraImages) ? c.extraImages.filter(Boolean).length : 0;
 const features=input.template==="scrapbook" && Array.isArray(c.features) ? c.features.map(x=>String(x.id)).filter(id=>scrapbookFeatureIds.has(id)) : [];
 const amount=template.price+(input.template==="scrapbook" ? extraImages*15+features.length*25 : 0);
 return {templateKey:input.template,templateName:template.name,basePrice:template.price,additionalImages:extraImages,featureIds:features,total:amount};
}
module.exports={templates,scrapbookFeatureIds,calculateOrder};