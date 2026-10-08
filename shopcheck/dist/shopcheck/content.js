// extension/inspect.js
function inspect(doc, href) {
  const texts = [];
  const walker = doc.createTreeWalker(doc.body || doc.documentElement, 4);
  let node, count = 0, size = 0;
  while ((node = walker.nextNode()) && count++ < 12e3 && size < 6e4) {
    const p = node.parentElement;
    if (!p || p.closest("script,style,noscript,textarea,input,select,[contenteditable],[hidden],[data-shopcheck-ui]")) continue;
    const t = node.textContent.trim();
    if (t) {
      texts.push(t);
      size += t.length;
    }
  }
  const text = texts.join(" ").slice(0, 6e4);
  const meta = doc.querySelector('meta[property="og:site_name"]')?.content || doc.querySelector('meta[name="application-name"]')?.content || "";
  const header = doc.querySelector('header [aria-label], header .brand, header [itemprop="name"]')?.textContent?.trim() || "";
  const identity = (meta || header || doc.title.split(/[|—]/).at(-1) || "").slice(0, 250);
  const forms = Array.from(doc.forms).slice(0, 30).map((form) => {
    const fields = Array.from(form.querySelectorAll("input")).slice(0, 60);
    const sensitive = fields.some((f) => f.type === "password" || /^cc-/.test(f.autocomplete || "") || /card.?number|credit.?card|cvv|cvc/i.test(`${f.name} ${f.id}`));
    const raw = form.getAttribute("action");
    let action = null;
    try {
      if (raw && raw.trim() && !raw.startsWith("#")) {
        const u = new URL(raw, doc.baseURI || href);
        if (["http:", "https:"].includes(u.protocol)) action = u.origin;
      }
    } catch {
    }
    return { sensitive, action };
  });
  const orphan = Array.from(doc.querySelectorAll("input")).some((f) => !f.form && (f.type === "password" || /^cc-/.test(f.autocomplete || "")));
  if (orphan) forms.push({ sensitive: true, action: null });
  const links = Array.from(doc.querySelectorAll("a[href]")).slice(0, 500).filter((a) => !a.closest("[data-shopcheck-ui]"));
  const linktext = links.filter((a) => {
    const h = a.getAttribute("href") || "";
    return h && h !== "#" && !h.startsWith("javascript:");
  }).map((a) => `${a.textContent} ${a.getAttribute("href")}`).join(" ").slice(0, 3e4);
  const policies = { contact: /contact|about.us|mailto:/i.test(linktext), returns: /refund|return/i.test(linktext), privacy: /privacy/i.test(linktext), shipping: /shipping|delivery/i.test(linktext) };
  const paymentHints = [];
  if (/(?:pay|transfer|send).{0,35}\bUPI\b|\bUPI\b.{0,25}(?:id|payment|transfer)/i.test(text)) paymentHints.push("UPI");
  if (/(?:pay|payment|transfer).{0,30}(?:bank transfer|wire transfer)|bank transfer/i.test(text)) paymentHints.push("bank transfer");
  if (/(?:pay|payment|send).{0,35}(?:bitcoin|cryptocurrency|crypto)|(?:bitcoin|crypto).{0,20}only/i.test(text)) paymentHints.push("cryptocurrency");
  if (/(?:pay|payment).{0,25}gift.cards/i.test(text)) paymentHints.push("gift cards");
  const structured = Array.from(doc.querySelectorAll('script[type="application/ld+json"]')).slice(0, 8).some((s) => /"@type"\s*:\s*"(?:Product|Offer)"/.test(s.textContent.slice(0, 3e4)));
  const shopping = structured || /add to (?:cart|bag)|proceed to checkout|buy now|shopping cart/i.test(text) || forms.some((f) => f.sensitive) && /checkout|payment|order total/i.test(text);
  return { url: new URL(href).origin, identity, shopping, forms, policies, paymentHints, iframeCount: doc.querySelectorAll("iframe").length };
}

// extension/content.js
var timer;
var last = "";
var highest = 0;
var notice;
var noticeTimer;
function showNotice(result) {
  const rank = result.verdict === "HIGH RISK" ? 2 : result.verdict === "REVIEW" ? 1 : 0;
  if (!result.notify || rank <= highest) return;
  highest = rank;
  clearTimeout(noticeTimer);
  notice?.remove();
  notice = document.createElement("div");
  notice.dataset.shopcheckUi = "true";
  const root = notice.attachShadow({ mode: "closed" });
  const style = document.createElement("style");
  style.textContent = `@font-face{font-family:R;src:url('${chrome.runtime.getURL("assets/Inter-Variable.ttf")}')} :host{all:initial;position:fixed;right:20px;bottom:20px;z-index:2147483647}section{box-sizing:border-box;width:300px;border:1px solid #666;border-radius:18px;background:#202020;color:#f0efec;padding:18px;font:400 14px/1.5 R,sans-serif;box-shadow:0 12px 40px #0005}strong{display:block;font-size:17px;margin:8px 28px 6px 0}small{font-size:13px;letter-spacing:2px}p{margin:0;color:#c8c8c3}button{position:absolute;right:12px;top:12px;width:30px;height:30px;border:1px solid #666;border-radius:50%;background:#303030;color:white;cursor:pointer;font-size:19px}button:focus-visible{outline:2px solid white}`;
  const box = document.createElement("section");
  box.setAttribute("role", "status");
  const label = document.createElement("small");
  label.textContent = "MEADOW";
  const title = document.createElement("strong");
  title.textContent = result.verdict === "HIGH RISK" ? "!  Check before you pay" : "?  Take a closer look";
  const p = document.createElement("p");
  p.textContent = result.reason;
  const close = document.createElement("button");
  close.textContent = "\xD7";
  close.setAttribute("aria-label", "Dismiss Meadow warning");
  close.onclick = () => notice.remove();
  box.append(label, title, p, close);
  root.append(style, box);
  document.documentElement.append(notice);
  noticeTimer = setTimeout(() => notice?.remove(), 12e3);
}
async function scan(force = false) {
  try {
    const facts = inspect(document, location.href);
    const signature = JSON.stringify(facts) + location.pathname;
    if (!force && signature === last) return;
    last = signature;
    const result = await chrome.runtime.sendMessage({ type: "SCAN", facts });
    if (result && !result.error) showNotice(result);
  } catch {
  }
}
function schedule() {
  clearTimeout(timer);
  timer = setTimeout(() => scan(), 650);
}
new MutationObserver((records) => {
  const relevant = records.some((r) => {
    if (r.target.closest?.("[data-shopcheck-ui]")) return false;
    if (r.type === "attributes") return true;
    return [...r.addedNodes, ...r.removedNodes].some((n) => !n.matches?.("[data-shopcheck-ui]"));
  });
  if (relevant) schedule();
}).observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ["action", "type", "autocomplete", "href", "content"] });
window.addEventListener("popstate", schedule);
window.addEventListener("hashchange", schedule);
document.addEventListener("click", () => setTimeout(schedule, 150));
chrome.runtime.onMessage.addListener((msg, sender, reply) => {
  if (msg.type === "RESCAN") {
    scan(true).then(() => reply({ ok: true }));
    return true;
  }
});
scan();
