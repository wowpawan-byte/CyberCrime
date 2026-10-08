# Meadow: the five-minute review

14 October 2026, around 1:30 as supplied. Confirm the room and AM/PM with the reviewer. This package does not schedule a reminder.

## The promise

“Meadow gives shoppers a first check of an unfamiliar store, with visible reasons to pause before entering details.”

Demonstrate one dangerous condition and one restrained decision. Do not describe Meadow as a complete fraud solution, a guarantee, or a proven accuracy benchmark.

## Before the review

1. Use the latest six-slide deck: `Meadow-technical-review.pdf` in Preview, full screen. It needs no installed fonts. For `Meadow-technical-review.pptx` with speaker notes, install Rajdhani SemiBold and Inter from `fonts` in Font Book if needed, then restart PowerPoint/Keynote. Keep `technical-slides` nearby as another font-independent fallback. The earlier five-slide versions remain available but are no longer the recommended presentation. Read `TECHNICAL-NOTES.md` for Q&A; do not try to recite it all in the five-minute slot.
2. In Chrome, open `chrome://extensions`. Reload the unpacked **Meadow · Demo Lab** extension. If the old name remains, reload again and confirm version **1.1.0**. The folder is still `outputs/shopcheck/dist/shopcheck-demo` inside this workspace. Keeping the path preserves the existing installation.
3. Disable the everyday/live copy for the demonstration to avoid two notices. Do not delete it. Pin the Demo Lab extension in Chrome’s toolbar. Refresh already-open demo pages after reloading the extension.
4. Start the server in Terminal:

```sh
cd /path/to/CyberCrime/shopcheck
npm run demo
```

Keep that Terminal open. If port 8765 is occupied and the demo already opens, use the running server. Do not stop unrelated processes.

5. Prepare exactly two Chrome tabs:
   - `http://checkout-store.localhost:8765/`
   - `http://new-store.localhost:8765/`
6. Reset the first scenario. The initial result should be **REVIEW**. Keep registration lookup and on-page warnings enabled for this rehearsal. The labelled local fixtures need no external registry connection.
7. Open the deck in full-screen presentation mode. Rehearse switching between the deck and Chrome with Command-Tab. Use Do Not Disturb and close personal tabs.
8. Test projection from the back of the room. Browser zoom can enlarge the page preview but may not enlarge Chrome’s toolbar popup. Use the actual popup at least once, then the clearly labelled preview for distant readers. Do not describe that page preview as browser-injected UI.

## Run of show

| Time | Screen | What to say or do |
|---|---|---|
| 0:00–0:20 | Slide 1 | Explain the harm: a fake store can take money or collect personal details by resembling a legitimate shop. |
| 0:20–0:40 | Slide 2 | Logos/design can be copied. HTTPS encrypts a connection but does not verify the merchant. |
| 0:40–1:10 | Slide 3 | Read the fictional address. `brand` is a subdomain; `example-shop.test` is the actual domain. Mention `tldts` and the Public Suffix List rather than treating the last two labels as the answer. Do not navigate to the invented address. |
| 1:10–1:45 | Slide 4 | Explain the three rule examples. A sensitive HTTP condition is sufficient for High Risk. The identity/young-domain case combines evidence. Age below 30 days alone stays Review. Call the threshold a heuristic, not a validated fraud boundary. |
| 1:45–2:20 | Slide 5 | Explain content-script facts, local worker decisions, and optional RDAP. No entered values go into inspection facts. Unknown registration cannot erase an existing warning. Do not claim a guaranteed 650 ms verdict. |
| 2:20–2:30 | Slide 6 | “Now we will test both detection and restraint.” Switch to Chrome. |
| 2:30–2:55 | Checkout tab | Open the pinned extension. Show **REVIEW** and the actual domain. Explain that local HTTP already deserves caution. Close the popup. |
| 2:55–3:45 | Same tab | Click **Proceed to checkout**. Pause for the rescan. Open the toolbar popup: **HIGH RISK**. Expand **Connection & forms**. “Sensitive fields are now visible on HTTP. That observed condition triggers the stronger warning.” |
| 3:45–4:10 | New-shop tab | Open the popup and **Registration age**. Show **REVIEW**. “A new shop is not automatically fraudulent. Age alone does not trigger High Risk.” Mention this local page also uses HTTP. |
| 4:10–4:30 | Chrome | “Registration ages here are labelled fixtures. The browser inspects the actual page. Inputs are disabled, and we send no payment.” Return to slide 6. |
| 4:30–4:45 | Slide 6 | “The value is a visible reason to pause before giving details. The demo proves selected rule behaviour, not real-world fraud accuracy.” |
| 4:45–5:00 | Slide 6 | Buffer for switching or one closing sentence. Do not start an extra scenario. |

## Recovery without losing the room

- **No toolbar update:** refresh the page, wait, then open the popup. Use “Check again” once. Confirm the Demo Lab build, not the live build. Do not troubleshoot repeatedly during the five minutes.
- **Server missing:** start the command above. If that takes more than 15 seconds, use the screenshot fallback.
- **Font substitution or deck app trouble:** show the six PNGs in `technical-slides` using Preview. These preserve the intended typography.
- **Demo trouble:** open the saved `assets/review-before.png`, then `assets/popup.png`, then `assets/new-store-review.png`. Say: “These are screenshots of the tested run.” Do not pretend they are live.
- **Internet trouble:** the two selected local scenarios do not need internet. Real registration lookups may return Unknown. That is a valid, visible limitation, not evidence of fraud.

## Likely questions

**What exactly is novel?**

Our contribution is integration and interaction design: surface the actual domain, group concrete evidence, reserve strong warnings for explicit dangerous conditions or defined combinations, and make uncertainty readable. The underlying methods already exist. We do not claim a newly invented algorithm or globally unique product.

**How does it work without AI?**

Domain parsing, a curated catalogue of covered brands/processors, optional registration lookup and page inspection feed deterministic rules. Seven displayed categories explain the result. No model training, model API or backend account is involved.

**How effective is it?**

The live test demonstrates detection of the specific unsafe checkout condition. The counterexample demonstrates restraint about a new merchant. The current build passes 39 rule tests and 19 local browser checks. Those are software checks, not fraud detection precision or recall. Real-world fraud accuracy and user outcomes have not been measured.

**Does HTTPS mean safe?**

No. Encryption is one property of a connection, not seller verification. A malicious shop can use HTTPS. Meadow can miss sophisticated deception.

**What does it miss?**

Uncovered brands, convincing independent fake shops, script-controlled payment destinations, embedded checkout frames and merchant fulfilment can remain unverified. A PASS means the performed checks found no major warning, not that the store is safe.

**Does it read payment details?**

It checks field types and form destinations, not entered values. Page inspection and decisions run locally. If registration lookup is enabled, the registry receives the domain and the request’s network address. Avoid saying “nothing ever leaves the device” about the everyday build.

**Does it block payment?**

No. It provides evidence and warnings. The user decides. The demo fields are disabled for safety independently of the extension.

## Everyday use after presenting

Disable Demo Lab and re-enable/reload the live extension from `outputs/shopcheck/dist/shopcheck`. Refresh the shopping page. The live build excludes the simulated registration fixtures. The local demo server is not required for everyday use.
