---
id: rep-zzjcw
status: closed
deps: []
links: []
created: 2026-11-18T20:58:40Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Rules: resign action and score helper

Ready for implementation.

Objective: in game.js, add a 'resign' action and a pure score helper. Add tests in game.test.js.

Resign:
- Either seat can resign at any time while the game is in progress, also when it is not that seat's turn. This is the one exception to the 'seat to act' check in applyAction.
- Reject it when the game has no actions yet (nothing to forfeit), and when the game is over.
- It ends the game: result is a win for the other seat, marked as a forfeit, for example { type: 'win', winner, forfeit: true, lines: [] }. Pick a shape that is easy for the page to tell apart from a Quarto win.
- isLegalGame must accept histories that contain it. Undo after it is already blocked because the game is over.

Score helper:
- A pure function that takes a score [wins0, wins1] and a game, and returns the score with the game's winner added (a Quarto win or a forfeit). Draws and unfinished games add nothing. It must not change its input.

Non-goals: no draw count, no change to the claim, undo or draw rules.

## Acceptance Criteria

Tests cover: resign by either seat in any step, resign rejected on an empty game and after the game ends, the forfeit result, isLegalGame with resign, and the score helper for win, forfeit, draw and unfinished games.

