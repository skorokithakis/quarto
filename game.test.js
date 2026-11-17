import test from 'node:test';
import assert from 'node:assert/strict';

import { ATTRIBUTES, createGame, viewOf, applyAction, undo, isLegalGame } from './game.js';

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

test('view derives board, pool, hand, seat and step', () => {
  const game = createGame(0);
  let view = viewOf(game);

  assert.deepEqual(view.board, Array(16).fill(null));
  assert.deepEqual(view.remaining, Array.from({ length: 16 }, (_, i) => i));
  assert.equal(view.hand, null);
  assert.equal(view.seat, 0);
  assert.equal(view.step, 'select');
  assert.equal(view.result, null);
  assert.equal(view.wrongClaim, null);

  const selected = applyAction(game, { seat: 0, type: 'select', piece: 5 });
  assert.equal(selected.ok, true);
  view = viewOf(selected.game);
  assert.equal(view.hand, 5);
  assert.equal(view.seat, 1);
  assert.equal(view.step, 'place');
  assert.deepEqual(view.remaining.includes(5), false);

  const placed = applyAction(selected.game, { seat: 1, type: 'place', square: 7 });
  assert.equal(placed.ok, true);
  view = viewOf(placed.game);
  assert.equal(view.board[7], 5);
  assert.equal(view.hand, null);
  assert.equal(view.seat, 1);
  assert.equal(view.step, 'select');
});

test('view reports the most recently placed square', () => {
  const game = createGame(0);
  assert.equal(viewOf(game).lastPlaced, null);

  const selected = applyAction(game, { seat: 0, type: 'select', piece: 5 });
  assert.equal(selected.ok, true);
  assert.equal(viewOf(selected.game).lastPlaced, null);

  const placed = applyAction(selected.game, { seat: 1, type: 'place', square: 7 });
  assert.equal(placed.ok, true);
  assert.equal(viewOf(placed.game).lastPlaced, 7);

  const selectedAgain = applyAction(placed.game, { seat: 1, type: 'select', piece: 4 });
  assert.equal(selectedAgain.ok, true);
  assert.equal(viewOf(selectedAgain.game).lastPlaced, 7);
});

test('row win by the placer before selecting their next piece', () => {
  const { actions, seat } = scriptedPlacements(0, [
    placement(1, 0),
    placement(7, 1),
    placement(13, 2),
    placement(11, 3),
  ]);
  assert.equal(seat, 0);
  actions.push({ seat, type: 'claim' });

  const game = play(createGame(0), actions);
  const view = viewOf(game);

  assert.equal(view.result.type, 'win');
  assert.equal(view.result.winner, 0);
  assert.deepEqual(view.result.lines, [
    {
      squares: [0, 1, 2, 3],
      attributes: [{ attribute: 'height', value: 'tall' }],
    },
  ]);
  assert.equal(view.seat, null);
  assert.equal(view.step, null);
  assert.equal(view.wrongClaim, null);
});

test('column win by the opponent after receiving a piece', () => {
  const { actions, seat } = scriptedPlacements(0, [
    placement(2, 0),
    placement(7, 4),
    placement(14, 8),
    placement(11, 12),
  ]);
  assert.equal(seat, 0);

  // The placer selects another piece. The opponent, now holding it,
  // can still claim the line the placer just completed.
  actions.push({ seat, type: 'select', piece: 0 });
  actions.push({ seat: 1, type: 'claim' });

  const game = play(createGame(0), actions);
  const view = viewOf(game);

  assert.equal(view.result.type, 'win');
  assert.equal(view.result.winner, 1);
  assert.deepEqual(view.result.lines, [
    {
      squares: [0, 4, 8, 12],
      attributes: [{ attribute: 'colour', value: 'light' }],
    },
  ]);
});

test('diagonal win with a common shape', () => {
  const { actions, seat } = scriptedPlacements(0, [
    placement(4, 0),
    placement(7, 5),
    placement(14, 10),
    placement(13, 15),
  ]);
  actions.push({ seat, type: 'claim' });

  const game = play(createGame(0), actions);
  const view = viewOf(game);

  assert.equal(view.result.type, 'win');
  assert.equal(view.result.winner, 0);
  assert.deepEqual(view.result.lines, [
    {
      squares: [0, 5, 10, 15],
      attributes: [{ attribute: 'shape', value: 'round' }],
    },
  ]);
});

