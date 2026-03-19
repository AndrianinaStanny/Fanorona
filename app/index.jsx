import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity,
  StyleSheet, SafeAreaView, StatusBar,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';
import { GAME_MODES, AI_DIFFICULTY } from '../constants/gameConstants';

const DIFFICULTIES = [
  { id: AI_DIFFICULTY.EASY, label: 'Facile', icon: 'leaf-outline', desc: 'Pour découvrir' },
  { id: AI_DIFFICULTY.NORMAL, label: 'Normal', icon: 'flame-outline', desc: 'Équilibré' },
  { id: AI_DIFFICULTY.HARD, label: 'Difficile', icon: 'skull-outline', desc: 'Pour experts' },
];

export default function HomeScreen() {
  const [mode, setMode] = useState(null);
  const [difficulty, setDifficulty] = useState(AI_DIFFICULTY.NORMAL);

  const handleStart = () => {
    if (!mode) return;
    router.push({ pathname: '/game', params: { mode, difficulty } });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bgPrimary} />

      <View style={styles.container}>
        {/* Title */}
        <View style={styles.titleBlock}>
          <View style={styles.boardIcon}>
            <Ionicons name="grid-outline" size={36} color={COLORS.accentLight} />
          </View>
          <Text style={styles.title}>FANORONA</Text>
          <Text style={styles.subtitle}>Jeu traditionnel malgache</Text>
          <View style={styles.divider} />
        </View>

        {/* Mode Selection */}
        <Text style={styles.sectionLabel}>Choisir un mode</Text>
        <View style={styles.modeRow}>
          <ModeCard
            id={GAME_MODES.MULTIPLAYER}
            icon="people-outline"
            title="Multijoueur"
            desc="2 joueurs • même écran"
            selected={mode === GAME_MODES.MULTIPLAYER}
            onPress={() => setMode(GAME_MODES.MULTIPLAYER)}
          />
          <ModeCard
            id={GAME_MODES.AI}
            icon="hardware-chip-outline"
            title="Contre l'IA"
            desc="1 joueur • vs ordinateur"
            selected={mode === GAME_MODES.AI}
            onPress={() => setMode(GAME_MODES.AI)}
          />
        </View>

        {/* Difficulté  */}
        {mode === GAME_MODES.AI && (
          <View style={styles.difficultyBlock}>
            <Text style={styles.sectionLabel}>Niveau de l'IA</Text>
            <View style={styles.difficultyRow}>
              {DIFFICULTIES.map((d) => (
                <DifficultyBtn
                  key={d.id}
                  item={d}
                  selected={difficulty === d.id}
                  onPress={() => setDifficulty(d.id)}
                />
              ))}
            </View>
          </View>
        )}

        {/* Start Button */}
        <TouchableOpacity
          style={[styles.startBtn, !mode && styles.startBtnDisabled]}
          onPress={handleStart}
          activeOpacity={mode ? 0.75 : 1}
        >
          <Ionicons
            name="play-circle"
            size={24}
            color={mode ? COLORS.bgPrimary : COLORS.btnDisabledText}
          />
          <Text style={[styles.startBtnText, !mode && styles.startBtnTextDisabled]}>
            Commencer la partie
          </Text>
        </TouchableOpacity>

        <Text style={styles.hint}>
          Capturez toutes les pièces adverses par approche ou retrait
        </Text>
      </View>
    </SafeAreaView>
  );
}

function ModeCard({ icon, title, desc, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.modeCard, selected && styles.modeCardSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={icon}
        size={32}
        color={selected ? COLORS.accentLight : COLORS.textSecondary}
      />
      <Text style={[styles.modeTitle, selected && styles.modeTitleSelected]}>{title}</Text>
      <Text style={styles.modeDesc}>{desc}</Text>
    </TouchableOpacity>
  );
}

function DifficultyBtn({ item, selected, onPress }) {
  return (
    <TouchableOpacity
      style={[styles.diffBtn, selected && styles.diffBtnSelected]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <Ionicons
        name={item.icon}
        size={20}
        color={selected ? COLORS.bgPrimary : COLORS.textSecondary}
      />
      <Text style={[styles.diffLabel, selected && styles.diffLabelSelected]}>
        {item.label}
      </Text>
      <Text style={[styles.diffDesc, selected && styles.diffDescSelected]}>
        {item.desc}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.bgPrimary,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
  },

  // Title
  titleBlock: {
    alignItems: 'center',
    marginBottom: 36,
  },
  boardIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    backgroundColor: COLORS.bgCard,
    borderWidth: 2,
    borderColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 34,
    fontWeight: '800',
    color: COLORS.accentLight,
    letterSpacing: 6,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMuted,
    marginTop: 4,
    letterSpacing: 1,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: COLORS.accent,
    borderRadius: 1,
    marginTop: 16,
    opacity: 0.6,
  },

  sectionLabel: {
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },

  // Mode cards
  modeRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 28,
  },
  modeCard: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 12,
    backgroundColor: COLORS.bgCard,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: COLORS.border,
    gap: 8,
  },
  modeCardSelected: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.bgCardLight,
  },
  modeTitle: {
    color: COLORS.textSecondary,
    fontSize: 15,
    fontWeight: '700',
  },
  modeTitleSelected: {
    color: COLORS.accentLight,
  },
  modeDesc: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
  },

  // Difficulty
  difficultyBlock: {
    marginBottom: 28,
  },
  difficultyRow: {
    flexDirection: 'row',
    gap: 10,
  },
  diffBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 8,
    backgroundColor: COLORS.bgCard,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 4,
  },
  diffBtnSelected: {
    backgroundColor: COLORS.accent,
    borderColor: COLORS.accentLight,
  },
  diffLabel: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  diffLabelSelected: {
    color: COLORS.bgPrimary,
  },
  diffDesc: {
    color: COLORS.textMuted,
    fontSize: 10,
  },
  diffDescSelected: {
    color: COLORS.bgSecondary,
  },

  // Start
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.accent,
    paddingVertical: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.accentLight,
    marginBottom: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  startBtnDisabled: {
    backgroundColor: COLORS.btnDisabled,
    borderColor: COLORS.border,
    shadowOpacity: 0,
    elevation: 0,
  },
  startBtnText: {
    color: COLORS.bgPrimary,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  startBtnTextDisabled: {
    color: COLORS.btnDisabledText,
  },

  hint: {
    color: COLORS.textMuted,
    fontSize: 11,
    textAlign: 'center',
    fontStyle: 'italic',
    paddingHorizontal: 12,
  },
});