import { SQLiteDatabase } from 'expo-sqlite';
import { INITIAL_EXERCISES } from '../constants/Exercises';
import { STARTER_FOODS } from '../constants/StarterFoods';

export async function seedDatabaseIfEmpty(db: SQLiteDatabase): Promise<void> {
  const now = new Date().toISOString();

  // 1. Seed User Profile if not exists
  const existingUser = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM user_profile'
  );

  if (!existingUser || existingUser.count === 0) {
    await db.runAsync(
      `INSERT INTO user_profile (
        id, name, gender, birth_date, height_cm, current_weight_kg,
        target_weight_kg, calorie_target, protein_target, carb_target,
        fat_target, created_at, updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Athlete',
        'male',
        '2000-01-01',
        175.0,
        70.0,
        75.0,
        2400,
        150,
        260,
        65,
        now,
        now,
      ]
    );
  }

  // 2. Seed Exercises if empty
  const existingExercises = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM exercises'
  );

  if (!existingExercises || existingExercises.count === 0) {
    for (const ex of INITIAL_EXERCISES) {
      await db.runAsync(
        `INSERT OR IGNORE INTO exercises (name, category, target_muscle, equipment, is_custom, created_at)
         VALUES (?, ?, ?, ?, 0, ?)`,
        [ex.name, ex.category, ex.target_muscle, ex.equipment, now]
      );
    }
  }

  // 3. Seed Starter Foods if empty
  const existingFoods = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM food_items'
  );

  if (!existingFoods || existingFoods.count === 0) {
    for (const food of STARTER_FOODS) {
      await db.runAsync(
        `INSERT INTO food_items (
          name, brand, serving_size, serving_unit, calories, protein, carbs, fat, is_favorite, is_custom, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)`,
        [
          food.name,
          food.brand || '',
          food.serving_size,
          food.serving_unit,
          food.calories,
          food.protein,
          food.carbs,
          food.fat,
          food.is_favorite ? 1 : 0,
          now,
        ]
      );
    }
  }

  // 4. Seed Default Weekly Workout Plan
  const existingPlans = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM workout_plans'
  );

  if (!existingPlans || existingPlans.count === 0) {
    const defaultPlans = [
      { day: 1, title: 'Arms + Shoulders', muscles: JSON.stringify(['Biceps', 'Triceps', 'Shoulders']), isRest: 0 },
      { day: 2, title: 'Chest + Back', muscles: JSON.stringify(['Chest', 'Back']), isRest: 0 },
      { day: 3, title: 'Legs + Abs', muscles: JSON.stringify(['Quadriceps', 'Hamstrings', 'Abs']), isRest: 0 },
      { day: 4, title: 'Push Day', muscles: JSON.stringify(['Chest', 'Shoulders', 'Triceps']), isRest: 0 },
      { day: 5, title: 'Pull Day', muscles: JSON.stringify(['Back', 'Biceps']), isRest: 0 },
      { day: 6, title: 'Legs & Core', muscles: JSON.stringify(['Quadriceps', 'Glutes', 'Calves']), isRest: 0 },
      { day: 7, title: 'Active Recovery', muscles: JSON.stringify(['Cardio', 'Abs']), isRest: 1 },
    ];

    for (const plan of defaultPlans) {
      await db.runAsync(
        `INSERT INTO workout_plans (day_of_week, title, muscle_groups, is_rest_day)
         VALUES (?, ?, ?, ?)`,
        [plan.day, plan.title, plan.muscles, plan.isRest]
      );
    }
  }

  // 5. Seed Starter Achievements
  const existingAchievements = await db.getFirstAsync<{ count: number }>(
    'SELECT COUNT(*) as count FROM achievements'
  );

  if (!existingAchievements || existingAchievements.count === 0) {
    const starterAchievements = [
      { code: 'FIRST_WORKOUT', title: 'First Lift', description: 'Logged your very first workout session', icon: 'dumbbell' },
      { code: 'STREAK_3', title: 'Consistency Rising', description: 'Logged 3 workouts in a single week', icon: 'flame' },
      { code: 'STREAK_7', title: 'Iron Warrior', description: 'Trained with 100% weekly consistency', icon: 'zap' },
      { code: 'CENTURY_BENCH', title: 'Triple Digit Press', description: 'Recorded 100 kg or more on Bench Press', icon: 'award' },
      { code: 'PROTEIN_MASTER', title: 'Macro Target Hit', description: 'Met 100% of your daily protein target', icon: 'check-circle' },
      { code: 'PHOTO_FIRST', title: 'Before & After', description: 'Captured your first transformation photo', icon: 'camera' },
      { code: 'VOLUME_10TONS', title: 'Heavy Metal', description: 'Moved over 10,000 kg total volume in one workout', icon: 'shield' },
    ];

    for (const ach of starterAchievements) {
      await db.runAsync(
        `INSERT OR IGNORE INTO achievements (code, title, description, icon)
         VALUES (?, ?, ?, ?)`,
        [ach.code, ach.title, ach.description, ach.icon]
      );
    }
  }
}
