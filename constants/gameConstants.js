export const ROWS = 5;
export const COLS = 9;

export const PLAYER_W = 'W';
export const PLAYER_B = 'B';
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
 * Disposition  :
 *
 *   Row 0: B B B B B B B B B
 *   Row 1: B B B B B B B B B
 *   Row 2: B W B W _ B W B W  
 *   Row 3: W W W W W W W W W
 *   Row 4: W W W W W W W W W
 *
 * Col :    0 1 2 3 4 5 6 7 8
 */

// Rangée du milieu préconfigurée explicitement
const MIDDLE_ROW = ['B','W','B','W', null, 'B','W','B','W'];

export function INITIAL_BOARD() {
  const board = [];
  for (let r = 0; r < ROWS; r++) {
    board[r] = [];
    for (let c = 0; c < COLS; c++) {
      if (r < 2) {
        board[r][c] = PLAYER_B;
      } else if (r > 2) {
        board[r][c] = PLAYER_W;
      } else {
        // Row 2 — alternance exacte
        board[r][c] = MIDDLE_ROW[c];
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