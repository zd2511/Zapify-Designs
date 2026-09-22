const express=require("express");
const cors=require("cors");
const crypto=require("crypto");
const fs=require("fs");
const path=require("path");
const {calculateOrder}=require("./catalog");

const app=express();
const PORT=process.env.PORT||3000;
const SITE=(process.env.PUBLIC_SITE_URL||"https://zapifydesigns.co.za").replace(/\/$/,"");
const ORDER_FILE=path.resolve(process.env.ORDER_STORE_PATH||"./data/orders.json");
const allowedOrigin=process.env.CORS_ORIGIN||"*";

app.use(cors({origin:allowedOrigin==="*"?"*":allowedOrigin}));

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
  const raw=req.body.toString("utf8");
  const headers={"webhook-id":req.get("webhook-id"),"webhook-timestamp":req.get("webhook-timestamp"),"webhook-signature":req.get("webhook-signature")};
  if(process.env.YOCO_WEBHOOK_SECRET && !verifySvix(raw,headers,process.env.YOCO_WEBHOOK_SECRET))return res.status(401).send("Invalid signature");
  const event=JSON.parse(raw||"{}");const type=event.type||event.eventType||"";const data=event.data||event;
  const checkoutId=data.checkoutId||data.checkout?.id;const orderReference=data.metadata?.orderReference||data.metadata?.orderId;
  if(checkoutId||orderReference){const paid=type==="payment.succeeded"||["succeeded","paid","completed"].includes(String(data.status||"").toLowerCase());updateOrder(orderReference||checkoutId,{checkoutId,status:paid?"paid":String(data.status||type||"received").toLowerCase(),webhookEvent:type,paidAt:paid?new Date().toISOString():undefined})}
  res.json({received:true});
 }catch(e){console.error(e);res.status(400).send("Bad webhook")}
});

app.use(express.json({limit:"8mb"}));
app.get("/api/health",(req,res)=>res.json({ok:true,service:"Zapify payment API"}));

app.post("/api/create-checkout",async(req,res)=>{
 try{
  if(!process.env.YOCO_SECRET_KEY)return res.status(503).json({error:"Payment server is not configured with YOCO_SECRET_KEY."});
  const input=req.body||{};const calc=calculateOrder(input);const customer=safeCustomer(input.customer);
  if(!customer.name||!customer.email||!customer.phone||!customer.businessName)return res.status(400).json({error:"Name, email, phone and business name are required."});
  const orderReference=`ZAP-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  const payload={amount:Math.round(calc.total*100),currency:"ZAR",description:`Zapify Designs — ${calc.templateName}`,successUrl:`${SITE}/payment-success.html`,cancelUrl:`${SITE}/payment-success.html?status=cancelled`,failureUrl:`${SITE}/payment-success.html?status=failed`,metadata:{orderReference,template:calc.templateKey},lineItems:[{name:calc.templateName,quantity:1,amount:Math.round(calc.total*100),currency:"ZAR"}]};
  const response=await fetch("https://payments.yoco.com/api/checkouts",{method:"POST",headers:{"Authorization":`Bearer ${process.env.YOCO_SECRET_KEY}`,"Content-Type":"application/json","Idempotency-Key":orderReference},body:JSON.stringify(payload)});
  const data=await response.json().catch(()=>({}));
  if(!response.ok||!data.redirectUrl)return res.status(502).json({error:"Yoco did not return a checkout URL.",providerStatus:response.status});
  saveOrder({orderReference,checkoutId:data.id||null,status:"pending",template:calc.templateKey,templateName:calc.templateName,basePrice:calc.basePrice,additionalImages:calc.additionalImages,featureIds:calc.featureIds,total:calc.total,customer,customization:{business:input.customization?.business||"",headline:input.customization?.headline||"",services:input.customization?.services||"",about:input.customization?.about||"",cta:input.customization?.cta||"",fontFamily:input.customization?.fontFamily||"",preset:Number(input.customization?.preset||0)},createdAt:new Date().toISOString()});
  res.json({redirectUrl:data.redirectUrl,checkoutId:data.id||null,orderReference,total:calc.total});
 }catch(e){console.error(e);res.status(500).json({error:"Unable to create checkout."})}
});

async function getYocoCheckout(checkoutId){
 const r=await fetch(`https://payments.yoco.com/api/checkouts/${encodeURIComponent(checkoutId)}`,{headers:{"Authorization":`Bearer ${process.env.YOCO_SECRET_KEY}`}});
 const d=await r.json().catch(()=>({}));return {ok:r.ok,data:d};
}
app.get("/api/verify-checkout",async(req,res)=>{
 try{
  const id=String(req.query.checkoutId||"");if(!id)return res.status(400).json({error:"Missing checkoutId."});if(!process.env.YOCO_SECRET_KEY)return res.status(503).json({error:"Payment server is not configured."});
  const result=await getYocoCheckout(id);if(!result.ok)return res.status(502).json({error:"Could not verify checkout with Yoco."});
  const d=result.data;const status=String(d.status||d.paymentStatus||"").toLowerCase();const paid=["succeeded","paid","completed","success"].includes(status);
  const orderRef=d.metadata?.orderReference||d.metadata?.orderId;if(orderRef)updateOrder(orderRef,{status:paid?"paid":status||"pending",yocoStatus:status,verifiedAt:new Date().toISOString()});
  const local=readOrders().find(o=>o.checkoutId===id||o.orderReference===orderRef);
  res.json({paid,checkoutId:id,orderReference:local?.orderReference||orderRef||null,templateName:local?.templateName||null,status:status||"unknown"});
 }catch(e){console.error(e);res.status(500).json({error:"Verification failed."})}
});

app.use("/data",(req,res)=>res.status(404).end());
app.use(express.static(path.resolve(__dirname,".."),{extensions:["html"],dotfiles:"ignore"}));
app.listen(PORT,()=>console.log(`Zapify payment API listening on ${PORT}`));