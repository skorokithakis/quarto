---
id: rep-ebvke
status: closed
deps: []
links: []
created: 2026-11-18T20:12:42Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Add piece favicon with red dot on your turn

Objective: give the page an icon (one Quarto piece) and add a red dot to it while it is the viewer's turn. Ready for implementation.

Scope: index.html; two new static files in repo root: favicon.svg and favicon-turn.svg.

Icon: the tall, light, round, solid piece, drawn with the same geometry as pieceSVG() in index.html (viewBox 0 0 100 100), with the CSS variables replaced by their hex values (--light-face #F4E9D2, --light-wall #D4C09B, --light-outline #8C7653, shadow #2B1E12 at 0.22 opacity). favicon-turn.svg is the same piece plus a red dot (#D93A2F) in the bottom-right corner, about 40% of the icon width, with a thin white ring. The piece and dot must stay readable at 16px; adjust the viewBox/cropping if the piece looks small.

Behaviour: index.html links favicon.svg by default (replace the current empty data: icon). After each render, set the icon link href to favicon-turn.svg only when the viewer holds a seat, both seats are taken, and the game is not over and it is the viewer's seat to act (viewOf(state).seat === latestSeat). Otherwise favicon.svg. Make sure the waiting screen, the home screen and the skeleton state show favicon.svg. Only touch the DOM when the href actually changes.

Non-goals: no title change, sound, notifications, game-over signal, PNG or apple-touch-icon, no edits to misc/Quarto.html.

