// Quarto rules: pure state derivation and action application.
//
// A piece is an integer 0..15. Bit 0 is height, bit 1 is colour,
// bit 2 is shape and bit 3 is fill. A set bit means tall, light,
// round or solid respectively.
//
// A game is { starter, actions }. `starter` is the seat that selects
// the first piece, and every action is replayed to derive the view.

/** Attributes in bit order. `values[0]` is the value when the bit is clear. */
export const ATTRIBUTES = Object.freeze([
  Object.freeze({ name: 'height', mask: 1, values: Object.freeze(['short', 'tall']) }),
  Object.freeze({ name: 'colour', mask: 2, values: Object.freeze(['dark', 'light']) }),
  Object.freeze({ name: 'shape', mask: 4, values: Object.freeze(['square', 'round']) }),
  Object.freeze({ name: 'fill', mask: 8, values: Object.freeze(['hollow', 'solid']) }),
]);

const LINES = Object.freeze([
  Object.freeze([0, 1, 2, 3]),
  Object.freeze([4, 5, 6, 7]),
  Object.freeze([8, 9, 10, 11]),
  Object.freeze([12, 13, 14, 15]),
  Object.freeze([0, 4, 8, 12]),
  Object.freeze([1, 5, 9, 13]),
  Object.freeze([2, 6, 10, 14]),
  Object.freeze([3, 7, 11, 15]),
  Object.freeze([0, 5, 10, 15]),
  Object.freeze([3, 6, 9, 12]),
]);

const ALL_PIECES = Object.freeze(Array.from({ length: 16 }, (_, index) => index));

function attributeOf(piece, attribute) {
  return attribute.values[(piece & attribute.mask) === 0 ? 0 : 1];
}

function commonAttributes(pieces) {
  const attributes = [];
  for (const attribute of ATTRIBUTES) {
    const value = pieces[0] & attribute.mask;
    if (pieces.every((piece) => (piece & attribute.mask) === value)) {
      attributes.push({ attribute: attribute.name, value: attributeOf(pieces[0], attribute) });
    }
  }
  return attributes;
}

/**
 * Return the complete lines through `lastPlaced` that share an attribute.
 *
 * Each line is `{ squares, attributes }`. A claim is valid exactly when this
 * list is non-empty for the last placed square.
 */
export function winningLines(board, lastPlaced) {
  if (lastPlaced === null) return [];
  const lines = [];
  for (const squares of LINES) {
    if (!squares.includes(lastPlaced)) continue;
    if (squares.some((square) => board[square] === null)) continue;
    const pieces = squares.map((square) => board[square]);
    const attributes = commonAttributes(pieces);
    if (attributes.length > 0) {
      lines.push({ squares: [...squares], attributes });
    }
  }
  return lines;
}

function derive(game) {
  const board = Array(16).fill(null);
  const remaining = new Set(ALL_PIECES);
  let hand = null;
  let seat = game.starter;
  let step = 'select';
  let lastPlaced = null;
  let placed = 0;
  let result = null;
  let wrongClaim = null;

  for (const action of game.actions) {
    wrongClaim = null;
    if (result !== null) break;

    if (action.type === 'select') {
      remaining.delete(action.piece);
      hand = action.piece;
      step = 'place';
      // The other seat places the selected piece.
      seat = 1 - seat;
    } else if (action.type === 'place') {
      board[action.square] = hand;
      hand = null;
      lastPlaced = action.square;
      placed += 1;
      // The placer selects the next piece. After the last placement
      // their only choices are to claim or pass.
      step = placed === 16 ? 'pass' : 'select';
    } else if (action.type === 'claim') {
      const lines = winningLines(board, lastPlaced);
      if (lines.length > 0) {
        result = { type: 'win', winner: action.seat, lines };
      } else {
        wrongClaim = { seat: action.seat };
      }
    } else if (action.type === 'pass') {
      step = 'draw';
      seat = 1 - seat;
    } else if (action.type === 'draw') {
      result = { type: 'draw' };
    } else if (action.type === 'resign') {
      result = { type: 'win', winner: 1 - action.seat, forfeit: true, lines: [] };
    }
  }

  if (result !== null) {
    seat = null;
    step = null;
  }

  return {
    board,
    remaining,
    hand,
    seat,
    step,
    result,
    wrongClaim,
    lastPlaced,
  };
}

/** Create the empty game for a starter seat. */
export function createGame(starter = 0) {
  if (starter !== 0 && starter !== 1) {
    throw new RangeError('starter must be 0 or 1');
  }
  return { starter, actions: [] };
}

