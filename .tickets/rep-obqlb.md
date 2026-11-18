---
id: rep-obqlb
status: closed
deps: []
links: []
created: 2026-11-18T19:16:21Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Add dark mode from the reference design

Ready for implementation.

Objective: index.html follows the system colour scheme. In dark mode, the UI colour tokens take the dark values from the 'Dark mode palette' frame in misc/Quarto.html.

Scope: index.html CSS only.
- Add @media (prefers-color-scheme: dark) { :root { ... } } that sets dark values for the UI tokens. Values (token: dark):
  --linen #1C1916, --paper #27231F, --sunk #141210, --line #3B352E, --line-strong #5E554A, --control-line #4D463D, --disabled-surface #2B2723,
  --board #A39072, --board-wall #7B6A4F, --cell #968366, --cell-hover #A89574, --winning-cell #D6C7A8,
  --charcoal #EDE6DA, --muted #A89D8E, --disabled #857B6E,
  --indigo #8DA6D6, --indigo-hover #A4B9E2, --indigo-wall #566F9E,
  --block #E2D9CA, --block-hover #EEE7DB, --block-wall #A4977F.
- New token --on-indigo: light #FFFFFF, dark #121A2B. Use it for the .button-quarto label (now hard-coded #FFFFFF).
- New token --button-hover: light #FFFFFF, dark #312C27. Use it for .button:hover (now hard-coded #FFFFFF). #312C27 is our choice; the design has no value.
- Change <meta name="color-scheme"> to "light dark".
- Check for any other hard-coded UI colour in index.html CSS or script that must follow the theme.

Non-goals: no manual toggle or saved preference; do not change piece colour tokens (--light-*, --dark-*) or the rgba/#2B1E12 shadows; no change to game.js.

Caveat: surfaces that use --charcoal as a background (notices, seat bar, dots) become light with dark text in dark mode. This is accepted.

## Acceptance Criteria

Light mode looks the same as before. In dark mode (emulate prefers-color-scheme: dark), the lobby, waiting room and game screens match the dark frames in misc/Quarto.html on phone and desktop, and screens without a dark frame stay readable.

