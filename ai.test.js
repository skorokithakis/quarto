import test from 'node:test';
import assert from 'node:assert/strict';

import { createGame, viewOf, applyAction, winningLines } from './game.js';
import { chooseAction } from './ai.js';

/** Always return the same value, for deterministic choices. */
function fixed(value) {
  return () => value;
}

/** A small deterministic PRNG, so full games can be replayed. */
function seeded(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function play(game, actions) {
  let current = game;
  for (const action of actions) {
    const outcome = applyAction(current, action);
    assert.equal(outcome.ok, true, `illegal action ${JSON.stringify(action)}: ${outcome.error}`);
    current = outcome.game;
  }
  return current;
}

/**
 * Build alternating select/place actions for a list of placements.
 * The returned `seat` is the seat that placed the last piece.
 */
function scriptedPlacements(starter, placements) {
  const actions = [];
  let seat = starter;
  for (const { piece, square } of placements) {
    actions.push({ seat, type: 'select', piece });
    seat = 1 - seat;
    actions.push({ seat, type: 'place', square });
  }
  return { actions, seat };
}

function placement(piece, square) {
  return { piece, square };
}

function emptySquares(board) {
  const squares = [];
  board.forEach((piece, square) => {
    if (piece === null) squares.push(square);
  });
  return squares;
}

/** Return true when placing `piece` on `square` completes a line. */
function completesLine(board, square, piece) {
  const placed = [...board];
  placed[square] = piece;
  return winningLines(placed, square).length > 0;
}

test('returns null when the game is over or it is not the seat\'s turn', () => {
  const empty = createGame(0);
  assert.equal(chooseAction(empty, 1), null);
  assert.deepEqual(chooseAction(empty, 0, fixed(0)), { seat: 0, type: 'select', piece: 0 });

  const selecting = play(empty, [{ seat: 0, type: 'select', piece: 5 }]);
  assert.equal(viewOf(selecting).step, 'place');
  assert.equal(chooseAction(selecting, 0), null);
  assert.deepEqual(chooseAction(selecting, 1, fixed(0)), { seat: 1, type: 'place', square: 0 });

  const row = scriptedPlacements(0, [
    placement(1, 0),
    placement(7, 1),
    placement(13, 2),
    placement(11, 3),
  ]);
  row.actions.push({ seat: row.seat, type: 'claim' });
  const won = play(createGame(0), row.actions);
  assert.equal(viewOf(won).result.type, 'win');
  assert.equal(chooseAction(won, 0), null);
  assert.equal(chooseAction(won, 1), null);
});

test('claims a line it has just completed, before selecting', () => {
  // Squares 0..2 hold tall pieces, so placing 11 at 3 completes the row.
  const { actions, seat } = scriptedPlacements(0, [
    placement(1, 0),
    placement(7, 1),
    placement(13, 2),
    placement(11, 3),
  ]);
  assert.equal(seat, 0);
  const game = play(createGame(0), actions);
  const view = viewOf(game);
  assert.equal(view.step, 'select');
  assert.equal(view.seat, 0);

  const action = chooseAction(game, 0, fixed(0.99));
  assert.deepEqual(action, { seat: 0, type: 'claim' });

  const claimed = applyAction(game, action);
  assert.equal(claimed.ok, true);
  assert.equal(viewOf(claimed.game).result.winner, 0);
});

test('does not claim while there is no complete line', () => {
  const { actions, seat } = scriptedPlacements(0, [
    placement(1, 0),
    placement(7, 1),
    placement(13, 2),
  ]);
  assert.equal(seat, 1);
  const game = play(createGame(0), actions);
  const view = viewOf(game);
  assert.equal(view.step, 'select');
  assert.deepEqual(winningLines(view.board, view.lastPlaced), []);

  assert.equal(chooseAction(game, seat, fixed(0)).type, 'select');
});

test('claims a line the other seat made and did not call', () => {
  // Squares 0, 4, 8 and 12 hold light pieces; the last one made the column.
  const { actions, seat } = scriptedPlacements(0, [
    placement(2, 0),
    placement(7, 4),
    placement(14, 8),
    placement(11, 12),
  ]);
  assert.equal(seat, 0);
  const passedUp = play(createGame(0), [...actions, { seat, type: 'select', piece: 0 }]);
  const view = viewOf(passedUp);
  assert.equal(view.step, 'place');
  assert.equal(view.seat, 1);

  const action = chooseAction(passedUp, 1, fixed(0));
  assert.deepEqual(action, { seat: 1, type: 'claim' });

  const claimed = applyAction(passedUp, action);
  assert.equal(claimed.ok, true);
  assert.equal(viewOf(claimed.game).result.winner, 1);
});

test('places the piece on a square that makes a line', () => {
  // One row and one column of three tall pieces are each missing a fourth,
  // so placing the tall 7 at either 3 or 12 wins.
  const { actions, seat } = scriptedPlacements(0, [
    placement(1, 0),
    placement(9, 1),
    placement(11, 2),
    placement(3, 4),
    placement(5, 8),
  ]);
  const game = play(createGame(0), [...actions, { seat, type: 'select', piece: 7 }]);
  const view = viewOf(game);
  assert.equal(view.step, 'place');
  assert.equal(view.seat, 0);
  assert.equal(view.hand, 7);
  assert.deepEqual(winningLines(view.board, view.lastPlaced), []);

  // The choice is random among equal options, and both options win.
  assert.deepEqual(chooseAction(game, 0, fixed(0)), { seat: 0, type: 'place', square: 3 });
  assert.deepEqual(chooseAction(game, 0, fixed(0.99)), { seat: 0, type: 'place', square: 12 });

  const placed = play(game, [chooseAction(game, 0, fixed(0))]);
  const after = viewOf(placed);
  assert.equal(after.step, 'select');
  assert.equal(winningLines(after.board, after.lastPlaced).length > 0, true);

  const claimed = play(placed, [chooseAction(placed, 0, fixed(0))]);
  assert.equal(viewOf(claimed).result.type, 'win');
  assert.equal(viewOf(claimed).result.winner, 0);
});

test('prefers a square that leaves a safe piece to give', () => {
  // Squares 0, 4 and 8 hold short dark pieces; 13, 14 and 15 hold round
  // solid ones. Square 12 is the empty fourth square of both lines, so it
  // is the only placement that leaves any remaining piece safe to give.
  const { actions, seat } = scriptedPlacements(0, [
    placement(0, 0),
    placement(4, 4),
    placement(8, 8),
    placement(13, 13),
    placement(14, 14),
    placement(15, 15),
  ]);
  const game = play(createGame(0), [...actions, { seat, type: 'select', piece: 3 }]);
  const view = viewOf(game);
  assert.equal(view.step, 'place');
  assert.equal(view.seat, 1);
  assert.equal(view.hand, 3);
  assert.deepEqual(winningLines(view.board, view.lastPlaced), []);

  // 12 is the only preferred square, so every random source agrees.
  assert.deepEqual(chooseAction(game, 1, fixed(0)), { seat: 1, type: 'place', square: 12 });
  assert.deepEqual(chooseAction(game, 1, fixed(0.99)), { seat: 1, type: 'place', square: 12 });
  assert.deepEqual(chooseAction(game, 1, fixed(0.5)), { seat: 1, type: 'place', square: 12 });

  const placed = play(game, [chooseAction(game, 1, fixed(0))]);
  assert.equal(viewOf(placed).step, 'select');
});

test('gives a safe piece when one exists', () => {
  // Squares 0..2 hold light pieces, so any light piece would complete the row.
  const { actions, seat } = scriptedPlacements(0, [
    placement(2, 0),
    placement(7, 1),
    placement(11, 2),
  ]);
  const game = play(createGame(0), actions);
  const view = viewOf(game);
  assert.equal(view.step, 'select');
  assert.equal(view.seat, seat);

  const empties = emptySquares(view.board);
  const unsafe = view.remaining.filter((piece) =>
    empties.some((square) => completesLine(view.board, square, piece)),
  );
  const safe = view.remaining.filter((piece) => !unsafe.includes(piece));
  assert.deepEqual(safe, [0, 1, 4, 5, 8, 9, 12, 13]);

  assert.deepEqual(chooseAction(game, seat, fixed(0)), { seat, type: 'select', piece: 0 });
  assert.deepEqual(chooseAction(game, seat, fixed(0.99)), { seat, type: 'select', piece: 13 });
});

test('gives any piece when none is safe', () => {
  // One row of three light pieces and one of three short dark pieces, with
  // the fourth square empty in both. Every remaining piece is unsafe.
  const { actions, seat } = scriptedPlacements(0, [
    placement(2, 0),
    placement(7, 1),
    placement(11, 2),
    placement(0, 4),
    placement(4, 5),
    placement(8, 6),
  ]);
  const game = play(createGame(0), actions);
  const view = viewOf(game);
  assert.equal(view.step, 'select');
  assert.equal(view.seat, 0);

  const empties = emptySquares(view.board);
  assert.equal(
    view.remaining.every((piece) =>
      empties.some((square) => completesLine(view.board, square, piece)),
    ),
    true,
  );
  assert.equal(view.remaining.includes(1), true);

  assert.deepEqual(chooseAction(game, 0, fixed(0)), { seat: 0, type: 'select', piece: 1 });
  assert.deepEqual(chooseAction(game, 0, fixed(0.99)), { seat: 0, type: 'select', piece: 15 });
});

test('passes and accepts the draw on a full board', () => {
  // This full board has no complete line at all, so claiming is never right.
  const board = [11, 15, 3, 12, 4, 9, 1, 10, 13, 6, 8, 0, 14, 2, 5, 7];
  const { actions, seat } = scriptedPlacements(
    0,
    board.map((piece, square) => placement(piece, square)),
  );
  const drawnish = play(createGame(0), actions);
  const view = viewOf(drawnish);
  assert.equal(view.step, 'pass');
  assert.equal(view.seat, seat);
  assert.deepEqual(winningLines(view.board, view.lastPlaced), []);

  const passed = play(drawnish, [chooseAction(drawnish, seat, fixed(0))]);
  const afterPass = viewOf(passed);
  assert.equal(afterPass.step, 'draw');
  assert.equal(afterPass.seat, 1 - seat);
  const drawn = play(passed, [chooseAction(passed, 1 - seat, fixed(0))]);
  assert.deepEqual(viewOf(drawn).result, { type: 'draw' });
});

test('plays full games to a win or a draw without an illegal or wrong claim', () => {
  const tally = { win: 0, draw: 0 };

  for (let seed = 1; seed <= 100; seed += 1) {
    let game = createGame(seed % 2);
    const random = seeded(seed);

    while (viewOf(game).result === null) {
      const view = viewOf(game);
      const action = chooseAction(game, view.seat, random);
      assert.notEqual(action, null, `no action while in progress on seed ${seed}`);
      assert.equal(action.seat, view.seat);

      if (action.type === 'claim') {
        assert.equal(
          winningLines(view.board, view.lastPlaced).length > 0,
          true,
          `wrong claim on seed ${seed}`,
        );
      }

      const outcome = applyAction(game, action);
      assert.equal(
        outcome.ok,
        true,
        `illegal action ${JSON.stringify(action)} on seed ${seed}: ${outcome.error}`,
      );
      game = outcome.game;
    }

    const view = viewOf(game);
    assert.equal(view.wrongClaim, null, `a claim was rejected on seed ${seed}`);
    assert.equal(view.result.type === 'win' || view.result.type === 'draw', true);
    tally[view.result.type] += 1;
  }

  assert.equal(tally.win > 0, true, 'no seeded game was won');
  assert.equal(tally.draw > 0, true, 'no seeded game was drawn');
});
