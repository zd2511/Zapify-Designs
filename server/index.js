const express=require("express");
const cors=require("cors");
const crypto=require("crypto");
const fs=require("fs");
const path=require("path");
// Lightweight .env loader so a local `.env` works without an extra dependency.
try{
 const envFile=path.resolve(process.cwd(),".env");
 if(fs.existsSync(envFile)){
  for(const line of fs.readFileSync(envFile,"utf8").split(/\r?\n/)){
   const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
   if(m&&process.env[m[1]]===undefined)process.env[m[1]]=m[2].replace(/^['"]|['"]$/g,"");
  }
 }
}catch(e){}
const {calculateOrder,templates,allAddons}=require("./catalog");

const app=express();
const PORT=process.env.PORT||3000;
const SITE=(process.env.PUBLIC_SITE_URL||"https://zapifydesigns.co.za").replace(/\/$/,"");
const YOCO_CHECKOUT_ENDPOINT=process.env.YOCO_CHECKOUT_ENDPOINT||"https://payments.yoco.com/api/checkouts";
const ORDER_FILE=path.resolve(process.env.ORDER_STORE_PATH||"./data/orders.json");
const allowedOrigins=(process.env.CORS_ORIGIN||"*").split(",").map(v=>v.trim()).filter(Boolean);
app.use(cors({
 origin:(origin,callback)=>{
  if(!origin||allowedOrigins.includes("*")||allowedOrigins.includes(origin)) return callback(null,true);
  return callback(new Error("CORS origin not allowed"));
 }
}));

function ensureStore(){const dir=path.dirname(ORDER_FILE);if(!fs.existsSync(dir))fs.mkdirSync(dir,{recursive:true});if(!fs.existsSync(ORDER_FILE))fs.writeFileSync(ORDER_FILE,"[]")}
function readOrders(){ensureStore();return JSON.parse(fs.readFileSync(ORDER_FILE,"utf8")||"[]")}
function writeOrders(rows){ensureStore();fs.writeFileSync(ORDER_FILE,JSON.stringify(rows,null,2))}
function saveOrder(order){const rows=readOrders();rows.push(order);writeOrders(rows);return order}
function updateOrder(ref,patch){const rows=readOrders();const i=rows.findIndex(o=>o.orderReference===ref||o.checkoutId===ref);if(i<0)return null;rows[i]={...rows[i],...patch,updatedAt:new Date().toISOString()};writeOrders(rows);return rows[i]}
function safeCustomer(c={}){return {name:String(c.name||"").slice(0,160),email:String(c.email||"").slice(0,200),phone:String(c.phone||"").slice(0,80),businessName:String(c.businessName||"").slice(0,160),category:String(c.category||"").slice(0,160),description:String(c.description||"").slice(0,4000),products:String(c.products||"").slice(0,4000),notes:String(c.notes||"").slice(0,4000)}}

function verifySvix(raw,headers,secret){
 const id=headers["webhook-id"],timestamp=headers["webhook-timestamp"],signature=headers["webhook-signature"];
 if(!id||!timestamp||!signature||!secret)return false;
 const age=Math.abs(Date.now()/1000-Number(timestamp));if(!Number.isFinite(age)||age>300)return false;
 const secretValue=secret.startsWith("whsec_")?secret.slice(6):secret;
 let key;try{key=Buffer.from(secretValue,"base64")}catch{return false}
 const expected=crypto.createHmac("sha256",key).update(`${id}.${timestamp}.${raw}`).digest("base64");
 return signature.split(" ").some(part=>{const value=part.includes(",")?part.split(",")[1]:part;return value===expected});
}

// Raw-body webhook must be registered before express.json().
app.post("/api/yoco-webhook",express.raw({type:"application/json",limit:"2mb"}),(req,res)=>{
 try{
  if(!process.env.YOCO_WEBHOOK_SECRET)return res.status(503).send("Webhook verification is not configured");
  const raw=req.body.toString("utf8");
  const headers={"webhook-id":req.get("webhook-id"),"webhook-timestamp":req.get("webhook-timestamp"),"webhook-signature":req.get("webhook-signature")};
  if(!verifySvix(raw,headers,process.env.YOCO_WEBHOOK_SECRET))return res.status(401).send("Invalid signature");
  const event=JSON.parse(raw||"{}");
  const eventId=headers["webhook-id"]||event.id||null;
  const rows=readOrders();
  if(eventId&&rows.some(o=>o.webhookEventId===eventId))return res.json({received:true,duplicate:true});
  const type=String(event.type||event.eventType||event.name||"").toLowerCase();
  const data=event.data||event.payload||event;
  const metadata=data.metadata||data.checkout?.metadata||{};
  const checkoutId=data.checkoutId||data.checkout?.id||data.id;
  const orderReference=metadata.orderReference||metadata.orderId||data.reference;
  if(checkoutId||orderReference){
   const paid=type==="payment.succeeded"||type==="checkout.succeeded"||["completed","succeeded","paid","success"].includes(String(data.status||data.paymentStatus||"").toLowerCase());
   updateOrder(orderReference||checkoutId,{checkoutId,status:paid?"paid":String(data.status||type||"received").toLowerCase(),webhookEvent:type,webhookEventId:eventId,paidAt:paid?new Date().toISOString():undefined});
  }
  res.json({received:true});
 }catch(e){console.error("Yoco webhook error:",e);res.status(400).send("Bad webhook")}
});

app.use(express.json({limit:"8mb"}));
app.get("/api/health",(req,res)=>res.json({ok:true,service:"Zapify payment API"}));
app.get("/api/catalog",(req,res)=>res.json({templates,addons:allAddons,imagesIncluded:5,additionalImagePrice:15,currency:"ZAR"}));

app.post("/api/create-checkout",async(req,res)=>{
 try{
  if(!process.env.YOCO_SECRET_KEY)return res.status(503).json({error:"Payment server is not configured. Add YOCO_SECRET_KEY to the server environment."});
  const input=req.body||{};
  const clientRequestId=String(input.clientRequestId||"").slice(0,120);
  if(clientRequestId){
   const existing=readOrders().find(o=>o.clientRequestId===clientRequestId&&o.status==="pending");
   if(existing?.checkoutId)return res.json({redirectUrl:existing.redirectUrl,checkoutId:existing.checkoutId,orderReference:existing.orderReference,total:existing.total,reused:true});
  }
  let calc;try{calc=calculateOrder(input)}catch(err){return res.status(400).json({error:err.message||"Invalid order."})}
  if(calc.total<2)return res.status(400).json({error:"The payment total must be at least R2."});
  const customer=safeCustomer(input.customer);
  if(!/^\S+@\S+\.\S+$/.test(customer.email))return res.status(400).json({error:"Please provide a valid email address."});
  if(!customer.name||!customer.email||!customer.phone||!customer.businessName)return res.status(400).json({error:"Name, email, phone and business name are required."});
  const orderReference=`ZAP-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const successUrl=`${SITE}/payment-success.html?status=success&orderReference=${encodeURIComponent(orderReference)}`;
  const cancelUrl=`${SITE}/payment-success.html?status=cancelled&orderReference=${encodeURIComponent(orderReference)}`;
  const failureUrl=`${SITE}/payment-success.html?status=failed&orderReference=${encodeURIComponent(orderReference)}`;
  const amountCents=Math.round(calc.total*100);
  const payload={amount:amountCents,currency:"ZAR",description:`Zapify Designs — ${calc.templateName}`,reference:orderReference,successUrl,cancelUrl,failureUrl,metadata:{orderReference,template:calc.templateKey,clientRequestId}};
  const response=await fetch(YOCO_CHECKOUT_ENDPOINT,{signal:AbortSignal.timeout(30000),method:"POST",headers:{"Authorization":`Bearer ${process.env.YOCO_SECRET_KEY}`,"Content-Type":"application/json","Idempotency-Key":clientRequestId||orderReference},body:JSON.stringify(payload)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok){console.error("Yoco checkout creation failed",{status:response.status,body:data});return res.status(502).json({error:"Yoco could not create the payment session. Please try again or contact Zapify."})}
  const redirectUrl=data.redirectUrl||data.checkoutUrl||data.hostedUrl;
  if(!redirectUrl){console.error("Yoco checkout missing redirectUrl",{body:data});return res.status(502).json({error:"Yoco did not return a payment URL. Please try again."})}
  saveOrder({clientRequestId,orderReference,checkoutId:data.id||null,redirectUrl,status:"pending",template:calc.templateKey,templateName:calc.templateName,basePrice:calc.basePrice,additionalImages:calc.additionalImages,additionalImagePrice:calc.additionalImagePrice,featureIds:calc.featureIds,featureTotal:calc.featureTotal,total:calc.total,customer,customization:{business:input.customization?.business||"",headline:input.customization?.headline||"",services:input.customization?.services||"",about:input.customization?.about||"",cta:input.customization?.cta||"",fontFamily:input.customization?.fontFamily||"",preset:Number(input.customization?.preset||0),totalImages:calc.totalImages},createdAt:new Date().toISOString()});
  res.json({redirectUrl,checkoutId:data.id||null,orderReference,total:calc.total});
 }catch(e){console.error("Create checkout error:",e);res.status(500).json({error:"Unable to create the Yoco checkout. Please try again."})}
});

async function getYocoCheckout(checkoutId){
 const r=await fetch(`${YOCO_CHECKOUT_ENDPOINT}/${encodeURIComponent(checkoutId)}`,{headers:{"Authorization":`Bearer ${process.env.YOCO_SECRET_KEY}`}});
 const d=await r.json().catch(()=>({}));return {ok:r.ok,data:d};
}
app.get("/api/verify-checkout",async(req,res)=>{
 try{
  const id=String(req.query.checkoutId||"");if(!id)return res.status(400).json({error:"Missing checkoutId."});
  if(!process.env.YOCO_SECRET_KEY)return res.status(503).json({error:"Payment server is not configured."});
  const result=await getYocoCheckout(id);if(!result.ok)return res.status(502).json({error:"Could not verify checkout with Yoco."});
  const d=result.data;const status=String(d.status||d.paymentStatus||"").toLowerCase();const paid=["succeeded","paid","completed","success"].includes(status);
  const orderRef=d.metadata?.orderReference||d.metadata?.orderId||d.reference;
  if(orderRef)updateOrder(orderRef,{checkoutId:id,status:paid?"paid":status||"pending",yocoStatus:status,verifiedAt:new Date().toISOString()});
  const local=readOrders().find(o=>o.checkoutId===id||o.orderReference===orderRef);
  res.json({paid,checkoutId:id,orderReference:local?.orderReference||orderRef||null,templateName:local?.templateName||null,status:status||"unknown"});
 }catch(e){console.error("Verify checkout error:",e);res.status(500).json({error:"Verification failed."})}
});

app.get("/api/verify-order",async(req,res)=>{
 try{
  const orderReference=String(req.query.orderReference||"").trim();if(!orderReference)return res.status(400).json({error:"Missing order reference."});
  const local=readOrders().find(o=>o.orderReference===orderReference);if(!local)return res.status(404).json({error:"Order not found."});
  if(local.status==="paid")return res.json({paid:true,orderReference,templateName:local.templateName,status:"paid"});
  if(!local.checkoutId)return res.json({paid:false,orderReference,templateName:local.templateName,status:local.status||"pending"});
  if(!process.env.YOCO_SECRET_KEY)return res.status(503).json({error:"Payment server is not configured."});
  const result=await getYocoCheckout(local.checkoutId);if(!result.ok)return res.status(502).json({error:"Could not verify checkout with Yoco."});
  const d=result.data;const status=String(d.status||d.paymentStatus||"").toLowerCase();const paid=["succeeded","paid","completed","success"].includes(status);
  updateOrder(orderReference,{status:paid?"paid":status||"pending",yocoStatus:status,verifiedAt:new Date().toISOString()});
  res.json({paid,orderReference,templateName:local.templateName,status:status||"unknown"});
 }catch(e){console.error("Verify order error:",e);res.status(500).json({error:"Verification failed."})}
});

app.use("/data",(req,res)=>res.status(404).end());
app.use(express.static(path.resolve(__dirname,".."),{extensions:["html"],dotfiles:"ignore"}));
app.listen(PORT,()=>console.log(`Zapify payment API listening on ${PORT}`));