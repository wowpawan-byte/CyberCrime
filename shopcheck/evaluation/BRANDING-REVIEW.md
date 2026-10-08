# Meadow 1.1 review

8 October 2026. Scope: rename ShopCheck to Meadow and apply Rajdhani headings with Inter reading text. Detection rules are unchanged.

- 39 deterministic unit tests passed.
- 19 local browser integration checks passed, including the new wordmark/font test.
- The optional external RDAP success check returned Unknown during this review. It is not part of the successful local run. The failure must not be described as a successful live-network test.
- Screenshots use the built demo extension in an isolated Chromium profile. The popup is opened as an extension page for capture and receives the tested storefront result. Tests separately verify the service worker result and toolbar badge.
- These checks show implementation behaviour, not real-world fraud detection accuracy.

The existing dist/shopcheck and dist/shopcheck-demo paths remain unchanged so installed unpacked extensions can be reloaded in place. Manifest name, popup, notices, demo UI and package version now use Meadow 1.1.0. Existing 1.0 ZIP releases remain available as earlier versions.
