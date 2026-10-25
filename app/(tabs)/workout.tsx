import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { Header } from '@/src/components/common/Header';
import { Card } from '@/src/components/common/Card';
import { Button } from '@/src/components/common/Button';
import { Badge } from '@/src/components/common/Badge';
import { Palette } from '@/constants/Colors';
import { useDatabase } from '@/src/hooks/useDatabase';
import { WorkoutRepo } from '@/src/db/repositories/workoutRepo';
import { WorkoutSession } from '@/src/types/database';
import { Dumbbell, Plus, History, Calendar, CheckCircle } from 'lucide-react-native';

export default function WorkoutScreen() {
  const { isReady } = useDatabase();
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);

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
            onPress={() => {}}
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
          onPress={() => {}}
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
});
