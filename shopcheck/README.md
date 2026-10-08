# Meadow

Seven transparent checks for online stores. No AI. No account. No API key.

Meadow is a Manifest V3 extension for Chrome and Edge. It inspects the current shopping page, shows the actual domain, and explains the evidence behind **Pass**, **Review**, **High Risk**, or **Incomplete**. The interface uses locally bundled Rajdhani for branding and headings, Inter for reading, charcoal surfaces, soft corners and monochrome symbols.

Version 1.1 renames ShopCheck to Meadow. Existing `dist/shopcheck` and `dist/shopcheck-demo` paths remain stable: reload the installed extension at `chrome://extensions`, then refresh open pages. The latest six-slide technical presentation and timed guide are in the sibling `../meadow-review` folder.

## Start here

The prebuilt extensions are ready to install. No npm install or build step is needed to use them.

1. Open `chrome://extensions` in Chrome or `edge://extensions` in Edge.
2. Turn on **Developer mode**, select **Load unpacked**, and choose `dist/shopcheck`.
3. Pin Meadow from the browser's Extensions menu.
4. Open a shopping page. Refresh pages that were already open when you installed the extension.
5. Click the Meadow icon to inspect the seven evidence rows. Each row expands to explain its finding.

Automatic inspection requires permission to read pages on HTTP/HTTPS sites. Chrome displays a broad site-access warning because this extension runs on shopping pages without requiring a click. Internal browser pages, the extension store and unsupported browser surfaces cannot be inspected. Incognito is not enabled by default.

## Run the offline demo

Requires Node.js 20 or newer. It has no runtime npm dependencies.

```sh
cd /path/to/shopcheck
npm run demo
```

Open **http://localhost:8765**. The server listens only on `127.0.0.1`. Stop it with Ctrl+C. Five scenarios are included:

| Scenario | What it demonstrates |
| --- | --- |
| Checkout reveal | Review → High Risk when an insecure sensitive form appears |
| Identity mismatch | A recent domain imitates Flipkart |
| Control store | Consistent identity and policies; HTTP warning is still shown |
| New independent shop | Newness alone is not fraud |
| Registry unavailable | Missing registration data remains Unknown |

The demo page has a labelled **Live engine preview** using the same inspector, rule engine and evidence renderer as the extension. This is useful on a projector without repeatedly opening the toolbar. It is not presented as browser protection.

To demonstrate the actual browser badge and popup, load **`dist/shopcheck-demo`** instead of the live build. Disable the other Meadow build while demonstrating. The demo extension alone contains synthetic registration dates for five exact `*.localhost:8765` origins. The live build contains no synthetic registration fixtures. Never present demo fixtures as live internet intelligence.

The demo uses HTTP, so its control site honestly shows Review. HTTPS is not simulated and no risk rule is bypassed. A Pass result is covered by HTTPS engine tests; we do not weaken the checks to manufacture a green local demo.

Payment fields are disabled, the server rejects non-GET requests, and Content Security Policy prevents form submission. No malicious site or real transaction is involved.

## What the checks mean

| Check | Implementation | Limit |
| --- | --- | --- |
| Actual domain | Bundled Public Suffix List parser, including hosted tenant suffixes | Domain identification does not establish ownership |
| Store identity | 40 reference brands, metadata/title/header identity, hostname tokens and edit distance | Catalogue is deliberately limited; resellers are not automatically impersonators |
| Registration age | Optional domain-only RDAP request, 3.5-second abort, 24-hour success cache | Registration date is not shop age; hosted subdomains cannot borrow platform age |
| Address structure | IP host, internationalised address, excessive address complexity | These are review clues, not proof of fraud |
| Connection & forms | HTTP/HTTPS page address and declared sensitive form destinations | No certificate audit or JavaScript traffic tracing |
| Payment context | Unfamiliar form destination and explicit visible payment instructions | UPI ownership, provider safety and payment exclusivity are not inferred |
| Merchant information | Contact, returns, privacy and shipping link presence | Presence is not business verification; policy content is not crawled |

**High Risk:** an HTTP page with sensitive fields, an unencrypted sensitive form destination, a deceptive covered-brand identity plus recent registration, or a deceptive brand hostname plus an unfamiliar sensitive-form destination.

**Review:** observed warning evidence without a High Risk combination. Newness, UPI, policy gaps and international characters alone never establish High Risk.

