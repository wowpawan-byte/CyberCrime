# Meadow: technical depth for the review

Companion to the six-slide **Meadow-technical-review** deck. This explains the existing implementation; it does not introduce new product features.

## 1. The implementation in plain terms

Meadow is a JavaScript Manifest V3 browser extension. A **content script** inspects the current page. An **extension service worker** obtains optional registration information and evaluates deterministic rules. The popup, badge and dismissible notice expose the resulting evidence.

There is no trained model, AI API, account or application backend. RDAP is an external registry service, so the everyday build is not entirely offline when that preference is enabled.

Sources: [content.js](../shopcheck/extension/content.js), [background.js](../shopcheck/extension/background.js), [build.mjs](../shopcheck/scripts/build.mjs).

## 2. What becomes evidence

| Input | Implementation | Boundary |
|---|---|---|
| Current address | `tldts` parses the Public Suffix List with private suffix support. Known domains use exact equality. | A domain match does not verify a merchant or marketplace seller. |
| Store identity | Site-name metadata, a selected header or title is compared with a curated reference catalogue. | It is incomplete and does not detect every copied brand or independent fake shop. |
| Hostname resemblance | Brand tokens, subdomain bait, selected `0/o` and `1/i` normalization, and edit distance 1 under length conditions. | These are limited text heuristics, not general visual similarity or Unicode homograph detection. |
| Registration date | RDAP `registration` event, not the last-update event. Age uses whole elapsed days. | Domain age is not shop age. Missing or future dates remain unavailable. |
| Sensitive fields | Password type, `cc-*` autocomplete, and configured card/CVV name or ID patterns. | No input values or `FormData` reads. Field metadata can be misleading. |
| Declared destination | HTML form `action`, resolved to an HTTP(S) origin and compared by domain. | JavaScript transfers and embedded checkout frames remain unverified. |
| Merchant/payment context | Contact/policy link presence and selected payment instructions in public page text. | Presence is not verification. UPI alone is not fraud evidence sufficient for High Risk. |

The inspector derives structured facts rather than returning a raw page-text dump. It caps processed collections: 12,000 text nodes, 60,000 text characters, 30 forms, 60 inputs per form and 500 links. These are processing limits, not a measured runtime guarantee.

Sources: [inspect.js](../shopcheck/extension/inspect.js), [domain.js](../shopcheck/extension/domain.js), [data.js](../shopcheck/extension/data.js).

## 3. Exact verdict logic

For a recognized shopping page, the engine evaluates these branches in priority order:

```text
HIGH RISK if any of these applies:
  A. Sensitive fields appear on HTTP, or a sensitive form declares HTTP.
  B. Covered-brand hostname resemblance + matching page identity
     + registration age below 30 days.
  C. Covered-brand hostname resemblance + a sensitive form declaring
     another domain outside the known payment-domain list.

Otherwise:
  Any finding                         -> REVIEW
  No findings, but an unknown check    -> INCOMPLETE
  No findings and no unknown checks   -> PASS
```

Case C does **not** require matching page-identity metadata. The unfamiliar destination alone produces Review, not High Risk. The code calls these conditions risk evidence, not proof of fraud.

Age below 30 days is a strong registration signal. Age from 30 to 179 days is a supporting signal. Either age signal alone yields Review. The 30/180-day boundaries are author-chosen heuristics, **not thresholds validated on a labelled fraud dataset**.

The implementation groups strong findings by evidence source. Hostname complexity and brand resemblance share the identity group, so correlated URL clues do not become independent votes in a numeric score. There is no percentage trust score.

If no shopping activity is recognized, the worker returns IDLE. An invalid or unsupported address can yield Incomplete. A missing registry response never erases a stronger existing warning.

Source: [engine.js](../shopcheck/extension/engine.js).

## 4. Network, storage and response timing

- A bundled IANA bootstrap selects an HTTPS RDAP registry endpoint. The request contains the domain, omits credentials and referrer, and has a 3.5-second timeout. The registry also sees the request's network address.
- Successful lookup results expire after 24 hours; failures after one minute. The cache holds at most 200 domain entries and shares an in-flight request for the same domain.
- Local/internal addresses skip registry lookup. A hosted tenant cannot borrow the platform's registration age.
- `MutationObserver` schedules a rescan after a **650 ms debounce**. This waits for a pause in relevant page changes. It is not a measured detection latency.
- The current worker awaits registration lookup before evaluating the full verdict. An uncached request can therefore delay even an otherwise local warning. **Do not promise instant protection or a warning before a fast user types.**
- Per-tab results live in session storage and clear on navigation or tab closure. Registration cache/settings live locally. This is not a forensic evidence archive.

Sources: [registration.js](../shopcheck/extension/registration.js), [background.js](../shopcheck/extension/background.js), [content.js](../shopcheck/extension/content.js).

## 5. How to defend the design choices

**Why deterministic rules?** Each verdict has a reproducible path that can be demonstrated and explained. This avoids model training and keeps the implementation small. It does not imply that rules outperform mature security tools.

**Why parse the Public Suffix List?** “Take the last two labels” fails for structures such as `co.in` and hosted platforms. Private suffix handling helps separate tenants instead of treating a whole hosting platform as one merchant.

**Why combine identity with other evidence?** A name can appear in legitimate reseller contexts. The engine reserves some High Risk branches for independent evidence groups. This is a design safeguard, not a measured false-positive guarantee.

**Why 30 days?** It is a transparent initial design choice. The honest next evaluation would freeze the rule, test on labelled examples, and measure false positives and misses. That validation has not been done.

**What is the novelty?** The engineering contribution is a scoped combination of existing techniques, explicit uncertainty and a readable browser workflow. It is not a new algorithm or a demonstrated scientific advance.

## 6. What the demo proves

The checkout reveal tests real DOM mutation handling, sensitive-field classification and the transport rule. The new-store scenario tests restraint about young domains. Local fixture ages are labelled. Payment fields are disabled and cannot submit.

The verification record reports **39 rule tests and 19 local browser checks** passed on 8 October 2026. An optional real RDAP attempt returned Unknown in the same review. These results support implementation correctness for the tested cases. They do not establish fraud precision/recall, a false-positive rate, guaranteed latency or consumer loss prevention.

This is a pre-payment screening demonstration related to the investigation topic. It does not trace an attacker, establish attribution, preserve chain of custody, prove bank-account ownership or guarantee order fulfilment.

Sources: [engine tests](../shopcheck/tests/engine.test.mjs), [browser tests](../shopcheck/tests/browser.mjs), [verification record](../shopcheck/evaluation/BRANDING-REVIEW.md).
