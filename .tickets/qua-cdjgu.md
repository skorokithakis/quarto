---
id: qua-cdjgu
status: closed
deps: []
links: []
created: 2026-11-17T18:30:39Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Online layer: rooms, seats, Gweet sync, persistence

Objective: create `index.html` (vanilla JS, inline CSS and script, no build step, no packages) with the online layer only. After this ticket, two browsers can open the same room link, take seat 1 and seat 2 with names, see the two names, and stay in sync after a reload. The game board is a later ticket.

Synced state, one JSON document: `{version, seats: [seat|null, seat|null], starter, actions}`, where a seat is `{id, name}`. `starter` (0 or 1) and `actions` (list) belong to the rules module. Treat them as opaque here. A new room starts with `starter: 0`, `actions: []`.

Gweet (HTTP message queue, CORS open, no auth), base `https://gweet.stavros.io`, key `quarto-<CODE>`:
- Write: POST `/stream/<key>/`, form-encoded, one field `state` that contains the JSON.
- Read latest: GET `/stream/<key>/?latest=1` gives `{"messages":[{"created","name","values":{field:[string]}}]}`. Values are arrays of strings.
- Live: GET `/stream/<key>/?streaming=1` stays open and sends JSON objects in a chunked response.
- The server keeps 100 messages per key for 5 days, in memory only. All listeners get messages in the same order.
- This format knowledge is second-hand. Confirm it against the live server with a throwaway key before you build on it, in particular how stream objects are framed and if a streamed object is bare or wrapped in `{"message": ...}`.

Behaviour:
- No `?room` in the URL: lobby with "Create game", which goes to `?room=<8 random characters>` (use an alphabet without look-alike characters). The lobby also links to the last room, if there is one.
- Room page: shows a share link with a "Copy link" button, the two seats with names, and the connection status.
- On room load, after a successful fetch of the latest state: if there is no state on Gweet and none stored locally, create one with this client in seat index 0. If this client's id is in a seat, resume. If a seat is free, ask for a name and take it. Otherwise the client is a spectator and can only read. A failed fetch does not mean "no state": try again, do not create.
- The creator is asked for a name too. An empty name becomes "Player 1" or "Player 2".
- Client id: random, kept in localStorage, the same for all rooms.
- Version rule: each local change increments `version` and posts the full state. Apply an incoming state if its `version` is equal to or higher than the local one. Do not use a time-based filter for the client's own echo.
- Persistence: keep the last state of each room in localStorage. On load and on each stream reconnect, fetch the latest state and use it, unless the local version is strictly higher. In that case post the local state again.
- Stream: reconnect automatically with backoff. Show "Connected" or "Reconnecting".
- Give the game interface (next ticket) one small internal interface: the current state, this client's seat (0, 1 or null), a function to submit a changed state, and a callback when the state changes.

Non-goals: board, pieces, game rules, authentication, protection against cheating, chat, name change after a seat is taken, play on one shared device.


## Notes

**2026-11-17T18:31:41Z**

ready for implementation
