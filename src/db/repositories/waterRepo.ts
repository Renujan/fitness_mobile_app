import { getDatabase } from '../database';
import { WaterLog } from '../../types/database';

export class WaterRepo {
  /**
   * Fetch today's or specified date's water log.
   * If not logged yet, returns default 0 with 2500ml target.
   */
  static async getWaterLog(date: string): Promise<WaterLog> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<WaterLog>(
      'SELECT * FROM water_logs WHERE date = ?',
      [date]
    );

    if (row) {
      return row;
    }

    return {
      id: 0,
      date,
      amount_ml: 0,
      target_ml: 2500,
      updated_at: new Date().toISOString(),
    };
  }

  /**
   * Increment water intake by specified amount in ml (e.g. +250ml)
   */
  static async addWater(date: string, amountMl: number): Promise<WaterLog> {
    const db = await getDatabase();
    const current = await this.getWaterLog(date);
    const newAmount = Math.max(0, current.amount_ml + amountMl);
    const now = new Date().toISOString();

    await db.runAsync(
      `INSERT INTO water_logs (date, amount_ml, target_ml, updated_at)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         amount_ml = excluded.amount_ml,
         updated_at = excluded.updated_at`,
      [date, newAmount, current.target_ml, now]
    );

    return {
      ...current,
      amount_ml: newAmount,
      updated_at: now,
    };
  }

  /**
   * Reset water intake for date back to 0
   */
  static async resetWater(date: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `INSERT INTO water_logs (date, amount_ml, target_ml, updated_at)
       VALUES (?, 0, 2500, ?)
       ON CONFLICT(date) DO UPDATE SET
         amount_ml = 0,
         updated_at = excluded.updated_at`,
      [date, now]
    );
  }
}
