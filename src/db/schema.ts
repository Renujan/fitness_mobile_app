export const CREATE_TABLES_SQL = `
PRAGMA journal_mode = WAL;
PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS user_profile (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  name TEXT NOT NULL DEFAULT 'Athlete',
  gender TEXT NOT NULL DEFAULT 'male',
  birth_date TEXT,
  height_cm REAL NOT NULL DEFAULT 175.0,
  current_weight_kg REAL NOT NULL DEFAULT 70.0,
  target_weight_kg REAL NOT NULL DEFAULT 75.0,
  calorie_target INTEGER NOT NULL DEFAULT 2400,
  protein_target INTEGER NOT NULL DEFAULT 150,
  carb_target INTEGER NOT NULL DEFAULT 260,
  fat_target INTEGER NOT NULL DEFAULT 65,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  target_muscle TEXT NOT NULL,
  equipment TEXT NOT NULL,
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS workout_plans (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  day_of_week INTEGER NOT NULL UNIQUE, -- 1=Monday ... 7=Sunday
  title TEXT NOT NULL,
  muscle_groups TEXT NOT NULL,        -- JSON array string
  is_rest_day INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workout_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,                 -- YYYY-MM-DD
  title TEXT NOT NULL,
  start_time TEXT NOT NULL,
  end_time TEXT,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  total_volume_kg REAL NOT NULL DEFAULT 0,
  notes TEXT,
  is_completed INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS workout_sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  exercise_id INTEGER NOT NULL,
  set_number INTEGER NOT NULL,
  weight_kg REAL NOT NULL DEFAULT 0,
  reps INTEGER NOT NULL DEFAULT 0,
  rpe REAL,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES workout_sessions (id) ON DELETE CASCADE,
  FOREIGN KEY (exercise_id) REFERENCES exercises (id) ON DELETE RESTRICT
);

CREATE TABLE IF NOT EXISTS food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  brand TEXT,
  serving_size REAL NOT NULL DEFAULT 100,
  serving_unit TEXT NOT NULL DEFAULT 'g',
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  is_favorite INTEGER NOT NULL DEFAULT 0,
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS food_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,                 -- YYYY-MM-DD
  meal_type TEXT NOT NULL,            -- breakfast, lunch, dinner, snack
  food_item_id INTEGER,
  food_name TEXT NOT NULL,
  serving_count REAL NOT NULL DEFAULT 1,
  calories REAL NOT NULL,
  protein REAL NOT NULL,
  carbs REAL NOT NULL,
  fat REAL NOT NULL,
  logged_at TEXT NOT NULL,
  FOREIGN KEY (food_item_id) REFERENCES food_items (id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS body_measurements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL UNIQUE,          -- YYYY-MM-DD
  weight_kg REAL NOT NULL,
  chest_cm REAL,
  waist_cm REAL,
  biceps_cm REAL,
  thigh_cm REAL,
  body_fat_pct REAL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS progress_photos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,                 -- YYYY-MM-DD
  photo_uri TEXT NOT NULL,
  pose_type TEXT NOT NULL,            -- front, side, back
  notes TEXT,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS fitness_goals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  target_value REAL NOT NULL,
  current_value REAL NOT NULL DEFAULT 0,
  unit TEXT NOT NULL,
  deadline TEXT,
  is_completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS achievements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  unlocked_at TEXT
);

CREATE TABLE IF NOT EXISTS water_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  amount_ml INTEGER NOT NULL DEFAULT 0,
  target_ml INTEGER NOT NULL DEFAULT 2500,
  updated_at TEXT NOT NULL,
  UNIQUE(date)
);

-- Indexing for fast query performance
CREATE INDEX IF NOT EXISTS idx_sessions_date ON workout_sessions(date);
CREATE INDEX IF NOT EXISTS idx_sets_session ON workout_sets(session_id);
CREATE INDEX IF NOT EXISTS idx_sets_exercise ON workout_sets(exercise_id);
CREATE INDEX IF NOT EXISTS idx_food_logs_date ON food_logs(date);
CREATE INDEX IF NOT EXISTS idx_food_logs_meal ON food_logs(meal_type);
CREATE INDEX IF NOT EXISTS idx_body_date ON body_measurements(date);
CREATE INDEX IF NOT EXISTS idx_photos_date ON progress_photos(date);
CREATE INDEX IF NOT EXISTS idx_water_date ON water_logs(date);
`;
