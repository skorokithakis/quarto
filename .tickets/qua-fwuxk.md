---
id: qua-fwuxk
status: closed
deps: []
links: []
created: 2026-11-17T18:30:39Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Quarto rules module (game.js) with tests

Objective: create `game.js`, an ES module that holds the Quarto rules and nothing else (no DOM, no network, no storage). Create `game.test.js` for Node's built-in runner (`node --test`). No packages. A `package.json` that only sets `"type": "module"` and a test script is acceptable.

Data model (this is the contract with the page, keep it):
- Seat: 0 or 1.
- Piece: integer 0..15. Each of the 4 bits is one attribute: height (tall/short), colour (light/dark), shape (round/square), fill (solid/hollow).
- Square: integer 0..15, row-major.
- Game: `{starter, actions}`. `starter` is the seat that selects the first piece. `actions` is the ordered list of all actions. Everything else is derived by replay.
- Action: `{seat, type, ...}`. Types: `select` (with `piece`), `place` (with `square`), `claim`, `pass`, `draw`.

Needed operations (names are your choice, all pure):
- Derive a view from a game: board, remaining pieces, piece in hand, seat to act, expected step, result (win with winner seat, all winning lines, common attribute values per line; or draw), and whether the latest action is a wrong claim and by which seat.
- Apply an action: return the new game, or reject an illegal action (wrong seat, wrong step, piece not available, square occupied, game over).
- Undo for a seat.

Rules:
- Turn order: the starter selects a piece. The other seat places it, then selects a piece for the starter. Repeat.
- Claim: allowed for the seat to act, at any step, when at least one piece is on the board. A claim is correct if at least one line (4 rows, 4 columns, 2 diagonals) is full, contains the most recently placed square, and its four pieces share at least one attribute value. A correct claim ends the game and the claimer wins. A wrong claim is recorded as an action and changes nothing else: same seat to act, same step.
- Consequences of the claim rule that must hold: the placer can claim their own line before they select. The opponent can claim that line after they receive a piece and before they place it. After the next placement the line can no longer be claimed.
- Last piece: after the 16th placement the placer's step is "pass" (claim or `pass`). After `pass`, the other seat can claim or do `draw`, which ends the game as a draw.
- Undo: allowed only if the game is not over and the last action belongs to the seat that asks. It removes that one action. A seat can therefore undo two consecutive own actions (select, then place) with two calls. A wrong claim is an ordinary action for undo.

Non-goals: 2x2 square variant, penalty for wrong claims, seats/names/version numbers (the page owns those), any interface code.

## Acceptance Criteria

Tests cover at least: win by the placer's own claim; win by the opponent's claim after they receive a piece; a line that expired after the next placement gives a wrong claim; a wrong claim leaves seat and step unchanged and is reported in the view; lines on a row, a column and a diagonal; a common value on each of the 4 attributes; illegal actions rejected; undo limits (own action only, two consecutive own actions, not the opponent's action, not after the game ends); last-piece sequence to a win and to a draw.


## Notes

**2026-11-17T18:31:41Z**

ready for implementation
