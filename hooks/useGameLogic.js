import { useReducer, useCallback } from 'react';
import { ROWS, COLS, PLAYER_W, PLAYER_B, EMPTY, INITIAL_BOARD } from '../constants/gameConstants';


export function getOpponent(player) {
  return player === PLAYER_W ? PLAYER_B : PLAYER_W;
}

export function hasDiagonals(row, col) {
  return (row + col) % 2 === 0;
}

function inBounds(r, c) {
  return r >= 0 && r < ROWS && c >= 0 && c < COLS;
}

function getDirections(row, col) {
  const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
  if (hasDiagonals(row, col)) {
    dirs.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  }
  return dirs;
}


export function getCaptureOptions(board, fromRow, fromCol, toRow, toCol) {
  const dr = toRow - fromRow;
  const dc = toCol - fromCol;
  const opp = getOpponent(board[fromRow][fromCol]);
  const options = [];

  
  const approach = [];
  let r = toRow + dr, c = toCol + dc;
  while (inBounds(r, c) && board[r][c] === opp) {
    approach.push({ row: r, col: c });
    r += dr; c += dc;
  }
  if (approach.length > 0) options.push({ type: 'approach', captures: approach });

  
  const withdraw = [];
  r = fromRow - dr; c = fromCol - dc;
  while (inBounds(r, c) && board[r][c] === opp) {
    withdraw.push({ row: r, col: c });
    r -= dr; c -= dc;
  }
  if (withdraw.length > 0) options.push({ type: 'withdraw', captures: withdraw });

  return options;
}


export function getValidMovesForPiece(board, row, col, chainState = null) {
  const piece = board[row][col];
  if (!piece) return [];

  const dirs = getDirections(row, col);
  const moves = [];
  const isChaining = !!chainState?.isChaining;
  const lastDir = chainState?.lastDir || null;

  for (const [dr, dc] of dirs) {
    const tr = row + dr, tc = col + dc;
    if (!inBounds(tr, tc) || board[tr][tc] !== EMPTY) continue;
   
    if (isChaining && lastDir && dr === lastDir.dr && dc === lastDir.dc) continue;

    const captureOptions = getCaptureOptions(board, row, col, tr, tc);

    if (captureOptions.length === 2) {
      
      moves.push({
        fromRow: row, fromCol: col, toRow: tr, toCol: tc,
        dr, dc, type: 'choose', captures: captureOptions[0].captures,
        captureOptions,
      });
    } else if (captureOptions.length === 1) {
      moves.push({
        fromRow: row, fromCol: col, toRow: tr, toCol: tc,
        dr, dc, type: captureOptions[0].type, captures: captureOptions[0].captures,
        captureOptions,
      });
    } else if (!isChaining) {
      
      moves.push({
        fromRow: row, fromCol: col, toRow: tr, toCol: tc,
        dr, dc, type: 'none', captures: [],
        captureOptions: [],
      });
    }
  }

  return moves;
}


export function getAllValidMoves(board, player, chainState = null) {
  if (chainState?.isChaining) {
    const { row, col } = chainState.chainingPiece;
    if (board[row][col] !== player) return [];
    return getValidMovesForPiece(board, row, col, chainState)
      .filter(m => m.captures.length > 0 || m.type === 'choose');
  }

  const all = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === player) {
        all.push(...getValidMovesForPiece(board, r, c));
      }
    }
  }

  const capturing = all.filter(m => m.captures.length > 0 || m.type === 'choose');
  return capturing.length > 0 ? capturing : all;
}

export function applyMove(board, fromRow, fromCol, toRow, toCol, captures = []) {
  const nb = board.map(r => [...r]);
  nb[toRow][toCol] = nb[fromRow][fromCol];
  nb[fromRow][fromCol] = EMPTY;
  for (const { row, col } of captures) nb[row][col] = EMPTY;
  return nb;
}

export function checkWinner(board) {
  let w = 0, b = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === PLAYER_W) w++;
      else if (board[r][c] === PLAYER_B) b++;
    }
  }
  if (w === 0) return PLAYER_B;
  if (b === 0) return PLAYER_W;
  return null;
}


const INITIAL_STATE = {
  board: INITIAL_BOARD(),
  currentPlayer: PLAYER_W,
  selectedPiece: null,
  validMoves: [],
  chainState: null,
  gameOver: false,
  winner: null,
  captureChoice: null, 
};

