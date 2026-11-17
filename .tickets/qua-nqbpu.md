---
id: qua-nqbpu
status: open
deps: [qua-gllwl]
links: []
created: 2026-11-17T19:56:04Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Name: ask once, reuse, change from the own chip

Objective: a player sets their name one time. The page reuses it with no prompt, and the player can change it from a discreet button on their own name chip.

Behaviour:
- Name prompt: shows only when this browser has no stored name (`quarto.name`) and the client needs one (no seat, and the room has no state or a free seat). With a stored name the page shows no prompt: it creates the room or takes the free seat directly, with the same checks against the current room state as today (read the state again before any write; never treat a failed fetch as an empty room).
- Edit button: the client's own name chip, in the waiting room and in the game, gets an icon-only button at its right end, after the "You" label. Inline SVG pencil, about 16px, muted text colour, charcoal on hover, no border and no background, 44px touch target, the design's focus ring. Accessible name "Change your name". Not shown on the other player's chip, and spectators have none.
- The button opens the existing name prompt screen with the current name in the field, plus a quiet "Cancel" button. "Continue" stores the name and changes this client's seat name in the room. "Cancel" and the Escape key close the screen with no change.
- Online layer: one new function that renames the client's own seat. It finds the seat by client id, writes the full state with version + 1, and posts it, the same path as every other local change. It does nothing for a spectator.
- The button is off while the page is not connected, as every other control that writes.
- Empty submit, in the first prompt and in the edit: the name becomes "Player 1" or "Player 2" by seat, and the stored name is removed. This is the current rule.

Copy, use exactly: "Change your name" (accessible name of the button), "Cancel". The prompt keeps "What is your name?", "The other player sees this name. It can be 32 characters long.", "Your name", "Continue".

Accepted limits: a rename that collides with the other player's move follows the normal rule (last write wins, one of the two is lost). A person with a stored name who opens a room link takes the free seat with no action.

Non-goals: a name change from the lobby, a name change for spectators, a designed frame for the edit state, any change to rules or to the rest of the sync.

## Acceptance Criteria

A browser with a stored name creates a room and joins a room by link with no prompt, and the two-clients-on-a-new-room race still ends with one player in each seat. A browser with no stored name gets the prompt. The pencil changes the name on the two screens and in storage; Cancel and Escape change nothing; the pencil is off while not connected. A rename during a game does not change the board or the turn.


## Notes

**2026-11-17T19:56:18Z**

ready for implementation
