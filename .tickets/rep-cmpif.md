---
id: rep-cmpif
status: closed
deps: []
links: []
created: 2026-11-18T19:25:16Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Add a light/dark/auto theme picker

Ready for implementation.

Objective: a subtle theme control at the top right of the page. One icon button that cycles Auto -> Light -> Dark. Default Auto (follow system, as today).

Scope: index.html only.
- Button: 44px tap target, 16px line icons in the style of the existing inline SVGs (half-filled circle = Auto, sun = Light, moon = Dark). Colour var(--muted), var(--charcoal) on hover, focus-visible ring like .lobby-link. aria-label/title gives the current state, e.g. 'Theme: auto'.
- Placement: top right on lobby, waiting room and game screens, phone and desktop. On room screens it must line up with the right end of .room-line (which is centred and narrower than the page at some widths, e.g. 480px at 600-839px) and must not overlap .room-meta at 360px. On the lobby, top right of the page with a matching inset. It scrolls with the page (not position: fixed). Pick the smallest approach that meets this (e.g. one element placed in the room line vs. page corner).
- Persistence: localStorage via a new key next to the existing STORAGE_* keys; values 'light' | 'dark', absent = auto. Wrap storage access in try/catch as the existing helpers do.
- No flash: a small inline script in <head> resolves the theme before first paint and sets data-theme="light|dark" on <html>. In auto it listens to matchMedia('(prefers-color-scheme: dark)') changes.
- CSS: change the existing @media (prefers-color-scheme: dark) :root block to :root[data-theme="dark"] so there is one list of dark tokens. Set color-scheme (light/dark) to match the resolved theme so scrollbars and form controls follow it.

Non-goals: no sync between devices or players; no picker on the name prompt overlay; no change to colour values; no change to game.js.

Caveat: the control is not in misc/Quarto.html; this is a deliberate, owner-approved difference.

## Acceptance Criteria

Each press changes the colours at once; the choice survives a reload with no flash of the other mode; Auto follows the system, including a change while the page is open.

