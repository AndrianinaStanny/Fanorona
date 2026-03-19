import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import { PLAYER_W, PLAYER_B, countPieces } from '../constants/gameConstants';

export default function Header({ board, currentPlayer, chainState, gameMode, isAIThinking }) {
  const { w, b } = countPieces(board);
  const isChaining = chainState?.isChaining;

  const playerLabel = (player) => {
    if (gameMode === 'ai') return player === PLAYER_W ? 'Vous' : 'IA';
    return player === PLAYER_W ? 'Joueur 1' : 'Joueur 2';
  };

  const statusText = () => {
    if (isAIThinking) return 'L\'IA réfléchit...';
    if (isChaining) return 'Capture enchaînée !';
    return `Tour de ${playerLabel(currentPlayer)}`;
  };

  return (
    <View style={styles.container}>
      
      <PlayerCard
        player={PLAYER_W}
        label={playerLabel(PLAYER_W)}
        count={w}
        isActive={currentPlayer === PLAYER_W && !isAIThinking}
        isChaining={isChaining && currentPlayer === PLAYER_W}
      />

      
      <View style={styles.center}>
        {isAIThinking ? (
          <Ionicons name="hardware-chip-outline" size={18} color={COLORS.accent} />
        ) : isChaining ? (
          <Ionicons name="flash" size={18} color={COLORS.chainHighlight} />
        ) : (
          <Ionicons name="ellipse" size={10} color={COLORS.textMuted} />
        )}
        <Text style={[
          styles.statusText,
          isChaining && { color: COLORS.chainHighlight },
          isAIThinking && { color: COLORS.accent },
        ]}>
          {statusText()}
        </Text>
      </View>

      
      <PlayerCard
        player={PLAYER_B}
        label={playerLabel(PLAYER_B)}
        count={b}
        isActive={currentPlayer === PLAYER_B && !isAIThinking}
        isChaining={isChaining && currentPlayer === PLAYER_B}
        align="right"
      />
    </View>
  );
}

function PlayerCard({ player, label, count, isActive, isChaining, align = 'left' }) {
  const isWhite = player === PLAYER_W;
  return (
    <View style={[styles.playerCard, isActive && styles.playerCardActive, align === 'right' && styles.cardRight]}>
      <View style={[styles.pieceDot, isWhite ? styles.dotWhite : styles.dotBlack]} />
      <View style={align === 'right' ? styles.textRight : null}>
        <Text style={[styles.playerName, isActive && styles.playerNameActive]}>
          {label}
        </Text>
        <View style={styles.countRow}>
          <Ionicons
            name="ellipse"
            size={10}
            color={isWhite ? COLORS.pieceWhite : COLORS.pieceBlack}
          />
          <Text style={[styles.countText, isActive && styles.countActive]}> {count}</Text>
        </View>
      </View>
      {isChaining && (
        <Ionicons name="flash" size={14} color={COLORS.chainHighlight} style={styles.chainIcon} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: COLORS.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 90,
  },
  playerCardActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.bgCardLight,
  },
  cardRight: {
    flexDirection: 'row-reverse',
  },
  pieceDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
  },
  dotWhite: {
    backgroundColor: COLORS.pieceWhite,
    borderColor: COLORS.pieceWhiteStroke,
  },
  dotBlack: {
    backgroundColor: COLORS.pieceBlack,
    borderColor: COLORS.pieceBlackStroke,
  },
  textRight: {
    alignItems: 'flex-end',
  },
  playerName: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  playerNameActive: {
    color: COLORS.accentLight,
  },
  countRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  countText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  countActive: {
    color: COLORS.textPrimary,
  },
  chainIcon: {
    marginLeft: 2,
  },
  center: {
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  statusText: {
    color: COLORS.textSecondary,
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
});