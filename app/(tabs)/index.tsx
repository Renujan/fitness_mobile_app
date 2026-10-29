import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator, TouchableOpacity, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { Header } from '@/src/components/common/Header';
import { Card } from '@/src/components/common/Card';
import { Button } from '@/src/components/common/Button';
import { Badge } from '@/src/components/common/Badge';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import { QuickCalcModal } from '@/src/components/common/QuickCalcModal';
import { Palette } from '@/constants/Colors';
import { useDatabase } from '@/src/hooks/useDatabase';
import { UserRepo } from '@/src/db/repositories/userRepo';
import { WorkoutRepo } from '@/src/db/repositories/workoutRepo';
import { NutritionRepo } from '@/src/db/repositories/nutritionRepo';
import { UserProfile, WorkoutPlan } from '@/src/types/database';
import { Dumbbell, PlusCircle, Flame, Calendar, Trophy, Sparkles, Scale, Utensils, Calculator } from 'lucide-react-native';

const MOTIVATIONAL_QUOTES = [
  { quote: 'The only bad workout is the one that didn’t happen.', author: 'Fitness Wisdom' },
  { quote: 'Discipline is choosing between what you want now and what you want most.', author: 'Abraham Lincoln' },
  { quote: 'Small daily improvements over time lead to stunning results.', author: 'Robin Sharma' },
  { quote: 'Strength does not come from winning. Your struggles develop your strengths.', author: 'Arnold Schwarzenegger' },
  { quote: 'Action produces motivation, not the other way around.', author: 'Mindset' },
];

