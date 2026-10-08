import {renderResult} from './render.js';
import {defaults} from './data.js';
let tabId;
const root=document.getElementById('result');
async function load(){
 try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});tabId=tab?.id;
  const result=tabId?await chrome.runtime.sendMessage({type:'RESULT',tabId}):null;renderResult(root,result);
  document.getElementById('footnote').textContent=result?.scannedAt?`Checked ${new Date(result.scannedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · No AI`:'Local checks · No AI';
 }catch{renderResult(root,{error:'This browser page cannot be inspected.'});}
}
chrome.storage.onChanged.addListener((changes,area)=>{if(area==='session'&&changes[`tab:${tabId}`])load();});
document.getElementById('rescan').onclick=async e=>{e.target.disabled=true;try{await chrome.tabs.sendMessage(tabId,{type:'RESCAN'});await load();}catch{renderResult(root,{error:'Refresh the shopping page once, then check again. Internal browser pages cannot be inspected.'});}finally{e.target.disabled=false;}};
const toggle=document.getElementById('settings-toggle');
function settingsOpen(open){document.getElementById('settings').hidden=!open;document.getElementById('inspection').hidden=open;toggle.setAttribute('aria-expanded',String(open));}
toggle.onclick=()=>settingsOpen(document.getElementById('settings').hidden);
document.getElementById('settings-close').onclick=()=>settingsOpen(false);
document.querySelector('.wordmark').onclick=e=>{e.preventDefault();settingsOpen(false);};
const saved={...defaults,...(await chrome.storage.local.get('settings')).settings};
for(const name of Object.keys(defaults)){const input=document.getElementById(name);input.checked=saved[name];input.onchange=async()=>{saved[name]=input.checked;await chrome.storage.local.set({settings:saved});chrome.tabs.sendMessage(tabId,{type:'RESCAN'}).catch(()=>{});};}
document.getElementById('clear-cache').onclick=async()=>{const all=await chrome.storage.local.get(null);await chrome.storage.local.remove(Object.keys(all).filter(k=>k.startsWith('age:')));document.getElementById('settings-status').textContent='Registration cache cleared.';};
load();
