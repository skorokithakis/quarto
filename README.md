# Quarto

An online version of the board game Quarto for two players. It is a static web
page: there is no build step, no package to install, and no backend to run.

## How to play

1. Open the page and select **Create game**.
2. Send the room link to the other player.
3. Each player enters a name and takes a seat. Other visitors can watch.

In each turn, a player puts the piece they received on an empty square, then
selects a piece for the opponent. The 16 pieces differ in four attributes:
height (large is tall, small is short), colour, shape, and fill.

A player wins when they call **Quarto!** on a line of four pieces (row, column,
or diagonal) that have one attribute value in common. The line must contain the
most recently placed piece:

- The player who completes a line can call it before they select a piece.
- If they do not, the opponent can call it before they place their piece.
- After the next piece is on the board, the line has no value.

A wrong call has no penalty. A player can undo their own last action until the
opponent acts.

## How to run it

Serve the directory over HTTP. The page does not work from `file://`, because
it loads `game.js` as a module.

```
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Tests

The rules have tests that use the test runner built into Node.js:

```
node --test
```

## How it works

- `game.js` holds the rules and nothing else. A game is a starting seat and an
  ordered list of actions. The board, the turn, and the result are calculated
  from that list.
- `index.html` holds the page, the game interface, and the online layer.
- The two players sync through [Gweet](https://github.com/skorokithakis/gweet),
  a simple HTTP message queue, at `https://gweet.stavros.io`. Each message
  contains the full game state and a version number. A client applies a state
  if its version is equal to or higher than its own.
- The browser keeps the last state of each room, the player's name, and a
  random client ID in `localStorage`. A reload brings back the game and the
  seat.

## Limits

- Only the browsers enforce the rules. Any person who has the room link can
  write to the room, so play with people you trust.
- If the two players act at the same moment, one action is lost and that
  player must do it again.
- Gweet keeps messages in memory for 5 days. A room comes back if a player who
  still has it stored opens it again.
- Two tabs in one browser share one client ID, so they are the same seat. Use
  two devices or two browser profiles.
