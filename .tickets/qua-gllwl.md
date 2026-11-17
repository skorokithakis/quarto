---
id: qua-gllwl
status: closed
deps: [qua-hrzat]
links: []
created: 2026-11-17T19:25:02Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Redesign 2: game screen

Objective: rebuild the game screen of `index.html` to the reference design, on the tokens, controls and piece drawing from the first redesign ticket. The rules, the seats and the sync logic stay as they are, with the two small additions below.

Reference design: `misc/Quarto.html`. It is a packed export with 38 frames; serve the repository over HTTP and open it in a browser to see them. Readable unpacked copies are in the temporary directory `/tmp/opencode/quarto-design2/`: `pretty/<frame>.html` (one element per line, inline styles with the exact values), `text/<frame>.txt` (text only), `assets/` (fonts). If that directory is gone, unpack again: the root file holds `<script type="__bundler/manifest">` (JSON, each entry base64 and gzip) and `__bundler/template`; each page in the manifest is the same structure one level down. The frames use inline styles; the page must use classes and CSS custom properties, not copied inline styles.

Frames: all `phone-*` and `desktop-*` game frames, plus `360px-smallest-phone`, `600px-to-839px-...` and `840px-to-1199px-...`. The `control-states` sheet covers the board cell and the pool position.

Two additions outside the interface:
- `game.js`: the view from `viewOf` also reports the most recently placed square (null when no piece is on the board). Add a test. No other change to the rules.
- Online layer: expose the connection state ('connecting', 'connected', 'reconnecting') and a callback when it changes. Today the state-change callback does not fire for it.

Layout, four width ranges (each has a frame): below 600px the phone layout, fluid from 360px; 600 to 839px the phone layout centred in a 480px column; 840 to 1199px two columns (board left, the rest right); from 1200px three columns.

Parts:
- Room line as in the first ticket.
- Two name chips. The dot marks the seat that must act; read its styles for "you" and "opponent" from the frames. "You" label on the client's own chip.
- Status block: a small label above one sentence. A notice (dark bar with an icon) replaces the status block. Priority: connection lost, then wrong claim, then the normal status.
- Board: indigo outline when this client must place. Empty cells are targets only then. On hover a target shows the piece in hand at 45%. A dot marks the most recently placed piece. After a win, the cells of all winning lines are lit and the other pieces are at 40%.
- Pool: fixed 4x4 grid. Rows: light round, light square, dark round, dark square. Columns: tall solid, tall hollow, short solid, short hollow. A piece that left the pool leaves an empty position with a small dot. Pieces are buttons only when this client must select.
- "In hand" well.
- Before the first state arrives: the empty skeleton from the `before-the-game-data-arrives` frames, all controls off, indicator "Connecting".

Controls. The rules decide; `game.js` stays the only judge of legality:
- "Quarto!": always visible for a seated player. On when it is this client's turn and at least one piece is on the board.
- "Undo": visible during play. On when the last action is this client's own.
- "Pass": visible only at the 'pass' step, for the seat to act. "Accept draw": visible only at the 'draw' step, for the seat to act.
- "New game": quiet button during play, with the browser's standard confirmation; strong button after the game ends, with no confirmation. It flips the starter, as today.
- After a win or a draw: "Undo" is not shown.
- Spectators: no controls.
- Connection: while the state is not 'connected', every game control is off, "New game" included (the frames leave "New game" on; this is a deliberate deviation). After about 5 seconds without a connection, show the connection notice and dim the board to 45%. Before that, only the indicator changes.

Copy, use exactly. {opponent} is the other player's name; {A} is the seat that selects or passes, {B} the other seat; {values} is the list of distinct common attribute values joined with ", " (for example "tall, round"):
- Own turn, label "Your turn": "Select a piece for {opponent}." / "Place the piece that {opponent} selected for you." / "All the pieces are on the board. Call Quarto or pass." / "{opponent} passed. Call Quarto or accept a draw."
- Other player's turn, label "Opponent's turn": "{opponent} selects a piece for you." / "{opponent} places the piece that you selected." / "All the pieces are on the board. {opponent} can call Quarto or pass." / "You passed. {opponent} can call Quarto or accept a draw."
- Spectator, label "You are a spectator": "{A} selects a piece for {B}." / "{B} places the piece that {A} selected." / "All the pieces are on the board. {A} can call Quarto or pass." / "{A} passed. {B} can call Quarto or accept a draw."
- Win, label "Quarto!" for every viewer: "You win with four {values} pieces in a line." / "{name} wins with four {values} pieces in a line."
- Draw, label "Draw" for every viewer: "The board is full and there is no Quarto."
- Notices: "Wrong claim. There is no Quarto on the board." / "Connection lost. The game is paused."
- Labels and buttons: "Remaining pieces", "In hand", "You", "Quarto!", "Undo", "Pass", "Accept draw", "New game". Confirmation: "End this game and start a new one?"
- Accessible names as in the frames: "Place the piece on row R, column C", "Select the tall, light, round, hollow piece", "Most recently placed piece".

Non-goals: changes to rules, seats or sync beyond the two additions, a designed confirmation dialog, animation beyond the 120ms transitions, dark mode, a build step or packages.

## Acceptance Criteria

Each game frame's state can be reached in the real page with two browser contexts and looks like the frame at 390px and at 1280px. The page also matches the 360px, 768px and 1024px frames. A full regression pass of play gives the same behaviour as before (claims, wrong claim, undo limits, last-piece sequence, new game, spectator, reload). node --test passes.


## Notes

**2026-11-17T19:28:36Z**

ready for implementation
