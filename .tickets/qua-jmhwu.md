---
id: qua-jmhwu
status: closed
deps: []
links: []
created: 2026-11-17T20:43:30Z
type: bug
priority: 1
assignee: Stavros Korokithakis
---
# Review fixes after the redesign: rename while offline, dialog focus, redundant re-render, notice with no state

Four defects from the code review of the redesign. All are in `index.html`. Keep each fix as small as the text says.

1. A rename can write while the page is not connected.
Open the name prompt from the own chip while connected, lose the connection, press "Continue": the rename still writes version + 1 and posts. Every control that writes must be off while not connected.
Fix: the rename function in the online layer does nothing and reports failure when the connection state is not 'connected'. In the edit prompt, "Continue" is disabled while not connected (and enabled again when the connection returns); "Cancel" and Escape still work. The first-time prompt (no stored name) is not affected: its path already reads the room again and handles a failed fetch.

2. Keyboard focus can leave the name prompt.
The prompt covers the screen, but the controls behind it can still be reached with Tab and used.
Fix: make the page content behind the prompt `inert` while the prompt is open, and remove it on submit, Cancel and Escape. Keep the existing return of focus.

3. Every state callback rebuilds the board and pool controls, also when nothing changed.
The online layer calls the callback more than once per change (local apply, then the echo from the server, and again on reconnect). Each call replaces the buttons, so a keyboard user loses focus for no reason.
Fix: skip the render when its inputs are the same as for the last render (the state, this client's seat, the connection state, and whether the connection notice shows). Do not build a finer diff of the DOM. A real change still rebuilds, as now.

4. With no state loaded, a long connection failure shows no notice.
If the first fetch never succeeds, the 5 second timer renders the skeleton, which hides the notice. The player sees an empty board and "Connecting" or "Reconnecting" with no explanation.
Fix: the skeleton also shows the connection notice ("Connection lost. The game is paused.") and the dimmed board after about 5 seconds without a connection, the same as the game screen.

Not a defect, no change (for the record): with a stored name the page takes a seat on the first successful fetch with no second read. The second read exists only to cover the time the name prompt is open; with no prompt the first read is current.

Non-goals: any other restructuring, changes to `game.js`, changes to the design.

ready for implementation

## Acceptance Criteria

1. With the edit prompt open and the connection lost, Continue is off and no POST goes out; after reconnection a rename works. 2. With the prompt open, Tab cycles only inside it. 3. Focus on a pool piece or board square survives an identical echo and a reconnect refresh. 4. With all Gweet requests failing from the first load, the notice and the dimmed board show after about 5 seconds, and they go away when a fetch succeeds.

