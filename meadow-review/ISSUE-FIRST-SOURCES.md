# Issue-first presentation: sources and scope

The revised presentation has five slides and no product screenshots. The existing Rajdhani/Inter typography and monochrome palette remain. The extension itself is unchanged.

## Public sources

1. **NCSC, Shopping and paying safely online**. Supports the fake-store threat, copied store designs/logos and deceptive addresses. Accessed 8 October 2026. https://www.ncsc.gov.uk/guidance/shopping-online-securely
2. **FTC, Online Shopping**. Supports the distinction between an encrypted connection and a legitimate merchant. Accessed 8 October 2026. https://consumer.ftc.gov/articles/online-shopping

Slide speaker notes identify the relevant sources. The domain on slide 3 is an invented teaching example, not a real incident or a scanned site. No figures for prevalence, losses, detection accuracy or user outcomes are claimed.

## Implementation evidence

Slide 4 describes this project's rule choices, with examples in `extension/engine.js` and `tests/engine.test.mjs` in the sibling `shopcheck` project. Slide 5 describes the existing controlled demo. A High Risk warning identifies an observed risk, not proof of criminal intent. A first-pass check does not establish legitimacy or delivery.

The main demonstration is two minutes. Local registration values are explicit fixtures. Page inspection, form detection and verdict updates execute live. The on-page projection panel is an engine preview; the toolbar popup is the extension UI.
