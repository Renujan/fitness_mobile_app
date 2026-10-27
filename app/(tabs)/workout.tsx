import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Modal, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { Header } from '@/src/components/common/Header';
import { Card } from '@/src/components/common/Card';
import { Button } from '@/src/components/common/Button';
import { Badge } from '@/src/components/common/Badge';
import { Palette } from '@/constants/Colors';
import { useDatabase } from '@/src/hooks/useDatabase';
import { WorkoutRepo } from '@/src/db/repositories/workoutRepo';
import { WorkoutSession, Exercise, WorkoutSet } from '@/src/types/database';
import { Dumbbell, Plus, History, Calendar, CheckCircle, Trash2, X } from 'lucide-react-native';

export default function WorkoutScreen() {
  const { isReady } = useDatabase();
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

  // Active Workout Session States
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<number | null>(null);
  const [sessionTitle, setSessionTitle] = useState('Strength Workout');
  const [sessionStartTime, setSessionStartTime] = useState<number>(Date.now());
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExerciseId, setSelectedExerciseId] = useState<number | null>(null);
  const [currentSets, setCurrentSets] = useState<WorkoutSet[]>([]);
  const [setForm, setSetForm] = useState({ weight: '60', reps: '10', rpe: '8' });

  const loadSessions = async () => {
    try {
      setLoading(true);
      const pastSessions = await WorkoutRepo.getCompletedSessions(20);
      setHistory(pastSessions);
    } catch (e) {
      console.error('Error loading workout sessions:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadSessions();
    }
  }, [isReady]);

  const startNewWorkout = async (title = 'Strength Training') => {
    try {
      const todayStr = new Date().toISOString().split('T')[0];
      const sessionId = await WorkoutRepo.createSession(title, todayStr);
      const allExercises = await WorkoutRepo.getExercises();

      setActiveSessionId(sessionId);
      setSessionTitle(title);
      setSessionStartTime(Date.now());
      setExercises(allExercises);
      setSelectedExerciseId(allExercises.length > 0 ? allExercises[0].id : null);
      setCurrentSets([]);
      setIsSessionModalOpen(true);
    } catch (e: any) {
      Alert.alert('Error', e?.message || 'Could not start workout session');
    }
  };

  const handleAddSet = async () => {
    if (!activeSessionId || !selectedExerciseId) {
      Alert.alert('Selection Error', 'Please select an exercise first.');
      return;
    }
    const weight = parseFloat(setForm.weight);
    const reps = parseInt(setForm.reps, 10);
    const rpe = parseFloat(setForm.rpe) || undefined;

    if (isNaN(weight) || isNaN(reps) || reps <= 0) {
      Alert.alert('Invalid Input', 'Please enter valid weight and reps.');
      return;
    }

    try {
      await WorkoutRepo.addSet(activeSessionId, selectedExerciseId, weight, reps, rpe);
      const sets = await WorkoutRepo.getSetsForSession(activeSessionId);
      setCurrentSets(sets);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not log set');
    }
  };

  const handleDiscardWorkout = () => {
    Alert.alert(
      'Discard Workout',
      'Are you sure you want to discard this workout session? Recorded sets will be lost.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: async () => {
            if (activeSessionId) {
              await WorkoutRepo.deleteSession(activeSessionId);
            }
            setIsSessionModalOpen(false);
            setActiveSessionId(null);
          },
        },
      ]
    );
  };

  const handleFinishWorkout = async () => {
    if (!activeSessionId) return;

    if (currentSets.length === 0) {
      Alert.alert(
        'Empty Workout',
        'No sets were recorded. Do you still want to finish this session?',
        [
          { text: 'Keep Training', style: 'cancel' },
          {
            text: 'Finish Anyway',
            onPress: async () => {
              const duration = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
              await WorkoutRepo.completeSession(activeSessionId, duration);
              await loadSessions();
              setIsSessionModalOpen(false);
              setActiveSessionId(null);
            },
          },
        ]
      );
      return;
    }

    try {
      const duration = Math.max(1, Math.round((Date.now() - sessionStartTime) / 1000));
      const totalVolume = currentSets.reduce((sum, s) => sum + s.weight_kg * s.reps, 0);

      await WorkoutRepo.completeSession(activeSessionId, duration);
      await loadSessions();
      setIsSessionModalOpen(false);
      setActiveSessionId(null);

      Alert.alert(
        'Workout Completed! 🎉',
        `Logged ${currentSets.length} sets with ${totalVolume} kg total volume in ${Math.round(duration / 60)} mins.`
      );
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Could not complete workout');
    }
  };

  return (
    <ScreenContainer scrollable>
      <Header
        subtitle="TRAINING & LOGS"
        title="Workout Tracker"
        rightAction={
          <Button
            title="+ New"
            size="small"
            icon={<Plus size={16} color="#0B0F14" />}
            onPress={() => startNewWorkout('Full Body Session')}
          />
        }
      />

      {/* Start Workout Banner */}
      <Card accent="primary" elevated style={styles.startCard}>
        <View style={styles.startCardHeader}>
          <View style={styles.iconCircle}>
            <Dumbbell size={22} color={Palette.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.startTitle}>Ready to Train?</Text>
            <Text style={styles.startSubtitle}>
              Log sets, track volume & conquer personal records.
            </Text>
          </View>
        </View>

        <Button
          title="Start Empty Workout"
          size="medium"
          onPress={() => startNewWorkout('Workout Session')}
          style={{ marginTop: 12 }}
        />
      </Card>

      {/* Recent History Section */}
      <View style={styles.sectionHeaderRow}>
        <View style={styles.sectionTitleGroup}>
          <History size={18} color={Palette.primary} />
          <Text style={styles.sectionTitle}>Workout History</Text>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={Palette.primary} style={{ marginTop: 24 }} />
      ) : history.length === 0 ? (
        <Card style={styles.emptyCard}>
          <Dumbbell size={36} color={Palette.textMuted} />
          <Text style={styles.emptyTitle}>No Workouts Logged Yet</Text>
          <Text style={styles.emptyDesc}>
            Your completed workouts, training volume and sets will appear here.
          </Text>
        </Card>
      ) : (
        history.map((item) => (
          <Card key={item.id} style={styles.historyCard}>
            <View style={styles.historyTop}>
              <Text style={styles.historyTitle}>{item.title}</Text>
              <Badge label={`${item.total_volume_kg} kg vol`} variant="secondary" />
            </View>
            <View style={styles.historyMeta}>
              <View style={styles.metaItem}>
                <Calendar size={14} color={Palette.textSecondary} />
                <Text style={styles.metaText}>{item.date}</Text>
              </View>
              <View style={styles.metaItem}>
                <CheckCircle size={14} color={Palette.primary} />
                <Text style={styles.metaText}>{Math.round(item.duration_seconds / 60)} mins</Text>
              </View>
            </View>
          </Card>
        ))
      )}

      {/* Active Workout Session Modal */}
      <Modal
        visible={isSessionModalOpen}
        animationType="slide"
        transparent
        onRequestClose={handleDiscardWorkout}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeaderRow}>
              <View>
                <Text style={styles.modalTitle}>{sessionTitle}</Text>
                <Text style={styles.sessionSub}>
                  {currentSets.length} sets logged • Live Session
                </Text>
              </View>
              <TouchableOpacity onPress={handleDiscardWorkout} style={styles.closeBtn}>
                <X size={20} color={Palette.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 380 }}>
              {/* Exercise Selector */}
              <Text style={styles.inputLabel}>Select Exercise</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exChipsRow}>
                {exercises.map((ex) => (
                  <TouchableOpacity
                    key={ex.id}
                    style={[
                      styles.exChip,
                      selectedExerciseId === ex.id && styles.activeExChip,
                    ]}
                    onPress={() => setSelectedExerciseId(ex.id)}
                  >
                    <Text
                      style={[
                        styles.exChipText,
                        selectedExerciseId === ex.id && styles.activeExChipText,
                      ]}
                    >
                      {ex.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              {/* Set Inputs */}
              <View style={styles.setInputsRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={setForm.weight}
                    onChangeText={(w) => setSetForm({ ...setForm, weight: w })}
                    keyboardType="numeric"
                    placeholder="60"
                    placeholderTextColor={Palette.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>Reps</Text>
                  <TextInput
                    style={styles.textInput}
                    value={setForm.reps}
                    onChangeText={(r) => setSetForm({ ...setForm, reps: r })}
                    keyboardType="numeric"
                    placeholder="10"
                    placeholderTextColor={Palette.textMuted}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.inputLabel}>RPE (1-10)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={setForm.rpe}
                    onChangeText={(r) => setSetForm({ ...setForm, rpe: r })}
                    keyboardType="numeric"
                    placeholder="8"
                    placeholderTextColor={Palette.textMuted}
                  />
                </View>
              </View>

              <Button
                title="+ Add Set"
                size="small"
                variant="primary"
                onPress={handleAddSet}
                style={{ marginTop: 12 }}
              />

              {/* Logged Sets List */}
              <Text style={[styles.sectionTitle, { fontSize: 14, marginTop: 16, marginBottom: 8 }]}>
                Current Sets ({currentSets.length})
              </Text>

              {currentSets.length === 0 ? (
                <Text style={{ color: Palette.textMuted, fontStyle: 'italic', paddingVertical: 8 }}>
                  No sets logged yet. Enter weight & reps and tap "+ Add Set".
                </Text>
              ) : (
                currentSets.map((s, idx) => (
                  <View key={s.id || idx} style={styles.setRow}>
                    <Text style={styles.setNum}>#{idx + 1}</Text>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.setExerciseText}>{s.exercise_name || 'Exercise'}</Text>
                      <Text style={styles.setDetailText}>
                        {s.weight_kg} kg × {s.reps} reps {s.rpe ? `(RPE ${s.rpe})` : ''}
                      </Text>
                    </View>
                    <Badge label={`${s.weight_kg * s.reps} kg`} variant="secondary" />
                  </View>
                ))
              )}
            </ScrollView>

            <View style={styles.modalBtnRow}>
              <Button
                title="Discard"
                variant="danger"
                onPress={handleDiscardWorkout}
                style={{ flex: 1 }}
              />
              <Button
                title="Finish Workout"
                variant="primary"
                onPress={handleFinishWorkout}
                style={{ flex: 1.5, marginLeft: 10 }}
              />
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  startCard: {
    padding: 18,
    marginBottom: 20,
  },
  startCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Palette.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
  },
  startSubtitle: {
    fontSize: 13,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Palette.text,
  },
  emptyCard: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
    marginTop: 6,
  },
  emptyDesc: {
    fontSize: 13,
    color: Palette.textSecondary,
    textAlign: 'center',
  },
  historyCard: {
    padding: 14,
    marginBottom: 10,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  historyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  historyMeta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 12,
    color: Palette.textSecondary,
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
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: Palette.text,
  },
  sessionSub: {
    fontSize: 12,
    color: Palette.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  closeBtn: {
    padding: 6,
  },
  exChipsRow: {
    marginVertical: 8,
  },
  exChip: {
    backgroundColor: Palette.cardElevated,
    borderColor: Palette.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
  },
  activeExChip: {
    backgroundColor: Palette.primary,
    borderColor: Palette.primary,
  },
  exChipText: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '600',
  },
  activeExChipText: {
    color: '#0B0F14',
    fontWeight: '700',
  },
  setInputsRow: {
    flexDirection: 'row',
    marginTop: 6,
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
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: Palette.border,
  },
  setNum: {
    fontSize: 13,
    fontWeight: '700',
    color: Palette.primary,
    width: 24,
  },
  setExerciseText: {
    fontSize: 13,
    fontWeight: '600',
    color: Palette.text,
  },
  setDetailText: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 18,
    marginBottom: 10,
  },
});
