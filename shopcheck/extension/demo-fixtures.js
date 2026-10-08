// Bundled ONLY into demo builds. No page-supplied flags or synthetic URLs.
export function demoRegistration(url,now=Date.now()) {
 const u=new URL(url);
 if(u.port!=='8765'||u.protocol!=='http:')return null;
 const ages={'honest-store.localhost':1400,'flipkart-clearance.localhost':7,'new-store.localhost':12,'checkout-store.localhost':900};
 if(u.hostname==='unavailable-store.localhost')return {status:'unavailable',reason:'Demonstration: registry unavailable.',demo:true};
 const days=ages[u.hostname];
 return days===undefined?null:{status:'ok',created:new Date(now-days*86400000).toISOString(),demo:true,source:'Synthetic local demo fixture'};
}
