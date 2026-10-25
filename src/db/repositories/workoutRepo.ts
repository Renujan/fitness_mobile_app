import { getDatabase } from '../database';
import { Exercise, WorkoutPlan, WorkoutSession, WorkoutSet } from '../../types/database';

export class WorkoutRepo {
  // Exercises
  static async getExercises(category?: string): Promise<Exercise[]> {
    const db = await getDatabase();
    if (category && category !== 'All') {
      return db.getAllAsync<Exercise>(
        'SELECT * FROM exercises WHERE category = ? ORDER BY name ASC',
        [category]
      );
    }
    return db.getAllAsync<Exercise>('SELECT * FROM exercises ORDER BY name ASC');
  }

  static async getExerciseById(id: number): Promise<Exercise | null> {
    const db = await getDatabase();
    return db.getFirstAsync<Exercise>('SELECT * FROM exercises WHERE id = ?', [id]);
  }

  static async createCustomExercise(exercise: Omit<Exercise, 'id' | 'is_custom' | 'created_at'>): Promise<number> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO exercises (name, category, target_muscle, equipment, is_custom, created_at)
       VALUES (?, ?, ?, ?, 1, ?)`,
      [exercise.name, exercise.category, exercise.target_muscle, exercise.equipment, now]
    );
    return result.lastInsertRowId;
  }

  // Workout Plans (Weekly Schedule)
  static async getWeeklyPlans(): Promise<WorkoutPlan[]> {
    const db = await getDatabase();
    return db.getAllAsync<WorkoutPlan>(
      'SELECT * FROM workout_plans ORDER BY day_of_week ASC'
    );
  }

  static async getPlanForDay(dayOfWeek: number): Promise<WorkoutPlan | null> {
    const db = await getDatabase();
    return db.getFirstAsync<WorkoutPlan>(
      'SELECT * FROM workout_plans WHERE day_of_week = ?',
      [dayOfWeek]
    );
  }

  static async updatePlan(dayOfWeek: number, title: string, muscleGroups: string[], isRestDay: boolean): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE workout_plans SET title = ?, muscle_groups = ?, is_rest_day = ? WHERE day_of_week = ?`,
      [title, JSON.stringify(muscleGroups), isRestDay ? 1 : 0, dayOfWeek]
    );
  }

  // Workout Sessions
  static async createSession(title: string, date?: string): Promise<number> {
    const db = await getDatabase();
    const sessionDate = date || new Date().toISOString().split('T')[0];
    const startTime = new Date().toISOString();

    const result = await db.runAsync(
      `INSERT INTO workout_sessions (date, title, start_time, duration_seconds, total_volume_kg, is_completed)
       VALUES (?, ?, ?, 0, 0, 0)`,
      [sessionDate, title, startTime]
    );
    return result.lastInsertRowId;
  }

  static async getActiveSession(): Promise<(WorkoutSession & { sets: WorkoutSet[] }) | null> {
    const db = await getDatabase();
    const session = await db.getFirstAsync<WorkoutSession>(
      'SELECT * FROM workout_sessions WHERE is_completed = 0 ORDER BY id DESC LIMIT 1'
    );
    if (!session) return null;

    const sets = await this.getSetsForSession(session.id);
    return { ...session, sets };
  }

  static async completeSession(sessionId: number, durationSeconds: number, notes?: string): Promise<void> {
    const db = await getDatabase();
    const endTime = new Date().toISOString();

    // Calculate total volume for completed sets
    const sets = await this.getSetsForSession(sessionId);
    const totalVolume = sets
      .filter((s) => s.is_completed === 1)
      .reduce((sum, s) => sum + s.weight_kg * s.reps, 0);

    await db.runAsync(
      `UPDATE workout_sessions SET
        is_completed = 1,
        end_time = ?,
        duration_seconds = ?,
        total_volume_kg = ?,
        notes = ?
      WHERE id = ?`,
      [endTime, durationSeconds, totalVolume, notes || '', sessionId]
    );
  }

  static async deleteSession(sessionId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM workout_sets WHERE session_id = ?', [sessionId]);
    await db.runAsync('DELETE FROM workout_sessions WHERE id = ?', [sessionId]);
  }

  static async getCompletedSessions(limit = 30): Promise<WorkoutSession[]> {
    const db = await getDatabase();
    return db.getAllAsync<WorkoutSession>(
      'SELECT * FROM workout_sessions WHERE is_completed = 1 ORDER BY date DESC, id DESC LIMIT ?',
      [limit]
    );
  }

  static async getSessionById(sessionId: number): Promise<(WorkoutSession & { sets: WorkoutSet[] }) | null> {
    const db = await getDatabase();
    const session = await db.getFirstAsync<WorkoutSession>(
      'SELECT * FROM workout_sessions WHERE id = ?',
      [sessionId]
    );
    if (!session) return null;
    const sets = await this.getSetsForSession(sessionId);
    return { ...session, sets };
  }

  // Sets
  static async getSetsForSession(sessionId: number): Promise<WorkoutSet[]> {
    const db = await getDatabase();
    return db.getAllAsync<WorkoutSet>(
      `SELECT ws.*, e.name as exercise_name, e.category as exercise_category
       FROM workout_sets ws
       LEFT JOIN exercises e ON ws.exercise_id = e.id
       WHERE ws.session_id = ?
       ORDER BY ws.id ASC`,
      [sessionId]
    );
  }

  static async addSet(
    sessionId: number,
    exerciseId: number,
    weightKg: number,
    reps: number,
    rpe?: number
  ): Promise<number> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    // Determine set number for this exercise within the session
    const existing = await db.getFirstAsync<{ max_set: number | null }>(
      'SELECT MAX(set_number) as max_set FROM workout_sets WHERE session_id = ? AND exercise_id = ?',
      [sessionId, exerciseId]
    );
    const nextSet = (existing?.max_set ?? 0) + 1;

    const result = await db.runAsync(
      `INSERT INTO workout_sets (
        session_id, exercise_id, set_number, weight_kg, reps, rpe, is_completed, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [sessionId, exerciseId, nextSet, weightKg, reps, rpe ?? null, now]
    );
    return result.lastInsertRowId;
  }

  static async updateSet(
    setId: number,
    data: { weight_kg?: number; reps?: number; rpe?: number; is_completed?: number }
  ): Promise<void> {
    const db = await getDatabase();
    const set = await db.getFirstAsync<WorkoutSet>('SELECT * FROM workout_sets WHERE id = ?', [setId]);
    if (!set) return;

    await db.runAsync(
      `UPDATE workout_sets SET
        weight_kg = ?,
        reps = ?,
        rpe = ?,
        is_completed = ?
      WHERE id = ?`,
      [
        data.weight_kg ?? set.weight_kg,
        data.reps ?? set.reps,
        data.rpe ?? set.rpe ?? null,
        data.is_completed ?? set.is_completed,
        setId,
      ]
    );
  }

  static async deleteSet(setId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM workout_sets WHERE id = ?', [setId]);
  }

  // Strength Progression & Analytics
  static async getExerciseHistory(exerciseId: number): Promise<{
    date: string;
    max_weight: number;
    total_volume: number;
    sets: WorkoutSet[];
  }[]> {
    const db = await getDatabase();
    const sets = await db.getAllAsync<WorkoutSet & { session_date: string }>(
      `SELECT ws.*, s.date as session_date
       FROM workout_sets ws
       JOIN workout_sessions s ON ws.session_id = s.id
       WHERE ws.exercise_id = ? AND ws.is_completed = 1 AND s.is_completed = 1
       ORDER BY s.date ASC, ws.id ASC`,
      [exerciseId]
    );

    // Group by date
    const dateMap = new Map<string, WorkoutSet[]>();
    for (const s of sets) {
      const arr = dateMap.get(s.session_date) || [];
      arr.push(s);
      dateMap.set(s.session_date, arr);
    }

    const history: {
      date: string;
      max_weight: number;
      total_volume: number;
      sets: WorkoutSet[];
    }[] = [];

    dateMap.forEach((daySets, date) => {
      const maxWeight = Math.max(...daySets.map((s) => s.weight_kg), 0);
      const totalVolume = daySets.reduce((sum, s) => sum + s.weight_kg * s.reps, 0);
      history.push({ date, max_weight: maxWeight, total_volume: totalVolume, sets: daySets });
    });

    return history;
  }

  static async getWeeklyConsistency(startDate: string, endDate: string): Promise<number> {
    const db = await getDatabase();
    const res = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(DISTINCT date) as count FROM workout_sessions
       WHERE is_completed = 1 AND date >= ? AND date <= ?`,
      [startDate, endDate]
    );
    return res?.count || 0;
  }
}
