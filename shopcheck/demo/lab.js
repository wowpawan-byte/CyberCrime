import {inspect} from '../extension/inspect.js';
import {evaluate} from '../extension/engine.js';
import {renderResult} from '../extension/render.js';
import {demoRegistration} from '../extension/demo-fixtures.js';
const host=location.hostname;
const fake=host==='flipkart-clearance.localhost';
const young=host==='new-store.localhost';
document.querySelector('meta[property="og:site_name"]').content=fake?'Flipkart':'Fieldwork';
document.getElementById('store-brand').textContent=fake?'Flipkart clearance.':young?'fieldwork / new.':'fieldwork.';
document.title=fake?'Clearance collection | Flipkart':'Everyday collection | Fieldwork';
if(fake){document.getElementById('price').textContent='₹299';document.getElementById('merchant-links').remove();}
document.getElementById('reset').onclick=()=>location.reload();
let renders=0;
function update(){
 const start=performance.now();
 const result=evaluate(inspect(document,location.href),demoRegistration(location.href)||{status:'unavailable'});
 renderResult(document.getElementById('live-result'),result);
 document.getElementById('update-time').textContent=`Scan ${++renders} · ${Math.max(1,Math.round(performance.now()-start))} ms`;
 window.__shopcheckDemoResult=result;
}
document.getElementById('checkout').onclick=()=>{
 const area=document.getElementById('checkout-area');area.hidden=false;area.className='checkout-panel';area.replaceChildren();
 const h=document.createElement('h2');h.textContent='Your checkout.';
 const note=document.createElement('p');note.textContent='Safe demonstration: fields are disabled. No data can be entered or transmitted.';area.append(h,note);
 if(host==='honest-store.localhost'||young||host==='unavailable-store.localhost'){
  const p=document.createElement('p');p.textContent='This sample stops before payment. No payment form is inspected or verified.';area.append(p);
 }else{
  const form=document.createElement('form');form.action='http://payment-verify.invalid/collect';form.method='post';
  const label=document.createElement('label');label.textContent='Card number · disabled demo field';label.htmlFor='demo-card';
  const input=document.createElement('input');input.id='demo-card';input.name='card-number';input.autocomplete='cc-number';input.disabled=true;input.placeholder='DEMO — no real card details';
  const button=document.createElement('button');button.type='button';button.className='secondary-button';button.textContent='Payment disabled';button.disabled=true;
  form.append(label,input,button);form.addEventListener('submit',e=>e.preventDefault());area.append(form);
  if(fake){const p=document.createElement('p');p.textContent='Payment by bank transfer only. This is a simulated instruction, not a real payment request.';area.append(p);}
 }
 update();area.scrollIntoView({behavior:'auto',block:'nearest'});
};
update();
