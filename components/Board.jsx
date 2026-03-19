import React, { useMemo } from 'react';
import { View, useWindowDimensions, StyleSheet } from 'react-native';
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
  currentPlayer,
  onCellPress,
  disabled,
}) {
  const { width } = useWindowDimensions();
  const boardWidth = Math.min(width - 24, 520);

  const cellSize = (boardWidth - MARGIN * 2) / (COLS - 1);
  const boardHeight = MARGIN * 2 + (ROWS - 1) * cellSize;
  const pieceR = cellSize * 0.37;
  const touchR = cellSize * 0.5;

  const getX = (col) => MARGIN + col * cellSize;
  const getY = (row) => MARGIN + row * cellSize;

  const validSet = useMemo(() => {
    const s = new Set();
    for (const m of validMoves) s.add(`${m.toRow},${m.toCol}`);
    return s;
  }, [validMoves]);

  const chainingPos = chainState?.isChaining ? chainState.chainingPiece : null;

  
  const diagonals = useMemo(() => {
    const lines = [];
    for (let r = 0; r < ROWS - 1; r++) {
      for (let c = 0; c < COLS; c++) {
        if ((r + c) % 2 !== 0) continue;
        if (c + 1 < COLS) {
          lines.push(
            <Line
              key={`dr${r}c${c}R`}
              x1={getX(c)} y1={getY(r)}
              x2={getX(c + 1)} y2={getY(r + 1)}
              stroke={COLORS.boardLines} strokeWidth={1.2}
            />
          );
        }
        if (c - 1 >= 0) {
          lines.push(
            <Line
              key={`dr${r}c${c}L`}
              x1={getX(c)} y1={getY(r)}
              x2={getX(c - 1)} y2={getY(r + 1)}
              stroke={COLORS.boardLines} strokeWidth={1.2}
            />
          );
        }
      }
    }
    return lines;
  }, [cellSize]);

  const handlePress = (row, col) => {
    if (disabled) return;
    onCellPress(row, col);
  };

  return (
    <View style={styles.wrapper}>
     
      <View style={[styles.frame, { width: boardWidth + 16, height: boardHeight + 16 }]}>
        <Svg width={boardWidth} height={boardHeight}>

         
          <Rect
            x={0} y={0} width={boardWidth} height={boardHeight}
            rx={8} fill={COLORS.boardBg}
          />

         
          <Rect
            x={2} y={2} width={boardWidth - 4} height={boardHeight - 4}
            rx={6} fill="none"
            stroke={COLORS.boardBgDark} strokeWidth={1}
          />

          
          {Array.from({ length: ROWS }, (_, r) => (
            <Line
              key={`h${r}`}
              x1={MARGIN} y1={getY(r)}
              x2={boardWidth - MARGIN} y2={getY(r)}
              stroke={COLORS.boardLines} strokeWidth={1.4}
            />
          ))}

          
          {Array.from({ length: COLS }, (_, c) => (
            <Line
              key={`v${c}`}
              x1={getX(c)} y1={MARGIN}
              x2={getX(c)} y2={boardHeight - MARGIN}
              stroke={COLORS.boardLines} strokeWidth={1.4}
            />
          ))}

          
          {diagonals}

          
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => (
              <Circle
                key={`dot${r}${c}`}
                cx={getX(c)} cy={getY(r)}
                r={2.5}
                fill={COLORS.boardLines}
                opacity={0.5}
              />
            ))
          )}

          
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              if (!validSet.has(`${r},${c}`)) return null;
              if (board[r][c] !== EMPTY) return null;
              return (
                <G key={`vm${r}${c}`}>
                  <Circle
                    cx={getX(c)} cy={getY(r)}
                    r={pieceR * 0.65}
                    fill={COLORS.validMove}
                    stroke={COLORS.validMoveStroke}
                    strokeWidth={1.5}
                  />
                </G>
              );
            })
          )}

          
          {Array.from({ length: ROWS }, (_, r) =>
            Array.from({ length: COLS }, (_, c) => {
              const piece = board[r][c];
              const isSelected = selectedPiece?.row === r && selectedPiece?.col === c;
              const isChaining = chainingPos?.row === r && chainingPos?.col === c;
              const isValidDest = validSet.has(`${r},${c}`) && piece === EMPTY;

              const isWhite = piece === PLAYER_W;
              const fill = isWhite ? COLORS.pieceWhite : COLORS.pieceBlack;
              const stroke = isSelected || isChaining
                ? COLORS.selected
                : (isWhite ? COLORS.pieceWhiteStroke : COLORS.pieceBlackStroke);
              const strokeW = isSelected || isChaining ? 3 : 1.5;

              return (
                <G
                  key={`cell${r}${c}`}
                  onPress={() => handlePress(r, c)}
                >
                  
                  <Circle
                    cx={getX(c)} cy={getY(r)}
                    r={touchR}
                    fill="transparent"
                  />

                  
                  {isChaining && (
                    <Circle
                      cx={getX(c)} cy={getY(r)}
                      r={pieceR + 8}
                      fill={COLORS.chainHighlightBg}
                      stroke={COLORS.chainHighlight}
                      strokeWidth={1.5}
                    />
                  )}

                  
                  {piece && (
                    <>
                      
                      <Circle
                        cx={getX(c) + 1.5} cy={getY(r) + 1.5}
                        r={pieceR}
                        fill="rgba(0,0,0,0.35)"
                      />
                      
                      <Circle
                        cx={getX(c)} cy={getY(r)}
                        r={pieceR}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={strokeW}
                      />
                      
                      <Circle
                        cx={getX(c) - pieceR * 0.25} cy={getY(r) - pieceR * 0.25}
                        r={pieceR * 0.28}
                        fill={isWhite ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.12)'}
                      />
                    </>
                  )}

                 
                  {isSelected && (
                    <Circle
                      cx={getX(c)} cy={getY(r)}
                      r={pieceR + 5}
                      fill="none"
                      stroke={COLORS.selected}
                      strokeWidth={2.5}
                      strokeDasharray="5,3"
                    />
                  )}

                 
                  {isValidDest && (
                    <Circle
                      cx={getX(c)} cy={getY(r)}
                      r={pieceR * 0.42}
                      fill={COLORS.accent}
                      opacity={0.85}
                    />
                  )}
                </G>
              );
            })
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
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 12,
  },
});