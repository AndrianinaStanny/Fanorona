import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  StyleSheet, SafeAreaView, StatusBar, ScrollView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import COLORS from '../constants/colors';
import { GAME_MODES, PLAYER_W, PLAYER_B } from '../constants/gameConstants';
import { useGameLogic } from '../hooks/useGameLogic';
import { getAIMove, getAIChainMove } from '../hooks/useAI';

import Board from '../components/Board';
import Header from '../components/Header';
import GameControls from '../components/GameControls';

export default function GameScreen() {
  const params = useLocalSearchParams();
  const mode = params.mode || GAME_MODES.MULTIPLAYER;
  const difficulty = params.difficulty || 'normal';

  const {
    board, currentPlayer, selectedPiece, validMoves,
    chainState, gameOver, winner, captureChoice,
    selectPiece, selectDestination, chooseCapture,
    endChain, resetGame, executeMove,
  } = useGameLogic();

  const [isAIThinking, setIsAIThinking] = useState(false);

  
  const boardRef = useRef(board);
  const chainStateRef = useRef(chainState);
  const endChainRef = useRef(endChain);
  const executeMoveRef = useRef(executeMove);

  boardRef.current = board;
  chainStateRef.current = chainState;
  endChainRef.current = endChain;
  executeMoveRef.current = executeMove;

  useEffect(() => {
    if (mode !== GAME_MODES.AI) return;
    if (currentPlayer !== PLAYER_B) return;
    if (gameOver) return;
    if (captureChoice) return; 

    setIsAIThinking(true);
    const delay = chainState?.isChaining ? 450 : 750;

    const timer = setTimeout(() => {
      let aiMove;

      if (chainStateRef.current?.isChaining) {
        aiMove = getAIChainMove(boardRef.current, chainStateRef.current);
        if (!aiMove) {
          endChainRef.current();
          setIsAIThinking(false);
          return;
        }
      } else {
        aiMove = getAIMove(boardRef.current, PLAYER_B, difficulty);
        if (!aiMove) {
          setIsAIThinking(false);
          return;
        }
      }

      executeMoveRef.current(aiMove);
      setIsAIThinking(false);
    }, delay);

    return () => {
      clearTimeout(timer);
      setIsAIThinking(false);
    };
  
  }, [currentPlayer, chainState, gameOver, mode, difficulty]);

  
  const handleCellPress = (row, col) => {
    if (mode === GAME_MODES.AI && currentPlayer === PLAYER_B) return;
    if (gameOver) return;

    const piece = board[row][col];

    
    if (piece === currentPlayer) {
      selectPiece(row, col);
      return;
    }

    
    if (piece === null) {
      selectDestination(row, col);
    }
  };

  const isBoardDisabled =
    gameOver ||
    (mode === GAME_MODES.AI && currentPlayer === PLAYER_B) ||
    isAIThinking;

  
  const winnerLabel = () => {
    if (!winner) return '';
    if (mode === GAME_MODES.AI) {
      return winner === PLAYER_W ? 'Vous avez gagné !' : 'L\'IA a gagné';
    }
    return winner === PLAYER_W ? 'Joueur 1 gagne !' : 'Joueur 2 gagne !';
  };

  const winnerIcon = () => {
    if (!winner) return 'trophy-outline';
    if (mode === GAME_MODES.AI) {
      return winner === PLAYER_W ? 'trophy' : 'sad-outline';
    }
    return 'trophy';
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgPrimary} />

      {/* Top nav */}
      <View style={styles.topNav}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={20} color={COLORS.textSecondary} />
          <Text style={styles.backLabel}>Menu</Text>
        </TouchableOpacity>

        <Text style={styles.navTitle}>Fanorona</Text>

        <TouchableOpacity style={styles.backBtn} onPress={resetGame}>
          <Ionicons name="refresh" size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      
      <Header
        board={board}
        currentPlayer={currentPlayer}
        chainState={chainState}
        gameMode={mode}
        isAIThinking={isAIThinking}
      />

      
      <ScrollView
        contentContainerStyle={styles.boardContainer}
        scrollEnabled={false}
      >
        <Board
          board={board}
          selectedPiece={selectedPiece}
          validMoves={validMoves}
          chainState={chainState}
          currentPlayer={currentPlayer}
          onCellPress={handleCellPress}
          disabled={isBoardDisabled}
        />

        
        {chainState?.isChaining && currentPlayer === PLAYER_W && (
          <View style={styles.chainHint}>
            <Ionicons name="flash" size={14} color={COLORS.chainHighlight} />
            <Text style={styles.chainHintText}>
              Continuez à capturer ou appuyez sur "Fin du tour"
            </Text>
          </View>
        )}
      </ScrollView>

     
      <GameControls
        chainState={chainState}
        captureChoice={captureChoice}
        onEndChain={endChain}
        onChooseCapture={chooseCapture}
        onRestart={resetGame}
        onMenu={() => router.back()}
      />

      
      <Modal
        visible={gameOver}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={styles.winModal}>
            <View style={styles.winIconWrap}>
              <Ionicons
                name={winnerIcon()}
                size={52}
                color={winner === PLAYER_W ? COLORS.accentLight : (
                  mode === GAME_MODES.AI ? COLORS.dangerRed : COLORS.accentLight
                )}
              />
            </View>

            <Text style={styles.winTitle}>{winnerLabel()}</Text>

            <Text style={styles.winSub}>
              {mode === GAME_MODES.AI && winner === PLAYER_B
                ? 'Retentez votre chance !'
                : 'Bravo, excellente partie !'}
            </Text>

           
            <View style={styles.finalScoreRow}>
              <ScorePill
                player={PLAYER_W}
                label={mode === GAME_MODES.AI ? 'Vous' : 'J1'}
                count={board.flat().filter(c => c === PLAYER_W).length}
                isWinner={winner === PLAYER_W}
              />
              <Ionicons name="remove" size={16} color={COLORS.textMuted} />
              <ScorePill
                player={PLAYER_B}
                label={mode === GAME_MODES.AI ? 'IA' : 'J2'}
                count={board.flat().filter(c => c === PLAYER_B).length}
                isWinner={winner === PLAYER_B}
              />
            </View>

            <TouchableOpacity style={styles.replayBtn} onPress={resetGame} activeOpacity={0.8}>
              <Ionicons name="refresh-circle" size={22} color={COLORS.bgPrimary} />
              <Text style={styles.replayBtnText}>Rejouer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuBtn} onPress={() => router.back()} activeOpacity={0.8}>
              <Ionicons name="home-outline" size={18} color={COLORS.textSecondary} />
              <Text style={styles.menuBtnText}>Menu principal</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function ScorePill({ player, label, count, isWinner }) {
  const isWhite = player === PLAYER_W;
  return (
    <View style={[styles.scorePill, isWinner && styles.scorePillWinner]}>
      <View style={[styles.scoreDot, isWhite ? styles.dotW : styles.dotB]} />
      <Text style={styles.scoreLabel}>{label}</Text>
      <Text style={styles.scoreCount}>{count}</Text>
      {isWinner && <Ionicons name="star" size={12} color={COLORS.accentLight} />}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },

  // Top nav
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: COLORS.bgSecondary,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 4,
    minWidth: 60,
  },
  backLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  navTitle: {
    color: COLORS.accentLight,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 3,
  },

  // Board area
  boardContainer: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  chainHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: COLORS.chainHighlightBg,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.chainHighlight,
  },
  chainHintText: {
    color: COLORS.chainHighlight,
    fontSize: 12,
    fontStyle: 'italic',
  },

  // Winner modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  winModal: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 20,
    padding: 28,
    width: '100%',
    maxWidth: 360,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.accent,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 20,
  },
  winIconWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.bgSecondary,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  winTitle: {
    color: COLORS.textPrimary,
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  winSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  finalScoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 24,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: COLORS.bgSecondary,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  scorePillWinner: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.bgCardLight,
  },
  scoreDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
  },
  dotW: {
    backgroundColor: COLORS.pieceWhite,
    borderColor: COLORS.pieceWhiteStroke,
  },
  dotB: {
    backgroundColor: COLORS.pieceBlack,
    borderColor: COLORS.pieceBlackStroke,
  },
  scoreLabel: {
    color: COLORS.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  scoreCount: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  replayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.accent,
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 10,
    width: '100%',
    justifyContent: 'center',
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 6,
    elevation: 6,
  },
  replayBtnText: {
    color: COLORS.bgPrimary,
    fontSize: 16,
    fontWeight: '800',
  },
  menuBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    width: '100%',
    justifyContent: 'center',
  },
  menuBtnText: {
    color: COLORS.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
});