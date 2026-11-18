---
id: rep-cclwl
status: closed
deps: []
links: []
created: 2026-11-18T20:30:49Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Make the game installable: web app manifest, app icons, theme colour

Objective: a phone can install the game to its home screen (Android 'Install app', iOS 'Add to Home Screen'), and it opens full screen on the lobby with the correct name and icon.

Status: ready for implementation.

Scope (all new files go in the repo root, next to favicon.svg):
- manifest.webmanifest: name and short_name 'Quarto', display 'standalone', start_url './' and scope './' (relative, so the site also works under a subpath), background_color and theme_color #F2EDE3, icons 192 and 512 with purpose 'any' plus the 512 again with purpose 'maskable'.
- icon.svg: the source of the app icon. Take the piece from favicon.svg (same geometry and colours, no red dot). Put it on a full-bleed #F2EDE3 square with no rounded corners and no transparency. Keep the whole piece inside the centre circle of 80% diameter, so that an Android circle crop does not cut it.
- icon-192.png, icon-512.png, apple-touch-icon.png (180x180): rendered one time from icon.svg with a local tool and committed. Look at the rendered files before you commit them.
- index.html head: link rel=manifest, link rel=apple-touch-icon, meta apple-mobile-web-app-title 'Quarto', and one meta theme-color. The early theme script in the head sets the theme-color content each time it applies a theme: #F2EDE3 for light, #1C1916 for dark (the --linen value of each theme). Say in a comment that these two values mirror --linen.
- README.md: after the sentence 'There is nothing to install and no account to make.' add exactly: 'You can add it to the home screen of your phone and open it like an app.'

Constraints:
- The page changes the tab icon at run time through document.querySelector('link[rel="icon"]') (favicon.svg or favicon-turn.svg). Do not add another link that this selector matches, and do not change that behaviour.
- No build step and no packages. The PNG files are static, committed assets.

Non-goals: no service worker, no offline cache, no install button or prompt in the page, no push notifications, no orientation lock, no iOS splash images, no viewport-fit or safe-area CSS, no apple-mobile-web-app-status-bar-style, no changes to favicon.svg, favicon-turn.svg or misc/Quarto.html.

## Design

No service worker on purpose: the game cannot be played offline, and with no build step there is no automatic cache version, so a cached page could stay on a phone after a deploy. One icon artwork serves Android (any and maskable) and iOS because it is an opaque full-bleed square with the piece in the safe zone. The manifest colours are static, so the splash screen is always light; only the meta theme-color follows the theme picker.

## Acceptance Criteria

Chrome DevTools (Application > Manifest) shows no errors or warnings and the page is installable when served over localhost. The meta theme-color changes when the theme button cycles and when the system scheme changes in Auto. The tab icon still changes to the red-dot icon on the turn of the viewer. node --test passes.

