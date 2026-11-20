---
id: rep-edazq
status: closed
deps: [rep-oyahw]
links: []
created: 2026-11-20T07:59:31Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Computer room: local game against the computer, no Gweet

Ready for implementation.

Objective: a lobby button 'Play the computer' opens a local room where seat 0 is the player and seat 1 is the computer. The room does not use Gweet.

Online layer (first script in index.html):
- Lobby: add the button below 'Create game', with the existing secondary .button style. It opens ?computer. If ?room is present, the existing room behaviour wins.
- Computer room: no fetch, no stream, no POST. Connection is always 'connected'. The state has the same shape as an online state, so isValidState and the game layer work with no change. Seat 1 is named 'Computer'.
- Player name: no name prompt. Use the saved name, or the default seat name. Rename from the chip works as it does online.
- Save the state in localStorage and load it on reload, so the game and the score survive. The storage key must not be able to collide with any room code. If the saved state is not valid or the client has no seat in it, start a fresh state.
- Do not write quarto.lastRoom, so 'Rejoin last room' still shows the last online room.
- Hide the room code and the connection label in this room. The page title is 'Quarto'.
- Add to window.QuartoOnline a way for the game layer to get the computer's seat (1 in this room, null in online rooms). Update the interface comment.

Game layer (second script):
- Driver for the computer. When the room has a computer seat, the game is in progress and it is that seat's turn, schedule one action after about 700 ms. When the timer fires, compute from the latest state: check again that it is the computer's turn, get the action from ai.js, apply it with applyAction and submit it. One timer at a time.
- The driver depends on the state only, not on the event that caused it. A reload on the computer's turn, a new game that the computer starts, and a player undo during the delay must all work.
- The driver uses the computer-seat value from the interface. Do not detect the computer from a seat id or name, because an online state can contain any id.

Non-goals: no thinking indicator, no change to undo, forfeit, score or new-game rules, no sync between two tabs (accepted limit), no offline cache, no rules screen (next ticket).

Caveat: every control that is on for a player today (Quarto, Undo, Pass, Accept draw, Forfeit, New game, rename) must work in this room with no special case.

## Acceptance Criteria

From the lobby, a full game against the computer can be played to a win, a loss and a draw; the score counts; New game alternates the starter and the computer makes the first move when it starts; a reload keeps the game. In this room the page makes no request to gweet.stavros.io. Online rooms behave as before.

