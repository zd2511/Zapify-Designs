const templates={
  salon:{name:'Lumi Beauty',category:'Salon / Beauty',price:100},
  mechanic:{name:'Vaal Auto',category:'Automotive',price:100},
  restaurant:{name:'Casa Vero',category:'Restaurant / Café',price:100},
  photographer:{name:'Nova Studio',category:'Photography / Creative',price:100},
  construction:{name:'Build Vaal',category:'Construction',price:100},
  scrapbook:{name:'Digital Scrapbook',category:'Personal / Creative',price:100}
};

const addonList=[
 ['premium-typography','Premium typography','A refined typography system.',25,'design','all'],
 ['custom-font-pairing','Custom font pairing','A tailored heading/body pairing.',35,'design','all'],
 ['custom-palette','Custom colour palette','Replace the preset with a bespoke palette.',25,'design','all'],
 ['advanced-background','Advanced background styling','Texture, gradients and layered backgrounds.',30,'design','all'],
 ['custom-section-style','Custom section styling','Tailored cards, dividers and section treatments.',30,'design','all'],
 ['premium-animations','Premium animations','Subtle premium motion throughout the site.',50,'design','all'],
 ['advanced-entrance','Advanced entrance animations','Scroll-based entrance choreography.',40,'design','all'],
 ['hero-image','Hero image customisation','Use and style a custom hero photograph.',25,'images','all'],
 ['advanced-crop','Advanced image positioning','Fine-tune focal point and crop.',25,'images','all'],
 ['custom-gallery','Custom gallery layout','Choose an enhanced gallery composition.',40,'images','all'],
 ['image-captions','Image captions','Add captions beneath gallery images.',15,'images','all'],
 ['lightbox','Image lightbox','Click images to open a larger gallery view.',30,'images','all'],
 ['custom-section','Additional custom section','Add one extra content section.',35,'content','all'],
 ['custom-text','Custom text section','A dedicated rich text block.',20,'content','all'],
 ['faq','FAQ section','Frequently asked questions block.',30,'content','all'],
 ['timeline','Timeline section','A chronological story/timeline.',35,'content','all'],
 ['testimonials','Testimonials section','Customer quotes and social proof.',40,'content','all'],
 ['custom-cta','Custom call-to-action','A dedicated conversion section.',30,'content','all'],
 ['rsvp','RSVP functionality','Guest response form section.',50,'functionality','all'],
 ['guest-wall','Guest message wall','Messages from visitors.',50,'functionality','all'],
 ['countdown','Countdown timer','A live countdown component.',20,'functionality','all'],
 ['contact-form','Contact form','A structured enquiry form.',30,'functionality','all'],
 ['social-links','Social links section','Dedicated social profile links.',15,'functionality','all'],
 ['maps','Google Maps/location','A location/map section.',25,'functionality','all'],
 ['calendar','Calendar/event integration','Add-to-calendar event action.',30,'functionality','all'],
 ['password','Custom password protection','Password-gated experience.',100,'privacy','all'],
 ['unlisted','Private/unlisted page','Discourage indexing and discovery.',50,'privacy','all'],
 ['remove-branding','Remove Zapify branding','Remove the standard template footer credit.',100,'premium','all'],
 ['favicon','Custom favicon','Use a custom site icon.',25,'premium','all'],
 ['custom-seo','Custom SEO title/description','Custom search metadata.',40,'premium','all'],
 ['social-image','Custom social sharing image','A custom Open Graph image.',30,'premium','all']
].map(([id,name,description,price,category,templates])=>({id,name,description,price,category,templates}));

