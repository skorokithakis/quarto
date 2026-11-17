---
id: qua-txgtr
status: closed
deps: [qua-fwuxk, qua-cdjgu]
links: []
created: 2026-11-17T18:30:39Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Game interface: board, pieces, actions, results

Objective: add the game interface to `index.html`. It uses the rules module `game.js` (import as an ES module) and the online layer that is already in the page.

Rules for the page:
- The page never decides legality itself. Each action goes through `game.js`. An accepted action gives a new `{starter, actions}`, which the page submits through the online layer. Rendering always comes from the view that `game.js` derives from the current state.
- Game controls are off until the two seats are taken. Spectators see everything and have no controls.

Content:
- 4x4 board, pool of remaining pieces, the piece in hand, the two names, and a status line that says whose turn it is and what they must do.
- Pieces are inline SVG, seen from above: tall is large and short is small; light or dark fill; round or square outline; hollow has a centre hole. All 16 must be easy to tell apart on a phone.
- Seat to act: tap a pool piece to select it (select step), tap an empty square to place (place step), "Quarto!" button, and "Pass" / "Accept draw" in the last-piece sequence.
- "Undo" for the seat whose own action is the last one, while the game is not over.
- "New game" for the two seated players. It asks for confirmation if the game is not over. It flips `starter` and clears `actions`.
- Win: highlight all winning lines, name the common attribute, name the winner. Draw: say so. Wrong claim: a notice on all screens until the next action.
- Layout works at about 360px wide and on a desktop.

Copy. Use these strings as written ({name} is a player name, {attribute} is one of: tall, short, light, dark, round, square, solid, hollow):
- "Waiting for the second player. Send them the link."
- "Select a piece for {name}." / "{name} is selecting a piece for you." / spectator: "{name} is selecting a piece."
- "Place your piece." / "{name} is placing a piece."
- "No pieces remain. Call Quarto or pass." / "{name} can call Quarto or pass."
- "Call Quarto or accept a draw." / "{name} can call Quarto or accept a draw."
- "You win with a line of {attribute} pieces." / "{name} wins with a line of {attribute} pieces."
- "The game is a draw."
- "No Quarto. {name} called it, but there is no line."
- Buttons: "Quarto!", "Undo", "Pass", "Accept draw", "New game".
- Confirmation: "End this game and start a new one?"

Non-goals: 2x2 variant, computer opponent, play on one shared device, chat, score history, sound, animation, offline use, installable app, screen wake lock, penalty for wrong claims, opponent approval for undo.


## Notes

**2026-11-17T18:31:41Z**

ready for implementation

**2026-11-17T18:42:50Z**

Contracts from the two finished tasks. Read the code for details; do not change these contracts without asking.

Rules module (`game.js`, ES module):
- `ATTRIBUTES`: `[{name, mask, values: [valueWhenBitClear, valueWhenBitSet]}]` for height, colour, shape, fill. Use it to draw pieces and to name the common attribute. Do not keep a second copy of the bit layout.
- `viewOf({starter, actions})` gives `{board, remaining, hand, seat, step, result, wrongClaim}`. `step` is 'select' | 'place' | 'pass' | 'draw'. `seat` and `step` are null when the game is over. `result` is null, `{type:'win', winner, lines:[{squares, attributes:[{attribute, value}]}]}` or `{type:'draw'}`. `wrongClaim` is null or `{seat}`.
- `applyAction(game, action)` and `undo(game, seat)` give `{ok:true, game}` or `{ok:false, error}`. They do not throw for illegal actions.
- A claim on an empty board is rejected, so keep "Quarto!" off until a piece is on the board.

Online layer (inline script in `index.html`), `window.QuartoOnline`:
- `getState()`, `getSeat()` (0, 1 or null), `submit({starter, actions})`, `onStateChange(callback)` (one callback only; called with `(state, seat)`).
- The online layer owns `version` and `seats`. `submit` ignores them.
- The callback fires more than once for one change (local apply, then the echo from the server) and again on reconnect. Render from the state you receive each time. Do not count callbacks as moves.
- The callback does not fire when the connection status changes.

Two additions to this ticket:
- If a line has more than one common attribute, or there is more than one winning line, name each distinct attribute value once, joined with "and" (for example "a line of tall and round pieces").
- Connection status: also show "Reconnecting" while a failed POST waits for its retry. Today the status stays "Connected" in that case, and a player then waits for an opponent who never received the move.
