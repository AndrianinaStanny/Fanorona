import React from 'react';
import {
  View, Text, TouchableOpacity, Modal,
  StyleSheet, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../constants/colors';

export default function GameControls({
  chainState,
  captureChoice,
  onEndChain,
  onChooseCapture,
  onRestart,
  onMenu,
}) {
  const isChaining = chainState?.isChaining;

  return (
    <>
     
      <View style={styles.bar}>
        <ControlBtn
          icon="arrow-back-circle-outline"
          label="Menu"
          onPress={onMenu}
          variant="secondary"
        />

        {isChaining ? (
          <ControlBtn
            icon="checkmark-circle-outline"
            label="Fin du tour"
            onPress={onEndChain}
            variant="chain"
            large
          />
        ) : (
          <View style={styles.spacer} />
        )}

        <ControlBtn
          icon="refresh-circle-outline"
          label="Rejouer"
          onPress={onRestart}
          variant="secondary"
        />
      </View>

     
      <Modal
        visible={!!captureChoice}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <Ionicons name="git-branch-outline" size={22} color={COLORS.accentLight} />
              <Text style={styles.modalTitle}>Choisir le type de capture</Text>
            </View>

            <Text style={styles.modalSub}>
              Les deux directions sont possibles. Laquelle ?
            </Text>

            <View style={styles.choiceRow}>
              
              <TouchableOpacity
                style={[styles.choiceBtn, styles.approachBtn]}
                onPress={() => onChooseCapture('approach')}
                activeOpacity={0.75}
              >
                <Ionicons name="arrow-forward-circle" size={30} color={COLORS.accentLight} />
                <Text style={styles.choiceBtnTitle}>Approche</Text>
                <Text style={styles.choiceBtnSub}>
                  {captureChoice?.options.find(o => o.type === 'approach')?.captures.length ?? 0} pièce(s)
                </Text>
              </TouchableOpacity>

             
              <TouchableOpacity
                style={[styles.choiceBtn, styles.withdrawBtn]}
                onPress={() => onChooseCapture('withdraw')}
                activeOpacity={0.75}
              >
                <Ionicons name="arrow-back-circle" size={30} color={COLORS.pieceWhite} />
                <Text style={styles.choiceBtnTitle}>Retrait</Text>
                <Text style={styles.choiceBtnSub}>
                  {captureChoice?.options.find(o => o.type === 'withdraw')?.captures.length ?? 0} pièce(s)
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function ControlBtn({ icon, label, onPress, variant = 'secondary', large = false }) {
  const btnStyle = [
    styles.btn,
    variant === 'chain' && styles.btnChain,
    variant === 'secondary' && styles.btnSecondary,
    large && styles.btnLarge,
  ];
  const textStyle = [
    styles.btnLabel,
    variant === 'chain' && styles.btnLabelChain,
  ];
  const iconColor = variant === 'chain' ? COLORS.bgPrimary : COLORS.textSecondary;

  return (
    <TouchableOpacity style={btnStyle} onPress={onPress} activeOpacity={0.75}>
      <Ionicons name={icon} size={large ? 26 : 22} color={iconColor} />
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.bgCard,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingBottom: Platform.OS === 'ios' ? 24 : 12,
  },
  btn: {
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    minWidth: 70,
  },
  btnSecondary: {
    backgroundColor: COLORS.bgSecondary,
  },
  btnChain: {
    backgroundColor: COLORS.chainHighlight,
    borderColor: COLORS.accentLight,
    paddingHorizontal: 20,
  },
  btnLarge: {
    paddingVertical: 12,
  },
  btnLabel: {
    color: COLORS.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  btnLabelChain: {
    color: COLORS.bgPrimary,
    fontWeight: '700',
  },
  spacer: {
    width: 120,
  },

  // Modal
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modal: {
    backgroundColor: COLORS.bgCard,
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 360,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
    elevation: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  modalTitle: {
    color: COLORS.textPrimary,
    fontSize: 17,
    fontWeight: '700',
  },
  modalSub: {
    color: COLORS.textSecondary,
    fontSize: 13,
    marginBottom: 20,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 14,
  },
  choiceBtn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
    paddingVertical: 18,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  approachBtn: {
    backgroundColor: COLORS.bgSecondary,
    borderColor: COLORS.accent,
  },
  withdrawBtn: {
    backgroundColor: COLORS.bgSecondary,
    borderColor: COLORS.borderLight,
  },
  choiceBtnTitle: {
    color: COLORS.textPrimary,
    fontSize: 15,
    fontWeight: '700',
  },
  choiceBtnSub: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
});