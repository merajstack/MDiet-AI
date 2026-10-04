'use client';

import React, { useState } from 'react';
import { Card } from '@/ui/Card';
import { CircularProgress } from '@/ui/CircularProgress';
import { Footprints, Edit3, Check } from 'lucide-react';
import { calculateStepMetrics } from '@/utils/calculations';
import { StepLog } from '@/types';
import { saveStepLog } from '@/utils/storage';

interface StepTrackerProps {
  currentDate: string;
  stepLog: StepLog;
  userHeightCm?: number;
  userWeightKg?: number;
  onStepsUpdated: () => void;
}

export function StepTracker({
  currentDate,
  stepLog,
  userHeightCm = 175,
  userWeightKg = 75,
  onStepsUpdated,
}: StepTrackerProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [stepInputValue, setStepInputValue] = useState(stepLog.steps.toString());

  const { distanceKm, caloriesBurned } = calculateStepMetrics(
    stepLog.steps,
    userHeightCm,
    userWeightKg
  );

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const parsed = parseInt(stepInputValue, 10);
    const validSteps = isNaN(parsed) ? 0 : Math.max(0, parsed);

    const metrics = calculateStepMetrics(validSteps, userHeightCm, userWeightKg);

    const updated: StepLog = {
      date: currentDate,
      steps: validSteps,
      target: stepLog.target || 10000,
      distanceKm: metrics.distanceKm,
      caloriesBurned: metrics.caloriesBurned,
    };

    saveStepLog(updated);
    setIsEditing(false);
    onStepsUpdated();
  };

  const percentage = Math.min(
    100,
    Math.round((stepLog.steps / (stepLog.target || 10000)) * 100)
  );

  return (
    <Card className="mobile-card-padding" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#ecfdf5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Footprints size={18} color="#10b981" />
          </div>
          <div>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 600,
                color: '#1d1d1f',
                letterSpacing: '-0.015em',
              }}
            >
              Daily Steps
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#86868b' }}>
              Movement & ambulation
            </span>
          </div>
        </div>

        <button
          onClick={() => {
            if (isEditing) {
              handleSave();
            } else {
              setStepInputValue(stepLog.steps.toString());
              setIsEditing(true);
            }
          }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#10b981',
            backgroundColor: '#ecfdf5',
            padding: '4px 10px',
            borderRadius: '999px',
          }}
        >
          {isEditing ? <Check size={14} /> : <Edit3 size={14} />}
          <span>{isEditing ? 'Save' : 'Update'}</span>
        </button>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '24px',
        }}
      >
        {/* Animated Circular Ring */}
        <div style={{ flexShrink: 0 }}>
          <CircularProgress
            value={stepLog.steps}
            max={stepLog.target || 10000}
            size={110}
            strokeWidth={10}
            color="#10b981"
            gradientStart="#34d399"
            gradientEnd="#059669"
          >
            <div style={{ textAlign: 'center' }}>
              <div
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: '#1d1d1f',
                  lineHeight: 1,
                }}
              >
                {percentage}%
              </div>
              <div style={{ fontSize: '0.68rem', color: '#86868b', marginTop: '2px' }}>
                Goal
              </div>
            </div>
          </CircularProgress>
        </div>

        {/* Numbers & Editing field */}
        <div style={{ flex: 1 }}>
          {isEditing ? (
            <form onSubmit={handleSave} style={{ marginBottom: '8px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  color: '#6e6e73',
                  marginBottom: '4px',
                }}
              >
                Enter steps for {currentDate}:
              </label>
              <input
                type="number"
                value={stepInputValue}
                onChange={(e) => setStepInputValue(e.target.value)}
                autoFocus
                style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  padding: '6px 12px',
                  borderRadius: '10px',
                  width: '100%',
                }}
              />
            </form>
          ) : (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
              <span
                style={{
                  fontSize: '1.9rem',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#1d1d1f',
                  lineHeight: 1,
                }}
              >
                {stepLog.steps.toLocaleString()}
              </span>
              <span style={{ fontSize: '0.95rem', color: '#86868b', fontWeight: 500 }}>
                / {(stepLog.target || 10000).toLocaleString()}
              </span>
            </div>
          )}

          {/* Deterministic distance & calories derived from height & weight */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              marginTop: '10px',
              paddingTop: '10px',
              borderTop: '1px solid rgba(0, 0, 0, 0.05)',
            }}
          >
            <div>
              <div style={{ fontSize: '0.72rem', color: '#86868b' }}>Distance</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1d1d1f' }}>
                {distanceKm} km
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.72rem', color: '#86868b' }}>Energy</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#10b981' }}>
                ~{caloriesBurned} kcal
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
