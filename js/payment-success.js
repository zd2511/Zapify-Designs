const API_BASE=(window.ZAPIFY_API_BASE||'').replace(/\/$/,'');

const q=new URLSearchParams(location.search);const checkoutId=q.get('checkoutId')||sessionStorage.getItem('zapifyCheckoutId');const orderReference=q.get('orderReference')||sessionStorage.getItem('zapifyOrderReference');const status=q.get('status');
async function verify(){
 if(status==='cancelled'){statusTitle.textContent='Payment cancelled';statusText.textContent='No payment was completed. Your customisation is still available if you return to the editor.';statusCard.textContent=orderReference?`Order reference: ${orderReference}`:'No payment was recorded.';return}
 if(status==='failed'){statusTitle.textContent='Payment failed';statusText.textContent='The payment provider reported a failed payment. No paid order has been recorded.';statusCard.textContent=orderReference?`Order reference: ${orderReference}`:'Please return to the editor and try again.';return}
 if(!orderReference&&!checkoutId){statusTitle.textContent='No payment reference found';statusText.textContent='If you completed payment, contact Zapify Designs with your order reference.';return}
 try{
  const url=orderReference?'/api/verify-order?orderReference='+encodeURIComponent(orderReference):'/api/verify-checkout?checkoutId='+encodeURIComponent(checkoutId);
  const r=await fetch(API_BASE+url);const d=await r.json();
  if(d.paid){statusTitle.textContent='Payment confirmed';statusText.textContent='Your payment has been verified. Your order has been recorded.';statusCard.innerHTML=`<b>Order reference:</b> ${d.orderReference||orderReference||'Recorded'}<br><b>Template:</b> ${d.templateName||'Zapify Template'}<br><br>Zapify Designs can now use the saved customisation and customer details to prepare the purchased product.`}
  else{statusTitle.textContent='Payment not yet confirmed';statusText.textContent='The return was received, but Yoco has not confirmed payment yet. Do not submit another payment yet.';statusCard.innerHTML=`<b>Order reference:</b> ${d.orderReference||orderReference||'Recorded'}<br><br>Wait a moment and refresh this page. The server verifies the Yoco checkout before treating the order as paid.`}
 }catch(e){statusTitle.textContent='Verification unavailable';statusText.textContent='The payment verification service could not be reached. Your payment should only be treated as complete after server-side verification.';statusCard.textContent='Please keep your order reference: '+(orderReference||checkoutId)}}verify();
