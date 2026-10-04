'use client';

import React from 'react';
import { ExerciseEntry, StepLog, UserProfile } from '@/types';
import { StepTracker } from '../dashboard/StepTracker';
import { ActivitySection } from '../dashboard/ActivitySection';
import { Button } from '@/ui/Button';
import { Flame, Plus } from 'lucide-react';

interface ActivityViewProps {
  currentDate: string;
  user: UserProfile;
  stepLog: StepLog;
  exercises: ExerciseEntry[];
  totalCaloriesBurned: number;
  onOpenExerciseModal: () => void;
  onActivityUpdated: () => void;
}

export function ActivityView({
  currentDate,
  user,
  stepLog,
  exercises,
  totalCaloriesBurned,
  onOpenExerciseModal,
  onActivityUpdated,
}: ActivityViewProps) {
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
            Activity & Movement
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#86868b' }}>
            Daily steps, ambulation, and workout energy expenditure
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={onOpenExerciseModal}
          leftIcon={<Plus size={18} />}
          style={{ background: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)', border: 'none' }}
        >
          Add Workout
        </Button>
      </div>

      {/* Step Tracker Card */}
      <StepTracker
        currentDate={currentDate}
        stepLog={stepLog}
        userHeightCm={user.height}
        userWeightKg={user.currentWeight}
        onStepsUpdated={onActivityUpdated}
      />

      {/* Workouts List */}
      <ActivitySection
        currentDate={currentDate}
        exercises={exercises}
        totalCaloriesBurned={totalCaloriesBurned}
        onOpenAddModal={onOpenExerciseModal}
        onExerciseUpdated={onActivityUpdated}
      />
    </div>
  );
}
