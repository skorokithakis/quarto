---
id: qua-hrzat
status: closed
deps: []
links: []
created: 2026-11-17T19:25:02Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Redesign 1: tokens, fonts, controls, piece drawing, entry screens

Objective: bring the visual base of `index.html` to the reference design and rebuild the three entry screens (lobby, name prompt, waiting room) and the room line. The game screen is the next ticket: after this ticket it must still work, but its look can be unfinished.

Reference design: `misc/Quarto.html`. It is a packed export with 38 frames; serve the repository over HTTP and open it in a browser to see them. Readable unpacked copies are in the temporary directory `/tmp/opencode/quarto-design2/`: `pretty/<frame>.html` (one element per line, inline styles with the exact values), `text/<frame>.txt` (text only), `assets/` (fonts). If that directory is gone, unpack again: the root file holds `<script type="__bundler/manifest">` (JSON, each entry base64 and gzip) and `__bundler/template`; each page in the manifest is the same structure one level down. The frames use inline styles; the page must use classes and CSS custom properties, not copied inline styles.

Frames for this ticket: `palette-type-and-spacing`, `control-states`, `piece-sheet`, `phone-lobby`, `desktop-lobby`, `phone-name-prompt`, `desktop-name-prompt`, `phone-waiting-room`, `desktop-waiting-room`.

Scope:
- Fonts: copy `assets/eddba2ef40.woff2` (Figtree, Latin) and `assets/00c371950b.woff2` (Figtree, extended Latin) into a new `fonts/` directory with clear names. It is a variable font: one file serves weights 400 to 700. Use the unicode ranges from the frames. Add `fonts/OFL.txt` with the Figtree copyright line and the SIL Open Font License text, both from the comment at the top of `misc/Quarto.html`. The page must make no request to fonts.gstatic.com or any other font host. Fallback is system-ui (Figtree has no Greek; that is accepted).
- Tokens: colours, type sizes, spacing, radii and depth from the palette sheet, as CSS custom properties with the sheet's names.
- Controls: Quarto! button, strong button, button, quiet button, text field and link, each with default, hover, focus, pressed and disabled states from the control-states sheet. Sheet rules: pressed moves the top down and the edge becomes 1px; disabled lies flat with no edge; focus is a 2px indigo outline with a gap on every control; transitions are 120ms on transform, box-shadow, background-color and opacity, and there is no other motion.
- Piece drawing: one function that draws any of the 16 pieces as inline SVG from its four attributes, at any size. Read the attribute bits from `ATTRIBUTES` in `game.js`; do not keep a second copy of the bit layout. Follow the construction on the piece sheet exactly (100 unit box, 56 unit top face, wall of 28 or 8 units, shadow moved 6 or 3 units, 28 unit recess, 2 unit outline; the frames give the exact coordinates and colours for all 16). Accessible name as in the frames, for example "Tall, light, round, solid piece". It replaces the current piece drawing.
- Lobby, name prompt, waiting room: as in the frames, phone and desktop. The name field is still filled from the stored name. The waiting room shows when this client has a seat and the other seat is empty; its link field shows the real room link and must cope with a long one.
- Room line (waiting room now, game screen in the next ticket): lobby link, "Room" with the room code, connection indicator with three states. Below 840px the lobby link is the text "Lobby" at the top left. From 840px it is the wordmark "Quarto" with the accessible name "Quarto: back to lobby".
- Remove what the design drops: the share card outside the waiting room, the "Seat 1" / "Seat 2" labels.

Copy, use exactly:
- Lobby: "Quarto", "A board game for two players.", "Create game", "Rejoin last room (CODE)", "That room link is not valid."
- Name prompt (the same for the creator and for a player who joins): "What is your name?", "The other player sees this name. It can be 32 characters long.", "Your name", "Continue".
- Waiting room: "Waiting for the second player", "Send this link to the other player. The game starts when they open it.", "Link to this game", "Copy link" (feedback "Copied!" or "Copy failed", as today), "You", "Second player".
- Room line: "Lobby", "Room", "Connecting", "Connected", "Reconnecting".

Non-goals: the game screen layout, any change to rules, seats or sync, animation beyond the 120ms transitions, dark mode, a build step or packages.

## Acceptance Criteria

The lobby, name prompt and waiting room look like their frames at 390px and at 1280px wide. All 16 pieces drawn by the function match the piece sheet. No network request for fonts leaves the page's own host. Create, join by link and reload still work, and a game can still be played.


## Notes

**2026-11-17T19:28:36Z**

ready for implementation
