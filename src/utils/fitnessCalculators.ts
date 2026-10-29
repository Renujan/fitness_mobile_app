/**
 * Fitness Calculations Engine
 * Supports 1-Rep-Max estimation, Olympic barbell plate loading, BMI, and energy expenditure.
 */

export interface PlateResult {
  weightPerSide: number;
  plates: Array<{ weight: number; count: number }>;
}

export const AVAILABLE_PLATES = [25, 20, 15, 10, 5, 2.5, 1.25];

/**
 * Calculates plates required on each side of a standard Olympic barbell (default 20kg).
 */
export const calculatePlates = (
  targetWeightKg: number,
  barWeightKg: number = 20
): PlateResult => {
  if (targetWeightKg <= barWeightKg) {
    return { weightPerSide: 0, plates: [] };
  }

  let remaining = (targetWeightKg - barWeightKg) / 2;
  const weightPerSide = remaining;
  const plates: Array<{ weight: number; count: number }> = [];

  for (const plate of AVAILABLE_PLATES) {
    const count = Math.floor(remaining / plate);
    if (count > 0) {
      plates.push({ weight: plate, count });
      remaining -= count * plate;
    }
  }

  return { weightPerSide, plates };
};

/**
 * Estimate 1-Rep-Max (1RM) using Epley and Brzycki formulas
 */
export const estimate1RM = (weight: number, reps: number): { epley: number; brzycki: number; average: number } => {
  if (reps <= 0 || weight <= 0) {
    return { epley: 0, brzycki: 0, average: 0 };
  }
  if (reps === 1) {
    return { epley: weight, brzycki: weight, average: weight };
  }

  // Epley Formula: 1RM = Weight * (1 + Reps / 30)
  const epley = Math.round(weight * (1 + reps / 30));

  // Brzycki Formula: 1RM = Weight * (36 / (37 - Reps))
  const brzycki = reps < 37 ? Math.round(weight * (36 / (37 - reps))) : epley;

  const average = Math.round((epley + brzycki) / 2);

  return { epley, brzycki, average };
};

/**
 * Calculate Body Mass Index (BMI)
 */
export const calculateBMI = (
  weightKg: number,
  heightCm: number
): { bmi: number; classification: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' } => {
  if (heightCm <= 0 || weightKg <= 0) {
    return { bmi: 0, classification: 'Normal' };
  }

  const heightM = heightCm / 100;
  const bmi = parseFloat((weightKg / (heightM * heightM)).toFixed(1));

  let classification: 'Underweight' | 'Normal' | 'Overweight' | 'Obese' = 'Normal';
  if (bmi < 18.5) classification = 'Underweight';
  else if (bmi < 25) classification = 'Normal';
  else if (bmi < 30) classification = 'Overweight';
  else classification = 'Obese';

  return { bmi, classification };
};

/**
 * Estimate Target Daily Caloric & Macro Needs
 */
export const estimateMacros = (
  weightKg: number,
  goal: 'cut' | 'maintain' | 'bulk'
) => {
  // Approximate baseline 30-33 kcal per kg
  let baseCalories = Math.round(weightKg * 32);

  if (goal === 'cut') baseCalories -= 400;
  else if (goal === 'bulk') baseCalories += 350;

  // 2.0g protein / kg bodyweight
  const protein = Math.round(weightKg * 2.0);
  const proteinCalories = protein * 4;

  // 25% calories from fats
  const fatCalories = baseCalories * 0.25;
  const fat = Math.round(fatCalories / 9);

  // Remaining calories from carbs
  const carbCalories = Math.max(0, baseCalories - proteinCalories - fatCalories);
  const carbs = Math.round(carbCalories / 4);

  return {
    calories: baseCalories,
    protein,
    carbs,
    fat,
  };
};