test('a common fill value wins as well', () => {
  const { actions, seat } = scriptedPlacements(0, [
    placement(8, 4),
    placement(11, 5),
    placement(14, 6),
    placement(13, 7),
  ]);
  actions.push({ seat, type: 'claim' });

  const game = play(createGame(0), actions);
  const view = viewOf(game);

  assert.equal(view.result.type, 'win');
  assert.deepEqual(view.result.lines, [
    {
      squares: [4, 5, 6, 7],
      attributes: [{ attribute: 'fill', value: 'solid' }],
    },
  ]);
});

test('a correct claim reports all winning lines and all common values', () => {
  const { actions, seat } = scriptedPlacements(0, [
    placement(1, 4),
    placement(3, 6),
    placement(5, 7),
    placement(2, 1),
    placement(6, 9),
    placement(10, 13),
    placement(7, 5),
  ]);
  assert.equal(seat, 1);
  actions.push({ seat, type: 'claim' });

  const game = play(createGame(0), actions);
  const view = viewOf(game);

  assert.equal(view.result.type, 'win');
  assert.equal(view.result.winner, 1);
  assert.deepEqual(
    view.result.lines.map((line) => line.squares),
    [
      [4, 5, 6, 7],
      [1, 5, 9, 13],
    ],
  );
  assert.deepEqual(view.result.lines[0].attributes, [
    { attribute: 'height', value: 'tall' },
    { attribute: 'fill', value: 'hollow' },
  ]);
  assert.deepEqual(view.result.lines[1].attributes, [
    { attribute: 'colour', value: 'light' },
  ]);
});

test('a line expires after the next placement and a claim is wrong', () => {
  const { actions, seat } = scriptedPlacements(0, [
    placement(1, 0),
    placement(7, 1),
    placement(13, 2),
    placement(11, 3),
  ]);
  assert.equal(seat, 0);

  actions.push({ seat, type: 'select', piece: 0 });
  actions.push({ seat: 1, type: 'place', square: 5 });

  const beforeClaim = play(createGame(0), actions);
  const before = viewOf(beforeClaim);
  assert.equal(before.seat, 1);
  assert.equal(before.step, 'select');

  const claimed = applyAction(beforeClaim, { seat: 1, type: 'claim' });
  assert.equal(claimed.ok, true);
  const after = viewOf(claimed.game);

  assert.equal(after.result, null);
  assert.deepEqual(after.wrongClaim, { seat: 1 });
  assert.equal(after.seat, before.seat);
  assert.equal(after.step, before.step);
});

test('a wrong claim is only the latest action', () => {
  const { actions, seat } = scriptedPlacements(0, [
    placement(1, 0),
    placement(7, 1),
    placement(13, 2),
    placement(11, 3),
  ]);
  actions.push({ seat, type: 'select', piece: 0 });
  actions.push({ seat: 1, type: 'place', square: 5 });
  actions.push({ seat: 1, type: 'claim' });

  const game = play(createGame(0), actions);
  assert.deepEqual(viewOf(game).wrongClaim, { seat: 1 });

  const next = applyAction(game, { seat: 1, type: 'select', piece: 2 });
  assert.equal(next.ok, true);
  assert.equal(viewOf(next.game).wrongClaim, null);
});

