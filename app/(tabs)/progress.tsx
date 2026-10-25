import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { Header } from '@/src/components/common/Header';
import { Card } from '@/src/components/common/Card';
import { Button } from '@/src/components/common/Button';
import { Badge } from '@/src/components/common/Badge';
import { Palette } from '@/constants/Colors';
import { useDatabase } from '@/src/hooks/useDatabase';
import { WorkoutRepo } from '@/src/db/repositories/workoutRepo';
import { BodyRepo } from '@/src/db/repositories/bodyRepo';
import { Exercise, BodyMeasurement } from '@/src/types/database';
import { TrendingUp, Award, Activity, Scale, ChevronRight } from 'lucide-react-native';

export default function ProgressScreen() {
  const { isReady } = useDatabase();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [latestMeasurement, setLatestMeasurement] = useState<BodyMeasurement | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isReady) {
      (async () => {
        try {
          const [exs, bm] = await Promise.all([
            WorkoutRepo.getExercises(),
            BodyRepo.getLatestMeasurement(),
          ]);
          setExercises(exs.slice(0, 8));
          setLatestMeasurement(bm);
        } catch (e) {
          console.error('Error loading progress:', e);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isReady]);

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
            onPress={() => {}}
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
});
