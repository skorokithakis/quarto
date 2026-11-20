// Computer opponent: choose the next action for a seat.
//
// Pure: the game, the seat and the random source are arguments, and the
// game is never changed.

import { viewOf, winningLines } from './game.js';

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

/** Return true when no empty square completes a line with `piece`. */
function isSafe(board, piece, empties) {
  return empties.every((square) => !completesLine(board, square, piece));
}

function pick(options, random) {
  return options[Math.floor(random() * options.length)];
}

/**
 * Choose the action for `seat`.
 *
 * Returns an action for `applyAction`, or null when the game is over or it is
 * not `seat`'s turn. `random` returns a number in [0, 1) and defaults to
 * Math.random, so tests can pass a deterministic source.
 */
export function chooseAction(game, seat, random = Math.random) {
  const view = viewOf(game);
  if (view.result !== null || view.seat !== seat) return null;

  const { board, hand, step, lastPlaced, remaining } = view;
  const empties = emptySquares(board);

  // A line through the last placement is still claimable, by either seat.
  if (winningLines(board, lastPlaced).length > 0) {
    return { seat, type: 'claim' };
  }

  if (step === 'select') {
    const safe = remaining.filter((piece) => isSafe(board, piece, empties));
    return {
      seat,
      type: 'select',
      piece: pick(safe.length > 0 ? safe : remaining, random),
    };
  }

  if (step === 'place') {
    const winners = empties.filter((square) => completesLine(board, square, hand));
    if (winners.length > 0) {
      return { seat, type: 'place', square: pick(winners, random) };
    }

    const safeGifts = empties.filter((square) => {
      const placed = [...board];
      placed[square] = hand;
      const rest = empties.filter((other) => other !== square);
      return remaining.some((piece) => isSafe(placed, piece, rest));
    });
    return {
      seat,
      type: 'place',
      square: pick(safeGifts.length > 0 ? safeGifts : empties, random),
    };
  }

  if (step === 'pass') return { seat, type: 'pass' };
  if (step === 'draw') return { seat, type: 'draw' };

  return null;
}
