'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  UserProfile,
  PersonalPlan,
  FoodLogEntry,
  ExerciseEntry,
  WaterLog,
  StepLog,
  MealType,
  ActiveTab,
  FoodItem,
} from '@/types';
import {
  getUserProfile,
  getPersonalPlan,
  getFoodLogsForDate,
  getExerciseLogsForDate,
  getWaterLogForDate,
  getStepLogForDate,
  addFoodLogEntry,
  STORAGE_CHANGE_EVENT,
} from '@/utils/storage';
import { getTodayString, getGreeting } from '@/utils/dateUtils';

// Navigation & Layout
import { Sidebar } from '@/components/navigation/Sidebar';
import { BottomNav } from '@/components/navigation/BottomNav';
import { Header } from '@/components/navigation/Header';

// Dashboard Components
import { CalorieSummaryCard } from '@/components/dashboard/CalorieSummaryCard';
import { MacroPills } from '@/components/dashboard/MacroPills';
import { WaterTracker } from '@/components/dashboard/WaterTracker';
import { StepTracker } from '@/components/dashboard/StepTracker';
import { ActivitySection } from '@/components/dashboard/ActivitySection';
import { MealsTimeline } from '@/components/dashboard/MealsTimeline';

// Views
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';
import { FoodView } from '@/components/food/FoodView';
import { ActivityView } from '@/components/activity/ActivityView';
import { ProgressView } from '@/components/progress/ProgressView';
import { AIRecommendationsView } from '@/components/recommendations/AIRecommendationsView';
import { SettingsView } from '@/components/settings/SettingsView';

// Modals & Feedback
import { CameraScanModal } from '@/components/modals/CameraScanModal';
import { ManualFoodModal } from '@/components/modals/ManualFoodModal';
import { ExerciseModal } from '@/components/modals/ExerciseModal';
import { WeightModal } from '@/components/modals/WeightModal';
import { QuickActionsModal } from '@/components/modals/QuickActionsModal';
import { Toast, ToastMessage } from '@/components/ui/Toast';