test('illegal actions are rejected', () => {
  const game = createGame(0);

  assert.equal(applyAction(game, { seat: 1, type: 'select', piece: 1 }).ok, false);
  assert.equal(applyAction(game, { seat: 0, type: 'place', square: 0 }).ok, false);
  assert.equal(applyAction(game, { seat: 0, type: 'pass' }).ok, false);
  assert.equal(applyAction(game, { seat: 0, type: 'draw' }).ok, false);
  assert.equal(applyAction(game, { seat: 0, type: 'claim' }).ok, false);
  assert.equal(applyAction(game, { seat: 0, type: 'unknown' }).ok, false);

  const selected = play(game, [{ seat: 0, type: 'select', piece: 5 }]);
  assert.equal(applyAction(selected, { seat: 1, type: 'select', piece: 6 }).ok, false);
  assert.equal(applyAction(selected, { seat: 1, type: 'place', square: -1 }).ok, false);
  assert.equal(applyAction(selected, { seat: 1, type: 'place', square: 16 }).ok, false);

  const placed = play(selected, [{ seat: 1, type: 'place', square: 0 }]);
  assert.equal(applyAction(placed, { seat: 1, type: 'select', piece: 5 }).ok, false);
  assert.equal(applyAction(placed, { seat: 1, type: 'select', piece: 16 }).ok, false);

  const selectedAgain = play(placed, [{ seat: 1, type: 'select', piece: 6 }]);
  assert.equal(applyAction(selectedAgain, { seat: 0, type: 'place', square: 0 }).ok, false);
  // A claim by the wrong seat is rejected even on a non-empty board.
  assert.equal(applyAction(selectedAgain, { seat: 1, type: 'claim' }).ok, false);
});

test('undo only removes the asking seat\'s own last action', () => {
  const game = play(createGame(0), [
    { seat: 0, type: 'select', piece: 1 },
    { seat: 1, type: 'place', square: 0 },
    { seat: 1, type: 'select', piece: 2 },
  ]);

  assert.equal(undo(game, 0).ok, false);
  assert.equal(undo(game, 2).ok, false);

  const undone = undo(game, 1);
  assert.equal(undone.ok, true);
  assert.equal(undone.game.actions.length, 2);
  assert.equal(viewOf(undone.game).step, 'select');
  assert.equal(viewOf(undone.game).seat, 1);

  assert.equal(undo(createGame(0), 0).ok, false);
});

test('undo removes two consecutive own actions with two calls', () => {
  const game = play(createGame(0), [
    { seat: 0, type: 'select', piece: 1 },
    { seat: 1, type: 'place', square: 0 },
    { seat: 1, type: 'select', piece: 2 },
    { seat: 0, type: 'place', square: 1 },
    { seat: 0, type: 'select', piece: 3 },
  ]);

  const first = undo(game, 0);
  assert.equal(first.ok, true);
  assert.equal(first.game.actions.length, 4);
  assert.equal(viewOf(first.game).step, 'select');
  assert.equal(viewOf(first.game).seat, 0);

  const second = undo(first.game, 0);
  assert.equal(second.ok, true);
  assert.equal(second.game.actions.length, 3);
  assert.equal(viewOf(second.game).step, 'place');
  assert.equal(viewOf(second.game).seat, 0);
});

test('undo is rejected after the game ends', () => {
  const { actions, seat } = scriptedPlacements(0, [
    placement(1, 0),
    placement(7, 1),
    placement(13, 2),
    placement(11, 3),
  ]);
  actions.push({ seat, type: 'claim' });
  const won = play(createGame(0), actions);

  assert.equal(viewOf(won).result.type, 'win');
  assert.equal(undo(won, seat).ok, false);

  const full = scriptedPlacements(
    0,
    Array.from({ length: 16 }, (_, i) => placement(i, i)),
  );
  const passed = play(createGame(0), [
    ...full.actions,
    { seat: full.seat, type: 'pass' },
    { seat: 1 - full.seat, type: 'draw' },
  ]);
  assert.equal(viewOf(passed).result.type, 'draw');
  assert.equal(undo(passed, 1 - full.seat).ok, false);
});

test('a wrong claim is an ordinary action for undo', () => {
  const { actions, seat } = scriptedPlacements(0, [
    placement(1, 0),
    placement(7, 1),
    placement(13, 2),
    placement(11, 3),
  ]);
  actions.push({ seat, type: 'select', piece: 0 });
  actions.push({ seat: 1, type: 'place', square: 5 });
  actions.push({ seat: 1, type: 'claim' });
  const game = play(createGame(0), actions);

  assert.equal(undo(game, 0).ok, false);
  const undone = undo(game, 1);
  assert.equal(undone.ok, true);
  assert.equal(undone.game.actions.length, actions.length - 1);
  const view = viewOf(undone.game);
  assert.equal(view.wrongClaim, null);
  assert.equal(view.seat, 1);
  assert.equal(view.step, 'select');
});

