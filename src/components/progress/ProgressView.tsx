'use client';

import React, { useState } from 'react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { UserProfile, PersonalPlan, WeightEntry } from '@/types';
import {
  getAllFoodLogs,
  getAllExerciseLogs,
  getAllWaterLogs,
  getAllStepLogs,
  getWeightHistory,
} from '@/utils/storage';
import { getPastDates, formatFriendlyDate } from '@/utils/dateUtils';
import { Scale, TrendingDown, Flame, Utensils, Droplet, Footprints, Plus } from 'lucide-react';

interface ProgressViewProps {
  user: UserProfile;
  plan: PersonalPlan;
  onOpenWeightModal: () => void;
}

export function ProgressView({ user, plan, onOpenWeightModal }: ProgressViewProps) {
  const [timeframe, setTimeframe] = useState<7 | 30 | 90>(7);

  const pastDates = getPastDates(timeframe);
  const foodLogs = getAllFoodLogs();
  const exerciseLogs = getAllExerciseLogs();
  const waterLogs = getAllWaterLogs();
  const stepLogs = getAllStepLogs();
  const weightHistory = getWeightHistory();

  // Aggregate metrics over timeframe
  let totalCaloriesConsumed = 0;
  let totalCaloriesBurned = 0;
  let totalWaterMl = 0;
  let totalSteps = 0;
  let daysWithData = 0;

  const chartData = pastDates.map((dateStr) => {
    const dayFoods = foodLogs[dateStr] || [];
    const dayEx = exerciseLogs[dateStr] || [];
    const dayWater = waterLogs[dateStr]?.amountMl || 0;
    const daySteps = stepLogs[dateStr]?.steps || 0;

    const cals = dayFoods.reduce((acc, curr) => acc + curr.food.calories, 0);
    const burned = dayEx.reduce((acc, curr) => acc + curr.caloriesBurned, 0);

    if (cals > 0 || burned > 0 || dayWater > 0 || daySteps > 0) {
      daysWithData++;
    }

    totalCaloriesConsumed += cals;
    totalCaloriesBurned += burned;
    totalWaterMl += dayWater;
    totalSteps += daySteps;

    const weightEntry = weightHistory.find((w) => w.date === dateStr);

    return {
      date: dateStr,
      shortLabel: formatFriendlyDate(dateStr).slice(0, 3),
      calories: cals,
      burned,
      waterL: Number((dayWater / 1000).toFixed(1)),
      steps: daySteps,
      weightKg: weightEntry?.weightKg,
    };
  });

  const divisor = Math.max(1, daysWithData || 1);
  const avgCalories = Math.round(totalCaloriesConsumed / divisor);
  const avgBurned = Math.round(totalCaloriesBurned / divisor);
  const avgWater = Number((totalWaterMl / 1000 / divisor).toFixed(1));
  const avgSteps = Math.round(totalSteps / divisor);

  // Weight progress calculations
  const currentWeight = user.currentWeight;
  const targetWeight = user.targetWeight;
  const remainingDifference = Math.abs(currentWeight - targetWeight).toFixed(1);
  const isLoss = targetWeight < currentWeight;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      {/* Top Header & Timeframe Switcher */}
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
            Analytics & Progress
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#86868b' }}>
            Historical trends and adherence tracking
          </p>
        </div>

        {/* Timeframe pill selector */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#ffffff',
            border: '1px solid rgba(0, 0, 0, 0.08)',
            borderRadius: '999px',
            padding: '4px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}
        >
          {([7, 30, 90] as const).map((days) => (
            <button
              key={days}
              onClick={() => setTimeframe(days)}
              style={{
                padding: '6px 16px',
                fontSize: '0.84rem',
                fontWeight: 600,
                borderRadius: '999px',
                backgroundColor: timeframe === days ? '#0284c7' : 'transparent',
                color: timeframe === days ? '#ffffff' : '#6e6e73',
                boxShadow: timeframe === days ? '0 2px 6px rgba(2, 132, 199, 0.25)' : 'none',
              }}
            >
              {days} Days
            </button>
          ))}
        </div>
      </div>

      {/* Weight Summary Banner Card */}
      <Card style={{ padding: '24px 28px' }}>
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Scale size={24} color="#0284c7" />
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#0284c7', fontWeight: 600, textTransform: 'uppercase' }}>
                Weight Trajectory
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                <span style={{ fontSize: '2.2rem', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.03em' }}>
                  {currentWeight} kg
                </span>
                <span style={{ fontSize: '1rem', color: '#86868b', fontWeight: 500 }}>
                  Target: {targetWeight} kg
                </span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div
              style={{
                backgroundColor: '#fbfbfd',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                borderRadius: '16px',
                padding: '10px 18px',
                textAlign: 'right',
              }}
            >
              <div style={{ fontSize: '0.74rem', color: '#86868b', fontWeight: 600 }}>
                Remaining to Goal
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0284c7' }}>
                {remainingDifference} kg {isLoss ? 'to lose' : 'to gain'}
              </div>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={onOpenWeightModal}
              leftIcon={<Plus size={16} />}
            >
              Log Weight
            </Button>
          </div>
        </div>
      </Card>

      {/* Average Stats Grid */}
      <div
        className="mobile-grid-2"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
        }}
      >
        <Card style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#86868b', fontSize: '0.78rem', marginBottom: '6px' }}>
            <Utensils size={14} color="#0284c7" />
            <span>Avg Daily Intake</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#1d1d1f' }}>
            {avgCalories} <span style={{ fontSize: '0.85rem', color: '#86868b', fontWeight: 500 }}>kcal</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#0284c7', marginTop: '4px' }}>
            Target: {plan.dailyCalories} kcal
          </div>
        </Card>

        <Card style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#86868b', fontSize: '0.78rem', marginBottom: '6px' }}>
            <Flame size={14} color="#f97316" />
            <span>Avg Burned</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#f97316' }}>
            {avgBurned} <span style={{ fontSize: '0.85rem', color: '#86868b', fontWeight: 500 }}>kcal</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#86868b', marginTop: '4px' }}>
            Active movement
          </div>
        </Card>

        <Card style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#86868b', fontSize: '0.78rem', marginBottom: '6px' }}>
            <Droplet size={14} color="#0ea5e9" />
            <span>Avg Hydration</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0284c7' }}>
            {avgWater} <span style={{ fontSize: '0.85rem', color: '#86868b', fontWeight: 500 }}>L</span>
          </div>
          <div style={{ fontSize: '0.74rem', color: '#0284c7', marginTop: '4px' }}>
            Target: {plan.waterLiters} L
          </div>
        </Card>

        <Card style={{ padding: '18px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#86868b', fontSize: '0.78rem', marginBottom: '6px' }}>
            <Footprints size={14} color="#10b981" />
            <span>Avg Steps</span>
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#10b981' }}>
            {avgSteps.toLocaleString()}
          </div>
          <div style={{ fontSize: '0.74rem', color: '#10b981', marginTop: '4px' }}>
            Target: {plan.steps.toLocaleString()}
          </div>
        </Card>
      </div>

      {/* Apple-style SVG Calorie Trend Chart */}
      <Card className="mobile-card-padding" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1d1d1f' }}>
              Daily Calorie Intake vs Target
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#86868b' }}>
              Dotted line indicates your daily target ({plan.dailyCalories} kcal)
            </span>
          </div>
        </div>

        {/* Minimal Bar Chart */}
        <div
          style={{
            height: '200px',
            display: 'flex',
            alignItems: 'flex-end',
            gap: timeframe === 7 ? '14px' : '4px',
            paddingTop: '30px',
            position: 'relative',
            overflowX: 'auto',
          }}
        >
          {/* Target guideline */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: '30%',
              borderTop: '1.5px dashed rgba(2, 132, 199, 0.4)',
              pointerEvents: 'none',
              zIndex: 1,
            }}
          />

          {chartData.map((d, i) => {
            const maxVal = Math.max(plan.dailyCalories * 1.3, ...chartData.map((c) => c.calories), 2400);
            const heightPercent = Math.min(100, Math.round((d.calories / maxVal) * 100));
            const isOver = d.calories > plan.dailyCalories;

            return (
              <div
                key={d.date}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  title={`${d.date}: ${d.calories} kcal`}
                  style={{
                    width: '100%',
                    maxWidth: '44px',
                    height: `${Math.max(4, heightPercent)}%`,
                    backgroundColor: d.calories === 0 ? 'rgba(0,0,0,0.04)' : isOver ? '#fb7185' : '#38bdf8',
                    borderRadius: '8px 8px 4px 4px',
                    transition: 'height 0.4s ease',
                  }}
                />
                <span
                  style={{
                    fontSize: '0.7rem',
                    color: '#86868b',
                    marginTop: '8px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {timeframe === 7 ? d.shortLabel : i % 5 === 0 ? d.date.slice(5) : ''}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
