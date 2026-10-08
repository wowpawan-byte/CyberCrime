# Verification results

39 deterministic unit checks and 19 browser integration checks passed for Meadow 1.1 on 8 October 2026. Browser integration results, with individual checks and execution time, are recorded in `browser-results.json`. This run includes the new branding/font check and excludes the optional live RDAP smoke test. An additional live-registry attempt returned Unknown and failed its success assertion. The earlier 1.0 run had succeeded, so do not rely on a registry response during the review. The main demo operates locally.

The automated tests exercise real installed-extension behaviour in an isolated Chromium profile: content-script inspection, service-worker results, toolbar badges, dynamic checkout rescans, settings, local fixture isolation, private input exclusion, rendering and responsive layouts. Screenshots are reviewed separately for clipping and hierarchy.

The live registry smoke test, when enabled with `SHOPCHECK_LIVE_RDAP=1`, uses an intercepted local HTML storefront at example.com while the extension performs a real network query to the authoritative .com RDAP registry. It verifies integration without visiting a suspected malicious website. That result is not a scan of the real example.com page.

## What these results establish

- Domain parsing handles multi-part and private suffixes.
- Subdomain brand bait and payment-provider lookalikes are not allowlisted.
- New independent shops, internationalised domains and UPI instructions are not individually labelled High Risk.
- Sensitive HTTP forms and specified combined evidence produce High Risk.
- Missing registration or uninspectable payment information is preserved as Unknown.
- A failed lookup cannot overwrite an existing High Risk result.
- Input values, textarea values and editable text do not appear in inspected facts.
- Demo registration fixtures do not exist in the live bundle.
- The installed extension reacts to dynamically inserted checkout fields.

## What these results do not establish

Real-world fraud precision, recall, false-positive rate and user protection effectiveness have **not been measured**. Passing synthetic fixtures is not an accuracy benchmark. No claim is made to meet the earlier suggested 80%/90% targets.

No separate Edge verification, extension-store review, long-duration performance study or independent security audit was performed. Domain/catalogue coverage, script-driven checkout, embedded frames, server behaviour and merchant fulfilment remain known limitations.

For a later labelled evaluation, report URL-only and full-page cases separately; freeze rules before testing; include legitimate resellers, newly established stores, non-Latin domains, familiar payment processors and hosted storefronts. Publish raw counts and uncertainty, not only a percentage.
