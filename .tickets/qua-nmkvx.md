---
id: qua-nmkvx
status: closed
deps: []
links: []
created: 2026-11-17T19:00:22Z
type: bug
priority: 1
assignee: Stavros Korokithakis
---
# Review fixes: POST loop, illegal histories, stalled connections, post-prompt reconcile

Four defects from the code review. All are in the online layer of `index.html`; the second one also adds a small function to `game.js`. Keep each fix as small as the text says.

1. POST loop on the client's own echo (`pushStateNow`).
After a POST succeeds, the code posts again if `currentState !== snapshot`. The stream delivers the client's own message (and the opponent's messages) as a new object, so the identity check is true when an echo arrives before the POST response. The page then posts the same state again, and the cycle can repeat with no end.
Fix: post again only when a local change was made while the POST was in flight (the `pushAgain` flag already records this). A state that came from the server must never cause a POST by itself. Remove the identity comparison.

2. An illegal action history is accepted, stored and re-published.
`isValidState` checks only that `actions` is an array. A history such as `[null]`, or one with an illegal action, passes, is saved to localStorage, makes the replay in `game.js` throw or give a nonsense board, and can be posted again on reconnect. The room is then broken for all clients.
Fix: add one exported function to `game.js` that says if a `{starter, actions}` game is a legal history, by replay of each action through the existing `applyAction` from an empty game. It must return false (not throw) for any malformed input. Add tests for it. The online layer must call it in the one place that decides if a state is valid, so that it covers streamed states, fetched states and states loaded from localStorage. Preferred wiring: the online layer imports the function from `game.js`. If that needs the online script to become a module, check that `window.QuartoOnline` still exists before the game interface script uses it.

3. A stalled network call can stop reconnection for good.
The stream request has no time limit until the response headers arrive, and `fetchWithTimeout` clears its timer before the response body is read (`res.json()` in `fetchLatestState`). If either stalls, the connect cycle never ends and no new attempt is scheduled.
Fix: put a time limit on the stream handshake (start the existing watchdog/abort before the stream `fetch`, not after), and keep the request timeout active until the body of the latest-state response is fully read.

4. The fetch after the name prompt bypasses the version rule (`syncFromServer`).
After the prompt the code does `latest === null ? createFreshState(...) : setState(latest)`. This can replace a newer local state with an older server state, or reset the room to version 1 while a newer local state waits to be posted.
Fix: call `reconcile(latest)` there and let `settleSeat()` create the room only when there is no state at all (it already does this).

Non-goals: automated browser tests, protection against a hostile client beyond what fix 2 gives, recovery when the newest message on the server is itself invalid, any other restructuring.

ready for implementation

## Acceptance Criteria

1. With the POST response delayed so that the echo arrives first, one move gives exactly one POST. An opponent's move that arrives during an own POST gives no extra POST.
2. `node --test` passes with new tests for the legal-history function (legal game, `[null]`, wrong seat, illegal step, action after the game ended, non-array). A cached or streamed state with an illegal history is ignored, and a later valid state still applies and renders.
3. A stream request or a latest-state body that never completes leads to "Reconnecting" and a new attempt.
4. A newer local state is not replaced by an older or empty server response after the name prompt.

