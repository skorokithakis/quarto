---
id: qua-tgxfc
status: closed
deps: []
links: []
created: 2026-11-17T18:50:57Z
type: bug
priority: 1
assignee: Stavros Korokithakis
---
# Seat entry is decided once and can leave a client with no seat

Defect in the online layer of `index.html` (`syncFromServer`, `createFreshState`, `claimSeat`, the `initialSyncDone` flag).

Today the page decides create / join / watch one time, from the first fetch, and then waits for the name prompt. The state can change while the prompt is open, and the decision is never made again. Two results:
- Two clients open a room that has no state yet (for example the creator has the name prompt open and the second player already has the link). Each one creates version 1 with itself in seat index 0. The last write wins. The other client has no seat, seat index 1 is free, and the page never offers it. That client is stuck.
- `createFreshState` runs after the prompt and writes version 1 with no new check, so it can overwrite a room that came into existence during the prompt.

Required behaviour (this is the approved rule, applied to the current state and not to a snapshot):
- Ask for the name once, when this client has no seat and the room has no state or has a free seat.
- After the prompt, fetch the latest state again before any write. No state: create it. Free seat: take it. No free seat: watch.
- After that, on each state change: if this client has no seat, a seat is free, and the client already gave a name, take the free seat with no second prompt. This repairs the lost creation race.
- The default name ("Player 1" / "Player 2") depends on the seat the client gets in the end, not on the seat it expected when the prompt opened.
- A failed fetch still never counts as "no state".

Second, small copy change in the game interface: when a win has more than one common attribute value, join them as a list with commas and one final "and" ("tall, hollow and light"), not "tall and hollow and light". Two values stay "tall and round".

Non-goals: a fair tie-break for two clients that want the same seat (last write wins is acceptable, the loser watches), any protection against a hostile client, changes to `game.js`.

ready for implementation

## Acceptance Criteria

Two separate browser contexts open the same new room link and the two name prompts are open at the same time. After the two submit, in either order, one has seat 1 and the other has seat 2, and a game can start. A third context watches.


## Notes

**2026-11-17T18:55:10Z**

Addition from the project owner: remember the player's name.
- When a player submits the name prompt with a name they typed, keep it in localStorage (key `quarto.name`, next to the other `quarto.*` keys).
- When the prompt opens, fill the field with the stored name. The player confirms with the button and can change the name first. The prompt still shows; do not skip it. It is the only place where a player can change the name, and it stops a visitor from taking a seat with no action.
- Store only what the player typed. Do not store the defaults "Player 1" / "Player 2". If the player clears the field and submits, remove the stored name.
- This is separate from the rule in the ticket about a free seat that shows up later in the same page session: that rule uses the name already given in this session and shows no second prompt.
