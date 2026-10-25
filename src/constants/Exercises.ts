export interface SeedExercise {
  name: string;
  category: string;
  target_muscle: string;
  equipment: string;
}

export const INITIAL_EXERCISES: SeedExercise[] = [
  // Chest
  { name: 'Barbell Bench Press', category: 'Chest', target_muscle: 'Middle Chest', equipment: 'Barbell' },
  { name: 'Incline Dumbbell Press', category: 'Chest', target_muscle: 'Upper Chest', equipment: 'Dumbbells' },
  { name: 'Decline Barbell Press', category: 'Chest', target_muscle: 'Lower Chest', equipment: 'Barbell' },
  { name: 'Chest Cable Flyes', category: 'Chest', target_muscle: 'Inner Chest', equipment: 'Cable' },
  { name: 'Push-Ups', category: 'Chest', target_muscle: 'General Chest', equipment: 'Bodyweight' },
  { name: 'Dips (Chest Focus)', category: 'Chest', target_muscle: 'Lower Chest', equipment: 'Parallel Bars' },

  // Back
  { name: 'Deadlift', category: 'Back', target_muscle: 'Lower Back & Erector', equipment: 'Barbell' },
  { name: 'Pull-Ups', category: 'Back', target_muscle: 'Lats', equipment: 'Pull-up Bar' },
  { name: 'Lat Pulldown', category: 'Back', target_muscle: 'Lats', equipment: 'Cable' },
  { name: 'Barbell Bent-Over Row', category: 'Back', target_muscle: 'Upper Back / Lats', equipment: 'Barbell' },
  { name: 'Seated Cable Row', category: 'Back', target_muscle: 'Mid Back / Rhomboids', equipment: 'Cable' },
  { name: 'Single-Arm Dumbbell Row', category: 'Back', target_muscle: 'Lats', equipment: 'Dumbbell' },

  // Shoulders
  { name: 'Overhead Shoulder Press', category: 'Shoulders', target_muscle: 'Anterior Deltoids', equipment: 'Barbell' },
  { name: 'Dumbbell Lateral Raise', category: 'Shoulders', target_muscle: 'Lateral Deltoids', equipment: 'Dumbbells' },
  { name: 'Face Pulls', category: 'Shoulders', target_muscle: 'Posterior Deltoids', equipment: 'Cable' },
  { name: 'Arnold Press', category: 'Shoulders', target_muscle: 'Front & Side Deltoids', equipment: 'Dumbbells' },
  { name: 'Reverse Pec Deck Fly', category: 'Shoulders', target_muscle: 'Rear Delts', equipment: 'Machine' },

  // Biceps
  { name: 'Barbell Bicep Curl', category: 'Biceps', target_muscle: 'Biceps Brachii', equipment: 'Barbell' },
  { name: 'Incline Dumbbell Curl', category: 'Biceps', target_muscle: 'Biceps Long Head', equipment: 'Dumbbells' },
  { name: 'Hammer Curls', category: 'Biceps', target_muscle: 'Brachialis', equipment: 'Dumbbells' },
  { name: 'Preacher Curl', category: 'Biceps', target_muscle: 'Biceps Short Head', equipment: 'EZ Bar' },

  // Triceps
  { name: 'Tricep Rope Pushdown', category: 'Triceps', target_muscle: 'Triceps Lateral Head', equipment: 'Cable' },
  { name: 'Skull Crushers', category: 'Triceps', target_muscle: 'Triceps Long Head', equipment: 'EZ Bar' },
  { name: 'Overhead Dumbbell Tricep Extension', category: 'Triceps', target_muscle: 'Triceps Long Head', equipment: 'Dumbbell' },
  { name: 'Close-Grip Bench Press', category: 'Triceps', target_muscle: 'Triceps Brachii', equipment: 'Barbell' },

  // Forearms
  { name: 'Wrist Curls', category: 'Forearms', target_muscle: 'Wrist Flexors', equipment: 'Barbell' },
  { name: 'Reverse Barbell Curl', category: 'Forearms', target_muscle: 'Brachioradialis', equipment: 'Barbell' },
  { name: 'Farmer Walk', category: 'Forearms', target_muscle: 'Grip & Forearms', equipment: 'Dumbbells' },

  // Quadriceps
  { name: 'Barbell Back Squat', category: 'Quadriceps', target_muscle: 'Quadriceps', equipment: 'Barbell' },
  { name: 'Leg Press', category: 'Quadriceps', target_muscle: 'Quadriceps', equipment: 'Machine' },
  { name: 'Leg Extension', category: 'Quadriceps', target_muscle: 'Quadriceps', equipment: 'Machine' },
  { name: 'Bulgarian Split Squat', category: 'Quadriceps', target_muscle: 'Quads & Glutes', equipment: 'Dumbbells' },
  { name: 'Goblet Squat', category: 'Quadriceps', target_muscle: 'Quadriceps', equipment: 'Kettlebell' },

  // Hamstrings
  { name: 'Romanian Deadlift (RDL)', category: 'Hamstrings', target_muscle: 'Hamstrings', equipment: 'Barbell' },
  { name: 'Lying Leg Curl', category: 'Hamstrings', target_muscle: 'Hamstrings', equipment: 'Machine' },
  { name: 'Seated Leg Curl', category: 'Hamstrings', target_muscle: 'Hamstrings', equipment: 'Machine' },

  // Glutes
  { name: 'Barbell Hip Thrust', category: 'Glutes', target_muscle: 'Gluteus Maximus', equipment: 'Barbell' },
  { name: 'Cable Glute Kickback', category: 'Glutes', target_muscle: 'Gluteus Medius/Maximus', equipment: 'Cable' },

  // Calves
  { name: 'Standing Calf Raise', category: 'Calves', target_muscle: 'Gastrocnemius', equipment: 'Machine' },
  { name: 'Seated Calf Raise', category: 'Calves', target_muscle: 'Soleus', equipment: 'Machine' },

  // Abs & Core
  { name: 'Hanging Leg Raise', category: 'Abs', target_muscle: 'Lower Abs', equipment: 'Pull-up Bar' },
  { name: 'Cable Woodchoppers', category: 'Abs', target_muscle: 'Obliques', equipment: 'Cable' },
  { name: 'Plank', category: 'Abs', target_muscle: 'Core / Transverse Abdominis', equipment: 'Bodyweight' },
  { name: 'Ab Wheel Rollout', category: 'Abs', target_muscle: 'Entire Core', equipment: 'Ab Wheel' },

  // Cardio
  { name: 'Treadmill Incline Walk', category: 'Cardio', target_muscle: 'Cardiovascular', equipment: 'Treadmill' },
  { name: 'Rowing Machine', category: 'Cardio', target_muscle: 'Full Body Endurance', equipment: 'Rower' },
  { name: 'Jump Rope', category: 'Cardio', target_muscle: 'Cardiovascular', equipment: 'Jump Rope' },
];

export const MUSCLE_CATEGORIES = [
  'All',
  'Chest',
  'Back',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Forearms',
  'Quadriceps',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Abs',
  'Cardio',
] as const;
