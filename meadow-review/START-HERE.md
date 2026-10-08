# Meadow review package

For the five-minute review on 14 October 2026.

## Open these

- **Meadow-technical-review.pdf**: the latest, recommended six-slide presentation. It keeps the issue-first explanation and adds code-grounded technical depth. Pages are flattened images, preserving typography without font installation.
- **Meadow-technical-review.pptx**: editable six-slide deck with timed speaker notes. Install the included fonts before editing or presenting if your app substitutes them.
- **TECHNICAL-NOTES.md**: full decision logic, implementation choices, privacy boundaries and technical Q&A.
- **DEMO-GUIDE.md**: setup checklist, exact five-minute script, Chrome clicks, recovery steps and reviewer Q&A.
- **brand-sheet.html**: visual identity sheet. Open in a browser, with this folder intact.
- **BRAND-GUIDE.md**: typography, colors, illustration treatment and wording rules.
- **technical-slides/**: latest slide PNGs for presentation fallback.
- **assets/**: real screenshots of the tested build for demo fallback.
- **fonts/**: Rajdhani and Inter with licenses.

The earlier `Meadow-review` and `Meadow-issue-first` files preserve the previous versions. Use **Meadow-technical-review** for the current review. The product and extension are unchanged by these slide revisions.

## Refresh the product

The project has been renamed **Meadow 1.1.0**. Go to `chrome://extensions`, reload the installed extension, and refresh the demo tabs. Chrome does not automatically reload unpacked extension files after edits.

From the repository root, use these folders:

```
shopcheck/dist/shopcheck-demo
shopcheck/dist/shopcheck
```

Use Demo Lab for the review. Use the live build for everyday shopping. Enable only one at a time. The source and versioned releases are in the sibling `shopcheck` folder.

## Demo in one sentence

Show the actual extension change from **REVIEW** to **HIGH RISK** when an unsafe checkout appears, then show that a new independent shop remains **REVIEW**.

The local demo does not require internet. Registration ages are explicit fixtures. Local HTTP remains a real warning. This demonstration establishes selected implementation behaviours, not real-world fraud detection accuracy.
