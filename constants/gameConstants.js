export const ROWS = 5;
export const COLS = 9;

export const PLAYER_W = 'W'; // Human (or Player 1)
export const PLAYER_B = 'B'; // AI or Player 2
export const EMPTY = null;

export const GAME_MODES = {
  MULTIPLAYER: 'multiplayer',
  AI: 'ai',
};

export const AI_DIFFICULTY = {
  EASY: 'easy',
  NORMAL: 'normal',
  HARD: 'hard',
};

/**
 * Initial board:
 *   Row 0: W W W W W W W W W
 *   Row 1: W W W W W W W W W
 *   Row 2: W W W W _ B B B B
 *   Row 3: B B B B B B B B B
 *   Row 4: B B B B B B B B B
 */
export function INITIAL_BOARD() {
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      if (r < 2) {
        board[r][c] = PLAYER_W;
      } else if (r > 2) {
        board[r][c] = PLAYER_B;
      } else {
        // row 2
        if (c < 4) board[r][c] = PLAYER_W;
        else if (c === 4) board[r][c] = EMPTY;
        else board[r][c] = PLAYER_B;
      }
    }
  }
  return board;
}

export function countPieces(board) {
  let w = 0, b = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === PLAYER_W) w++;
      else if (board[r][c] === PLAYER_B) b++;
    }
  }
  return { w, b };
}