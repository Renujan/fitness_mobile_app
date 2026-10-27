import * as FileSystem from 'expo-file-system/legacy';
import { getDatabase } from '../database';
import { BodyMeasurement, ProgressPhoto } from '../../types/database';

export class BodyRepo {
  // Body Measurements
  static async logMeasurement(data: {
    date: string;
    weight_kg: number;
    chest_cm?: number;
    waist_cm?: number;
    biceps_cm?: number;
    thigh_cm?: number;
    body_fat_pct?: number;
    notes?: string;
  }): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO body_measurements (
        date, weight_kg, chest_cm, waist_cm, biceps_cm, thigh_cm, body_fat_pct, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(date) DO UPDATE SET
        weight_kg = excluded.weight_kg,
        chest_cm = excluded.chest_cm,
        waist_cm = excluded.waist_cm,
        biceps_cm = excluded.biceps_cm,
        thigh_cm = excluded.thigh_cm,
        body_fat_pct = excluded.body_fat_pct,
        notes = excluded.notes`,
      [
        data.date,
        data.weight_kg,
        data.chest_cm ?? null,
        data.waist_cm ?? null,
        data.biceps_cm ?? null,
        data.thigh_cm ?? null,
        data.body_fat_pct ?? null,
        data.notes ?? null,
      ]
    );

    // Also update current_weight_kg in user_profile
    await db.runAsync(
      'UPDATE user_profile SET current_weight_kg = ?, updated_at = ? WHERE id = 1',
      [data.weight_kg, new Date().toISOString()]
    );
  }

  static async getMeasurements(limit = 60): Promise<BodyMeasurement[]> {
    const db = await getDatabase();
    return db.getAllAsync<BodyMeasurement>(
      'SELECT * FROM body_measurements ORDER BY date DESC LIMIT ?',
      [limit]
    );
  }

  static async getLatestMeasurement(): Promise<BodyMeasurement | null> {
    const db = await getDatabase();
    return db.getFirstAsync<BodyMeasurement>(
      'SELECT * FROM body_measurements ORDER BY date DESC LIMIT 1'
    );
  }

  // Progress Photos
  static async savePhoto(sourceUri: string, pose: 'front' | 'side' | 'back', date?: string, notes?: string): Promise<ProgressPhoto> {
    const db = await getDatabase();
    const photoDate = date || new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();

    // Ensure persistent directory exists in documentDirectory
    const targetDir = `${FileSystem.documentDirectory || ''}fittrack_photos/`;
    const dirInfo = await FileSystem.getInfoAsync(targetDir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(targetDir, { intermediates: true });
    }

    const filename = `photo_${pose}_${Date.now()}.jpg`;
    const persistentUri = `${targetDir}${filename}`;

    // Copy to persistent storage
    await FileSystem.copyAsync({
      from: sourceUri,
      to: persistentUri,
    });

    const result = await db.runAsync(
      `INSERT INTO progress_photos (date, photo_uri, pose_type, notes, created_at)
       VALUES (?, ?, ?, ?, ?)`,
      [photoDate, persistentUri, pose, notes || '', now]
    );

    return {
      id: result.lastInsertRowId,
      date: photoDate,
      photo_uri: persistentUri,
      pose_type: pose,
      notes: notes || '',
      created_at: now,
    };
  }

  static async getPhotos(pose?: 'front' | 'side' | 'back'): Promise<ProgressPhoto[]> {
    const db = await getDatabase();
    if (pose) {
      return db.getAllAsync<ProgressPhoto>(
        'SELECT * FROM progress_photos WHERE pose_type = ? ORDER BY date DESC, id DESC',
        [pose]
      );
    }
    return db.getAllAsync<ProgressPhoto>(
      'SELECT * FROM progress_photos ORDER BY date DESC, id DESC'
    );
  }

  static async deletePhoto(id: number): Promise<void> {
    const db = await getDatabase();
    const photo = await db.getFirstAsync<ProgressPhoto>(
      'SELECT * FROM progress_photos WHERE id = ?',
      [id]
    );
    if (photo) {
      try {
        await FileSystem.deleteAsync(photo.photo_uri, { idempotent: true });
      } catch (e) {
        // file may already be removed
      }
      await db.runAsync('DELETE FROM progress_photos WHERE id = ?', [id]);
    }
  }
}
