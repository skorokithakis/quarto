---
id: rep-aunuu
status: closed
deps: [rep-edazq]
links: []
created: 2026-11-20T07:59:31Z
type: feature
priority: 2
assignee: Stavros Korokithakis
---
# Rules screen in the computer room

Ready for implementation.

Objective: a 'How to play' screen in the computer room.

Behaviour:
- It is a third phase of the room body, next to 'waiting' and 'game', with the same .screen-column layout as the waiting screen. No pop-up.
- It shows before the game when the player enters the computer room and localStorage has no quarto.rulesSeen flag. The button below the text reads 'Start game'. It sets the flag and shows the game.
- A 'Rules' link in the top line of the computer room opens the screen again. The button then reads 'Back to game'. The link is not in online rooms.
- The computer does not wait while the screen is open. This is accepted.

Text, exactly as approved (bold as marked):

Title: How to play

There are 16 pieces, all different. Each piece is tall or short, light or dark, round or square, and solid or hollow.

**You do not choose the piece you place.** The other player selects it for you. You place it on an empty square, then you select a piece for the other player.

**Make a line of four pieces that have one thing in common**, for example four tall pieces or four hollow pieces. A line is a row, a column or a diagonal. The pieces belong to no one, so it does not matter who placed the other three.

**Call Quarto to win.** When your piece completes a line, press **Quarto** before you give the next piece. If you forget, the other player can call Quarto on your line and win. A wrong call costs nothing.

If the board is full and no one called Quarto, the game is a draw.

Picture: after the 'Make a line' paragraph, one row of four pieces drawn with the existing piece drawing code: pieces 1, 7, 11 and 13 (all tall, no other common attribute). Caption: 'These four pieces are all tall. That is a Quarto.' Give the row a text alternative.

Non-goals: no rules link in the lobby or in online rooms, no translation, no new colour tokens or fonts.

Caveat: the screen must be readable in light and dark theme and at 390px width, and keyboard focus must go to the screen when it opens and back to the game when it closes.

