import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Palette } from '@/constants/Colors';
import { Button } from './Button';
import { Badge } from './Badge';
import { calculatePlates, estimate1RM } from '@/src/utils/fitnessCalculators';
import { Calculator, X, Disc, Flame } from 'lucide-react-native';

interface QuickCalcModalProps {
  visible: boolean;
  onClose: () => void;
  defaultWeight?: number;
}

export const QuickCalcModal: React.FC<QuickCalcModalProps> = ({
  visible,
  onClose,
  defaultWeight = 100,
}) => {
  const [activeTab, setActiveTab] = useState<'plates' | '1rm'>('plates');

  // Plate Calculator State
  const [targetWeight, setTargetWeight] = useState(String(defaultWeight));
  const [barWeight, setBarWeight] = useState<number>(20);

  // 1RM Calculator State
  const [rmWeight, setRmWeight] = useState('80');
  const [rmReps, setRmReps] = useState('5');

  const parsedTarget = parseFloat(targetWeight) || 0;
  const plateResult = calculatePlates(parsedTarget, barWeight);

  const parsedRmWeight = parseFloat(rmWeight) || 0;
  const parsedRmReps = parseInt(rmReps, 10) || 0;
  const rmResult = estimate1RM(parsedRmWeight, parsedRmReps);

  const percentageScale = [
    { pct: 95, label: '95% (1-2 reps)' },
    { pct: 90, label: '90% (3-4 reps)' },
    { pct: 85, label: '85% (5-6 reps)' },
    { pct: 80, label: '80% (7-8 reps)' },
    { pct: 75, label: '75% (9-10 reps)' },
    { pct: 70, label: '70% (11-12 reps)' },
  ];

  const getPlateColor = (weight: number) => {
    switch (weight) {
      case 25: return '#E63946'; // Red
      case 20: return '#1D3557'; // Blue
      case 15: return '#F4A261'; // Yellow
      case 10: return '#2A9D8F'; // Green
      case 5: return '#E9C46A';
      default: return Palette.textSecondary;
    }
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.titleGroup}>
              <Calculator size={20} color={Palette.primary} />
              <Text style={styles.title}>Gym Calculator</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={20} color={Palette.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Tab Selector */}
          <View style={styles.tabsRow}>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === 'plates' && styles.activeTabBtn]}
              onPress={() => setActiveTab('plates')}
            >
              <Text style={[styles.tabText, activeTab === 'plates' && styles.activeTabText]}>
                Plate Loader
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tabBtn, activeTab === '1rm' && styles.activeTabBtn]}
              onPress={() => setActiveTab('1rm')}
            >
              <Text style={[styles.tabText, activeTab === '1rm' && styles.activeTabText]}>
                1-Rep Max
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
            {activeTab === 'plates' ? (
              <View>
                {/* Inputs */}
                <Text style={styles.inputLabel}>Target Weight (kg)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={targetWeight}
                  onChangeText={setTargetWeight}
                  placeholder="e.g. 100"
                  placeholderTextColor={Palette.textMuted}
                />

                <Text style={styles.inputLabel}>Barbell Weight</Text>
                <View style={styles.barWeightRow}>
                  {[20, 15].map((w) => (
                    <TouchableOpacity
                      key={w}
                      style={[
                        styles.barWeightPill,
                        barWeight === w && styles.activeBarWeightPill,
                      ]}
                      onPress={() => setBarWeight(w)}
                    >
                      <Text
                        style={[
                          styles.barWeightText,
                          barWeight === w && styles.activeBarWeightText,
                        ]}
                      >
                        {w} kg {w === 20 ? '(Olympic Men)' : '(Olympic Women)'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Plate Results Summary */}
                <View style={styles.resultBox}>
                  <Text style={styles.resultSideLabel}>LOAD PER SIDE</Text>
                  <Text style={styles.resultSideWeight}>{plateResult.weightPerSide} kg</Text>

                  {plateResult.plates.length === 0 ? (
                    <Text style={styles.noPlatesText}>
                      {parsedTarget < barWeight
                        ? 'Target weight is less than barbell weight'
                        : 'Empty barbell (no plates needed)'}
                    </Text>
                  ) : (
                    <View style={styles.platesList}>
                      {plateResult.plates.map((p) => (
                        <View key={p.weight} style={styles.plateItem}>
                          <View
                            style={[
                              styles.plateDot,
                              { backgroundColor: getPlateColor(p.weight) },
                            ]}
                          />
                          <Text style={styles.plateItemText}>
                            {p.count} × <Text style={{ fontWeight: '700' }}>{p.weight} kg</Text>
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            ) : (
              <View>
                {/* 1RM Inputs */}
                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.inputLabel}>Weight Lifted (kg)</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={rmWeight}
                      onChangeText={setRmWeight}
                      placeholder="e.g. 80"
                      placeholderTextColor={Palette.textMuted}
                    />
                  </View>
                  <View style={{ flex: 1, marginLeft: 8 }}>
                    <Text style={styles.inputLabel}>Reps</Text>
                    <TextInput
                      style={styles.textInput}
                      keyboardType="numeric"
                      value={rmReps}
                      onChangeText={setRmReps}
                      placeholder="e.g. 5"
                      placeholderTextColor={Palette.textMuted}
                    />
                  </View>
                </View>

                {/* 1RM Big Output */}
                <View style={styles.resultBox}>
                  <Text style={styles.resultSideLabel}>ESTIMATED 1-REP MAX</Text>
                  <Text style={[styles.resultSideWeight, { color: Palette.primary }]}>
                    {rmResult.average} kg
                  </Text>
                  <Text style={styles.rmFormulaNote}>
                    Epley: {rmResult.epley} kg • Brzycki: {rmResult.brzycki} kg
                  </Text>
                </View>

                {/* Percentages Table */}
                <Text style={[styles.inputLabel, { marginTop: 14 }]}>Training Load Percentages</Text>
                <View style={styles.pctGrid}>
                  {percentageScale.map((item) => (
                    <View key={item.pct} style={styles.pctRow}>
                      <Text style={styles.pctLabel}>{item.label}</Text>
                      <Badge
                        label={`${Math.round((rmResult.average * item.pct) / 100)} kg`}
                        variant="secondary"
                      />
                    </View>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          <Button
            title="Done"
            variant="outline"
            onPress={onClose}
            style={{ marginTop: 16 }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Palette.overlay,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Palette.card,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
  },
  closeBtn: {
    padding: 4,
  },
  tabsRow: {
    flexDirection: 'row',
    backgroundColor: Palette.cardElevated,
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTabBtn: {
    backgroundColor: Palette.primary,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  activeTabText: {
    color: '#0B0F14',
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
    marginTop: 6,
  },
  textInput: {
    backgroundColor: Palette.inputBg,
    borderWidth: 1,
    borderColor: Palette.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Palette.text,
    fontSize: 16,
  },
  barWeightRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  barWeightPill: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.border,
    alignItems: 'center',
    backgroundColor: Palette.cardElevated,
  },
  activeBarWeightPill: {
    borderColor: Palette.primary,
    backgroundColor: Palette.primaryGlow,
  },
  barWeightText: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
  },
  activeBarWeightText: {
    color: Palette.primary,
    fontWeight: '700',
  },
  resultBox: {
    backgroundColor: Palette.cardElevated,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 10,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  resultSideLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    color: Palette.textSecondary,
  },
  resultSideWeight: {
    fontSize: 32,
    fontWeight: '800',
    color: Palette.text,
    marginVertical: 4,
  },
  noPlatesText: {
    fontSize: 12,
    color: Palette.textMuted,
    marginTop: 6,
  },
  platesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
    justifyContent: 'center',
  },
  plateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Palette.inputBg,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  plateDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  plateItemText: {
    fontSize: 13,
    color: Palette.text,
  },
  formRow: {
    flexDirection: 'row',
  },
  rmFormulaNote: {
    fontSize: 11,
    color: Palette.textSecondary,
    marginTop: 4,
  },
  pctGrid: {
    backgroundColor: Palette.cardElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: Palette.cardBorder,
  },
  pctRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  pctLabel: {
    fontSize: 13,
    color: Palette.text,
  },
});