export default function MainPage() {
  const [isClient, setIsClient] = useState(false);
  const [currentDate, setCurrentDate] = useState<string>(getTodayString());
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // User & Plan State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [personalPlan, setPersonalPlan] = useState<PersonalPlan | null>(null);
  const [isAiConfigured, setIsAiConfigured] = useState<boolean>(false);

  // Daily Data State
  const [foodLogs, setFoodLogs] = useState<FoodLogEntry[]>([]);
  const [exerciseLogs, setExerciseLogs] = useState<ExerciseEntry[]>([]);
  const [waterLog, setWaterLog] = useState<WaterLog | null>(null);
  const [stepLog, setStepLog] = useState<StepLog | null>(null);

  // Modals State
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [isManualFoodModalOpen, setIsManualFoodModalOpen] = useState(false);
  const [isExerciseModalOpen, setIsExerciseModalOpen] = useState(false);
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isQuickActionsOpen, setIsQuickActionsOpen] = useState(false);
  const [activeMealTypeForAdd, setActiveMealTypeForAdd] = useState<MealType>('lunch');

  // Toast State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ id: `toast-${Date.now()}`, type, message });
  }, []);

  // Reload current day's logs
  const reloadDayData = useCallback(
    (dateStr: string, planTargetWater = 2.5, planTargetSteps = 10000) => {
      setFoodLogs(getFoodLogsForDate(dateStr));
      setExerciseLogs(getExerciseLogsForDate(dateStr));
      setWaterLog(getWaterLogForDate(dateStr, planTargetWater));
      setStepLog(getStepLogForDate(dateStr, planTargetSteps));
    },
    []
  );

  // Initial load
  useEffect(() => {
    setIsClient(true);
    const profile = getUserProfile();
    const plan = getPersonalPlan();

    setUserProfile(profile);
    setPersonalPlan(plan);

    if (profile && plan) {
      reloadDayData(currentDate, plan.waterLiters, plan.steps);
    }

    // Check Mdiet AI status
    fetch('/api/gemini/status')
      .then((r) => r.json())
      .then((data) => {
        setIsAiConfigured(!!data.configured);
      })
      .catch(() => {});

    // Listen for storage events across tabs / components
    const handleStorageUpdate = () => {
      const p = getUserProfile();
      const pl = getPersonalPlan();
      setUserProfile(p);
      setPersonalPlan(pl);
      if (pl) {
        reloadDayData(currentDate, pl.waterLiters, pl.steps);
      }
    };

    window.addEventListener(STORAGE_CHANGE_EVENT, handleStorageUpdate);
    return () => {
      window.removeEventListener(STORAGE_CHANGE_EVENT, handleStorageUpdate);
    };
  }, [currentDate, reloadDayData]);

  // When date changes
  const handleDateChange = (newDate: string) => {
    setCurrentDate(newDate);
    if (personalPlan) {
      reloadDayData(newDate, personalPlan.waterLiters, personalPlan.steps);
    }
  };

  // Add food confirmation handler (from camera scan or manual natural language)
  const handleConfirmFood = (
    foodItem: FoodItem,
    mealType: MealType,
    imageUrl?: string
  ) => {
    const newEntry: FoodLogEntry = {
      id: `food-entry-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      date: currentDate,
      mealType,
      food: foodItem,
      timestamp: Date.now(),
      source: imageUrl ? 'camera' : 'manual_text',
      imageUrl,
    };

    addFoodLogEntry(newEntry);
    if (personalPlan) {
      reloadDayData(currentDate, personalPlan.waterLiters, personalPlan.steps);
    }
    showToast(`Added ${foodItem.name} (${foodItem.calories} kcal) to ${mealType}`);
  };

  // Quick Action Selection
  const handleSelectQuickAction = (
    action: 'camera_food' | 'manual_food' | 'water' | 'exercise' | 'weight'
  ) => {
    switch (action) {
      case 'camera_food':
        setIsCameraModalOpen(true);
        break;
      case 'manual_food':
        setIsManualFoodModalOpen(true);
        break;
      case 'exercise':
        setIsExerciseModalOpen(true);
        break;
      case 'water':
        if (personalPlan) {
          // Quick add +250ml
          import('@/utils/storage').then(({ addWaterIntake }) => {
            addWaterIntake(currentDate, 250, personalPlan.waterLiters);
            reloadDayData(currentDate, personalPlan.waterLiters, personalPlan.steps);
            showToast('Added 250ml water 💧');
          });
        }
        break;
      case 'weight':
        setIsWeightModalOpen(true);
        break;
    }
  };

  if (!isClient) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          backgroundColor: '#f5f5f7',
        }}
      >
        <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7' }}>
          M Diet
        </div>
      </div>
    );
  }

  // If user hasn't completed onboarding, show step-by-step onboarding flow
  if (!userProfile || !personalPlan) {
    return (
      <main style={{ minHeight: '100vh', backgroundColor: '#f5f5f7' }}>
        <OnboardingFlow
          onComplete={() => {
            const p = getUserProfile();
            const pl = getPersonalPlan();
            setUserProfile(p);
            setPersonalPlan(pl);
            if (pl) {
              reloadDayData(currentDate, pl.waterLiters, pl.steps);
            }
            showToast('Welcome to M Diet!');
          }}
        />
        <Toast toast={toast} onClose={() => setToast(null)} />
      </main>
    );
  }

  // Deterministic daily aggregations
  const consumedCalories = foodLogs.reduce((acc, curr) => acc + curr.food.calories, 0);
  const exerciseCaloriesBurned = exerciseLogs.reduce(
    (acc, curr) => acc + curr.caloriesBurned,
    0
  );
  // Add step calories burned
  const stepCalories = stepLog?.caloriesBurned || 0;
  const totalBurnedCalories = exerciseCaloriesBurned + stepCalories;

  const proteinConsumed = foodLogs.reduce((acc, curr) => acc + curr.food.protein, 0);
  const carbsConsumed = foodLogs.reduce((acc, curr) => acc + curr.food.carbs, 0);
  const fatConsumed = foodLogs.reduce((acc, curr) => acc + curr.food.fat, 0);

  return (
    <div className="app-container">
      {/* Desktop Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAdd={() => setIsQuickActionsOpen(true)}
        userName={userProfile.name}
      />

      {/* Main Content Area */}
      <main className="main-content">
        {/* Top Header */}
        <Header
          currentDate={currentDate}
          onDateChange={handleDateChange}
          greeting={getGreeting(userProfile.name)}
          isAiConfigured={isAiConfigured}
          onOpenProfile={() => setActiveTab('settings')}
          userName={userProfile.name}
          isProfileActive={activeTab === 'settings'}
        />

        {/* VIEW 1: MAIN DASHBOARD ("Today") */}
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Dynamic Calorie Balance Card */}
            <CalorieSummaryCard
              targetCalories={personalPlan.dailyCalories}
              consumedCalories={consumedCalories}
              burnedCalories={totalBurnedCalories}
              onAddFood={() => {
                setActiveMealTypeForAdd('lunch');
                setIsCameraModalOpen(true);
              }}
              onAddExercise={() => setIsExerciseModalOpen(true)}
            />

            {/* Macronutrients distribution */}
            <MacroPills
              proteinConsumed={proteinConsumed}
              proteinTarget={personalPlan.protein}
              carbsConsumed={carbsConsumed}
              carbsTarget={personalPlan.carbs}
              fatConsumed={fatConsumed}
              fatTarget={personalPlan.fat}
            />

            {/* Hydration & Step Trackers Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '20px',
              }}
            >
              {waterLog && (
                <WaterTracker
                  currentDate={currentDate}
                  amountMl={waterLog.amountMl}
                  targetMl={waterLog.targetMl}
                  onWaterUpdated={() =>
                    reloadDayData(currentDate, personalPlan.waterLiters, personalPlan.steps)
                  }
                />
              )}

              {stepLog && (
                <StepTracker
                  currentDate={currentDate}
                  stepLog={stepLog}
                  userHeightCm={userProfile.height}
                  userWeightKg={userProfile.currentWeight}
                  onStepsUpdated={() =>
                    reloadDayData(currentDate, personalPlan.waterLiters, personalPlan.steps)
                  }
                />
              )}
            </div>

            {/* Activity & Workouts Burned */}
            <ActivitySection
              currentDate={currentDate}
              exercises={exerciseLogs}
              totalCaloriesBurned={totalBurnedCalories}
              onOpenAddModal={() => setIsExerciseModalOpen(true)}
              onExerciseUpdated={() =>
                reloadDayData(currentDate, personalPlan.waterLiters, personalPlan.steps)
              }
            />

            {/* Today's Meals Timeline */}
            <MealsTimeline
              currentDate={currentDate}
              foodLogs={foodLogs}
              onAddFood={(mealType) => {
                if (mealType) setActiveMealTypeForAdd(mealType);
                setIsCameraModalOpen(true);
              }}
              onLogsUpdated={() =>
                reloadDayData(currentDate, personalPlan.waterLiters, personalPlan.steps)
              }
            />
          </div>
        )}

        {/* VIEW 2: FOOD LOG */}
        {activeTab === 'food' && (
          <FoodView
            currentDate={currentDate}
            foodLogs={foodLogs}
            onOpenScanModal={(m) => {
              if (m) setActiveMealTypeForAdd(m);
              setIsCameraModalOpen(true);
            }}
            onOpenManualModal={(m) => {
              if (m) setActiveMealTypeForAdd(m);
              setIsManualFoodModalOpen(true);
            }}
            onLogsUpdated={() =>
              reloadDayData(currentDate, personalPlan.waterLiters, personalPlan.steps)
            }
          />
        )}

        {/* VIEW 3: ACTIVITY */}
        {activeTab === 'activity' && stepLog && (
          <ActivityView
            currentDate={currentDate}
            user={userProfile}
            stepLog={stepLog}
            exercises={exerciseLogs}
            totalCaloriesBurned={totalBurnedCalories}
            onOpenExerciseModal={() => setIsExerciseModalOpen(true)}
            onActivityUpdated={() =>
              reloadDayData(currentDate, personalPlan.waterLiters, personalPlan.steps)
            }
          />
        )}

        {/* VIEW 4: PROGRESS & ANALYTICS */}
        {activeTab === 'progress' && (
          <ProgressView
            user={userProfile}
            plan={personalPlan}
            onOpenWeightModal={() => setIsWeightModalOpen(true)}
          />
        )}

        {/* VIEW 5: AI STRATEGY & RECOMMENDATIONS */}
        {activeTab === 'recommendations' && (
          <AIRecommendationsView
            user={userProfile}
            plan={personalPlan}
            onPlanUpdated={() => {
              const updatedPlan = getPersonalPlan();
              if (updatedPlan) setPersonalPlan(updatedPlan);
            }}
            onShowToast={showToast}
          />
        )}

        {/* VIEW 6: PERSONALIZED SETTINGS & PROFILE */}
        {activeTab === 'settings' && (
          <SettingsView
            user={userProfile}
            plan={personalPlan}
            onProfileUpdated={() => {
              const u = getUserProfile();
              const p = getPersonalPlan();
              if (u) setUserProfile(u);
              if (p) setPersonalPlan(p);
            }}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onQuickAdd={() => setIsQuickActionsOpen(true)}
      />

      {/* Floating Action Button (Accessible on Mobile & Desktop) */}
      <button
        onClick={() => setIsQuickActionsOpen(true)}
        aria-label="Quick Action"
        className="app-fab"
        title="Quick Log"
      >
        <span style={{ fontSize: '1.75rem', fontWeight: 300, lineHeight: 1 }}>+</span>
      </button>

      {/* MODALS */}
      {/* 1. Camera Food Scan */}
      <CameraScanModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        defaultMealType={activeMealTypeForAdd}
        onConfirmFood={handleConfirmFood}
      />

      {/* 2. Manual Food Natural Language Input */}
      <ManualFoodModal
        isOpen={isManualFoodModalOpen}
        onClose={() => setIsManualFoodModalOpen(false)}
        defaultMealType={activeMealTypeForAdd}
        onConfirmFood={handleConfirmFood}
      />

      {/* 3. Log Exercise / Workout */}
      <ExerciseModal
        isOpen={isExerciseModalOpen}
        onClose={() => setIsExerciseModalOpen(false)}
        currentDate={currentDate}
        userWeightKg={userProfile.currentWeight}
        onExerciseAdded={() =>
          reloadDayData(currentDate, personalPlan.waterLiters, personalPlan.steps)
        }
      />

      {/* 4. Log Weight */}
      <WeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        currentDate={currentDate}
        currentWeightKg={userProfile.currentWeight}
        targetWeightKg={userProfile.targetWeight}
        onWeightRecorded={() => {
          const u = getUserProfile();
          if (u) setUserProfile(u);
          showToast('Body weight updated.');
        }}
      />

      {/* 5. Quick Actions Central Selector */}
      <QuickActionsModal
        isOpen={isQuickActionsOpen}
        onClose={() => setIsQuickActionsOpen(false)}
        onSelectAction={handleSelectQuickAction}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
