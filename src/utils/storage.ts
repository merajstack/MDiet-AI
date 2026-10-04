import {
  UserProfile,
  PersonalPlan,
  FoodLogEntry,
  ExerciseEntry,
  WaterLog,
  WeightEntry,
  StepLog,
  AIRecommendation,
} from '@/types';
import { getTodayString } from './dateUtils';

const KEYS = {
  USER: 'mDiet_user',
  PLAN: 'mDiet_plan',
  FOOD_LOGS: 'mDiet_foodLogs',
  EXERCISE_LOGS: 'mDiet_exerciseLogs',
  WATER: 'mDiet_water',
  WEIGHT_HISTORY: 'mDiet_weightHistory',
  STEPS: 'mDiet_steps',
  SETTINGS: 'mDiet_settings',
  RECOMMENDATIONS: 'mDiet_recommendations',
} as const;

// Custom event name for instant cross-component updates
export const STORAGE_CHANGE_EVENT = 'mDiet_storage_update';

function notifyStorageChange(key: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(STORAGE_CHANGE_EVENT, { detail: { key } }));
  }
}

function getItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (error) {
    console.warn(`[mDiet storage] Error reading ${key}:`, error);
    return defaultValue;
  }
}

function setItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
    notifyStorageChange(key);
  } catch (error) {
    console.error(`[mDiet storage] Error saving ${key}:`, error);
  }
}

// ---------------- USER PROFILE ----------------
export function getUserProfile(): UserProfile | null {
  return getItem<UserProfile | null>(KEYS.USER, null);
}

export function saveUserProfile(profile: UserProfile): void {
  setItem(KEYS.USER, profile);
}

// ---------------- PERSONAL PLAN ----------------
export function getPersonalPlan(): PersonalPlan | null {
  return getItem<PersonalPlan | null>(KEYS.PLAN, null);
}

export function savePersonalPlan(plan: PersonalPlan): void {
  setItem(KEYS.PLAN, plan);
}

// ---------------- FOOD LOGS (Date-partitioned) ----------------
// Stored as Record<string, FoodLogEntry[]> where key is YYYY-MM-DD
export function getAllFoodLogs(): Record<string, FoodLogEntry[]> {
  return getItem<Record<string, FoodLogEntry[]>>(KEYS.FOOD_LOGS, {});
}

export function getFoodLogsForDate(dateStr: string): FoodLogEntry[] {
  const all = getAllFoodLogs();
  return all[dateStr] || [];
}

export function addFoodLogEntry(entry: FoodLogEntry): void {
  const all = getAllFoodLogs();
  const list = all[entry.date] ? [...all[entry.date]] : [];
  list.push(entry);
  all[entry.date] = list;
  setItem(KEYS.FOOD_LOGS, all);
}

export function updateFoodLogEntry(entry: FoodLogEntry): void {
  const all = getAllFoodLogs();
  const list = all[entry.date] || [];
  const idx = list.findIndex((item) => item.id === entry.id);
  if (idx !== -1) {
    list[idx] = entry;
    all[entry.date] = [...list];
    setItem(KEYS.FOOD_LOGS, all);
  }
}

export function deleteFoodLogEntry(dateStr: string, id: string): void {
  const all = getAllFoodLogs();
  const list = all[dateStr] || [];
  all[dateStr] = list.filter((item) => item.id !== id);
  setItem(KEYS.FOOD_LOGS, all);
}

// ---------------- EXERCISE LOGS (Date-partitioned) ----------------
export function getAllExerciseLogs(): Record<string, ExerciseEntry[]> {
  return getItem<Record<string, ExerciseEntry[]>>(KEYS.EXERCISE_LOGS, {});
}

export function getExerciseLogsForDate(dateStr: string): ExerciseEntry[] {
  const all = getAllExerciseLogs();
  return all[dateStr] || [];
}

export function addExerciseEntry(entry: ExerciseEntry): void {
  const all = getAllExerciseLogs();
  const list = all[entry.date] ? [...all[entry.date]] : [];
  list.push(entry);
  all[entry.date] = list;
  setItem(KEYS.EXERCISE_LOGS, all);
}

