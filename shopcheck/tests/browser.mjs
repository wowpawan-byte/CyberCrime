import assert from 'node:assert/strict';
import {mkdir,mkdtemp,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
const require=createRequire(import.meta.url);
let playwright;
try{playwright=await import('playwright');}catch{
 const bundled=process.env.SHOPCHECK_PLAYWRIGHT||'/Users/pawanyadav/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
 try{playwright=require(bundled);}catch{throw new Error('Install Playwright for browser checks: npm install --no-save playwright && npx playwright install chromium');}
}
await mkdir('evaluation',{recursive:true});
await mkdir('work/screenshots',{recursive:true});
const profile=await mkdtemp(join(tmpdir(),'shopcheck-browser-'));
const extension=resolve('dist/shopcheck-demo');
const context=await playwright.chromium.launchPersistentContext(profile,{headless:true,channel:'chromium',...(process.env.SHOPCHECK_CHROMIUM?{executablePath:process.env.SHOPCHECK_CHROMIUM}:{}),viewport:{width:1440,height:1000},deviceScaleFactor:2,args:[`--disable-extensions-except=${extension}`,`--load-extension=${extension}`]});
const checks=[];
const errors=[];
const record=(name)=>{checks.push({name,passed:true});console.log(`PASS ${name}`);};
try{
 const [worker]=context.serviceWorkers().length?context.serviceWorkers():[await context.waitForEvent('serviceworker',{timeout:20000})];
 const extensionId=new URL(worker.url()).host;
 const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://localhost:8765');await page.evaluate(()=>document.fonts.ready);
 await page.screenshot({path:'work/screenshots/lab-desktop.png',fullPage:true});
 assert.equal(await page.locator('a.scenario').count(),3);record('Offline demo home renders with three primary scenarios');
 assert.equal(await page.locator('.wordmark').innerText(),'m\nmeadow');
 assert.ok(await page.evaluate(()=>document.fonts.check('14px Inter')&&document.fonts.check('600 30px Rajdhani')));record('Meadow branding and locally bundled font pair load');
 await page.goto('http://checkout-store.localhost:8765');await page.waitForFunction(()=>window.__shopcheckDemoResult?.verdict==='REVIEW');
 const getResult=()=>worker.evaluate(async()=>{const entries=await chrome.storage.session.get(null);return Object.values(entries).find(r=>r.domain==='checkout-store.localhost');});
 await page.waitForTimeout(1200);
 assert.equal((await getResult())?.verdict,'REVIEW');record('Installed extension inspects real local page: Review');
 const before=await getResult();assert.equal(before.demo,true);record('Demo registration is explicitly labelled');
 await page.locator('.storefront').screenshot({path:'work/screenshots/storefront-before.png'});
 await page.locator('.inspector-card').screenshot({path:'work/screenshots/review-before.png'});
 await page.getByRole('button',{name:'Proceed to checkout'}).click();
 await page.waitForFunction(()=>window.__shopcheckDemoResult?.verdict==='HIGH RISK');await page.waitForTimeout(1300);
 assert.equal((await getResult())?.verdict,'HIGH RISK');record('Mutation-driven extension rescan changes to High Risk');
 assert.equal(await page.locator('#demo-card').isDisabled(),true);record('Demo payment input is disabled');
 const card=await page.locator('#live-result').innerText();assert.ok(card.includes('HIGH RISK'));record('Shared evidence renderer shows the changed verdict');
 await page.screenshot({path:'work/screenshots/checkout-desktop.png',fullPage:true});
 const entries=await worker.evaluate(()=>chrome.storage.session.get(null));
 const tabId=Number(Object.entries(entries).find(([,v])=>v.domain==='checkout-store.localhost')[0].split(':')[1]);
 assert.equal(await worker.evaluate(id=>chrome.action.getBadgeText({tabId:id}),tabId),'!');record('Toolbar badge reflects High Risk');
 const networkBefore=await worker.evaluate(()=>chrome.storage.local.get(null));assert.ok(!Object.keys(networkBefore).some(k=>k.startsWith('age:')));record('Local demo uses no RDAP cache or external registry lookup');
 const popup=await context.newPage();popup.on('pageerror',e=>errors.push(e.message));
 await popup.goto(`chrome-extension://${extensionId}/popup.html`);await popup.evaluate(()=>document.fonts.ready);
 // A standalone popup tab becomes active itself. Render the tested tab result for visual QA.
 await popup.evaluate(async id=>{const [current]=await chrome.tabs.query({active:true,currentWindow:true});const result=await chrome.runtime.sendMessage({type:'RESULT',tabId:id});await chrome.storage.session.set({['tab:'+current.id]:result});},tabId);
 await popup.waitForTimeout(200);
 await popup.setViewportSize({width:414,height:900});await popup.screenshot({path:'work/screenshots/popup.png',fullPage:true});
 await popup.locator('.hero').screenshot({path:'work/screenshots/high-risk-summary.png'});
 await popup.locator('.evidence').screenshot({path:'work/screenshots/evidence-list.png'});
 await popup.getByText('Connection & forms',{exact:true}).click();
 await popup.locator('details.check').filter({hasText:'Connection & forms'}).screenshot({path:'work/screenshots/connection-evidence.png'});
 await popup.getByText('Connection & forms',{exact:true}).click();
 await popup.getByRole('button',{name:'Open settings'}).click();
 assert.equal(await popup.locator('#settings').isVisible(),true);
 await popup.locator('#remoteLookup').uncheck();
 assert.equal(await worker.evaluate(async()=>(await chrome.storage.local.get('settings')).settings.remoteLookup),false);
 await popup.locator('#remoteLookup').check();record('Settings open and persist registration preference');
 await popup.locator('#notifications').uncheck();await popup.locator('#notifications').check();
 await popup.screenshot({path:'work/screenshots/settings.png',fullPage:true});
 await page.goto('http://flipkart-clearance.localhost:8765');await page.waitForFunction(()=>window.__shopcheckDemoResult?.verdict==='HIGH RISK');record('Impersonation plus recent registration produces High Risk');
 await page.goto('http://honest-store.localhost:8765');await page.waitForFunction(()=>window.__shopcheckDemoResult?.verdict==='REVIEW');
 const control=await page.evaluate(()=>window.__shopcheckDemoResult);
 assert.deepEqual(control.findings.map(f=>f.id),['http-page']);record('Benign control produces only honest HTTP warning');
 await page.goto('http://new-store.localhost:8765');await page.waitForFunction(()=>window.__shopcheckDemoResult);assert.equal(await page.evaluate(()=>window.__shopcheckDemoResult.verdict),'REVIEW');record('New independent merchant is not accused of fraud');
 await page.locator('.inspector-card').screenshot({path:'work/screenshots/new-store-review.png'});
 await page.goto('http://unavailable-store.localhost:8765');await page.waitForFunction(()=>window.__shopcheckDemoResult);assert.equal(await page.evaluate(()=>window.__shopcheckDemoResult.checks.find(c=>c.id==='age').state),'unknown');record('Unavailable registry stays unknown');
 const compiled=await build({entryPoints:['extension/inspect.js'],bundle:true,write:false,format:'iife',globalName:'ShopCheckInspect'});
 await page.addScriptTag({content:compiled.outputFiles[0].text}).catch(async()=>{ // CSP blocks inline scripts; CDP evaluation executes test-only code.
  await page.evaluate(compiled.outputFiles[0].text+';window.ShopCheckInspect=ShopCheckInspect;');
 });
 const privacy=await page.evaluate(()=>{
  const secret='NEVER_EXPORT_TEST_SECRET_8127';
  const i=document.createElement('input');i.type='password';i.value=secret;document.body.append(i);
  const t=document.createElement('textarea');t.value=secret;document.body.append(t);
  const e=document.createElement('div');e.contentEditable='true';e.textContent=secret;document.body.append(e);
  return JSON.stringify(window.ShopCheckInspect.inspect(document,location.href));
 });
 assert.ok(!privacy.includes('NEVER_EXPORT_TEST_SECRET_8127'));record('DOM inspection excludes input values, textarea and editable text');
 await page.goto('http://localhost:8765');await page.setViewportSize({width:390,height:844});await page.screenshot({path:'work/screenshots/lab-mobile.png',fullPage:true});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);record('Demo home has no mobile horizontal overflow');
 await page.goto('http://checkout-store.localhost:8765');await page.waitForFunction(()=>window.__shopcheckDemoResult);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);record('Demo store has no mobile horizontal overflow');
 const live=await readFile('dist/shopcheck/background.js','utf8');assert.ok(!live.includes('Synthetic local demo fixture'));record('Live build excludes synthetic registration fixtures');
 assert.deepEqual(errors,[]);record('No uncaught page or popup JavaScript errors');
 if(process.env.SHOPCHECK_LIVE_RDAP==='1'){
  await page.route('https://example.com/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Example store</title><h1>Example store</h1><button>Add to cart</button><a href="/contact">Contact</a><a href="/returns">Returns</a><a href="/privacy">Privacy</a><a href="/shipping">Shipping</a>'}));
  await page.goto('https://example.com');
  let liveResult;for(let i=0;i<15;i++){await page.waitForTimeout(400);liveResult=await worker.evaluate(async()=>Object.values(await chrome.storage.session.get(null)).find(r=>r.domain==='example.com'));if(liveResult)break;}
  assert.equal(liveResult?.checks.find(c=>c.id==='age').state,'clear');assert.match(liveResult.checks.find(c=>c.id==='age').detail,/1995-08-14/);assert.equal(liveResult.demo,false);assert.equal(liveResult.verdict,'PASS');
  record('Live authoritative RDAP succeeds in extension worker (example.com; local test storefront)');
 }
 await writeFile('evaluation/browser-results.json',JSON.stringify({ranAt:new Date().toISOString(),browser:context.browser()?.version(),checks,claim:'Integration correctness only; not measured real-world fraud detection accuracy.'},null,2));
 console.log(`${checks.length} browser checks passed.`);
}finally{await context.close();}
