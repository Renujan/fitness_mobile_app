import { getDatabase } from '../database';
import { UserProfile } from '../../types/database';

export class UserRepo {
  static async getProfile(): Promise<UserProfile | null> {
    const db = await getDatabase();
    const profile = await db.getFirstAsync<UserProfile>(
      'SELECT * FROM user_profile WHERE id = 1'
    );
    return profile || null;
  }

  static async updateProfile(profile: Partial<UserProfile>): Promise<void> {
    const db = await getDatabase();
    const existing = await this.getProfile();
    const now = new Date().toISOString();

    if (!existing) return;

    await db.runAsync(
      `UPDATE user_profile SET
        name = ?,
        gender = ?,
        birth_date = ?,
        height_cm = ?,
        current_weight_kg = ?,
        target_weight_kg = ?,
        calorie_target = ?,
        protein_target = ?,
        carb_target = ?,
        fat_target = ?,
        updated_at = ?
      WHERE id = 1`,
      [
        profile.name ?? existing.name,
        profile.gender ?? existing.gender,
        profile.birth_date ?? existing.birth_date ?? null,
        profile.height_cm ?? existing.height_cm,
        profile.current_weight_kg ?? existing.current_weight_kg,
        profile.target_weight_kg ?? existing.target_weight_kg,
        profile.calorie_target ?? existing.calorie_target,
        profile.protein_target ?? existing.protein_target,
        profile.carb_target ?? existing.carb_target,
        profile.fat_target ?? existing.fat_target,
        now,
      ]
    );
  }
}