const scrapbookFeatures=[
 ['paper-texture','Paper texture','Switch the paper grain/texture.',15],['paper-colour','Paper colour','Choose a warm paper tint.',15],['notebook-style','Notebook style','Add ruled notebook styling.',20],['torn-edges','Torn-paper edges','Ragged paper section edges.',20],['tape-decoration','Tape decoration','Layered washi tape accents.',15],['sticker-decorations','Sticker decorations','Decorative sticker badges.',20],['polaroid-photos','Polaroid-style photos','Classic white instant-photo frames.',20],['photo-shadow','Photo shadow intensity','Increase/decrease photo depth.',15],['photo-rotation','Photo rotation','Playful varied photo rotations.',15],['photo-borders','Custom photo borders','Change photo frame borders.',20],['border-thickness','Border thickness','Control frame thickness.',15],['border-colour','Border colour','Choose a custom frame colour.',15],['doodles','Doodle decorations','Hand-drawn doodle marks.',20],['handwritten-font','Handwritten font','Apply handwritten display type.',20],['handwriting-colour','Handwriting colour','Tint handwritten accents.',15],['scrapbook-background','Scrapbook background','Layer a custom scrapbook background.',25],['background-texture','Background texture','Add paper/grain texture.',20],['washi-tape','Washi tape styles','Choose tape patterns.',20],['sticker-pack','Sticker pack','Add a themed sticker collection.',25],['custom-sticker','Custom sticker upload','Reserve a custom sticker layer.',35],['photo-captions','Photo captions','Show caption cards beneath photos.',15],['caption-handwriting','Caption handwriting style','Use a handwritten caption style.',15],['journal-entries','Journal entry sections','Add journal-note cards.',30],['date-stamps','Date stamp style','Add visual date stamps.',15],['location-stamp','Location stamp','Add location label styling.',15],['memory-timeline','Memory timeline','Turn memories into a timeline.',35],['paper-layouts','Custom paper layouts','Vary page composition.',25],['photo-collage','Photo collage layouts','Use a collage arrangement.',30],['masonry-gallery','Masonry gallery','Use an offset masonry gallery.',30],['gallery-spacing','Custom gallery spacing','Adjust image rhythm/spacing.',15],['section-dividers','Page/section dividers','Add decorative dividers.',15],['corner-elements','Decorative corner elements','Add corner decorations.',15],['vintage-effect','Vintage photo effect','Warm vintage treatment.',25],['photo-grain','Photo grain','Add film grain.',20],['photo-opacity','Photo opacity','Adjust image opacity.',15],['title-style','Custom section title style','Change scrapbook title treatment.',20],['page-margins','Custom page margins','Adjust page margins.',15],['card-rotation','Custom card rotation','Vary note-card rotation.',15],['scrapbook-frame','Custom scrapbook frame','Frame the entire scrapbook.',30],['background-image','Custom background image','Use a custom background image.',35],['quote-cards','Custom quote cards','Add styled quote cards.',25],['private-sections','Hidden/private sections','Mark sections as private.',50],['guest-messages','Guest message area','Add a guest memory area.',50],['rsvp-area','Custom RSVP area','Add an RSVP panel.',50],['music-audio','Music/audio section','Add a music/audio section.',40],['scrapbook-countdown','Custom countdown','Add a scrapbook countdown.',20],['map-card','Custom map/location card','Add a memory location card.',25],['scrapbook-buttons','Custom button style','Use a custom scrapbook button treatment.',20]
].map(([id,name,description,price])=>({id,name,description,price,category:'scrapbook',templates:['scrapbook']}));

const allAddons=[...addonList,...scrapbookFeatures];
const addonMap=new Map(allAddons.map(x=>[x.id,x]));

function isValidImageData(value){
 if(typeof value!=='string') return false;
 if(!/^data:image\/(jpeg|png|webp|avif);base64,[A-Za-z0-9+/=]+$/.test(value)) return false;
 return value.length<=7_000_000;
}
function calculateOrder(input={}){
 const template=templates[input.template];
 if(!template) throw new Error('Unknown template.');
 const c=input.customization||{};
 const images=Array.isArray(c.images)?c.images.filter(Boolean):[];
 const extraImages=Array.isArray(c.extraImages)?c.extraImages.filter(Boolean):[];
 const totalImages=images.length+extraImages.length;
 if(totalImages>0 && images.some(x=>!isValidImageData(x))){throw new Error('One or more uploaded images are invalid.');}
 if(totalImages>0 && extraImages.some(x=>!isValidImageData(x))){throw new Error('One or more additional images are invalid.');}
 const additionalImages=Math.max(0,totalImages-5);
 const selectedIds=[...(Array.isArray(c.features)?c.features:[])].map(x=>typeof x==='string'?x:x?.id).filter(Boolean);
 const unique=[...new Set(selectedIds)];
 const featureIds=unique.filter(id=>{const a=addonMap.get(id);return a && (a.templates==='all'||a.templates.includes(input.template));});
 const featureTotal=featureIds.reduce((sum,id)=>sum+addonMap.get(id).price,0);
 const imageTotal=additionalImages*15;
 const amount=template.price+imageTotal+featureTotal;
 return {templateKey:input.template,templateName:template.name,basePrice:template.price,totalImages,additionalImages,additionalImagePrice:imageTotal,featureIds,featureTotal,total:amount};
}
module.exports={templates,allAddons,scrapbookFeatures,calculateOrder,addonMap,isValidImageData};
