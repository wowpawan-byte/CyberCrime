// extension/render.js
function el(tag, cls, text) {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (text !== void 0) n.textContent = text;
  return n;
}
function renderResult(root2, result) {
  root2.replaceChildren();
  if (!result || result.error || result.verdict === "IDLE") {
    const section = el("section", "empty");
    section.append(el("span", "orb", result?.error ? "?" : "\u2014"), el("h1", "", result?.error ? "Unable to inspect." : result ? "Nothing to inspect here." : "Open a store to begin."), el("p", "muted", result?.error || "Visit a shopping page, then open Meadow. If the page was open before installation, refresh it once."));
    root2.append(section);
    return;
  }
  const titles = { "PASS": "No major warning.", "REVIEW": "Take a closer look.", "HIGH RISK": "Check before you pay.", "INCOMPLETE": "A few unknowns." };
  const symbols = { "PASS": "\u2713", "REVIEW": "?", "HIGH RISK": "!", "INCOMPLETE": "\u2026" };
  const hero = el("section", "hero" + (result.verdict === "HIGH RISK" ? " risk" : ""));
  const top = el("div", "scan-top");
  top.append(el("span", "eyebrow", "CURRENT STORE"), el("span", "status-label", result.verdict));
  hero.append(top, el("div", "hero-domain", result.domain), el("p", "identity", result.claimedBrand ? `Page identity \xB7 ${result.claimedBrand}` : "The actual domain, beyond the storefront."));
  const verdict = el("div", "verdict");
  verdict.append(el("span", "orb", symbols[result.verdict]), el("h1", "", titles[result.verdict]));
  hero.append(verdict);
  hero.append(el("p", "verdict-copy", result.reason));
  if (result.verdict === "HIGH RISK") hero.append(el("p", "guidance", "Pause before entering personal or payment details."));
  root2.append(hero);
  if (result.demo) root2.append(el("div", "demo-tag", "LOCAL DEMO \xB7 Registration data is simulated. Other checks inspect this page."));
  const evidence = el("section", "evidence");
  const heading = el("div", "evidence-head");
  heading.append(el("span", "eyebrow", "THE EVIDENCE"), el("span", "count", `${result.checks.length} checks`));
  evidence.append(heading);
  for (const c of result.checks) {
    const detail = el("details", `check ${c.state}`), summary = el("summary");
    const icon = el("span", "check-icon", c.state === "warning" ? "!" : c.state === "unknown" ? "?" : "\u2713");
    icon.setAttribute("aria-hidden", "true");
    summary.append(icon, el("span", "", c.label), el("span", "check-state", c.state === "warning" ? "REVIEW" : c.state === "unknown" ? "UNKNOWN" : "CHECKED"), el("span", "chevron", "\u203A"));
    const body = el("div", "check-body");
    for (const note of c.notes || []) body.append(el("p", "finding", note));
    body.append(el("p", "", c.detail));
    detail.append(summary, body);
    evidence.append(detail);
  }
  root2.append(evidence);
  const coverage = el("details", "coverage");
  coverage.append(el("summary", "", "What this check can tell you \u2197"));
  for (const text of result.coverage || []) coverage.append(el("p", "", text));
  coverage.append(el("p", "", "A clear result is not a guarantee that an order will be delivered."));
  root2.append(coverage);
}

