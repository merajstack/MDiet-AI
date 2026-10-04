import { ActivityLevel, GoalType, ExerciseActivityType } from '@/types';

/**
 * Deterministic Calorie & Nutrition Calculation Engine
 * No AI is used for arithmetic. Formulas are based on established clinical exercise physiology
 * (Mifflin-St Jeor BMR, Ainsworth Compendium of Physical Activities METs).
 */

// MET values for standard activities
export const MET_VALUES: Record<string, number> = {
  Walking: 3.5,
  Running: 9.8,
  Cycling: 7.5,
  Gym: 5.5,
  Swimming: 7.0,
  'Strength Training': 5.0,
  HIIT: 8.5,
  Yoga: 3.0,
  Pilates: 3.5,
  Sports: 6.5,
  Other: 4.5,
};

export const INTENSITY_MULTIPLIERS = {
  low: 0.85,
  moderate: 1.0,
  high: 1.25,
};

/**
 * Calculates Basal Metabolic Rate using Mifflin-St Jeor formula
 */
export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'male' | 'female' | 'other' = 'other'
): number {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  if (gender === 'male') {
    return Math.round(base + 5);
  } else if (gender === 'female') {
    return Math.round(base - 161);
  }
  // Gender-neutral average
  return Math.round(base - 78);
}

/**
 * Calculates Total Daily Energy Expenditure (TDEE) based on activity level
 */
export function calculateTDEE(bmr: number, activityLevel: ActivityLevel): number {
  const multipliers: Record<ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    very: 1.725,
  };
  return Math.round(bmr * (multipliers[activityLevel] || 1.2));
}



/**
 * Deterministic exercise calorie burn calculation
 */
export function calculateExerciseCalories(
  activityType: ExerciseActivityType | string,
  durationMinutes: number,
  weightKg: number,
  intensity: 'low' | 'moderate' | 'high' = 'moderate'
): number {
  const met = MET_VALUES[activityType] || 4.5;
  const intensityFactor = INTENSITY_MULTIPLIERS[intensity] || 1.0;
  // Calories = MET * weight(kg) * (duration / 60) * intensity
  const burned = met * weightKg * (durationMinutes / 60) * intensityFactor;
  return Math.round(burned);
}

/**
 * Deterministic step calculations
 */
export function calculateStepMetrics(steps: number, heightCm: number, weightKg: number) {
  // Stride length formula: height (cm) * 0.415
  const strideMeters = (heightCm * 0.415) / 100;
  const distanceKm = Number(((steps * strideMeters) / 1000).toFixed(2));
  // Walking calorie expenditure: approx 0.04 - 0.045 kcal per step for average person, or ~0.57 kcal per km per kg
  const caloriesBurned = Math.round(distanceKm * weightKg * 0.57);

  return {
    distanceKm,
    caloriesBurned,
  };
}

/**
 * Computes complete dynamic calorie summary for the day
 */
export function calculateDailyCalorieSummary(
  targetCalories: number,
  foodCaloriesConsumed: number,
  exerciseCaloriesBurned: number
) {
  const netCalories = foodCaloriesConsumed - exerciseCaloriesBurned;
  const remainingCalories = targetCalories - foodCaloriesConsumed + exerciseCaloriesBurned;
  const percentage = targetCalories > 0 ? Math.min(100, Math.round((foodCaloriesConsumed / targetCalories) * 100)) : 0;

  return {
    targetCalories,
    foodCaloriesConsumed,
    exerciseCaloriesBurned,
    netCalories,
    remainingCalories,
    percentage,
    isOverBudget: remainingCalories < 0,
  };
}
