export type GoalType = 'lose' | 'maintain' | 'gain' | 'habits';

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface UserProfile {
  name: string;
  age: number;
  height: number; // in cm
  currentWeight: number; // in kg
  targetWeight: number; // in kg
  goal: GoalType;
  activityLevel: ActivityLevel;
  gender?: 'male' | 'female' | 'other';
  createdAt: string;
  updatedAt: string;
}

export interface PersonalPlan {
  id: string;
  name: string;
  description: string;
  dailyCalories: number;
  protein: number; // in grams
  carbs: number; // in grams
  fat: number; // in grams
  waterLiters: number;
  steps: number;
  estimatedWeeklyChange: string;
  strategyNotes?: string;
  isCustom?: boolean;
}

export interface FoodItem {
  id: string;
  name: string;
  estimatedPortion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  notes?: string;
}

export interface FoodLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  food: FoodItem;
  timestamp: number;
  source: 'camera' | 'manual_text' | 'direct';
  imageUrl?: string;
}

export type ExerciseActivityType =
  | 'Walking'
  | 'Running'
  | 'Cycling'
  | 'Gym'
  | 'Swimming'
  | 'Strength Training'
  | 'HIIT'
  | 'Yoga'
  | 'Pilates'
  | 'Sports'
  | 'Other';

export interface ExerciseEntry {
  id: string;
  date: string; // YYYY-MM-DD
  activityType: ExerciseActivityType | string;
  durationMinutes: number;
  distanceKm?: number;
  intensity: 'low' | 'moderate' | 'high';
  caloriesBurned: number;
  timestamp: number;
  notes?: string;
}

export interface WaterLog {
  date: string; // YYYY-MM-DD
  amountMl: number;
  targetMl: number;
  logs: Array<{
    id: string;
    amountMl: number;
    timestamp: number;
  }>;
}

export interface WeightEntry {
  id: string;
  date: string; // YYYY-MM-DD
  weightKg: number;
  timestamp: number;
  note?: string;
}

export interface StepLog {
  date: string; // YYYY-MM-DD
  steps: number;
  target: number;
  distanceKm: number;
  caloriesBurned: number;
}

export interface AIRecommendation {
  id: string;
  title: string;
  tagline: string;
  description: string;
  type: 'calorie_adjustment' | 'macro_rebalance' | 'hydration_focus' | 'activity_boost';
  suggestedPlan: Partial<PersonalPlan>;
  reasons: string[];
  createdAt: string;
  applied?: boolean;
}

export type ActiveTab = 'dashboard' | 'food' | 'activity' | 'progress' | 'settings' | 'recommendations';
