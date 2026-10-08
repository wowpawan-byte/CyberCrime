// Only public DOM metadata is returned. Never access input.value, FormData or editable text.
export function inspect(doc,href) {
 const texts=[];
 const walker=doc.createTreeWalker(doc.body||doc.documentElement,4);
 let node,count=0,size=0;
 while((node=walker.nextNode())&&count++<12000&&size<60000){
  const p=node.parentElement;
  if(!p||p.closest('script,style,noscript,textarea,input,select,[contenteditable],[hidden],[data-shopcheck-ui]'))continue;
  const t=node.textContent.trim();if(t){texts.push(t);size+=t.length;}
 }
 const text=texts.join(' ').slice(0,60000);
 const meta=doc.querySelector('meta[property="og:site_name"]')?.content||doc.querySelector('meta[name="application-name"]')?.content||'';
 const header=doc.querySelector('header [aria-label], header .brand, header [itemprop="name"]')?.textContent?.trim()||'';
 const identity=(meta||header||doc.title.split(/[|—]/).at(-1)||'').slice(0,250);
 const forms=Array.from(doc.forms).slice(0,30).map(form=>{
  const fields=Array.from(form.querySelectorAll('input')).slice(0,60);
  const sensitive=fields.some(f=>f.type==='password'||/^cc-/.test(f.autocomplete||'')||/card.?number|credit.?card|cvv|cvc/i.test(`${f.name} ${f.id}`));
  const raw=form.getAttribute('action');
  let action=null;try{if(raw&&raw.trim()&&!raw.startsWith('#')){const u=new URL(raw,doc.baseURI||href);if(['http:','https:'].includes(u.protocol))action=u.origin;}}catch{}
  return {sensitive,action};
 });
 const orphan=Array.from(doc.querySelectorAll('input')).some(f=>!f.form&&(f.type==='password'||/^cc-/.test(f.autocomplete||'')));
 if(orphan)forms.push({sensitive:true,action:null});
 const links=Array.from(doc.querySelectorAll('a[href]')).slice(0,500).filter(a=>!a.closest('[data-shopcheck-ui]'));
 const linktext=links.filter(a=>{const h=a.getAttribute('href')||'';return h&&h!=='#'&&!h.startsWith('javascript:');}).map(a=>`${a.textContent} ${a.getAttribute('href')}`).join(' ').slice(0,30000);
 const policies={contact:/contact|about.us|mailto:/i.test(linktext),returns:/refund|return/i.test(linktext),privacy:/privacy/i.test(linktext),shipping:/shipping|delivery/i.test(linktext)};
 const paymentHints=[];
 if(/(?:pay|transfer|send).{0,35}\bUPI\b|\bUPI\b.{0,25}(?:id|payment|transfer)/i.test(text))paymentHints.push('UPI');
 if(/(?:pay|payment|transfer).{0,30}(?:bank transfer|wire transfer)|bank transfer/i.test(text))paymentHints.push('bank transfer');
 if(/(?:pay|payment|send).{0,35}(?:bitcoin|cryptocurrency|crypto)|(?:bitcoin|crypto).{0,20}only/i.test(text))paymentHints.push('cryptocurrency');
 if(/(?:pay|payment).{0,25}gift.cards/i.test(text))paymentHints.push('gift cards');
 const structured=Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).slice(0,8).some(s=>/"@type"\s*:\s*"(?:Product|Offer)"/.test(s.textContent.slice(0,30000)));
 const shopping=structured||/add to (?:cart|bag)|proceed to checkout|buy now|shopping cart/i.test(text)||forms.some(f=>f.sensitive)&&/checkout|payment|order total/i.test(text);
 return {url:new URL(href).origin,identity,shopping,forms,policies,paymentHints,iframeCount:doc.querySelectorAll('iframe').length};
}
