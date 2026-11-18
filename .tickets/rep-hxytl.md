---
id: rep-hxytl
status: closed
deps: [rep-zzjcw]
links: []
created: 2026-11-18T20:58:40Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Page: room score and Forfeit button

Ready for implementation.

Objective: in index.html, keep a win count per seat for the room, show it in the name chips, and replace mid-game 'New game' with 'Forfeit'. Uses the game.js resign action and score helper from the dependency ticket.

Room state:
- Add score: [wins0, wins1] to the room state. New rooms start at [0, 0].
- A state with no score (old rooms, old tabs) is valid and means [0, 0]. Otherwise each value must be a whole number of 0 or more.
- The online layer's submit() currently rebuilds the state from starter and actions only. It must carry the score through, or ordinary moves will drop it.
- 'New game' (only after a game ends) adds the finished game's winner to the stored score through the score helper, flips starter and clears actions, in one submit.

Shown score = stored score + the current game's winner if it has ended (score helper on the current game). So a win shows at once.

Buttons:
- In progress with at least one action: the quiet button says 'Forfeit'. It asks 'Forfeit this game? {name} gets the win.' ({name} = the opponent), then submits a resign for the own seat.
- No actions yet: keep 'New game' as today (no confirm, no score change).
- Game over: strong 'New game', as today.
- Same enabled rules as today's New game button (seated players, connected).

Display:
- Each chip shows its seat's win count after the name (after 'You' on the own chip is fine), smaller and quieter than the name, and correct in light and dark mode. Long names must shorten, never the number. Keep the own chip's DOM rebuild rule (see the comment on buildChips).

Forfeit result:
- Status line: '{loser} forfeits. {winner} wins.' for others; for the forfeiting player 'You forfeit. {winner} wins.'; for the winner '{loser} forfeits. You win.'
- A forfeit win has no lines. The board highlight and the win message code use result lines and attribute values today; they must handle the empty case.

Non-goals: no reset button, no draw count, no score across rooms, no design file change.

