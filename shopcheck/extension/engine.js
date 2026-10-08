import {domainInfo,editDistance} from './domain.js';
import {brands,paymentDomains,categories} from './data.js';
const clean=s=>(s||'').toLowerCase().replace(/[^a-z0-9]/g,'');
function containsName(text,name) {return new RegExp('(^|[^a-z0-9])'+name.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'([^a-z0-9]|$)','i').test(text);}
export function evaluate(facts,registration={status:'unavailable'},now=Date.now()) {
 const info=domainInfo(facts.url);
 if(!info)return {verdict:'INCOMPLETE',reason:'This address cannot be inspected.',checks:[],findings:[],coverage:[],domain:'Unsupported page'};
 const checks=categories.map(([id,label])=>({id,label,state:'clear',detail:'',notes:[]}));
 const findings=[];
 const get=id=>checks.find(c=>c.id===id);
 const add=(id,code,level,group,text)=>{findings.push({id:code,category:id,level,group,text});get(id).state='warning';get(id).notes.push(text);};
 get('domain').detail=`${info.domain} is the actual site domain.`;
 const identity=(facts.identity||'').slice(0,500);
 const claimed=brands.find(b=>containsName(identity,b.name));
 const official=brands.find(b=>b.domains.includes(info.domain));
 let deceptive=false;
 for(const b of brands){
  if(b.domains.includes(info.domain))continue;
  const key=clean(b.name);if(key.length<4)continue;
  const stem=info.domain.split('.')[0];
  const labels=info.host.split(/[.\-]/).filter(Boolean);
  const normalized=stem.replace(/0/g,'o').replace(/1/g,'i');
  const brandInSub=info.host!==info.domain&&info.host.slice(0,-info.domain.length).split(/[.\-]/).includes(key);
  const exact=labels.includes(key)||normalized===key;
  const typo=stem.length>=5&&Math.abs(stem.length-key.length)<=1&&editDistance(stem,key)===1;
  if(exact||typo||brandInSub){
   const identityMatch=claimed?.name===b.name;
   add('brand','brand-lookalike','strong','identity',`${info.host} resembles ${b.name}, but is outside the listed ${b.name} domains.`);
   if(identityMatch){get('brand').notes.push(`The store identity also names ${b.name}.`);deceptive=true;}
   break;
  }
 }
 get('brand').detail=official?`Domain matches our ${official.name} reference entry. This does not verify every seller.`:claimed?`Page identity mentions ${claimed.name}; authorisation is not verified.`:'No covered-brand impersonation pattern found. Catalogue coverage is limited.';
 if(claimed&&!official&&!get('brand').notes.length)add('brand','unverified-brand','support','identity',`The store identity mentions ${claimed.name} on another domain. It may be a reseller; this alone is not impersonation.`);
 if(registration.status==='ok'){
  const age=Math.floor((now-Date.parse(registration.created))/86400000);
  if(Number.isFinite(age)&&age>=0){
   get('age').detail=`Registered ${registration.created.slice(0,10)} · ${age.toLocaleString('en')} days ago. Registration age is not shop age.`;
   if(age<30)add('age','young-domain','strong','registration','This domain was registered less than 30 days ago.');
   else if(age<180)add('age','recent-domain','support','registration','This domain was registered less than 180 days ago.');
  }else{get('age').state='unknown';get('age').detail='The registration date could not be interpreted.';}
 }else{get('age').state='unknown';get('age').detail=registration.reason||'Registration information is unavailable.';}
 get('url').detail='No covered address-deception pattern found.';
 if(info.isIp)add('url','ip-host','support','identity','The page uses an IP address instead of a domain name.');
 if(info.host.includes('xn--'))add('url','idn-host','support','identity','Internationalised address: inspect the domain carefully. International characters alone are not suspicious.');
 if(info.host.length>80||(info.host.match(/-/g)||[]).length>4||info.host.split('.').length>6)add('url','complex-host','support','identity','The address is unusually complex. Complexity alone does not establish fraud.');
 get('connection').detail=info.protocol==='https:'?'Page address uses HTTPS. Encryption does not verify the seller.':'Page address uses HTTP.';
 const forms=facts.forms||[];
 const sensitive=forms.filter(f=>f.sensitive);
 if(info.protocol!=='https:')add('connection','http-page',sensitive.length?'critical':'support','transport',sensitive.length?'Sensitive fields are displayed on an HTTP page. Do not enter payment or login information.':'This page is delivered over HTTP.');
 for(const form of sensitive){
  if(!form.action){if(get('payment').state!=='warning')get('payment').state='unknown';continue;}
  const dest=domainInfo(form.action);
  if(dest?.protocol==='http:')add('connection','http-action','critical','transport',`A sensitive form points to an unencrypted destination: ${dest.host}.`);
  if(dest&&dest.domain!==info.domain&&!paymentDomains.includes(dest.domain))add('payment','external-action','strong','payment',`A sensitive form declares an unfamiliar destination: ${dest.domain}. Its legitimacy is unverified.`);
 }
 const paymentHints=facts.paymentHints||[];
 if(paymentHints.length)add('payment','payment-instructions','support','payment',`Visible payment instructions mention ${paymentHints.join(', ')}. Account ownership and other available methods are not verified.`);
 get('payment').detail=sensitive.length?'Only declared HTML form destinations are checked; script-driven transfers and provider legitimacy are not verified.':'No inspectable sensitive payment form found on this page. This does not establish payment safety.';
 if(facts.iframeCount>0){get('payment').detail+=' Embedded frames were not inspected.';if(get('payment').state==='clear')get('payment').state='unknown';}
 get('merchant').detail='Policy/contact links are presence checks only; business identity and policy content are not verified.';
 const missing=['contact','returns','privacy','shipping'].filter(x=>!facts.policies?.[x]);
 if(missing.length>=2)add('merchant','missing-links','support','merchant',`Not found on this page: ${missing.join(', ')}.`);
 else get('merchant').notes.push('Basic contact and policy links were found on this page.');
 const strong=new Set(findings.filter(f=>f.level==='strong').map(f=>f.group));
 const high=findings.some(f=>f.level==='critical')||(deceptive&&strong.has('registration'))||(strong.has('identity')&&strong.has('payment'));
 const verdict=high?'HIGH RISK':findings.length?'REVIEW':checks.some(c=>c.state==='unknown')?'INCOMPLETE':'PASS';
 const priority={critical:0,strong:1,support:2};
 const ordered=[...findings].sort((a,b)=>priority[a.level]-priority[b.level]);
 return {verdict,domain:info.domain,host:info.host,claimedBrand:claimed?.name||null,officialBrand:official?.name||null,
  reason:ordered[0]?.text||(verdict==='INCOMPLETE'?'Some checks could not be completed.':'No major warning found in the checks performed.'),
  checks,findings:ordered,shopping:!!facts.shopping,demo:!!registration.demo,scannedAt:now,
  coverage:['First-pass inspection of the current page only.','No threat feeds, business verification, delivery guarantees or JavaScript network tracing.',...(facts.iframeCount?['Embedded payment frames were not inspected.']:[])],
  registrationSource:registration.source||null};
}
