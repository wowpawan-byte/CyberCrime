# Meadow · Fake E-Commerce Website Investigation

A no-AI browser extension and safe local demonstration of explainable first-pass checks for online stores. Meadow reports observable warning evidence; it does not certify sellers or guarantee fraud detection.

## Use the extension

1. Download this repository or clone it.
2. Open `chrome://extensions` (or `edge://extensions`) and enable Developer mode.
3. Select **Load unpacked** and choose `shopcheck/dist/shopcheck`.
4. Pin Meadow, open a shopping page and click the icon to inspect its evidence.

The prebuilt extension needs no installation of Node.js or dependencies. The folder name `shopcheck` is retained from the project's earlier name.

## Run the review demo

Requires Node.js 20 or newer:

```sh
git clone https://github.com/wowpawan-byte/CyberCrime.git
cd CyberCrime/shopcheck
npm run demo
```

Open **http://localhost:8765/**. For the actual extension demonstration, load `shopcheck/dist/shopcheck-demo` instead of the live build and enable only one build at a time. Demo registration ages are explicitly synthetic fixtures; the live build excludes them. No real payments are collected.

## Project contents

| Folder | Contents |
| --- | --- |
| [shopcheck/](shopcheck/) | Extension source, local demo, build scripts, tests and architecture |
| [shopcheck/dist/](shopcheck/dist/) | Ready-to-load live and demo extensions |
| [shopcheck/releases/](shopcheck/releases/) | Versioned extension and project ZIPs, including historical releases |
| [meadow-review/](meadow-review/) | Presentations, technical notes, demo script, branding, fonts and fallback screenshots |

## Latest presentation

- [Six-slide technical review — PDF](meadow-review/Meadow-technical-review.pdf)
- [Editable PowerPoint with speaker notes](meadow-review/Meadow-technical-review.pptx)
- [Five-minute demo guide](meadow-review/DEMO-GUIDE.md)
- [Technical depth and Q&A](meadow-review/TECHNICAL-NOTES.md)
- [Brand guide](meadow-review/BRAND-GUIDE.md)

The `Meadow-review` and `Meadow-issue-first` decks and root ZIP packages are preserved earlier versions. Use **Meadow-technical-review** for the latest presentation. The PDF preserves typography without installing fonts; bundled font files and licenses are in `meadow-review/fonts/`.

## Build and test

```sh
cd shopcheck
npm ci
npm run build
npm test
```

All 39 rule tests passed on 8 October 2026. These test selected implementation behaviours, not real-world fraud-detection accuracy. See the [project README](shopcheck/README.md) for browser integration tests, permissions and privacy details.

## Scope and privacy

Page inspection and rule evaluation are local. An optional RDAP lookup sends the registrable domain to its registry, which also receives normal network metadata. Meadow does not read entered payment or password values. It cannot establish seller ownership, guarantee delivery, inspect every script-driven payment transfer or replace an investigation.

Generated dependency folders, temporary working files and macOS metadata are excluded. Bundled third-party fonts and parser distributions retain their license notices.