**Incomplete:** no warnings were found but registration or inspectable payment evidence is unavailable. A known warning retains Review/High Risk even when other checks fail.

**Pass:** no major warning was found in the checks performed. It is not a guarantee of legitimacy or delivery.

Warnings are non-blocking, dismissible, disappear after 12 seconds, and appear at most once per increasing risk level per document. Turn off on-page warnings in settings while keeping the toolbar badge and evidence panel.

## Privacy and storage

Page inspection and rule evaluation happen on the device. Input values, textareas, select controls and editable text are excluded. Form metadata and declared destination origins are inspected; payment details are never read.

When enabled, the authoritative RDAP registry receives the registrable domain and normal network metadata including your IP address. A bundled IANA bootstrap directory selects the HTTPS registry endpoint without contacting an intermediary. No page path, query string, form value or page content is sent. Local/private addresses and hosted tenant subdomains do not generate a lookup. Unsupported registries produce Unknown; update the bundled directory when maintaining the project.

Local storage holds preferences and up to 200 domain registration cache entries. Successful entries last 24 hours; failures last one minute. Clear them in settings. The cache contains visited domain names, so it is not anonymous storage. Per-tab evidence lives in session storage, is cleared on navigation/tab close, and is not a permanent browsing log. There is no telemetry.

## Build and test

```sh
npm ci
npm run build
npm test
```

`dist/shopcheck` is the live build; `dist/shopcheck-demo` is the isolated demo build. Fonts, parser and all JavaScript are bundled locally. Build dependencies are esbuild and tldts; they are not remote runtime services.

For integration tests, keep `npm run demo` running in a separate terminal and install Playwright/Chromium:

```sh
npm install --no-save playwright
npx playwright install chromium
npm run test:browser
```

`SHOPCHECK_CHROMIUM` can point to an existing Chrome for Testing executable; `SHOPCHECK_PLAYWRIGHT` can point to an installed Playwright module. Tests use an isolated temporary profile and do not modify your regular Chrome profile.

See `evaluation/browser-results.json` for the actual integration run and `evaluation/RESULTS.md` for interpretation. Synthetic tests demonstrate implementation correctness, not measured real-world detection accuracy. The earlier proposed 80%/90% targets are not claimed results.

## Project layout

```text
extension/    Inspector, domain parser wrapper, rules, worker and popup
demo/         Local server, store scenarios and shared-engine preview
scripts/      Reproducible extension/lab build and packaging
tests/        Rule, privacy, rendering and integration checks
dist/         Ready-to-load live and demo extensions
evaluation/   Actual verification results
docs/         Design rationale, architecture and demo script
```

## Design contribution

Meadow packages established checks around domain identity, registration and transaction evidence. It groups correlated signals, preserves uncertainty, and explains the decision without a numerical trust score. This is the project's engineering contribution; it is not a claim that these methods or their ordering have never existed before.

## Known limits

This is a first-pass current-page screening tool. It cannot establish seller authorisation, bank-account ownership, product delivery, or a site's full payment flow. It does not inspect JavaScript exfiltration, shadow DOM, inaccessible embedded forms, server-side behaviour or policy content. DOM inspections are bounded for responsiveness. It can miss fraud and flag innocent sites. Leave the browser's own Safe Browsing/SmartScreen enabled.

Chrome/Edge share the extension API target. Automated integration was exercised in Chromium; a separate Edge run has not been performed. Unpacked installation is suitable for this project demonstration; public distribution would require a store submission and review.

## References and third-party assets

- [Chrome content scripts](https://developer.chrome.com/docs/extensions/develop/concepts/content-scripts)
- [Chrome cross-origin requests](https://developer.chrome.com/docs/extensions/develop/concepts/network-requests)
- [IANA RDAP bootstrap directory](https://www.iana.org/assignments/rdap-dns/) — bundled from `https://data.iana.org/rdap/dns.json` on 8 October 2026.
- [tldts and Public Suffix List parsing](https://github.com/remusao/tldts)
- [Rajdhani, Google Fonts](https://github.com/google/fonts/tree/main/ofl/rajdhani) — SIL Open Font License, bundled in `extension/assets/OFL.txt`.
- [Inter, Google Fonts](https://github.com/google/fonts/tree/main/ofl/inter) — SIL Open Font License, bundled in `extension/assets/Inter-OFL.txt`.

The reference brand catalogue is configurable and non-exhaustive. A catalogue match identifies an address, not a guarantee of the business. Recheck entries when updating the project.