/**
 * Derive the public view of a game.
 *
 * `step` is 'select', 'place', 'pass' or 'draw' while the game is in
 * progress, and null once `result` is set. `seat` is the seat to act,
 * or null once the game is over.
 */
export function viewOf(game) {
  const state = derive(game);
  return {
    board: state.board,
    remaining: [...state.remaining].sort((a, b) => a - b),
    hand: state.hand,
    seat: state.seat,
    step: state.step,
    result: state.result,
    wrongClaim: state.wrongClaim,
    lastPlaced: state.lastPlaced,
  };
}

function rejected(error) {
  return { ok: false, error };
}

/**
 * Validate and append an action.
 *
 * Returns `{ ok: true, game }` with a new game, or
 * `{ ok: false, error }` when the action is illegal.
 */
export function applyAction(game, action) {
  const state = derive(game);

  if (state.result !== null) return rejected('The game is over.');
  if (action === null || typeof action !== 'object') return rejected('Invalid action.');

  // Resignation is the one action a seat may take out of turn.
  if (action.type === 'resign') {
    if (action.seat !== 0 && action.seat !== 1) return rejected('Invalid seat.');
    if (game.actions.length === 0) return rejected('There is nothing to forfeit.');
    return {
      ok: true,
      game: {
        starter: game.starter,
        actions: [...game.actions, { seat: action.seat, type: 'resign' }],
      },
    };
  }

  if (action.seat !== state.seat) {
    return rejected('That seat is not to act.');
  }

  let recorded;
  if (action.type === 'select') {
    if (state.step !== 'select') return rejected('A piece cannot be selected now.');
    if (
      !Number.isInteger(action.piece) ||
      action.piece < 0 ||
      action.piece > 15 ||
      !state.remaining.has(action.piece)
    ) {
      return rejected('That piece is not available.');
    }
    recorded = { seat: action.seat, type: 'select', piece: action.piece };
  } else if (action.type === 'place') {
    if (state.step !== 'place') return rejected('A piece cannot be placed now.');
    if (
      !Number.isInteger(action.square) ||
      action.square < 0 ||
      action.square > 15 ||
      state.board[action.square] !== null
    ) {
      return rejected('That square is not available.');
    }
    recorded = { seat: action.seat, type: 'place', square: action.square };
  } else if (action.type === 'claim') {
    if (state.board.every((piece) => piece === null)) {
      return rejected('Quarto cannot be called before any piece is on the board.');
    }
    recorded = { seat: action.seat, type: 'claim' };
  } else if (action.type === 'pass') {
    if (state.step !== 'pass') return rejected('There is nothing to pass.');
    recorded = { seat: action.seat, type: 'pass' };
  } else if (action.type === 'draw') {
    if (state.step !== 'draw') return rejected('A draw cannot be accepted now.');
    recorded = { seat: action.seat, type: 'draw' };
  } else {
    return rejected('Unknown action type.');
  }

  return {
    ok: true,
    game: {
      starter: game.starter,
      actions: [...game.actions, recorded],
    },
  };
}

/**
 * Return true when `game` is a well-formed `{starter, actions}` history that
 * replays end to end through `applyAction`. Returns false for malformed input.
 */
export function isLegalGame(game) {
  try {
    if (game === null || typeof game !== 'object' || Array.isArray(game)) return false;
    if (game.starter !== 0 && game.starter !== 1) return false;
    if (!Array.isArray(game.actions)) return false;

    let current = createGame(game.starter);
    for (const action of game.actions) {
      const outcome = applyAction(current, action);
      if (!outcome.ok) return false;
      current = outcome.game;
    }
    return true;
  } catch {
    return false;
  }
}

/**
 * Return a new `[wins0, wins1]` score with the winner of `game` added.
 *
 * A Quarto win and a forfeit both count. Draws and unfinished games add
 * nothing. The input score is never changed.
 */
export function addWinnerToScore(score, game) {
  const next = [score[0], score[1]];
  const { result } = viewOf(game);
  if (result !== null && result.type === 'win') {
    next[result.winner] += 1;
  }
  return next;
}

/**
 * Remove the last action if it belongs to `seat` and the game is not over.
 *
 * Returns `{ ok: true, game }` or `{ ok: false, error }`.
 */
export function undo(game, seat) {
  const view = viewOf(game);
  if (view.result !== null) return rejected('The game is over.');

  const last = game.actions[game.actions.length - 1];
  if (last === undefined) return rejected('There is nothing to undo.');
  if (last.seat !== seat) return rejected('The last action belongs to the other seat.');

  return {
    ok: true,
    game: {
      starter: game.starter,
      actions: game.actions.slice(0, -1),
    },
  };
}
