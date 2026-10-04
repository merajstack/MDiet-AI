'use client';

import React, { useState } from 'react';
import { Modal } from '@/ui/Modal';
import { Button } from '@/ui/Button';
import { Flame, Clock, MapPin } from 'lucide-react';
import { ExerciseActivityType, ExerciseEntry } from '@/types';
import { calculateExerciseCalories, MET_VALUES } from '@/utils/calculations';
import { addExerciseEntry } from '@/utils/storage';

interface ExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  userWeightKg?: number;
  onExerciseAdded: () => void;
}

const ACTIVITIES: Array<{ type: ExerciseActivityType; icon: string }> = [
  { type: 'Walking', icon: '🚶' },
  { type: 'Running', icon: '🏃' },
  { type: 'Cycling', icon: '🚴' },
  { type: 'Gym', icon: '🏋️' },
  { type: 'Swimming', icon: '🏊' },
  { type: 'Strength Training', icon: '💪' },
  { type: 'HIIT', icon: '⚡' },
  { type: 'Yoga', icon: '🧘' },
  { type: 'Pilates', icon: '🤸' },
  { type: 'Sports', icon: '⚽' },
  { type: 'Other', icon: '🔥' },
];

export function ExerciseModal({
  isOpen,
  onClose,
  currentDate,
  userWeightKg = 75,
  onExerciseAdded,
}: ExerciseModalProps) {
  const [selectedActivity, setSelectedActivity] = useState<ExerciseActivityType>('Walking');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [distanceKm, setDistanceKm] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'moderate' | 'high'>('moderate');

  // Instant deterministic calculation
  const estimatedCalories = calculateExerciseCalories(
    selectedActivity,
    durationMinutes,
    userWeightKg,
    intensity
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: ExerciseEntry = {
      id: `exercise-${Date.now()}`,
      date: currentDate,
      activityType: selectedActivity,
      durationMinutes,
      distanceKm: distanceKm ? parseFloat(distanceKm) : undefined,
      intensity,
      caloriesBurned: estimatedCalories,
      timestamp: Date.now(),
    };

    addExerciseEntry(entry);
    onExerciseAdded();
    onClose();
  };

  const isDistanceApplicable = ['Walking', 'Running', 'Cycling', 'Swimming'].includes(selectedActivity);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Log Activity"
      subtitle="Estimated scientifically based on duration, activity type, and intensity"
      maxWidth="520px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Activity Selection Grid */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '8px' }}>
            Select Workout Type:
          </label>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))',
              gap: '8px',
              maxHeight: '160px',
              overflowY: 'auto',
              padding: '2px',
            }}
          >
            {ACTIVITIES.map((act) => {
              const isSelected = selectedActivity === act.type;
              return (
                <button
                  key={act.type}
                  type="button"
                  onClick={() => setSelectedActivity(act.type)}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '10px 6px',
                    borderRadius: '14px',
                    backgroundColor: isSelected ? '#fff7ed' : '#f8f8fa',
                    border: isSelected ? '1.5px solid #f97316' : '1px solid rgba(0, 0, 0, 0.05)',
                    color: isSelected ? '#ea580c' : '#52525b',
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>{act.icon}</span>
                  <span style={{ fontSize: '0.74rem', fontWeight: 600, textAlign: 'center' }}>
                    {act.type}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Duration Input */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <label style={{ fontSize: '0.84rem', fontWeight: 600, color: '#1d1d1f' }}>
              Duration
            </label>
            <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0284c7' }}>
              {durationMinutes} minutes
            </span>
          </div>
          <input
            type="range"
            min={5}
            max={180}
            step={5}
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(Number(e.target.value))}
            style={{ width: '100%', accentColor: '#0284c7' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#86868b', marginTop: '2px' }}>
            <span>5m</span>
            <span>60m</span>
            <span>120m</span>
            <span>180m</span>
          </div>
        </div>

        {/* Distance (if applicable) */}
        {isDistanceApplicable && (
          <div>
            <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '6px' }}>
              Distance (Optional)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                step="0.1"
                placeholder="e.g. 5.2"
                value={distanceKm}
                onChange={(e) => setDistanceKm(e.target.value)}
              />
              <span style={{ fontSize: '0.86rem', color: '#6e6e73', fontWeight: 600 }}>km</span>
            </div>
          </div>
        )}

        {/* Intensity Selection */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '6px' }}>
            Effort Intensity:
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
            {(['low', 'moderate', 'high'] as const).map((lvl) => (
              <button
                key={lvl}
                type="button"
                onClick={() => setIntensity(lvl)}
                style={{
                  padding: '8px',
                  borderRadius: '12px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                  backgroundColor: intensity === lvl ? '#fff7ed' : '#f8f8fa',
                  border: intensity === lvl ? '1.5px solid #f97316' : '1px solid rgba(0,0,0,0.05)',
                  color: intensity === lvl ? '#ea580c' : '#52525b',
                }}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Deterministic Live Calculation Highlight */}
        <div
          style={{
            backgroundColor: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: '18px',
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ fontSize: '0.74rem', color: '#ea580c', fontWeight: 600, textTransform: 'uppercase' }}>
              Deterministic Energy Burn
            </div>
            <div style={{ fontSize: '0.78rem', color: '#86868b', marginTop: '2px' }}>
              Based on {userWeightKg}kg body weight
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Flame size={20} color="#f97316" />
            <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ea580c' }}>
              {estimatedCalories}
            </span>
            <span style={{ fontSize: '0.9rem', color: '#86868b', fontWeight: 600 }}>kcal</span>
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<Flame size={18} />}
          style={{ background: 'linear-gradient(180deg, #f97316 0%, #ea580c 100%)', border: 'none' }}
        >
          Add to Daily Activity
        </Button>
      </form>
    </Modal>
  );
}