function getMovesForPieceRespectingMandatory(board, row, col, chainState, currentPlayer) {
  const pieceMoves = getValidMovesForPiece(board, row, col, chainState);
  if (chainState?.isChaining) {
    return pieceMoves.filter(m => m.captures.length > 0 || m.type === 'choose');
  }
 
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] === currentPlayer) {
        const pm = getValidMovesForPiece(board, r, c);
        if (pm.some(m => m.captures.length > 0 || m.type === 'choose')) {
          return pieceMoves.filter(m => m.captures.length > 0 || m.type === 'choose');
        }
      }
    }
  }
  return pieceMoves;
}

function doExecuteMove(state, move) {
  const { board, currentPlayer, chainState } = state;
  const { fromRow, fromCol, toRow, toCol, captures, dr, dc } = move;

  const newBoard = applyMove(board, fromRow, fromCol, toRow, toCol, captures);

  const winner = checkWinner(newBoard);
  if (winner) {
    return {
      ...state, board: newBoard, gameOver: true, winner,
      selectedPiece: null, validMoves: [], chainState: null, captureChoice: null,
    };
  }

  if (captures.length > 0) {
    const newChain = {
      isChaining: true,
      chainingPiece: { row: toRow, col: toCol },
      lastDir: { dr, dc },
    };
    const chainMoves = getValidMovesForPiece(newBoard, toRow, toCol, newChain)
      .filter(m => m.captures.length > 0 || m.type === 'choose');

    if (chainMoves.length > 0) {
      return {
        ...state, board: newBoard,
        chainState: newChain,
        selectedPiece: { row: toRow, col: toCol },
        validMoves: chainMoves,
        captureChoice: null,
      };
    }
  }

  
  return {
    ...state, board: newBoard,
    currentPlayer: getOpponent(currentPlayer),
    selectedPiece: null, validMoves: [], chainState: null, captureChoice: null,
  };
}

function gameReducer(state, action) {
  switch (action.type) {

    case 'SELECT_PIECE': {
      const { row, col } = action;
      if (state.gameOver) return state;
      if (state.board[row][col] !== state.currentPlayer) return state;
      if (state.chainState?.isChaining) {
        const { row: cr, col: cc } = state.chainState.chainingPiece;
        if (row !== cr || col !== cc) return state;
      }
      const validMoves = getMovesForPieceRespectingMandatory(
        state.board, row, col, state.chainState, state.currentPlayer
      );
      return { ...state, selectedPiece: { row, col }, validMoves, captureChoice: null };
    }

    case 'SELECT_DESTINATION': {
      const { row, col } = action;
      if (!state.selectedPiece || state.gameOver) return state;
      const move = state.validMoves.find(m => m.toRow === row && m.toCol === col);
      if (!move) return state;
      if (move.type === 'choose') {
        return { ...state, captureChoice: { move, options: move.captureOptions } };
      }
      return doExecuteMove(state, move);
    }

    case 'CHOOSE_CAPTURE': {
      if (!state.captureChoice) return state;
      const option = state.captureChoice.options.find(o => o.type === action.captureType);
      if (!option) return state;
      const resolved = { ...state.captureChoice.move, type: action.captureType, captures: option.captures };
      return doExecuteMove({ ...state, captureChoice: null }, resolved);
    }

    case 'EXECUTE_MOVE': {
      return doExecuteMove(state, action.move);
    }

    case 'END_CHAIN': {
      if (!state.chainState?.isChaining) return state;
      return {
        ...state, chainState: null, selectedPiece: null, validMoves: [],
        currentPlayer: getOpponent(state.currentPlayer),
      };
    }

    case 'RESET': {
      return { ...INITIAL_STATE, board: INITIAL_BOARD() };
    }

    default:
      return state;
  }
}



export function useGameLogic() {
  const [state, dispatch] = useReducer(gameReducer, INITIAL_STATE);

  const selectPiece = useCallback((row, col) =>
    dispatch({ type: 'SELECT_PIECE', row, col }), []);

  const selectDestination = useCallback((row, col) =>
    dispatch({ type: 'SELECT_DESTINATION', row, col }), []);

  const chooseCapture = useCallback((captureType) =>
    dispatch({ type: 'CHOOSE_CAPTURE', captureType }), []);

  const endChain = useCallback(() =>
    dispatch({ type: 'END_CHAIN' }), []);

  const resetGame = useCallback(() =>
    dispatch({ type: 'RESET' }), []);

  const executeMove = useCallback((move) =>
    dispatch({ type: 'EXECUTE_MOVE', move }), []);

  return { ...state, selectPiece, selectDestination, chooseCapture, endChain, resetGame, executeMove };
}