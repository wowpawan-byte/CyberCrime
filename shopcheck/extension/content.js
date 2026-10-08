import {inspect} from './inspect.js';
let timer,last='',highest=0,notice,noticeTimer;
function showNotice(result){
 const rank=result.verdict==='HIGH RISK'?2:result.verdict==='REVIEW'?1:0;
 if(!result.notify||rank<=highest)return;highest=rank;
 clearTimeout(noticeTimer);notice?.remove();notice=document.createElement('div');notice.dataset.shopcheckUi='true';
 const root=notice.attachShadow({mode:'closed'});
 const style=document.createElement('style');style.textContent=`@font-face{font-family:R;src:url('${chrome.runtime.getURL('assets/Inter-Variable.ttf')}')} :host{all:initial;position:fixed;right:20px;bottom:20px;z-index:2147483647}section{box-sizing:border-box;width:300px;border:1px solid #666;border-radius:18px;background:#202020;color:#f0efec;padding:18px;font:400 14px/1.5 R,sans-serif;box-shadow:0 12px 40px #0005}strong{display:block;font-size:17px;margin:8px 28px 6px 0}small{font-size:13px;letter-spacing:2px}p{margin:0;color:#c8c8c3}button{position:absolute;right:12px;top:12px;width:30px;height:30px;border:1px solid #666;border-radius:50%;background:#303030;color:white;cursor:pointer;font-size:19px}button:focus-visible{outline:2px solid white}`;
 const box=document.createElement('section');box.setAttribute('role','status');
 const label=document.createElement('small');label.textContent='MEADOW';
 const title=document.createElement('strong');title.textContent=result.verdict==='HIGH RISK'?'!  Check before you pay':'?  Take a closer look';
 const p=document.createElement('p');p.textContent=result.reason;
 const close=document.createElement('button');close.textContent='×';close.setAttribute('aria-label','Dismiss Meadow warning');close.onclick=()=>notice.remove();
 box.append(label,title,p,close);root.append(style,box);document.documentElement.append(notice);
 noticeTimer=setTimeout(()=>notice?.remove(),12000);
}
async function scan(force=false){
 try{
  const facts=inspect(document,location.href);
  const signature=JSON.stringify(facts)+location.pathname;
  if(!force&&signature===last)return;last=signature;
  const result=await chrome.runtime.sendMessage({type:'SCAN',facts});
  if(result&&!result.error)showNotice(result);
 }catch{/* Extension may be reloaded while this page is open. */}
}
function schedule(){clearTimeout(timer);timer=setTimeout(()=>scan(),650);}
new MutationObserver(records=>{
 const relevant=records.some(r=>{
  if(r.target.closest?.('[data-shopcheck-ui]'))return false;
  if(r.type==='attributes')return true;
  return [...r.addedNodes,...r.removedNodes].some(n=>!n.matches?.('[data-shopcheck-ui]'));
 });
 if(relevant)schedule();
}).observe(document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:['action','type','autocomplete','href','content']});
window.addEventListener('popstate',schedule);window.addEventListener('hashchange',schedule);
document.addEventListener('click',()=>setTimeout(schedule,150));
chrome.runtime.onMessage.addListener((msg,sender,reply)=>{if(msg.type==='RESCAN'){scan(true).then(()=>reply({ok:true}));return true;}});
scan();
