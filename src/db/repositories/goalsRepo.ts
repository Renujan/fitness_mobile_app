import { getDatabase } from '../database';
import { Achievement, FitnessGoal } from '../../types/database';

export class GoalsRepo {
  // Fitness Goals
  static async getGoals(): Promise<FitnessGoal[]> {
    const db = await getDatabase();
    return db.getAllAsync<FitnessGoal>(
      'SELECT * FROM fitness_goals ORDER BY is_completed ASC, id DESC'
    );
  }

  static async createGoal(goal: {
    title: string;
    category: 'weight' | 'strength' | 'nutrition' | 'consistency' | 'measurement';
    target_value: number;
    current_value?: number;
    unit: string;
    deadline?: string;
  }): Promise<number> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO fitness_goals (title, category, target_value, current_value, unit, deadline, is_completed, created_at)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?)`,
      [
        goal.title,
        goal.category,
        goal.target_value,
        goal.current_value || 0,
        goal.unit,
        goal.deadline || null,
        now,
      ]
    );
    return result.lastInsertRowId;
  }

  static async updateGoalProgress(goalId: number, currentValue: number, isCompleted?: boolean): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `UPDATE fitness_goals SET current_value = ?, is_completed = ? WHERE id = ?`,
      [currentValue, isCompleted ? 1 : 0, goalId]
    );
  }

  static async deleteGoal(goalId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM fitness_goals WHERE id = ?', [goalId]);
  }

  // Achievements
  static async getAchievements(): Promise<Achievement[]> {
    const db = await getDatabase();
    return db.getAllAsync<Achievement>(
      'SELECT * FROM achievements ORDER BY unlocked_at DESC, id ASC'
    );
  }

  static async unlockAchievement(code: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      'UPDATE achievements SET unlocked_at = ? WHERE code = ? AND unlocked_at IS NULL',
      [now, code]
    );
  }
}
