# Meadow implementation plan

Build an installable Manifest V3 extension, an offline demonstration lab, and a small reproducible test suite. Runtime: local JavaScript plus optional RDAP registration lookup. No AI, account, API key or backend.

## Sequence

1. Implement public-suffix-aware domain parsing, seven evidence categories and a pure verdict engine.
2. Add bounded DOM inspection that never reads input values, textareas or editable content. Inspect the main document only; explicitly disclose inaccessible frames and script-controlled submission destinations.
3. Add a service worker with domain-only RDAP, timeout, bounded cache, stale-result protection and per-tab state. Existing high-risk evidence must survive a failed lookup.
4. Build a Rajdhani interface with generous spacing, clear hierarchy and keyboard access. User-selected identity: dark charcoal, off-white text, soft rounded panels, strictly monochrome warnings. Use symbols and contrast, never red.
5. Build a loopback-only demo laboratory and a separate demo extension build. Only the demo build can use pinned synthetic registration fixtures on exact local hosts. The live build never reads fixtures.
6. Verify domain edge cases, false positives, rule combinations, unavailable checks, privacy, dynamic checkout and extension integration. Render and inspect the UI.
7. Package source, live/demo extension builds, setup documentation, demo script and actual test results.

## Corrections necessary for reliable implementation

- Brand names on product pages do not establish impersonation. Only store identity signals plus a deceptive hostname contribute to a strong identity finding.
- Punycode, a new domain, an unfamiliar TLD, Gmail or UPI are not proof of fraud. Do not infer a personal UPI account or payment exclusivity from a handle or a single keyword.
- An unknown third-party payment destination is a review finding, not a confirmed malicious destination. Recognised payment infrastructure does not verify its merchant.
- Reading form action does not reveal JavaScript fetch destinations or inaccessible iframe fields. Display this coverage limitation instead of claiming a secure payment.
- Policy links establish presence only. They do not verify the business or the policy content.
- Domain age means registration age, not how long the current shop or owner has existed.
- Correlated domain clues count once; missing merchant links and newness cannot accumulate into a high-risk accusation.
- Demo HTTP remains labelled HTTP. A benign local store may show Review; no HTTPS checks are silently bypassed for a staged Pass.
- Demonstrate a Review-to-High-Risk transition on a neutral shop revealing an insecure payment form. An already-high-risk impersonator demonstrates new evidence, not a fictitious badge transition.
- Novelty is a project design contribution, not an established research priority claim. Runtime order alone does not improve accuracy; evidence grouping and thresholds do.
- Automated fixture tests measure implementation correctness. Real-world precision and recall remain unmeasured until an independently labelled held-out evaluation exists.

## Acceptance

- All seven categories have an evidence state and clear reason.
- No risk percentages, no guaranteed-safe label, no typed values in inspection results or storage.
- Non-blocking notification once per escalation per document; dismissible and optional.
- RDAP failure produces Incomplete unless an existing warning warrants Review/High Risk.
- Installable ZIPs and unpacked directories; npm run demo serves the safe lab locally.
- No network requests required during the controlled demonstration.

## Completion record

Implemented and packaged on 8 October 2026. Meadow 1.1 applies the agreed dark monochrome identity with Rajdhani headings and Inter body text. All 39 unit checks and 19 local Chromium browser integration checks passed. An optional external RDAP attempt returned Unknown during this review; the earlier 1.0 attempt had succeeded. Network availability must not be assumed. The offline demo server is loopback-only. Real-world fraud precision/recall and a separate Edge run remain unmeasured, as documented.
