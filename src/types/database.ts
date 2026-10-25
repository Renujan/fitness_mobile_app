export interface UserProfile {
  id: number;
  name: string;
  gender: 'male' | 'female' | 'other';
  birth_date?: string;
  height_cm: number;
  current_weight_kg: number;
  target_weight_kg: number;
  calorie_target: number;
  protein_target: number;
  carb_target: number;
  fat_target: number;
  created_at: string;
  updated_at: string;
}

export interface Exercise {
  id: number;
  name: string;
  category: string;
  target_muscle: string;
  equipment: string;
  is_custom: number; // 0 or 1
  created_at?: string;
}

export interface WorkoutPlan {
  id: number;
  day_of_week: number; // 1 = Monday ... 7 = Sunday
  title: string;
  muscle_groups: string; // JSON array of string e.g. ["Chest", "Triceps"]
  is_rest_day: number; // 0 or 1
}

export interface WorkoutSession {
  id: number;
  date: string; // YYYY-MM-DD
  title: string;
  start_time: string;
  end_time?: string;
  duration_seconds: number;
  total_volume_kg: number;
  notes?: string;
  is_completed: number; // 0 or 1
}

export interface WorkoutSet {
  id: number;
  session_id: number;
  exercise_id: number;
  exercise_name?: string;
  exercise_category?: string;
  set_number: number;
  weight_kg: number;
  reps: number;
  rpe?: number;
  is_completed: number; // 0 or 1
  created_at: string;
}

export interface FoodItem {
  id: number;
  name: string;
  brand?: string;
  serving_size: number;
  serving_unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  is_favorite: number;
  is_custom: number;
  created_at?: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface FoodLog {
  id: number;
  date: string; // YYYY-MM-DD
  meal_type: MealType;
  food_item_id: number;
  food_name: string;
  serving_count: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  logged_at: string;
}

export interface BodyMeasurement {
  id: number;
  date: string; // YYYY-MM-DD
  weight_kg: number;
  chest_cm?: number;
  waist_cm?: number;
  biceps_cm?: number;
  thigh_cm?: number;
  body_fat_pct?: number;
  notes?: string;
}

export interface ProgressPhoto {
  id: number;
  date: string; // YYYY-MM-DD
  photo_uri: string;
  pose_type: 'front' | 'side' | 'back';
  notes?: string;
  created_at: string;
}

export interface FitnessGoal {
  id: number;
  title: string;
  category: 'weight' | 'strength' | 'nutrition' | 'consistency' | 'measurement';
  target_value: number;
  current_value: number;
  unit: string;
  deadline?: string;
  is_completed: number;
  created_at: string;
}

export interface Achievement {
  id: number;
  code: string;
  title: string;
  description: string;
  icon: string;
  unlocked_at?: string;
}

export interface BackupData {
  version: number;
  exported_at: string;
  user_profile: UserProfile | null;
  exercises: Exercise[];
  workout_plans: WorkoutPlan[];
  workout_sessions: WorkoutSession[];
  workout_sets: WorkoutSet[];
  food_items: FoodItem[];
  food_logs: FoodLog[];
  body_measurements: BodyMeasurement[];
  progress_photos: ProgressPhoto[];
  fitness_goals: FitnessGoal[];
  achievements: Achievement[];
}
