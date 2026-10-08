function el(tag,cls,text){const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;}
export function renderResult(root,result){
 root.replaceChildren();
 if(!result||result.error||result.verdict==='IDLE'){
  const section=el('section','empty');section.append(el('span','orb',result?.error?'?':'—'),el('h1','',result?.error?'Unable to inspect.':result?'Nothing to inspect here.':'Open a store to begin.'),el('p','muted',result?.error||'Visit a shopping page, then open Meadow. If the page was open before installation, refresh it once.'));
  root.append(section);return;
 }
 const titles={'PASS':'No major warning.','REVIEW':'Take a closer look.','HIGH RISK':'Check before you pay.','INCOMPLETE':'A few unknowns.'};
 const symbols={'PASS':'✓','REVIEW':'?','HIGH RISK':'!','INCOMPLETE':'…'};
 const hero=el('section','hero'+(result.verdict==='HIGH RISK'?' risk':''));
 const top=el('div','scan-top');top.append(el('span','eyebrow','CURRENT STORE'),el('span','status-label',result.verdict));
 hero.append(top,el('div','hero-domain',result.domain),el('p','identity',result.claimedBrand?`Page identity · ${result.claimedBrand}`:'The actual domain, beyond the storefront.'));
 const verdict=el('div','verdict');verdict.append(el('span','orb',symbols[result.verdict]),el('h1','',titles[result.verdict]));hero.append(verdict);
 hero.append(el('p','verdict-copy',result.reason));
 if(result.verdict==='HIGH RISK')hero.append(el('p','guidance','Pause before entering personal or payment details.'));
 root.append(hero);
 if(result.demo)root.append(el('div','demo-tag','LOCAL DEMO · Registration data is simulated. Other checks inspect this page.'));
 const evidence=el('section','evidence');const heading=el('div','evidence-head');heading.append(el('span','eyebrow','THE EVIDENCE'),el('span','count',`${result.checks.length} checks`));evidence.append(heading);
 for(const c of result.checks){
  const detail=el('details',`check ${c.state}`),summary=el('summary');
  const icon=el('span','check-icon',c.state==='warning'?'!':c.state==='unknown'?'?':'✓');icon.setAttribute('aria-hidden','true');
  summary.append(icon,el('span','',c.label),el('span','check-state',c.state==='warning'?'REVIEW':c.state==='unknown'?'UNKNOWN':'CHECKED'),el('span','chevron','›'));
  const body=el('div','check-body');for(const note of c.notes||[])body.append(el('p','finding',note));body.append(el('p','',c.detail));
  detail.append(summary,body);evidence.append(detail);
 }
 root.append(evidence);
 const coverage=el('details','coverage');coverage.append(el('summary','','What this check can tell you ↗'));
 for(const text of result.coverage||[])coverage.append(el('p','',text));coverage.append(el('p','','A clear result is not a guarantee that an order will be delivered.'));root.append(coverage);
}