export function deleteExerciseEntry(dateStr: string, id: string): void {
  const all = getAllExerciseLogs();
  const list = all[dateStr] || [];
  all[dateStr] = list.filter((item) => item.id !== id);
  setItem(KEYS.EXERCISE_LOGS, all);
}

// ---------------- WATER LOGS (Date-partitioned) ----------------
export function getAllWaterLogs(): Record<string, WaterLog> {
  return getItem<Record<string, WaterLog>>(KEYS.WATER, {});
}

export function getWaterLogForDate(dateStr: string, defaultTargetLiters: number = 2.5): WaterLog {
  const all = getAllWaterLogs();
  if (all[dateStr]) {
    return all[dateStr];
  }
  return {
    date: dateStr,
    amountMl: 0,
    targetMl: Math.round(defaultTargetLiters * 1000),
    logs: [],
  };
}

export function addWaterIntake(dateStr: string, mlToAdd: number, targetLiters?: number): WaterLog {
  const all = getAllWaterLogs();
  const current = getWaterLogForDate(dateStr, targetLiters);
  const updatedAmount = Math.max(0, current.amountMl + mlToAdd);
  const updatedLogs = [
    ...current.logs,
    {
      id: 'water-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
      amountMl: mlToAdd,
      timestamp: Date.now(),
    },
  ];

  const updated: WaterLog = {
    ...current,
    amountMl: updatedAmount,
    targetMl: targetLiters ? Math.round(targetLiters * 1000) : current.targetMl,
    logs: updatedLogs,
  };

  all[dateStr] = updated;
  setItem(KEYS.WATER, all);
  return updated;
}

export function resetWaterForDate(dateStr: string, targetLiters?: number): void {
  const all = getAllWaterLogs();
  all[dateStr] = {
    date: dateStr,
    amountMl: 0,
    targetMl: targetLiters ? Math.round(targetLiters * 1000) : 2500,
    logs: [],
  };
  setItem(KEYS.WATER, all);
}

// ---------------- WEIGHT HISTORY ----------------
export function getWeightHistory(): WeightEntry[] {
  return getItem<WeightEntry[]>(KEYS.WEIGHT_HISTORY, []);
}

export function addWeightEntry(entry: WeightEntry): void {
  const history = getWeightHistory();
  // If entry for date already exists, update it, else append
  const idx = history.findIndex((h) => h.date === entry.date);
  if (idx !== -1) {
    history[idx] = entry;
  } else {
    history.push(entry);
  }
  history.sort((a, b) => (a.date > b.date ? 1 : -1));
  setItem(KEYS.WEIGHT_HISTORY, history);

  // Also update user profile current weight if it's the latest entry
  const profile = getUserProfile();
  if (profile) {
    profile.currentWeight = entry.weightKg;
    profile.updatedAt = new Date().toISOString();
    saveUserProfile(profile);
  }
}

// ---------------- STEP HISTORY ----------------
export function getAllStepLogs(): Record<string, StepLog> {
  return getItem<Record<string, StepLog>>(KEYS.STEPS, {});
}

export function getStepLogForDate(dateStr: string, defaultTarget: number = 10000): StepLog {
  const all = getAllStepLogs();
  if (all[dateStr]) {
    return all[dateStr];
  }
  return {
    date: dateStr,
    steps: 0,
    target: defaultTarget,
    distanceKm: 0,
    caloriesBurned: 0,
  };
}

export function saveStepLog(log: StepLog): void {
  const all = getAllStepLogs();
  all[log.date] = log;
  setItem(KEYS.STEPS, all);
}

// ---------------- AI RECOMMENDATIONS ----------------
export function getRecommendations(): AIRecommendation[] {
  return getItem<AIRecommendation[]>(KEYS.RECOMMENDATIONS, []);
}

export function saveRecommendations(recs: AIRecommendation[]): void {
  setItem(KEYS.RECOMMENDATIONS, recs);
}

export function markRecommendationApplied(id: string): void {
  const recs = getRecommendations();
  const updated = recs.map((r) => (r.id === id ? { ...r, applied: true } : r));
  saveRecommendations(updated);
}

// ---------------- SETTINGS & CLEAR DATA ----------------
export function clearAllData(): void {
  if (typeof window === 'undefined') return;
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  notifyStorageChange('clear_all');
}
