import {domainInfo} from './domain.js';
import {evaluate} from './engine.js';
import {defaults} from './data.js';
import {fetchRegistration} from './registration.js';
import {demoRegistration} from './demo-fixtures.js';
const pending=new Map(),revision=new Map();
const key=id=>`tab:${id}`;
async function settings(){return {...defaults,...(await chrome.storage.local.get('settings')).settings};}
async function ageFor(url,opts){
 if(__DEMO__){const fixture=demoRegistration(url);if(fixture)return fixture;}
 if(!opts.remoteLookup)return {status:'unavailable',reason:'Online registration lookup is turned off.'};
 const domain=domainInfo(url)?.domain;if(!domain)return {status:'unavailable'};
 const cacheKey=`age:${domain}`;
 const cache=(await chrome.storage.local.get(cacheKey))[cacheKey];
 if(cache&&cache.until>Date.now())return cache.result;
 if(pending.has(domain))return pending.get(domain);
 const promise=(async()=>{
  const result=await fetchRegistration(domain);
  const entries=await chrome.storage.local.get(null);
  const ages=Object.keys(entries).filter(k=>k.startsWith('age:')).sort((a,b)=>entries[a].until-entries[b].until);
  if(ages.length>=200)await chrome.storage.local.remove(ages.slice(0,ages.length-199));
  await chrome.storage.local.set({[cacheKey]:{result,until:Date.now()+(result.status==='ok'?86400000:60000)}});
  return result;
 })().finally(()=>pending.delete(domain));
 pending.set(domain,promise);return promise;
}
async function save(id,result){
 await chrome.storage.session.set({[key(id)]:result});
 const badges={'HIGH RISK':'!','REVIEW':'?','PASS':'OK','INCOMPLETE':'…','IDLE':''};
 await chrome.action.setBadgeText({tabId:id,text:badges[result.verdict]||''});
 await chrome.action.setBadgeBackgroundColor({tabId:id,color:result.verdict==='HIGH RISK'?'#e8e8e5':'#454545'});
 await chrome.action.setBadgeTextColor({tabId:id,color:result.verdict==='HIGH RISK'?'#111111':'#ffffff'});
 await chrome.action.setTitle({tabId:id,title:`Meadow · ${result.verdict}`});
}
chrome.runtime.onMessage.addListener((message,sender,reply)=>{
 (async()=>{
  if(message.type==='SETTINGS'){return settings();}
  if(message.type==='RESULT')return (await chrome.storage.session.get(key(message.tabId)))[key(message.tabId)]||null;
  if(message.type!=='SCAN'||!sender.tab||sender.frameId!==0)return null;
  const id=sender.tab.id;
  const url=sender.url;
  if(!url||!/^https?:/.test(url))return null;
  const rev=(revision.get(id)||0)+1;revision.set(id,rev);
  const facts={...message.facts,url};
  if(!facts.shopping){const result={verdict:'IDLE',domain:domainInfo(url)?.domain,reason:'No shopping activity detected.',checks:[],findings:[],coverage:[]};await save(id,result);return result;}
  const opts=await settings();
  const result=evaluate(facts,await ageFor(url,opts));
  if(revision.get(id)!==rev)return null;
  await save(id,result);
  return {...result,notify:opts.notifications};
 })().then(reply).catch(()=>reply({error:'The inspection could not finish. Refresh this page and try again.'}));
 return true;
});
chrome.tabs.onUpdated.addListener((id,change)=>{
 if(change.status==='loading'||change.url){revision.set(id,(revision.get(id)||0)+1);chrome.storage.session.remove(key(id));chrome.action.setBadgeText({tabId:id,text:''}).catch(()=>{});}
 if(change.status==='complete'||change.url&&change.status!=='loading')chrome.tabs.sendMessage(id,{type:'RESCAN'}).catch(()=>{});
});
chrome.tabs.onRemoved.addListener(id=>{revision.delete(id);chrome.storage.session.remove(key(id));});