test('the last placement leads to a claimable line and a win', () => {
  const pieces = [1, 3, 5, 0, 2, 4, 6, 8, 9, 10, 11, 12, 13, 14, 15, 7];
  const squares = [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 14, 3];
  assert.equal(new Set(pieces).size, 16);
  assert.equal(new Set(squares).size, 16);

  const { actions, seat } = scriptedPlacements(
    0,
    pieces.map((piece, index) => placement(piece, squares[index])),
  );
  assert.equal(seat, 0);

  const afterPlacements = play(createGame(0), actions);
  const view = viewOf(afterPlacements);
  assert.equal(view.step, 'pass');
  assert.equal(view.seat, 0);
  assert.equal(view.hand, null);
  assert.deepEqual(view.remaining, []);
  assert.equal(view.board.includes(null), false);
  assert.equal(view.result, null);

  const claimed = applyAction(afterPlacements, { seat: 0, type: 'claim' });
  assert.equal(claimed.ok, true);
  const result = viewOf(claimed.game).result;
  assert.equal(result.type, 'win');
  assert.equal(result.winner, 0);
  assert.equal(
    result.lines.some((line) => line.squares.join(',') === '0,1,2,3'),
    true,
  );
  assert.equal(
    result.lines
      .find((line) => line.squares.join(',') === '0,1,2,3')
      .attributes.some((value) => value.attribute === 'height' && value.value === 'tall'),
    true,
  );
});

test('the last-piece sequence can end in a draw', () => {
  const { actions, seat } = scriptedPlacements(
    0,
    Array.from({ length: 16 }, (_, i) => placement(i, i)),
  );
  assert.equal(seat, 0);

  const afterPlacements = play(createGame(0), actions);
  assert.equal(viewOf(afterPlacements).step, 'pass');
  assert.equal(viewOf(afterPlacements).seat, 0);

  const passed = applyAction(afterPlacements, { seat: 0, type: 'pass' });
  assert.equal(passed.ok, true);
  const afterPass = viewOf(passed.game);
  assert.equal(afterPass.step, 'draw');
  assert.equal(afterPass.seat, 1);
  assert.equal(afterPass.board.includes(null), false);

  const drawn = applyAction(passed.game, { seat: 1, type: 'draw' });
  assert.equal(drawn.ok, true);
  const afterDraw = viewOf(drawn.game);
  assert.deepEqual(afterDraw.result, { type: 'draw' });
  assert.equal(afterDraw.seat, null);
  assert.equal(afterDraw.step, null);

  assert.equal(applyAction(drawn.game, { seat: 1, type: 'select', piece: 0 }).ok, false);
});

test('isLegalGame accepts legal histories and rejects malformed ones', () => {
  assert.equal(isLegalGame(createGame(0)), true);

  const legal = scriptedPlacements(0, [
    placement(1, 0),
    placement(7, 1),
  ]);
  assert.equal(isLegalGame({ starter: 0, actions: legal.actions }), true);

  const win = scriptedPlacements(0, [
    placement(1, 0),
    placement(7, 1),
    placement(13, 2),
    placement(11, 3),
  ]);
  win.actions.push({ seat: win.seat, type: 'claim' });
  assert.equal(isLegalGame({ starter: 0, actions: win.actions }), true);

  assert.equal(isLegalGame({ starter: 0, actions: [null] }), false);
  assert.equal(isLegalGame({ starter: 0, actions: [{ seat: 1, type: 'select', piece: 1 }] }), false);
  assert.equal(isLegalGame({ starter: 0, actions: [{ seat: 0, type: 'place', square: 0 }] }), false);
  assert.equal(
    isLegalGame({ starter: 0, actions: [...win.actions, { seat: 0, type: 'select', piece: 0 }] }),
    false,
  );
  assert.equal(isLegalGame({ starter: 0, actions: 'not an array' }), false);

  assert.equal(isLegalGame(null), false);
  assert.equal(isLegalGame(undefined), false);
  assert.equal(isLegalGame({}), false);
  assert.equal(isLegalGame({ starter: 2, actions: [] }), false);
});

test('piece attribute bits are exposed for the renderer', () => {
  assert.deepEqual(
    ATTRIBUTES.map(({ name, mask }) => [name, mask]),
    [
      ['height', 1],
      ['colour', 2],
      ['shape', 4],
      ['fill', 8],
    ],
  );
});
