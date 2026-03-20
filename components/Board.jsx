import React, { useMemo } from 'react';
import { View, useWindowDimensions, StyleSheet, Platform } from 'react-native';
import Svg, { Rect, Line, Circle, G } from 'react-native-svg';

import COLORS from '../constants/colors';
import { ROWS, COLS, PLAYER_W, PLAYER_B, EMPTY } from '../constants/gameConstants';
import { hasDiagonals } from '../hooks/useGameLogic';

const MARGIN = 26;

export default function Board({
  board,
  selectedPiece,
  validMoves,
  chainState,
  onCellPress,
  disabled,
}) {
  const { width } = useWindowDimensions();
  const boardWidth = Math.min(width - 24, 520);

  const cellSize = (boardWidth - MARGIN * 2) / (COLS - 1);
  const boardHeight = MARGIN * 2 + (ROWS - 1) * cellSize;
  const pieceR = cellSize * 0.37;
  const touchSize = cellSize * 0.95;

  const getX = (col) => MARGIN + col * cellSize;
  const getY = (row) => MARGIN + row * cellSize;

  const validSet = useMemo(() => {
    const s = new Set();
    for (const m of validMoves) s.add(`${m.toRow},${m.toCol}`);
    return s;
  }, [validMoves]);

  const chainingPos = chainState?.isChaining ? chainState.chainingPiece : null;

  // ── Diagonal lines ────────────────────────────────────────────────
  const diagonals = useMemo(() => {
    const lines = [];
    for (let r = 0; r < ROWS - 1; r++) {
      for (let c = 0; c < COLS; c++) {
        if ((r + c) % 2 !== 0) continue;
        if (c + 1 < COLS) {
          lines.push(
            <Line key={`drR${r}c${c}`}
              x1={getX(c)} y1={getY(r)}
              x2={getX(c + 1)} y2={getY(r + 1)}
              stroke={COLORS.boardLines} strokeWidth={1.2} />
          );
        }
        if (c - 1 >= 0) {
          lines.push(
            <Line key={`drL${r}c${c}`}
              x1={getX(c)} y1={getY(r)}
              x2={getX(c - 1)} y2={getY(r + 1)}
              stroke={COLORS.boardLines} strokeWidth={1.2} />
          );
        }
      }
    }
    return lines;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cellSize]);

  return (
    <View style={styles.wrapper}>
      <View style={[styles.frame, { width: boardWidth + 16, height: boardHeight + 16 }]}>
        <Svg width={boardWidth} height={boardHeight}>

          {/* ── Board background ───────────────────────────── */}
          <Rect x={0} y={0} width={boardWidth} height={boardHeight}
            rx={8} fill={COLORS.boardBg} />
          <Rect x={2} y={2} width={boardWidth - 4} height={boardHeight - 4}
            rx={6} fill="none" stroke={COLORS.boardBgDark} strokeWidth={1} />

          {/* ── Grid lines ─────────────────────────────────── */}
          {Array.from({ length: ROWS }, (_, r) => (
            <Line key={`h${r}`}
              x1={MARGIN} y1={getY(r)}
              x2={boardWidth - MARGIN} y2={getY(r)}
              stroke={COLORS.boardLines} strokeWidth={1.4} />
          ))}
          {Array.from({ length: COLS }, (_, c) => (
            <Line key={`v${c}`}
              x1={getX(c)} y1={MARGIN}
              x2={getX(c)} y2={boardHeight - MARGIN}
              stroke={COLORS.boardLines} strokeWidth={1.4} />
          ))}

          {/* ── Diagonals ──────────────────────────────────── */}
          {diagonals}

          {/* ── Intersection dots ──────────────────────────── */}
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => (
              <Circle key={`dot${r}${c}`}
                cx={getX(c)} cy={getY(r)} r={2.5}
                fill={COLORS.boardLines} opacity={0.5} />
            ))
          )}

          {/* ── Valid move indicators ──────────────────────── */}
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              if (!validSet.has(`${r},${c}`) || board[r][c] !== EMPTY) return null;
              return (
                <Circle key={`vm${r}${c}`}
                  cx={getX(c)} cy={getY(r)} r={pieceR * 0.65}
                  fill={COLORS.validMove}
                  stroke={COLORS.validMoveStroke} strokeWidth={1.5} />
              );
            })
          )}

          {/* ── Chain glow ─────────────────────────────────── */}
          {chainingPos && (
            <Circle
              cx={getX(chainingPos.col)} cy={getY(chainingPos.row)}
              r={pieceR + 8}
              fill={COLORS.chainHighlightBg}
              stroke={COLORS.chainHighlight} strokeWidth={1.5} />
          )}

          {/* ── Selected ring ──────────────────────────────── */}
          {selectedPiece && (
            <Circle
              cx={getX(selectedPiece.col)} cy={getY(selectedPiece.row)}
              r={pieceR + 5} fill="none"
              stroke={COLORS.selected} strokeWidth={2.5}
              strokeDasharray="5,3" />
          )}

          {/* ── Pieces ─────────────────────────────────────── */}
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const piece = board[r][c];
              if (!piece) return null;
              const isSelected = selectedPiece?.row === r && selectedPiece?.col === c;
              const isChaining = chainingPos?.row === r && chainingPos?.col === c;
              const isWhite = piece === PLAYER_W;
              const fill = isWhite ? COLORS.pieceWhite : COLORS.pieceBlack;
              const stroke = isSelected || isChaining
                ? COLORS.selected
                : (isWhite ? COLORS.pieceWhiteStroke : COLORS.pieceBlackStroke);

              return (
                <G key={`piece${r}${c}`}>
                  <Circle cx={getX(c) + 1.5} cy={getY(r) + 1.5}
                    r={pieceR} fill="rgba(0,0,0,0.35)" />
                  <Circle cx={getX(c)} cy={getY(r)}
                    r={pieceR} fill={fill}
                    stroke={stroke} strokeWidth={isSelected || isChaining ? 3 : 1.5} />
                  <Circle
                    cx={getX(c) - pieceR * 0.25} cy={getY(r) - pieceR * 0.25}
                    r={pieceR * 0.28}
                    fill={isWhite
                      ? 'rgba(255,255,255,0.55)'
                      : 'rgba(255,255,255,0.12)'} />
                </G>
              );
            })
          )}

          {/* ── Valid dest dots on occupied cells ──────────── */}
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              if (!validSet.has(`${r},${c}`) || board[r][c] === EMPTY) return null;
              return (
                <Circle key={`vmp${r}${c}`}
                  cx={getX(c)} cy={getY(r)} r={pieceR * 0.3}
                  fill={COLORS.accent} opacity={0.9} />
              );
            })
          )}

          {/* ── TOUCH TARGETS — transparent Rect on every cell ─
               Works on Android, iOS and Web unlike onPress on <G>  */}
          {!disabled && Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => (
              <Rect
                key={`touch${r}${c}`}
                x={getX(c) - touchSize / 2}
                y={getY(r) - touchSize / 2}
                width={touchSize}
                height={touchSize}
                fill="transparent"
                onPress={() => onCellPress(r, c)}
              />
            ))
          )}

        </Svg>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  frame: {
    backgroundColor: COLORS.boardBgDark,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: COLORS.boardBorder,
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
});