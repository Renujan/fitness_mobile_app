import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { Header } from '@/src/components/common/Header';
import { Card } from '@/src/components/common/Card';
import { Button } from '@/src/components/common/Button';
import { Badge } from '@/src/components/common/Badge';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import { Palette } from '@/constants/Colors';
import { useDatabase } from '@/src/hooks/useDatabase';
import { WorkoutRepo } from '@/src/db/repositories/workoutRepo';
import { BodyRepo } from '@/src/db/repositories/bodyRepo';
import { UserRepo } from '@/src/db/repositories/userRepo';
import { GoalsRepo } from '@/src/db/repositories/goalsRepo';
import { Exercise, BodyMeasurement, FitnessGoal } from '@/src/types/database';
import { estimate1RM } from '@/src/utils/fitnessCalculators';
import { TrendingUp, Award, Activity, Scale, ChevronRight, Target, Plus, Check, Flame } from 'lucide-react-native';

export default function ProgressScreen() {
  const { isReady } = useDatabase();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [latestMeasurement, setLatestMeasurement] = useState<BodyMeasurement | null>(null);
  const [goals, setGoals] = useState<FitnessGoal[]>([]);
  const [loading, setLoading] = useState(true);

  // Goal Modal State
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [goalForm, setGoalForm] = useState({ title: '', targetValue: '', unit: 'kg' });

  // Measurement Modal States
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [chestInput, setChestInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');

  // Exercise Detail Modal States
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [exerciseHistory, setExerciseHistory] = useState<
    Array<{ date: string; max_weight: number; total_volume: number; sets: any[] }>
  >([]);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleOpenExerciseDetail = async (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setIsDetailModalOpen(true);
    setLoadingDetail(true);
    try {
      const history = await WorkoutRepo.getExerciseHistory(exercise.id);
      setExerciseHistory(history);
    } catch (e) {
      console.error('Error loading exercise history:', e);
    } finally {
      setLoadingDetail(false);
    }
  };

  const loadData = async () => {
    try {
      setLoading(true);
      const [exs, bm, g] = await Promise.all([
        WorkoutRepo.getExercises(),
        BodyRepo.getLatestMeasurement(),
        GoalsRepo.getGoals(),
      ]);
      setExercises(exs.slice(0, 8));
      setLatestMeasurement(bm);
      setGoals(g);
      if (bm) {
        setWeightInput(String(bm.weight_kg));
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGoal = async () => {
    const target = parseFloat(goalForm.targetValue);
    if (!goalForm.title.trim() || isNaN(target) || target <= 0) {
      Alert.alert('Required', 'Please enter a goal title and target value');
      return;
    }
    try {
      await GoalsRepo.createGoal({
        title: goalForm.title.trim(),
        category: 'strength',
        target_value: target,
        current_value: 0,
        unit: goalForm.unit.trim() || 'kg',
      });
      const updatedGoals = await GoalsRepo.getGoals();
      setGoals(updatedGoals);
      setIsAddGoalModalOpen(false);
      setGoalForm({ title: '', targetValue: '', unit: 'kg' });
      Alert.alert('Goal Added', 'New fitness goal created.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not create goal');
    }
  };

  useEffect(() => {
    if (isReady) {
      loadData();
    }
  }, [isReady]);

  const handleSaveMeasurement = async () => {
    const weight = parseFloat(weightInput);
    if (!weight || isNaN(weight)) {
      Alert.alert('Required', 'Please enter a valid weight in kg.');
      return;
    }
    const todayStr = new Date().toISOString().split('T')[0];
    try {
      await BodyRepo.logMeasurement({
        date: todayStr,
        weight_kg: weight,
        waist_cm: parseFloat(waistInput) || undefined,
        chest_cm: parseFloat(chestInput) || undefined,
        body_fat_pct: parseFloat(bodyFatInput) || undefined,
      });
      await UserRepo.updateProfile({ current_weight_kg: weight });
      await loadData();
      setIsMeasurementModalOpen(false);
      Alert.alert('Success', 'Body metrics recorded successfully.');
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not save measurement');
    }
  };

  return (
    <ScreenContainer scrollable>
      <Header subtitle="ANALYTICS & PRs" title="Strength & Progress" />

      {/* Body Metric Highlight */}
      <Card elevated accent="secondary" style={styles.metricCard}>
        <View style={styles.metricTop}>
          <View style={styles.iconCircle}>
            <Scale size={20} color={Palette.secondary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.metricLabel}>LATEST BODY WEIGHT</Text>
            <Text style={styles.metricValue}>
              {latestMeasurement ? `${latestMeasurement.weight_kg} kg` : 'No record yet'}
            </Text>
          </View>
          <Button
            title="+ Update"
            size="small"
            variant="outline"
            onPress={() => setIsMeasurementModalOpen(true)}
          />
        </View>
      </Card>

      {/* Active Fitness Goals */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleGroup}>
          <Target size={18} color={Palette.primary} />
          <Text style={styles.sectionTitle}>Fitness Goals</Text>
        </View>
        <Button
          title="+ Goal"
          size="small"
          variant="ghost"
          textStyle={{ color: Palette.primary }}
          onPress={() => setIsAddGoalModalOpen(true)}
        />
      </View>

      {goals.length === 0 ? (
        <Card style={styles.emptyGoalCard}>
          <Text style={{ color: Palette.textMuted, fontStyle: 'italic', fontSize: 13, textAlign: 'center' }}>
            No goals set yet. Tap "+ Goal" to set a strength or physique milestone!
          </Text>
        </Card>
      ) : (
        goals.map((g) => (
          <Card key={g.id} style={{ padding: 14, marginBottom: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ fontSize: 15, fontWeight: '700', color: Palette.text }}>{g.title}</Text>
              <Badge
                label={g.is_completed ? 'COMPLETED' : `${g.target_value} ${g.unit}`}
                variant={g.is_completed ? 'primary' : 'secondary'}
              />
            </View>
            <ProgressBar
              current={g.current_value}
              target={g.target_value}
              unit={g.unit}
              color={g.is_completed ? Palette.primary : Palette.secondary}
            />
          </Card>
        ))
      )}

      {/* Exercise Progression Directory */}
      <View style={[styles.sectionHeader, { marginTop: 14 }]}>
        <Text style={styles.sectionTitle}>Exercise Progression</Text>
        <Text style={styles.sectionSub}>Select an exercise to view charts & history</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Palette.primary} style={{ marginTop: 20 }} />
      ) : (
        exercises.map((ex) => (
          <Card
            key={ex.id}
            onPress={() => handleOpenExerciseDetail(ex)}
            style={styles.exerciseCard}
          >
            <View style={styles.exerciseRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.exerciseName}>{ex.name}</Text>
                <View style={styles.badgeRow}>
                  <Badge label={ex.category} variant="primary" style={styles.badge} />
                  <Badge label={ex.equipment} variant="neutral" style={styles.badge} />
                </View>
              </View>
              <ChevronRight size={20} color={Palette.textSecondary} />
            </View>
          </Card>
        ))
      )}

      {/* Measurement Update Modal */}
      <Modal
        visible={isMeasurementModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsMeasurementModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Update Body Metrics</Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Current Weight (kg) *</Text>
              <TextInput
                style={styles.textInput}
                value={weightInput}
                onChangeText={setWeightInput}
                keyboardType="numeric"
                placeholder="e.g. 74.5"
                placeholderTextColor={Palette.textMuted}
              />

              <View style={styles.formRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Waist (cm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={waistInput}
                    onChangeText={setWaistInput}
                    keyboardType="numeric"
                    placeholder="80"
                    placeholderTextColor={Palette.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.inputLabel}>Chest (cm)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={chestInput}
                    onChangeText={setChestInput}
                    keyboardType="numeric"
                    placeholder="100"
                    placeholderTextColor={Palette.textMuted}
                  />
                </View>
              </View>

              <Text style={styles.inputLabel}>Body Fat Percentage (%)</Text>
              <TextInput
                style={styles.textInput}
                value={bodyFatInput}
                onChangeText={setBodyFatInput}
                keyboardType="numeric"
                placeholder="e.g. 15.5"
                placeholderTextColor={Palette.textMuted}
              />
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsMeasurementModalOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Metrics"
                variant="primary"
                onPress={handleSaveMeasurement}
                style={{ flex: 1, marginLeft: 10 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Exercise Detail & Progression Modal */}
      <Modal
        visible={isDetailModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsDetailModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedExercise?.name || 'Exercise Details'}</Text>
            <View style={[styles.badgeRow, { justifyContent: 'center', marginBottom: 16 }]}>
              {selectedExercise && (
                <>
                  <Badge label={selectedExercise.category} variant="primary" style={styles.badge} />
                  <Badge label={selectedExercise.equipment} variant="neutral" style={styles.badge} />
                  <Badge label={selectedExercise.target_muscle} variant="secondary" style={styles.badge} />
                </>
              )}
            </View>

            {loadingDetail ? (
              <ActivityIndicator color={Palette.primary} style={{ marginVertical: 30 }} />
            ) : (
              <ScrollView style={{ maxHeight: 320 }} showsVerticalScrollIndicator={false}>
                {/* PR & Estimated 1RM Cards Grid */}
                {(() => {
                  const allSets = exerciseHistory.flatMap((h) => h.sets || []);
                  const best1RM = allSets.reduce((max, s) => {
                    const est = estimate1RM(s.weight_kg, s.reps).average;
                    return est > max ? est : max;
                  }, 0);
                  const maxWeight = exerciseHistory.length > 0
                    ? Math.max(...exerciseHistory.map((h) => h.max_weight))
                    : 0;

                  return (
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: 14 }}>
                      <Card accent="primary" style={{ flex: 1, padding: 12, marginBottom: 0 }}>
                        <Text style={{ fontSize: 10, fontWeight: '700', color: Palette.primary, letterSpacing: 0.5 }}>
                          MAX WEIGHT PR
                        </Text>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: Palette.text, marginTop: 4 }}>
                          {maxWeight > 0 ? `${maxWeight} kg` : '--'}
                        </Text>
                      </Card>

                      <Card accent="secondary" style={{ flex: 1, padding: 12, marginBottom: 0 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                          <Flame size={12} color={Palette.secondary} />
                          <Text style={{ fontSize: 10, fontWeight: '700', color: Palette.secondary, letterSpacing: 0.5 }}>
                            ESTIMATED 1RM
                          </Text>
                        </View>
                        <Text style={{ fontSize: 22, fontWeight: '800', color: Palette.text, marginTop: 4 }}>
                          {best1RM > 0 ? `${best1RM} kg` : '--'}
                        </Text>
                      </Card>
                    </View>
                  );
                })()}

                <Text style={[styles.sectionTitle, { fontSize: 14, marginBottom: 8 }]}>
                  History & Session Logs
                </Text>

                {exerciseHistory.length === 0 ? (
                  <Text style={{ color: Palette.textMuted, fontStyle: 'italic', paddingVertical: 12 }}>
                    No recorded training history for this exercise yet.
                  </Text>
                ) : (
                  exerciseHistory.map((entry) => (
                    <View key={entry.date} style={styles.historyRow}>
                      <View>
                        <Text style={{ fontSize: 14, fontWeight: '700', color: Palette.text }}>
                          {entry.date}
                        </Text>
                        <Text style={{ fontSize: 12, color: Palette.textSecondary, marginTop: 2 }}>
                          {entry.sets.length} sets • Vol: {entry.total_volume} kg
                        </Text>
                      </View>
                      <Badge label={`${entry.max_weight} kg max`} variant="secondary" />
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            <Button
              title="Close"
              variant="outline"
              onPress={() => setIsDetailModalOpen(false)}
              style={{ marginTop: 14 }}
            />
          </View>
        </View>
      </Modal>

      {/* Add Goal Modal */}
      <Modal
        visible={isAddGoalModalOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsAddGoalModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>New Fitness Milestone</Text>
            <Text style={styles.inputLabel}>Goal Title</Text>
            <TextInput
              style={styles.textInput}
              value={goalForm.title}
              onChangeText={(t) => setGoalForm({ ...goalForm, title: t })}
              placeholder="e.g. Bench Press 100kg"
              placeholderTextColor={Palette.textMuted}
            />

            <View style={styles.formRow}>
              <View style={{ flex: 1.5 }}>
                <Text style={styles.inputLabel}>Target Value</Text>
                <TextInput
                  style={styles.textInput}
                  value={goalForm.targetValue}
                  onChangeText={(t) => setGoalForm({ ...goalForm, targetValue: t })}
                  keyboardType="numeric"
                  placeholder="100"
                  placeholderTextColor={Palette.textMuted}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.inputLabel}>Unit</Text>
                <TextInput
                  style={styles.textInput}
                  value={goalForm.unit}
                  onChangeText={(t) => setGoalForm({ ...goalForm, unit: t })}
                  placeholder="kg, reps, d"
                  placeholderTextColor={Palette.textMuted}
                />
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="ghost"
                onPress={() => setIsAddGoalModalOpen(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Create Goal"
                variant="primary"
                onPress={handleCreateGoal}
                style={{ flex: 1, marginLeft: 10 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  metricCard: {
    padding: 16,
    marginBottom: 20,
  },
  metricTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.secondaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.secondary,
    letterSpacing: 0.8,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.text,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 14,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyGoalCard: {
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
  },
  sectionSub: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  exerciseCard: {
    padding: 14,
    marginBottom: 8,
  },
  exerciseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
    color: Palette.text,
    marginBottom: 6,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Palette.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: Palette.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Palette.textSecondary,
    marginBottom: 6,
    marginTop: 10,
  },
  textInput: {
    backgroundColor: Palette.cardElevated,
    borderWidth: 1,
    borderColor: Palette.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Palette.text,
    fontSize: 15,
  },
  formRow: {
    flexDirection: 'row',
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 10,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
});
