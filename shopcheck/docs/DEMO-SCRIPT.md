# Three-minute live demo

Before presenting: start `npm run demo`, open http://localhost:8765, load `dist/shopcheck-demo`, and pin its icon. Disable the live build to prevent duplicate notices. Keep the shared-engine preview visible on the projector.

**0:00 — Explain the promise.** “Meadow performs seven fixed checks on the current shopping page. It uses no AI and shows the evidence behind each result.”

**0:20 — Open The Control.** Expand Connection & forms. “This store has consistent identity and policy links. Because this local demo uses HTTP, the extension still reports a connection warning. We have not turned off a security check to force a Pass.”

**0:45 — Open The Live Reveal.** Before checkout, show Review. Click Proceed to checkout. The real extension rescans and changes its badge to `!`. “The page has now revealed sensitive fields on HTTP. The engine detects this from the form structure. It never reads entered values.” Expand Connection & forms and Payment context. Point out the disabled field and unfamiliar destination.

**1:30 — Open Identity Mismatch.** “The storefront says Flipkart, but the actual domain is different. A separate registration-age clue supports the identity warning.” Point to the local-demo label: “Registration age is the only simulated evidence. The page and its controls are inspected live.”

**2:10 — Open New Independent Shop.** “A new domain is not automatically fraud. It receives Review, not High Risk. Weak clues are not added together to manufacture certainty.”

**2:30 — Open Registry Unavailable.** Expand Registration age. “Unavailable information stays Unknown. A network failure does not make a shop safe.” HTTP keeps the overall local result at Review.

**2:50 — Finish.** “The contribution is a small, explainable package of established checks. It does not guarantee delivery, replace the browser's security tools, or inspect every network transfer.”

Reset scenario reloads the store. The full demonstration works offline once files are built. A failed external network cannot affect the controlled examples. If the extension was installed after opening a store, refresh that store once.
