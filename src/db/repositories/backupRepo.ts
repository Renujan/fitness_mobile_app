import { getDatabase, resetDatabase } from '../database';
import { BackupData } from '../../types/database';

export class BackupRepo {
  /**
   * Export all database records into a single structured, versioned JSON object
   */
  static async exportBackupData(): Promise<BackupData> {
    const db = await getDatabase();

    const [
      user_profile,
      exercises,
      workout_plans,
      workout_sessions,
      workout_sets,
      food_items,
      food_logs,
      body_measurements,
      progress_photos,
      fitness_goals,
      achievements,
    ] = await Promise.all([
      db.getFirstAsync<any>('SELECT * FROM user_profile WHERE id = 1'),
      db.getAllAsync<any>('SELECT * FROM exercises'),
      db.getAllAsync<any>('SELECT * FROM workout_plans'),
      db.getAllAsync<any>('SELECT * FROM workout_sessions'),
      db.getAllAsync<any>('SELECT * FROM workout_sets'),
      db.getAllAsync<any>('SELECT * FROM food_items'),
      db.getAllAsync<any>('SELECT * FROM food_logs'),
      db.getAllAsync<any>('SELECT * FROM body_measurements'),
      db.getAllAsync<any>('SELECT * FROM progress_photos'),
      db.getAllAsync<any>('SELECT * FROM fitness_goals'),
      db.getAllAsync<any>('SELECT * FROM achievements'),
    ]);

    return {
      version: 1,
      exported_at: new Date().toISOString(),
      user_profile,
      exercises,
      workout_plans,
      workout_sessions,
      workout_sets,
      food_items,
      food_logs,
      body_measurements,
      progress_photos,
      fitness_goals,
      achievements,
    };
  }

  /**
   * Validate and import backup data into SQLite
   */
  static async importBackupData(jsonString: string): Promise<{ success: boolean; message: string }> {
    try {
      const data: BackupData = JSON.parse(jsonString);

      if (!data.version || !data.user_profile) {
        return { success: false, message: 'Invalid backup file: Missing header or profile metadata.' };
      }

      await resetDatabase();
      const db = await getDatabase();

      // Restore user profile
      const up = data.user_profile;
      await db.runAsync(
        `INSERT OR REPLACE INTO user_profile (
          id, name, gender, birth_date, height_cm, current_weight_kg, target_weight_kg,
          calorie_target, protein_target, carb_target, fat_target, created_at, updated_at
        ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          up.name,
          up.gender,
          up.birth_date || null,
          up.height_cm,
          up.current_weight_kg,
          up.target_weight_kg,
          up.calorie_target,
          up.protein_target,
          up.carb_target,
          up.fat_target,
          up.created_at,
          up.updated_at,
        ]
      );

      // Restore exercises
      for (const ex of data.exercises || []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO exercises (id, name, category, target_muscle, equipment, is_custom, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [ex.id, ex.name, ex.category, ex.target_muscle, ex.equipment, ex.is_custom, ex.created_at || '']
        );
      }

      // Restore workout plans
      for (const plan of data.workout_plans || []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO workout_plans (id, day_of_week, title, muscle_groups, is_rest_day)
           VALUES (?, ?, ?, ?, ?)`,
          [plan.id, plan.day_of_week, plan.title, plan.muscle_groups, plan.is_rest_day]
        );
      }

      // Restore sessions
      for (const sess of data.workout_sessions || []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO workout_sessions (
            id, date, title, start_time, end_time, duration_seconds, total_volume_kg, notes, is_completed
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            sess.id,
            sess.date,
            sess.title,
            sess.start_time,
            sess.end_time || null,
            sess.duration_seconds,
            sess.total_volume_kg,
            sess.notes || null,
            sess.is_completed,
          ]
        );
      }

      // Restore sets
      for (const s of data.workout_sets || []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO workout_sets (
            id, session_id, exercise_id, set_number, weight_kg, reps, rpe, is_completed, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [s.id, s.session_id, s.exercise_id, s.set_number, s.weight_kg, s.reps, s.rpe || null, s.is_completed, s.created_at]
        );
      }

      // Restore food items
      for (const f of data.food_items || []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO food_items (
            id, name, brand, serving_size, serving_unit, calories, protein, carbs, fat, is_favorite, is_custom, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            f.id,
            f.name,
            f.brand || '',
            f.serving_size,
            f.serving_unit,
            f.calories,
            f.protein,
            f.carbs,
            f.fat,
            f.is_favorite,
            f.is_custom,
            f.created_at || '',
          ]
        );
      }

      // Restore food logs
      for (const log of data.food_logs || []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO food_logs (
            id, date, meal_type, food_item_id, food_name, serving_count, calories, protein, carbs, fat, logged_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            log.id,
            log.date,
            log.meal_type,
            log.food_item_id || null,
            log.food_name,
            log.serving_count,
            log.calories,
            log.protein,
            log.carbs,
            log.fat,
            log.logged_at,
          ]
        );
      }

      // Restore body measurements
      for (const b of data.body_measurements || []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO body_measurements (
            id, date, weight_kg, chest_cm, waist_cm, biceps_cm, thigh_cm, body_fat_pct, notes
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [b.id, b.date, b.weight_kg, b.chest_cm || null, b.waist_cm || null, b.biceps_cm || null, b.thigh_cm || null, b.body_fat_pct || null, b.notes || null]
        );
      }

      // Restore goals
      for (const g of data.fitness_goals || []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO fitness_goals (
            id, title, category, target_value, current_value, unit, deadline, is_completed, created_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [g.id, g.title, g.category, g.target_value, g.current_value, g.unit, g.deadline || null, g.is_completed, g.created_at]
        );
      }

      // Restore achievements
      for (const ach of data.achievements || []) {
        await db.runAsync(
          `INSERT OR REPLACE INTO achievements (id, code, title, description, icon, unlocked_at)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [ach.id, ach.code, ach.title, ach.description, ach.icon, ach.unlocked_at || null]
        );
      }

      return { success: true, message: 'FitTrack data restored successfully!' };
    } catch (e: any) {
      return { success: false, message: `Restore failed: ${e?.message || 'Invalid format'}` };
    }
  }
}
