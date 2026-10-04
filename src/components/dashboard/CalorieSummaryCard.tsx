'use client';

import React from 'react';
import { Card } from '@/ui/Card';
import { calculateDailyCalorieSummary } from '@/utils/calculations';
import { Flame, Utensils, Zap, Plus } from 'lucide-react';

interface CalorieSummaryCardProps {
  targetCalories: number;
  consumedCalories: number;
  burnedCalories: number;
  onAddFood: () => void;
  onAddExercise: () => void;
}

export function CalorieSummaryCard({
  targetCalories,
  consumedCalories,
  burnedCalories,
  onAddFood,
  onAddExercise,
}: CalorieSummaryCardProps) {
  const summary = calculateDailyCalorieSummary(
    targetCalories,
    consumedCalories,
    burnedCalories
  );

  return (
    <Card className="mobile-card-padding" style={{ padding: '28px 24px' }}>
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '14px',
          marginBottom: '20px',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '0.82rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#0284c7',
              marginBottom: '4px',
            }}
          >
            Today's Calories
          </div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', flexWrap: 'wrap' }}>
            <span
              style={{
                fontSize: 'clamp(1.9rem, 6vw, 2.5rem)',
                fontWeight: 700,
                letterSpacing: '-0.04em',
                color: '#1d1d1f',
                lineHeight: 1,
              }}
            >
              {consumedCalories.toLocaleString()}
            </span>
            <span
              style={{
                fontSize: 'clamp(1rem, 3.5vw, 1.25rem)',
                fontWeight: 500,
                color: '#86868b',
              }}
            >
              / {targetCalories.toLocaleString()} kcal
            </span>
          </div>
        </div>

        {/* Remaining Calories Pill */}
        <div
          style={{
            backgroundColor: summary.isOverBudget ? '#fff1f2' : '#f0f9ff',
            border: `1.5px solid ${summary.isOverBudget ? '#fecdd3' : '#bae6fd'}`,
            borderRadius: '16px',
            padding: '8px 14px',
            textAlign: 'right',
          }}
        >
          <div
            style={{
              fontSize: '0.74rem',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: summary.isOverBudget ? '#e11d48' : '#0369a1',
            }}
          >
            {summary.isOverBudget ? 'Over Budget' : 'Remaining'}
          </div>
          <div
            style={{
              fontSize: 'clamp(1.15rem, 4vw, 1.4rem)',
              fontWeight: 700,
              color: summary.isOverBudget ? '#e11d48' : '#0284c7',
              letterSpacing: '-0.02em',
            }}
          >
            {Math.abs(summary.remainingCalories).toLocaleString()} kcal
          </div>
        </div>
      </div>

      {/* Animated Calorie Progress Bar */}
      <div style={{ marginBottom: '20px' }}>
        <div
          style={{
            width: '100%',
            height: '14px',
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
            borderRadius: '999px',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          <div
            style={{
              width: `${Math.min(100, summary.percentage)}%`,
              height: '100%',
              borderRadius: '999px',
              background: summary.isOverBudget
                ? 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)'
                : 'linear-gradient(90deg, #38bdf8 0%, #0284c7 100%)',
              transition: 'width 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          />
        </div>
      </div>

      {/* Deterministic Dynamic Math Breakdown */}
      <div
        className="mobile-grid-2"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          paddingTop: '16px',
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
        }}
      >
        {/* Daily Target */}
        <div
          style={{
            backgroundColor: '#fbfbfd',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            borderRadius: '16px',
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#86868b',
              fontSize: '0.78rem',
              fontWeight: 500,
              marginBottom: '4px',
            }}
          >
            <Zap size={14} color="#0284c7" />
            <span>Target</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1d1d1f' }}>
            {targetCalories.toLocaleString()}
          </div>
        </div>

        {/* Food Consumed */}
        <div
          style={{
            backgroundColor: '#fbfbfd',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            borderRadius: '16px',
            padding: '12px 14px',
            cursor: 'pointer',
          }}
          onClick={onAddFood}
          title="Click to add food"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#86868b',
                fontSize: '0.78rem',
                fontWeight: 500,
              }}
            >
              <Utensils size={14} color="#0ea5e9" />
              <span>Food</span>
            </div>
            <Plus size={12} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0284c7' }}>
            +{consumedCalories.toLocaleString()}
          </div>
        </div>

        {/* Exercise Burned */}
        <div
          style={{
            backgroundColor: '#fbfbfd',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            borderRadius: '16px',
            padding: '12px 14px',
            cursor: 'pointer',
          }}
          onClick={onAddExercise}
          title="Click to add exercise"
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '4px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: '#86868b',
                fontSize: '0.78rem',
                fontWeight: 500,
              }}
            >
              <Flame size={14} color="#f97316" />
              <span>Burned</span>
            </div>
            <Plus size={12} color="#f97316" />
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f97316' }}>
            -{burnedCalories.toLocaleString()}
          </div>
        </div>

        {/* Net Calories */}
        <div
          style={{
            backgroundColor: '#fbfbfd',
            border: '1px solid rgba(0, 0, 0, 0.04)',
            borderRadius: '16px',
            padding: '12px 14px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#86868b',
              fontSize: '0.78rem',
              fontWeight: 500,
              marginBottom: '4px',
            }}
          >
            <span>Net Calories</span>
          </div>
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1d1d1f' }}>
            {summary.netCalories.toLocaleString()}
          </div>
        </div>
      </div>
    </Card>
  );
}
