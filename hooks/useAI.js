import {
    getAllValidMoves,
    getValidMovesForPiece,
    applyMove,
    getOpponent,
  } from './useGameLogic';
  import { ROWS, COLS, PLAYER_B } from '../constants/gameConstants';
  
  
  function resolveMove(move) {
    if (move.type !== 'choose') return move;
    const best = move.captureOptions.reduce((a, b) =>
      a.captures.length >= b.captures.length ? a : b
    );
    return { ...move, type: best.type, captures: best.captures };
  }
  
  
  function simulateChain(board, move, depth = 0) {
    const resolved = resolveMove(move);
    const { fromRow, fromCol, toRow, toCol, captures, dr, dc } = resolved;
  
    const newBoard = applyMove(board, fromRow, fromCol, toRow, toCol, captures);
    let total = captures.length;
  
    if (depth < 6 && captures.length > 0) {
      const chain = {
        isChaining: true,
        chainingPiece: { row: toRow, col: toCol },
        lastDir: { dr, dc },
      };
      const continuations = getValidMovesForPiece(newBoard, toRow, toCol, chain)
        .filter(m => m.captures.length > 0 || m.type === 'choose')
        .map(resolveMove);
  
      if (continuations.length > 0) {
        let bestCaptures = 0;
        let bestBoard = newBoard;
        for (const cont of continuations) {
          const { finalBoard, totalCaptures } = simulateChain(newBoard, cont, depth + 1);
          if (totalCaptures > bestCaptures) {
            bestCaptures = totalCaptures;
            bestBoard = finalBoard;
          }
        }
        return { finalBoard: bestBoard, totalCaptures: total + bestCaptures };
      }
    }
  
    return { finalBoard: newBoard, totalCaptures: total };
  }
  
  function evaluate(board, player) {
    let score = 0;
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (board[r][c] === player) {
          score += 10;
         
          const centerDist = Math.abs(c - 4) + Math.abs(r - 2);
          score += Math.max(0, 4 - centerDist);
        } else if (board[r][c] !== null) {
          score -= 10;
        }
      }
    }
    return score;
  }
  
 
  function easyAI(board, player) {
    const moves = getAllValidMoves(board, player);
    if (!moves.length) return null;
  
    const capturing = moves.filter(m => m.captures.length > 0 || m.type === 'choose');
    
    const pool = capturing.length > 0 && Math.random() > 0.4 ? capturing : moves;
    return resolveMove(pool[Math.floor(Math.random() * pool.length)]);
  }
  
  function normalAI(board, player) {
    const moves = getAllValidMoves(board, player);
    if (!moves.length) return null;
  
    let bestMove = moves[0];
    let bestCaptures = -1;
  
    for (const move of moves) {
      const { totalCaptures } = simulateChain(board, move);
      if (totalCaptures > bestCaptures) {
        bestCaptures = totalCaptures;
        bestMove = move;
      }
    }
  
    
    const tied = moves.filter(m => {
      const { totalCaptures } = simulateChain(board, m);
      return totalCaptures === bestCaptures;
    });
  
    return resolveMove(tied[Math.floor(Math.random() * tied.length)] || bestMove);
  }
  
  function hardAI(board, player) {
    const moves = getAllValidMoves(board, player);
    if (!moves.length) return null;
  
    const opp = getOpponent(player);
    let bestMove = moves[0];
    let bestScore = -Infinity;
  
    for (const move of moves) {
      const { finalBoard, totalCaptures } = simulateChain(board, move);
  
      
      const oppMoves = getAllValidMoves(finalBoard, opp).slice(0, 10);
      let oppBestCaptures = 0;
      for (const om of oppMoves) {
        const { totalCaptures: oc } = simulateChain(finalBoard, om);
        if (oc > oppBestCaptures) oppBestCaptures = oc;
      }
  
      const score = totalCaptures * 2 - oppBestCaptures * 1.5 + evaluate(finalBoard, player) * 0.1;
  
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    }
  
    return resolveMove(bestMove);
  }
  
  
  
  export function getAIChainMove(board, chainState) {
    if (!chainState?.isChaining) return null;
    const { row, col } = chainState.chainingPiece;
  
    const moves = getValidMovesForPiece(board, row, col, chainState)
      .filter(m => m.captures.length > 0 || m.type === 'choose')
      .map(resolveMove);
  
    if (!moves.length) return null;
  
    return moves.reduce((a, b) => a.captures.length >= b.captures.length ? a : b);
  }
  
  
  
  export function getAIMove(board, player, difficulty) {
    switch (difficulty) {
      case 'easy': return easyAI(board, player);
      case 'normal': return normalAI(board, player);
      case 'hard': return hardAI(board, player);
      default: return easyAI(board, player);
    }
  }