export default function HomeScreen() {
  const { isReady } = useDatabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [todayPlan, setTodayPlan] = useState<WorkoutPlan | null>(null);
  const [dailyMacros, setDailyMacros] = useState({ calories: 0, protein: 0 });
  const [weeklyConsistency, setWeeklyConsistency] = useState(0);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);

  const quoteOfTheDay = MOTIVATIONAL_QUOTES[new Date().getDate() % MOTIVATIONAL_QUOTES.length];

  const todayStr = new Date().toISOString().split('T')[0];
  const dayOfWeek = new Date().getDay() === 0 ? 7 : new Date().getDay(); // 1=Mon...7=Sun

  const loadData = async () => {
    try {
      const [user, plan, macros, consistency] = await Promise.all([
        UserRepo.getProfile(),
        WorkoutRepo.getPlanForDay(dayOfWeek),
        NutritionRepo.getDailyLogs(todayStr),
        WorkoutRepo.getWeeklyConsistency(
          new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
          todayStr
        ),
      ]);

      setProfile(user);
      setTodayPlan(plan);
      setDailyMacros({ calories: macros.calories, protein: macros.protein });
      setWeeklyConsistency(consistency);
    } catch (err) {
      console.error('Error loading home data:', err);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadData();
    }
  }, [isReady]);

  if (!isReady) {
    return (
      <ScreenContainer style={styles.center}>
        <ActivityIndicator size="large" color={Palette.primary} />
        <Text style={styles.loadingText}>Initializing FitTrack Local Database...</Text>
      </ScreenContainer>
    );
  }

  const muscleList: string[] = todayPlan?.muscle_groups
    ? JSON.parse(todayPlan.muscle_groups)
    : [];

  return (
    <ScreenContainer scrollable>
      <Header
        subtitle={new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
        title={`Welcome, ${profile?.name || 'Athlete'}`}
        rightAction={
          <View style={styles.streakBadge}>
            <Flame size={16} color={Palette.primary} />
            <Text style={styles.streakText}>{weeklyConsistency}d / 7d</Text>
          </View>
        }
      />

      {/* Quick Action Shortcuts */}
      <View style={styles.shortcutsRow}>
        <TouchableOpacity
          style={styles.shortcutBtn}
          onPress={() => router.push('/workout')}
        >
          <View style={[styles.shortcutIcon, { backgroundColor: Palette.primaryGlow }]}>
            <Dumbbell size={18} color={Palette.primary} />
          </View>
          <Text style={styles.shortcutText}>Log Lift</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutBtn}
          onPress={() => router.push('/nutrition')}
        >
          <View style={[styles.shortcutIcon, { backgroundColor: Palette.secondaryGlow }]}>
            <Utensils size={18} color={Palette.secondary} />
          </View>
          <Text style={styles.shortcutText}>Log Meal</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutBtn}
          onPress={() => router.push('/progress')}
        >
          <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(255, 184, 76, 0.15)' }]}>
            <Scale size={18} color="#FFB84C" />
          </View>
          <Text style={styles.shortcutText}>Weigh In</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.shortcutBtn}
          onPress={() => setIsCalcModalOpen(true)}
        >
          <View style={[styles.shortcutIcon, { backgroundColor: 'rgba(184, 255, 101, 0.15)' }]}>
            <Calculator size={18} color={Palette.primary} />
          </View>
          <Text style={styles.shortcutText}>Calc</Text>
        </TouchableOpacity>
      </View>

      {/* Today's Workout Card */}
      <Card accent="primary" elevated style={styles.workoutCard}>
        <View style={styles.cardHeaderRow}>
          <View style={styles.workoutIconCircle}>
            <Dumbbell size={24} color={Palette.primary} />
          </View>
          <View style={styles.workoutHeaderInfo}>
            <Text style={styles.cardCategory}>TODAY'S WORKOUT</Text>
            <Text style={styles.cardTitle}>{todayPlan?.title || 'Rest & Recovery'}</Text>
          </View>
          <Badge
            label={todayPlan?.is_rest_day ? 'REST' : 'ACTIVE'}
            variant={todayPlan?.is_rest_day ? 'neutral' : 'primary'}
          />
        </View>

        {muscleList.length > 0 && (
          <View style={styles.muscleRow}>
            {muscleList.map((m) => (
              <Badge key={m} label={m} variant="secondary" style={styles.muscleBadge} />
            ))}
          </View>
        )}

        <View style={styles.actionRow}>
          <Button
            title="Start Workout"
            icon={<Dumbbell size={18} color="#0B0F14" />}
            onPress={() => router.push('/workout')}
            style={styles.primaryButton}
          />
        </View>
      </Card>

      {/* Daily Nutrition Summary */}
      <Card style={styles.nutritionCard}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.sectionTitle}>Daily Nutrition Targets</Text>
          <Button
            title="+ Quick Add"
            size="small"
            variant="ghost"
            textStyle={{ color: Palette.secondary }}
            onPress={() => router.push('/nutrition')}
          />
        </View>

        <ProgressBar
          label="Protein"
          current={dailyMacros.protein}
          target={profile?.protein_target || 150}
          unit="g"
          color={Palette.primary}
        />

        <View style={{ height: 12 }} />

        <ProgressBar
          label="Calories"
          current={dailyMacros.calories}
          target={profile?.calorie_target || 2400}
          unit="kcal"
          color={Palette.secondary}
        />
      </Card>

      {/* Quick Stats Grid */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>BODY WEIGHT</Text>
          <Text style={styles.statValue}>
            {profile?.current_weight_kg ? `${profile.current_weight_kg} kg` : '--'}
          </Text>
          <Text style={styles.statSub}>Target: {profile?.target_weight_kg || 75} kg</Text>
        </Card>

        <Card style={styles.statCard}>
          <Text style={styles.statLabel}>CONSISTENCY</Text>
          <Text style={styles.statValue}>{weeklyConsistency} Days</Text>
          <Text style={styles.statSub}>This week</Text>
        </Card>
      </View>

      {/* Daily Motivation Card */}
      <Card style={styles.quoteCard}>
        <View style={styles.quoteHeaderRow}>
          <Sparkles size={16} color={Palette.primary} />
          <Text style={styles.quoteCategory}>DAILY INSPIRATION</Text>
        </View>
        <Text style={styles.quoteText}>"{quoteOfTheDay.quote}"</Text>
        <Text style={styles.quoteAuthor}>— {quoteOfTheDay.author}</Text>
      </Card>

      {/* Gym Plate & 1RM Calculator Modal */}
      <QuickCalcModal
        visible={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
        defaultWeight={profile?.current_weight_kg ? Math.round(profile.current_weight_kg * 1.2) : 80}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: Palette.textSecondary,
    fontSize: 14,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Palette.cardElevated,
    borderColor: Palette.border,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  streakText: {
    color: Palette.text,
    fontSize: 13,
    fontWeight: '700',
  },
  workoutCard: {
    padding: 18,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  workoutIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Palette.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  workoutHeaderInfo: {
    flex: 1,
  },
  cardCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.primary,
    letterSpacing: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Palette.text,
    marginTop: 2,
  },
  muscleRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 12,
  },
  muscleBadge: {
    marginBottom: 4,
  },
  actionRow: {
    marginTop: 12,
  },
  primaryButton: {
    width: '100%',
  },
  nutritionCard: {
    marginBottom: 16,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.textSecondary,
    letterSpacing: 0.8,
  },
  statValue: {
    fontSize: 22,
    fontWeight: '800',
    color: Palette.text,
    marginVertical: 6,
  },
  statSub: {
    fontSize: 12,
    color: Palette.textMuted,
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 8,
  },
  shortcutBtn: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: Palette.card,
    borderRadius: 14,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: Palette.border,
  },
  shortcutIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  shortcutText: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.text,
  },
  quoteCard: {
    marginTop: 4,
    marginBottom: 20,
    padding: 16,
    borderLeftWidth: 3,
    borderLeftColor: Palette.primary,
  },
  quoteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  quoteCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: Palette.primary,
    letterSpacing: 1,
  },
  quoteText: {
    fontSize: 14,
    fontStyle: 'italic',
    color: Palette.text,
    lineHeight: 20,
  },
  quoteAuthor: {
    fontSize: 12,
    color: Palette.textSecondary,
    fontWeight: '600',
    marginTop: 6,
    textAlign: 'right',
  },
});
