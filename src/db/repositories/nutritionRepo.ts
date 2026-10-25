import { getDatabase } from '../database';
import { FoodItem, FoodLog, MealType } from '../../types/database';

export interface DailyMacroSummary {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logs: FoodLog[];
}

export class NutritionRepo {
  // Food Items
  static async getFoodItems(search = '', favoritesOnly = false): Promise<FoodItem[]> {
    const db = await getDatabase();
    let query = 'SELECT * FROM food_items WHERE 1=1';
    const params: any[] = [];

    if (search.trim()) {
      query += ' AND name LIKE ?';
      params.push(`%${search.trim()}%`);
    }

    if (favoritesOnly) {
      query += ' AND is_favorite = 1';
    }

    query += ' ORDER BY is_favorite DESC, name ASC';
    return db.getAllAsync<FoodItem>(query, params);
  }

  static async toggleFavoriteFood(foodId: number, isFavorite: boolean): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('UPDATE food_items SET is_favorite = ? WHERE id = ?', [
      isFavorite ? 1 : 0,
      foodId,
    ]);
  }

  static async createCustomFood(food: Omit<FoodItem, 'id' | 'is_custom' | 'created_at'>): Promise<number> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO food_items (name, brand, serving_size, serving_unit, calories, protein, carbs, fat, is_favorite, is_custom, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`,
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
    return result.lastInsertRowId;
  }

  // Food Logging
  static async logFood(entry: {
    date: string; // YYYY-MM-DD
    meal_type: MealType;
    food_item_id?: number;
    food_name: string;
    serving_count: number;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }): Promise<number> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const result = await db.runAsync(
      `INSERT INTO food_logs (
        date, meal_type, food_item_id, food_name, serving_count, calories, protein, carbs, fat, logged_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        entry.date,
        entry.meal_type,
        entry.food_item_id || null,
        entry.food_name,
        entry.serving_count,
        entry.calories * entry.serving_count,
        entry.protein * entry.serving_count,
        entry.carbs * entry.serving_count,
        entry.fat * entry.serving_count,
        now,
      ]
    );
    return result.lastInsertRowId;
  }

  static async getDailyLogs(date: string): Promise<DailyMacroSummary> {
    const db = await getDatabase();
    const logs = await db.getAllAsync<FoodLog>(
      'SELECT * FROM food_logs WHERE date = ? ORDER BY id ASC',
      [date]
    );

    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    for (const log of logs) {
      calories += log.calories;
      protein += log.protein;
      carbs += log.carbs;
      fat += log.fat;
    }

    return {
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
      logs,
    };
  }

  static async deleteLog(logId: number): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM food_logs WHERE id = ?', [logId]);
  }
}
