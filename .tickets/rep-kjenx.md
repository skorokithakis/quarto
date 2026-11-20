---
id: rep-kjenx
status: closed
deps: []
links: []
created: 2026-11-20T07:59:31Z
type: task
priority: 2
assignee: Stavros Korokithakis
---
# Result text when a player calls Quarto on the other player's line

Ready for implementation.

Objective: when a game ends with a Quarto call on a line that the other player completed, the status text says so. Today it reads the same as a normal win, so the loser cannot see why they lost. Applies to online rooms and the computer room.

Detection: the game ended with a claim (not a forfeit), and the last 'place' action in the history belongs to the loser.

Texts (label stays 'Quarto!'; VALUES is the existing common-values string, NAME the seat name):
- Loser's view: 'You did not call Quarto. NAME called it on your line of four VALUES pieces.'
- Winner's view: 'NAME did not call Quarto. You called it on their line of four VALUES pieces.'
- Spectator: 'LOSER did not call Quarto. WINNER called it on their line of four VALUES pieces.'

Scope: statusContent in the game layer of index.html. If the check is cleaner as a pure helper in game.js, put it there with a test.

Non-goals: no change to the rules or to the normal win, forfeit and draw texts.

