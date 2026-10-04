'use client';

import React from 'react';
import { FoodLogEntry, MealType } from '@/types';
import { MealsTimeline } from '../dashboard/MealsTimeline';
import { Button } from '@/ui/Button';
import { Card } from '@/ui/Card';
import { Camera, FileText } from 'lucide-react';

interface FoodViewProps {
  currentDate: string;
  foodLogs: FoodLogEntry[];
  onOpenScanModal: (mealType?: MealType) => void;
  onOpenManualModal: (mealType?: MealType) => void;
  onLogsUpdated: () => void;
}

export function FoodView({
  currentDate,
  foodLogs,
  onOpenScanModal,
  onOpenManualModal,
  onLogsUpdated,
}: FoodViewProps) {
  const totalCals = foodLogs.reduce((acc, curr) => acc + curr.food.calories, 0);
  const totalProt = foodLogs.reduce((acc, curr) => acc + curr.food.protein, 0);
  const totalCarbs = foodLogs.reduce((acc, curr) => acc + curr.food.carbs, 0);
  const totalFat = foodLogs.reduce((acc, curr) => acc + curr.food.fat, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }} className="animate-fade-in">
      {/* Header and Quick Buttons */}
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
            Nutrition & Meals
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#86868b' }}>
            {totalCals.toLocaleString()} kcal logged for today
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="primary"
            size="md"
            onClick={() => onOpenScanModal()}
            leftIcon={<Camera size={18} />}
          >
            Scan with Mdiet AI
          </Button>

          <Button
            variant="secondary"
            size="md"
            onClick={() => onOpenManualModal()}
            leftIcon={<FileText size={18} />}
          >
            Describe with Mdiet AI
          </Button>
        </div>
      </div>

      {/* Summary Macro Cards */}
      <div
        className="mobile-grid-2"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '12px',
        }}
      >
        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#86868b', fontWeight: 600 }}>Total Calories</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1d1d1f', marginTop: '2px' }}>
            {totalCals.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#86868b' }}>kcal</span>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>Protein</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0284c7', marginTop: '2px' }}>
            {totalProt} <span style={{ fontSize: '0.8rem', color: '#86868b' }}>g</span>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 600 }}>Carbs</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#d97706', marginTop: '2px' }}>
            {totalCarbs} <span style={{ fontSize: '0.8rem', color: '#86868b' }}>g</span>
          </div>
        </Card>

        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.74rem', color: '#ec4899', fontWeight: 600 }}>Fat</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ec4899', marginTop: '2px' }}>
            {totalFat} <span style={{ fontSize: '0.8rem', color: '#86868b' }}>g</span>
          </div>
        </Card>
      </div>

      {/* Meals Timeline */}
      <MealsTimeline
        currentDate={currentDate}
        foodLogs={foodLogs}
        onAddFood={(mealType) => onOpenScanModal(mealType)}
        onLogsUpdated={onLogsUpdated}
      />
    </div>
  );
}
