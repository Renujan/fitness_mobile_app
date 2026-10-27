import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, Modal, TextInput, Alert, ScrollView } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { Header } from '@/src/components/common/Header';
import { Card } from '@/src/components/common/Card';
import { Button } from '@/src/components/common/Button';
import { Badge } from '@/src/components/common/Badge';
import { Palette } from '@/constants/Colors';
import { useDatabase } from '@/src/hooks/useDatabase';
import { WorkoutRepo } from '@/src/db/repositories/workoutRepo';
import { BodyRepo } from '@/src/db/repositories/bodyRepo';
import { UserRepo } from '@/src/db/repositories/userRepo';
import { Exercise, BodyMeasurement } from '@/src/types/database';
import { TrendingUp, Award, Activity, Scale, ChevronRight } from 'lucide-react-native';

export default function ProgressScreen() {
  const { isReady } = useDatabase();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [latestMeasurement, setLatestMeasurement] = useState<BodyMeasurement | null>(null);
  const [loading, setLoading] = useState(true);

  // Measurement Modal States
  const [isMeasurementModalOpen, setIsMeasurementModalOpen] = useState(false);
  const [weightInput, setWeightInput] = useState('');
  const [waistInput, setWaistInput] = useState('');
  const [chestInput, setChestInput] = useState('');
  const [bodyFatInput, setBodyFatInput] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      const [exs, bm] = await Promise.all([
        WorkoutRepo.getExercises(),
        BodyRepo.getLatestMeasurement(),
      ]);
      setExercises(exs.slice(0, 8));
      setLatestMeasurement(bm);
      if (bm) {
        setWeightInput(String(bm.weight_kg));
      }
    } catch (e) {
      console.error('Error loading progress:', e);
    } finally {
      setLoading(false);
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

      {/* Exercise Progression Directory */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Exercise Progression</Text>
        <Text style={styles.sectionSub}>Select an exercise to view charts & history</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={Palette.primary} style={{ marginTop: 20 }} />
      ) : (
        exercises.map((ex) => (
          <Card key={ex.id} onPress={() => {}} style={styles.exerciseCard}>
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
});
