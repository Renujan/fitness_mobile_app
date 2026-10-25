import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '@/src/components/common/ScreenContainer';
import { Header } from '@/src/components/common/Header';
import { Card } from '@/src/components/common/Card';
import { Button } from '@/src/components/common/Button';
import { Badge } from '@/src/components/common/Badge';
import { ProgressBar } from '@/src/components/common/ProgressBar';
import { Palette } from '@/constants/Colors';
import { useDatabase } from '@/src/hooks/useDatabase';
import { NutritionRepo, DailyMacroSummary } from '@/src/db/repositories/nutritionRepo';
import { UserRepo } from '@/src/db/repositories/userRepo';
import { UserProfile, MealType } from '@/src/types/database';
import { Utensils, Plus, Apple, Trash2 } from 'lucide-react-native';

export default function NutritionScreen() {
  const { isReady } = useDatabase();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [summary, setSummary] = useState<DailyMacroSummary>({
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    logs: [],
  });
  const [loading, setLoading] = useState(true);

  const todayStr = new Date().toISOString().split('T')[0];

  const loadNutrition = async () => {
    try {
      setLoading(true);
      const [u, s] = await Promise.all([
        UserRepo.getProfile(),
        NutritionRepo.getDailyLogs(todayStr),
      ]);
      setProfile(u);
      setSummary(s);
    } catch (e) {
      console.error('Error loading nutrition:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isReady) {
      loadNutrition();
    }
  }, [isReady]);

  const meals: { type: MealType; title: string }[] = [
    { type: 'breakfast', title: 'Breakfast' },
    { type: 'lunch', title: 'Lunch' },
    { type: 'dinner', title: 'Dinner' },
    { type: 'snack', title: 'Snacks' },
  ];

  return (
    <ScreenContainer scrollable>
      <Header
        subtitle="DAILY FUEL"
        title="Nutrition Tracker"
        rightAction={
          <Button
            title="+ Log Food"
            size="small"
            icon={<Plus size={16} color="#0B0F14" />}
            onPress={() => {}}
          />
        }
      />

      {/* Macro Overview Card */}
      <Card elevated accent="secondary" style={styles.macroCard}>
        <Text style={styles.macroHeading}>Daily Progress</Text>
        <ProgressBar
          label="Calories"
          current={summary.calories}
          target={profile?.calorie_target || 2400}
          unit="kcal"
          color={Palette.secondary}
        />
        <View style={{ height: 10 }} />
        <ProgressBar
          label="Protein"
          current={summary.protein}
          target={profile?.protein_target || 150}
          unit="g"
          color={Palette.primary}
        />
        <View style={{ height: 10 }} />
        <ProgressBar
          label="Carbohydrates"
          current={summary.carbs}
          target={profile?.carb_target || 260}
          unit="g"
          color="#FFB84C"
        />
        <View style={{ height: 10 }} />
        <ProgressBar
          label="Fats"
          current={summary.fat}
          target={profile?.fat_target || 65}
          unit="g"
          color="#FF758F"
        />
      </Card>

      {/* Meals Grouping */}
      {meals.map((meal) => {
        const mealLogs = summary.logs.filter((l) => l.meal_type === meal.type);
        const mealCals = Math.round(mealLogs.reduce((acc, l) => acc + l.calories, 0));
        const mealProt = Math.round(mealLogs.reduce((acc, l) => acc + l.protein, 0));

        return (
          <Card key={meal.type} style={styles.mealCard}>
            <View style={styles.mealHeader}>
              <View>
                <Text style={styles.mealTitle}>{meal.title}</Text>
                <Text style={styles.mealTotals}>
                  {mealCals} kcal • {mealProt}g protein
                </Text>
              </View>
              <Button
                title="+ Add"
                size="small"
                variant="ghost"
                textStyle={{ color: Palette.primary }}
                onPress={() => {}}
              />
            </View>

            {mealLogs.length === 0 ? (
              <Text style={styles.emptyMealText}>No food logged for {meal.title.toLowerCase()}</Text>
            ) : (
              mealLogs.map((log) => (
                <View key={log.id} style={styles.foodRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.foodName}>{log.food_name}</Text>
                    <Text style={styles.foodSub}>
                      {log.serving_count} serving • {Math.round(log.protein)}g P • {Math.round(log.carbs)}g C • {Math.round(log.fat)}g F
                    </Text>
                  </View>
                  <Text style={styles.foodCalories}>{Math.round(log.calories)} kcal</Text>
                </View>
              ))
            )}
          </Card>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  macroCard: {
    padding: 18,
    marginBottom: 16,
  },
  macroHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: Palette.text,
    marginBottom: 12,
  },
  mealCard: {
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Palette.text,
  },
  mealTotals: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  emptyMealText: {
    fontSize: 13,
    color: Palette.textMuted,
    fontStyle: 'italic',
    paddingVertical: 6,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTopColor: Palette.border,
    borderTopWidth: 1,
    marginTop: 6,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '600',
    color: Palette.text,
  },
  foodSub: {
    fontSize: 12,
    color: Palette.textSecondary,
    marginTop: 2,
  },
  foodCalories: {
    fontSize: 14,
    fontWeight: '700',
    color: Palette.secondary,
  },
});
