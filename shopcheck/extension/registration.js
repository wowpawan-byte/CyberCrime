import {domainInfo} from './domain.js';
import bootstrap from './rdap-bootstrap.json' with {type:'json'};
export function registryEndpoint(domain){
 const tld=domain.split('.').at(-1);
 return bootstrap.services.find(([names])=>names.includes(tld))?.[1].find(url=>url.startsWith('https://'))||null;
}
export function registrationFromRdap(data,now=Date.now()){
 const event=data.events?.find(e=>e.eventAction==='registration');
 const time=Date.parse(event?.eventDate);
 return Number.isFinite(time)&&time<=now?{status:'ok',created:new Date(time).toISOString()}:{status:'unavailable',reason:'The registry did not provide a usable creation date.'};
}
export async function fetchRegistration(domain,fetcher=fetch){
 const info=domainInfo(`https://${domain}`);
 if(!info||info.local||info.isIp||!info.isPublic||domain.endsWith('.invalid'))return {status:'unavailable',reason:'Registration lookup is not available for this local, internal or reserved address.'};
 if(info.registrationDomain!==info.domain)return {status:'unavailable',reason:'This is a hosted subdomain. The platform’s registration date cannot establish this shop’s age.'};
 const endpoint=registryEndpoint(domain);
 if(!endpoint)return {status:'unavailable',reason:'No HTTPS registration service is listed for this domain suffix.'};
 try{
  const r=await fetcher(`${endpoint}domain/${encodeURIComponent(domain)}`,{signal:AbortSignal.timeout(3500),credentials:'omit',referrerPolicy:'no-referrer'});
  if(!r.ok)return {status:'unavailable',reason:r.status===429?'The registration service is rate-limited. Try again later.':'Registration information is unavailable from the registry.'};
  return {...registrationFromRdap(await r.json()),source:'RDAP registry response'};
 }catch{return {status:'unavailable',reason:'Registration lookup timed out or the network is unavailable.'};}
}
