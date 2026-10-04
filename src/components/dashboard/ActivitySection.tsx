'use client';

import React from 'react';
import { Card } from '@/ui/Card';
import { Flame, Plus, Trash2, Clock } from 'lucide-react';
import { ExerciseEntry } from '@/types';
import { deleteExerciseEntry } from '@/utils/storage';

interface ActivitySectionProps {
  currentDate: string;
  exercises: ExerciseEntry[];
  totalCaloriesBurned: number;
  onOpenAddModal: () => void;
  onExerciseUpdated: () => void;
}

export function ActivitySection({
  currentDate,
  exercises,
  totalCaloriesBurned,
  onOpenAddModal,
  onExerciseUpdated,
}: ActivitySectionProps) {
  const handleDelete = (id: string) => {
    if (confirm('Delete this exercise entry?')) {
      deleteExerciseEntry(currentDate, id);
      onExerciseUpdated();
    }
  };

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
              backgroundColor: '#fff7ed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Flame size={18} color="#f97316" />
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
              Activity & Workouts
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#86868b' }}>
              Physical energy expenditure
            </span>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#f97316',
            backgroundColor: '#fff7ed',
            padding: '6px 12px',
            borderRadius: '999px',
          }}
        >
          <Plus size={14} />
          <span>Add Activity</span>
        </button>
      </div>

      {/* Burned Headline */}
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '8px',
          marginBottom: '16px',
        }}
      >
        <span
          style={{
            fontSize: '2rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#f97316',
            lineHeight: 1,
          }}
        >
          {totalCaloriesBurned.toLocaleString()}
        </span>
        <span style={{ fontSize: '0.92rem', color: '#86868b', fontWeight: 500 }}>
          kcal burned today
        </span>
      </div>

      {/* Exercise Entries List */}
      {exercises.length === 0 ? (
        <div
          style={{
            padding: '24px 16px',
            backgroundColor: '#fbfbfd',
            borderRadius: '16px',
            border: '1px dashed rgba(0, 0, 0, 0.08)',
            textAlign: 'center',
          }}
        >
          <p style={{ fontSize: '0.86rem', color: '#86868b' }}>
            No workouts logged for this day yet.
          </p>
          <button
            onClick={onOpenAddModal}
            style={{
              marginTop: '8px',
              fontSize: '0.82rem',
              color: '#f97316',
              fontWeight: 600,
            }}
          >
            + Log your first workout
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {exercises.map((item) => (
            <div
              key={item.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 14px',
                backgroundColor: '#fbfbfd',
                borderRadius: '14px',
                border: '1px solid rgba(0, 0, 0, 0.04)',
              }}
            >
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#1d1d1f' }}>
                  {item.activityType}
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    fontSize: '0.76rem',
                    color: '#86868b',
                    marginTop: '2px',
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                    <Clock size={12} />
                    {item.durationMinutes} mins
                  </span>
                  {item.distanceKm && <span>{item.distanceKm} km</span>}
                  <span
                    style={{
                      textTransform: 'capitalize',
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      padding: '1px 6px',
                      borderRadius: '999px',
                    }}
                  >
                    {item.intensity} intensity
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f97316' }}>
                  -{item.caloriesBurned} kcal
                </span>
                <button
                  onClick={() => handleDelete(item.id)}
                  aria-label="Delete exercise"
                  style={{
                    color: '#aeaeb2',
                    padding: '4px',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