// extension/data.js
var brands = [
  ["Amazon", ["amazon.com", "amazon.in", "amazon.co.uk", "amazon.de", "amazon.co.jp"]],
  ["Flipkart", ["flipkart.com"]],
  ["Myntra", ["myntra.com"]],
  ["Meesho", ["meesho.com"]],
  ["Ajio", ["ajio.com"]],
  ["Nykaa", ["nykaa.com", "nykaafashion.com"]],
  ["Tata CLiQ", ["tatacliq.com", "tatacliqluxury.com"]],
  ["Croma", ["croma.com"]],
  ["Reliance Digital", ["reliancedigital.in"]],
  ["Snapdeal", ["snapdeal.com"]],
  ["Apple", ["apple.com"]],
  ["Samsung", ["samsung.com"]],
  ["Nike", ["nike.com"]],
  ["Adidas", ["adidas.com", "adidas.co.in"]],
  ["Puma", ["puma.com"]],
  ["Reebok", ["reebok.com", "reebok.in"]],
  ["IKEA", ["ikea.com"]],
  ["Decathlon", ["decathlon.com", "decathlon.in"]],
  ["Zara", ["zara.com"]],
  ["Uniqlo", ["uniqlo.com"]],
  ["H&M", ["hm.com"]],
  ["Walmart", ["walmart.com"]],
  ["eBay", ["ebay.com", "ebay.co.uk"]],
  ["Etsy", ["etsy.com"]],
  ["Target", ["target.com"]],
  ["Best Buy", ["bestbuy.com"]],
  ["Costco", ["costco.com"]],
  ["ASOS", ["asos.com"]],
  ["Sephora", ["sephora.com", "sephora.in"]],
  ["Temu", ["temu.com"]],
  ["AliExpress", ["aliexpress.com"]],
  ["Lenovo", ["lenovo.com"]],
  ["Dell", ["dell.com"]],
  ["Sony", ["sony.com", "sony.co.in"]],
  ["HP", ["hp.com"]],
  ["Bose", ["bose.com"]],
  ["Dyson", ["dyson.com", "dyson.in"]],
  ["LEGO", ["lego.com"]],
  ["New Balance", ["newbalance.com"]],
  ["Under Armour", ["underarmour.com", "underarmour.in"]]
].map(([name, domains]) => ({ name, domains }));
var defaults = { remoteLookup: true, notifications: true };

// extension/popup.js
var tabId;
var root = document.getElementById("result");
async function load() {
  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = tab?.id;
    const result = tabId ? await chrome.runtime.sendMessage({ type: "RESULT", tabId }) : null;
    renderResult(root, result);
    document.getElementById("footnote").textContent = result?.scannedAt ? `Checked ${new Date(result.scannedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} \xB7 No AI` : "Local checks \xB7 No AI";
  } catch {
    renderResult(root, { error: "This browser page cannot be inspected." });
  }
}
chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "session" && changes[`tab:${tabId}`]) load();
});
document.getElementById("rescan").onclick = async (e) => {
  e.target.disabled = true;
  try {
    await chrome.tabs.sendMessage(tabId, { type: "RESCAN" });
    await load();
  } catch {
    renderResult(root, { error: "Refresh the shopping page once, then check again. Internal browser pages cannot be inspected." });
  } finally {
    e.target.disabled = false;
  }
};
var toggle = document.getElementById("settings-toggle");
function settingsOpen(open) {
  document.getElementById("settings").hidden = !open;
  document.getElementById("inspection").hidden = open;
  toggle.setAttribute("aria-expanded", String(open));
}
toggle.onclick = () => settingsOpen(document.getElementById("settings").hidden);
document.getElementById("settings-close").onclick = () => settingsOpen(false);
document.querySelector(".wordmark").onclick = (e) => {
  e.preventDefault();
  settingsOpen(false);
};
var saved = { ...defaults, ...(await chrome.storage.local.get("settings")).settings };
for (const name of Object.keys(defaults)) {
  const input = document.getElementById(name);
  input.checked = saved[name];
  input.onchange = async () => {
    saved[name] = input.checked;
    await chrome.storage.local.set({ settings: saved });
    chrome.tabs.sendMessage(tabId, { type: "RESCAN" }).catch(() => {
    });
  };
}
document.getElementById("clear-cache").onclick = async () => {
  const all = await chrome.storage.local.get(null);
  await chrome.storage.local.remove(Object.keys(all).filter((k) => k.startsWith("age:")));
  document.getElementById("settings-status").textContent = "Registration cache cleared.";
};
load();
