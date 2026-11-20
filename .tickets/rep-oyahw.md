---
id: rep-oyahw
status: closed
deps: []
links: []
created: 2026-11-20T07:59:31Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Computer opponent: ai.js move chooser with tests

Ready for implementation.

Objective: a new pure module ai.js that chooses the computer's next action, with tests in ai.test.js. No browser APIs, no timers, no state. Same style as game.js.

Interface: one exported function that takes a game ({starter, actions}), the computer's seat, and an optional random source (default Math.random, so tests can be deterministic). It returns the action for that seat to pass to applyAction, or null when the game is over or it is not that seat's turn.

Behaviour, in this order:
1. Claim first. If the last placed square is on a complete line with a common attribute, return a claim. This covers the computer's own line after it places, and a line that the other player made and did not call (the computer is then at step 'place' or 'draw'). It never claims when there is no line.
2. Step 'place': if a square makes a line with the piece in hand, place there. If not, prefer a square after which at least one remaining piece is safe to give. If there is none, any empty square.
3. Step 'select': give a safe piece. A piece is safe when no empty square completes a line with it. If no piece is safe, any remaining piece.
4. Step 'pass': pass. Step 'draw': accept the draw. (Rule 1 already handled a line.)
Choose with the random source among equal options.

Scope: ai.js, ai.test.js. You can export a line-check helper from game.js if ai.js needs it; do not change the behaviour of game.js.

Non-goals: no search deeper than the rules above, no difficulty levels, no change to index.html.

## Acceptance Criteria

Tests cover each rule above with fixed positions. One test plays many full games of computer against computer with a seeded random source: every returned action is accepted by applyAction, every game ends in a win or a draw, and no claim is wrong.

