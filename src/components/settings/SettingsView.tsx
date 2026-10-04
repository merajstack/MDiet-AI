'use client';

import React, { useState } from 'react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { UserProfile, PersonalPlan, GoalType, ActivityLevel } from '@/types';
import { saveUserProfile, savePersonalPlan, clearAllData } from '@/utils/storage';
import { PlanSelection } from '../onboarding/PlanSelection';
import { Sparkles, Save, RotateCcw, AlertTriangle } from 'lucide-react';

interface SettingsViewProps {
  user: UserProfile;
  plan: PersonalPlan;
  onProfileUpdated: () => void;
  onShowToast: (msg: string) => void;
}

export function SettingsView({
  user,
  plan,
  onProfileUpdated,
  onShowToast,
}: SettingsViewProps) {
  // User profile inputs
  const [name, setName] = useState(user.name);
  const [age, setAge] = useState(user.age.toString());
  const [height, setHeight] = useState(user.height.toString());
  const [currentWeight, setCurrentWeight] = useState(user.currentWeight.toString());
  const [targetWeight, setTargetWeight] = useState(user.targetWeight.toString());
  const [goal, setGoal] = useState<GoalType>(user.goal);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(user.activityLevel);

  // Plan targets inputs
  const [dailyCalories, setDailyCalories] = useState(plan.dailyCalories.toString());
  const [protein, setProtein] = useState(plan.protein.toString());
  const [carbs, setCarbs] = useState(plan.carbs.toString());
  const [fat, setFat] = useState(plan.fat.toString());
  const [waterLiters, setWaterLiters] = useState(plan.waterLiters.toString());
  const [steps, setSteps] = useState(plan.steps.toString());

  // Recalculate AI state
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [recalculatedPlans, setRecalculatedPlans] = useState<PersonalPlan[] | null>(null);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser: UserProfile = {
      ...user,
      name: name.trim() || 'User',
      age: parseInt(age, 10) || user.age,
      height: parseInt(height, 10) || user.height,
      currentWeight: parseFloat(currentWeight) || user.currentWeight,
      targetWeight: parseFloat(targetWeight) || user.targetWeight,
      goal,
      activityLevel,
      updatedAt: new Date().toISOString(),
    };

    const updatedPlan: PersonalPlan = {
      ...plan,
      dailyCalories: parseInt(dailyCalories, 10) || plan.dailyCalories,
      protein: parseInt(protein, 10) || plan.protein,
      carbs: parseInt(carbs, 10) || plan.carbs,
      fat: parseInt(fat, 10) || plan.fat,
      waterLiters: parseFloat(waterLiters) || plan.waterLiters,
      steps: parseInt(steps, 10) || plan.steps,
      isCustom: true,
    };

    saveUserProfile(updatedUser);
    savePersonalPlan(updatedPlan);
    onProfileUpdated();
    onShowToast('Personalized profile and targets saved.');
  };

  const handleRecalculatePlan = async () => {
    setIsRecalculating(true);
    try {
      const res = await fetch('/api/gemini/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          age: parseInt(age, 10),
          height: parseInt(height, 10),
          currentWeight: parseFloat(currentWeight),
          targetWeight: parseFloat(targetWeight),
          goal,
          activityLevel,
        }),
      });

      const data = await res.json();
      if (data.plans && data.plans.length > 0) {
        setRecalculatedPlans(data.plans);
      }
    } catch (err) {
      console.warn('Recalculation error:', err);
    } finally {
      setIsRecalculating(false);
    }
  };

  const handleSelectRecalculatedPlan = (selectedPlan: PersonalPlan) => {
    savePersonalPlan(selectedPlan);
    setDailyCalories(selectedPlan.dailyCalories.toString());
    setProtein(selectedPlan.protein.toString());
    setCarbs(selectedPlan.carbs.toString());
    setFat(selectedPlan.fat.toString());
    setWaterLiters(selectedPlan.waterLiters.toString());
    setSteps(selectedPlan.steps.toString());
    setRecalculatedPlans(null);
    onProfileUpdated();
    onShowToast(`Switched to plan: ${selectedPlan.name}`);
  };

  const handleClearAll = () => {
    if (
      confirm(
        'Are you sure you want to reset all data and restart onboarding? This cannot be undone.'
      )
    ) {
      clearAllData();
      window.location.reload();
    }
  };

  if (recalculatedPlans && recalculatedPlans.length > 0) {
    return (
      <div className="animate-fade-in">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setRecalculatedPlans(null)}
          style={{ marginBottom: '16px' }}
        >
          ← Back to Settings
        </Button>
        <PlanSelection
          plans={recalculatedPlans}
          onSelectPlan={handleSelectRecalculatedPlan}
          userName={name}
          isRecalculate
        />
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#1d1d1f',
            }}
          >
            Personalized Settings
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#86868b' }}>
            Fine-tune your physiological metrics and daily macronutrient targets
          </p>
        </div>

        {/* Recalculate Plan Button */}
        <Button
          variant="primary"
          size="md"
          onClick={handleRecalculatePlan}
          isLoading={isRecalculating}
          leftIcon={<Sparkles size={16} />}
        >
          {isRecalculating ? 'Analyzing with Mdiet AI...' : 'Recalculate with Mdiet AI'}
        </Button>
      </div>

      <form onSubmit={handleSaveProfile} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Personal Details Card */}
        <Card className="mobile-card-padding" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '16px' }}>
            Biometric Profile
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '14px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#6e6e73', marginBottom: '6px' }}>
                Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#6e6e73', marginBottom: '6px' }}>
                Age (years)
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#6e6e73', marginBottom: '6px' }}>
                Height (cm)
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#6e6e73', marginBottom: '6px' }}>
                Current Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={currentWeight}
                onChange={(e) => setCurrentWeight(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#6e6e73', marginBottom: '6px' }}>
                Target Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#6e6e73', marginBottom: '6px' }}>
                Primary Goal
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value as GoalType)}
              >
                <option value="lose">Lose weight</option>
                <option value="maintain">Maintain weight</option>
                <option value="gain">Gain weight</option>
                <option value="habits">Build healthier eating habits</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#6e6e73', marginBottom: '6px' }}>
                Activity Level
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value as ActivityLevel)}
              >
                <option value="sedentary">Mostly sedentary</option>
                <option value="light">Lightly active</option>
                <option value="moderate">Moderately active</option>
                <option value="very">Very active</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Nutritional & Daily Targets Card */}
        <Card className="mobile-card-padding" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '16px' }}>
            Daily Strategic Targets
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '14px',
            }}
          >
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0284c7', marginBottom: '6px' }}>
                Daily Calories (kcal)
              </label>
              <input
                type="number"
                value={dailyCalories}
                onChange={(e) => setDailyCalories(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0284c7', marginBottom: '6px' }}>
                Protein Target (g)
              </label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#d97706', marginBottom: '6px' }}>
                Carbs Target (g)
              </label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#ec4899', marginBottom: '6px' }}>
                Fat Target (g)
              </label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#0ea5e9', marginBottom: '6px' }}>
                Water Target (Liters)
              </label>
              <input
                type="number"
                step="0.1"
                value={waterLiters}
                onChange={(e) => setWaterLiters(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#10b981', marginBottom: '6px' }}>
                Daily Step Target
              </label>
              <input
                type="number"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Button
            type="submit"
            variant="primary"
            size="lg"
            leftIcon={<Save size={18} />}
          >
            Save Changes
          </Button>

          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={handleRecalculatePlan}
            leftIcon={<Sparkles size={18} />}
            isLoading={isRecalculating}
          >
            {isRecalculating ? 'Analyzing with Mdiet AI...' : 'Recalculate with Mdiet AI'}
          </Button>
        </div>
      </form>


      {/* Danger Zone: Clear Data */}
      <Card className="mobile-card-padding" style={{ padding: '24px', border: '1px solid #fee2e2', backgroundColor: '#fffbfb' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
          <AlertTriangle size={18} color="#ef4444" />
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#ef4444' }}>
            Reset Application Data
          </h4>
        </div>
        <p style={{ fontSize: '0.84rem', color: '#86868b', marginBottom: '16px' }}>
          Clears local storage, meal logs, activity logs, water records, and returns you to onboarding.
        </p>
        <Button
          variant="danger"
          size="sm"
          onClick={handleClearAll}
          leftIcon={<RotateCcw size={15} />}
        >
          Reset All Data
        </Button>
      </Card>
    </div>
  );
}
