'use client';

import React, { useState } from 'react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { PersonalPlan } from '@/types';
import { Check, Sparkles, ArrowRight, Droplet, Footprints, Flame } from 'lucide-react';

interface PlanSelectionProps {
  plans: PersonalPlan[];
  onSelectPlan: (plan: PersonalPlan) => void;
  userName?: string;
  isRecalculate?: boolean;
}

export function PlanSelection({
  plans,
  onSelectPlan,
  userName = 'there',
  isRecalculate = false,
}: PlanSelectionProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string>(plans[0]?.id || '');

  const chosenPlan = plans.find((p) => p.id === selectedPlanId) || plans[0];

  return (
    <div
      style={{
        maxWidth: '820px',
        margin: '0 auto',
        padding: '32px 16px',
      }}
      className="animate-fade-in"
    >
      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '999px',
            padding: '4px 12px',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: '#0284c7',
            marginBottom: '12px',
          }}
        >
          <Sparkles size={14} />
          <span>Mdiet AI Nutrition Strategy</span>
        </div>
        <h1
          style={{
            fontSize: 'clamp(1.4rem, 4.5vw, 2rem)',
            fontWeight: 800,
            letterSpacing: '-0.035em',
            color: '#1d1d1f',
          }}
        >
          {isRecalculate ? 'Updated Recommendations' : `Tailored Plans for You, ${userName}`}
        </h1>
        <p
          style={{
            fontSize: '1rem',
            color: '#6e6e73',
            maxWidth: '540px',
            margin: '8px auto 0 auto',
          }}
        >
          Select the strategic framework that fits your lifestyle. You can always adjust this later in settings.
        </p>
      </div>

      {/* Plan Cards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '20px',
          marginBottom: '32px',
        }}
      >
        {plans.map((plan) => {
          const isSelected = selectedPlanId === plan.id;

          return (
            <div
              key={plan.id}
              onClick={() => setSelectedPlanId(plan.id)}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '24px',
                border: isSelected ? '2px solid #0284c7' : '1px solid rgba(0, 0, 0, 0.08)',
                boxShadow: isSelected
                  ? '0 12px 32px rgba(2, 132, 199, 0.16)'
                  : '0 2px 8px rgba(0, 0, 0, 0.04)',
                padding: '24px 20px',
                cursor: 'pointer',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                transform: isSelected ? 'scale(1.02)' : 'scale(1)',
              }}
            >
              {isSelected && (
                <div
                  style={{
                    position: 'absolute',
                    top: '16px',
                    right: '16px',
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: '#0284c7',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Check size={14} />
                </div>
              )}

              <div>
                <h3
                  style={{
                    fontSize: '1.2rem',
                    fontWeight: 700,
                    letterSpacing: '-0.02em',
                    color: '#1d1d1f',
                    marginBottom: '6px',
                    paddingRight: isSelected ? '28px' : '0',
                  }}
                >
                  {plan.name}
                </h3>
                <p
                  style={{
                    fontSize: '0.82rem',
                    color: '#6e6e73',
                    lineHeight: 1.4,
                    minHeight: '40px',
                    marginBottom: '16px',
                  }}
                >
                  {plan.description}
                </p>

                {/* Calorie Headline */}
                <div
                  style={{
                    backgroundColor: isSelected ? '#f0f9ff' : '#fbfbfd',
                    borderRadius: '16px',
                    padding: '14px',
                    marginBottom: '16px',
                    textAlign: 'center',
                    border: '1px solid rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <div
                    style={{
                      fontSize: '1.9rem',
                      fontWeight: 800,
                      color: isSelected ? '#0284c7' : '#1d1d1f',
                      letterSpacing: '-0.03em',
                      lineHeight: 1,
                    }}
                  >
                    {plan.dailyCalories.toLocaleString()}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#86868b', fontWeight: 600, marginTop: '2px' }}>
                    kcal / day
                  </div>
                </div>

                {/* Macro Target Pills */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(3, 1fr)',
                    gap: '6px',
                    marginBottom: '16px',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ backgroundColor: '#f0f9ff', padding: '6px 4px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#0284c7', fontWeight: 600 }}>Protein</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1d1d1f' }}>{plan.protein}g</div>
                  </div>
                  <div style={{ backgroundColor: '#fffbeb', padding: '6px 4px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#d97706', fontWeight: 600 }}>Carbs</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1d1d1f' }}>{plan.carbs}g</div>
                  </div>
                  <div style={{ backgroundColor: '#fdf2f8', padding: '6px 4px', borderRadius: '10px' }}>
                    <div style={{ fontSize: '0.7rem', color: '#ec4899', fontWeight: 600 }}>Fat</div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#1d1d1f' }}>{plan.fat}g</div>
                  </div>
                </div>

                {/* Daily Habits */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem', color: '#52525b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Droplet size={15} color="#0ea5e9" />
                    <span>{plan.waterLiters}L water daily</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Footprints size={15} color="#10b981" />
                    <span>{plan.steps.toLocaleString()} steps / day</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Flame size={15} color="#f97316" />
                    <span>Estimated: {plan.estimatedWeeklyChange}</span>
                  </div>
                </div>
              </div>

              {/* Selection button */}
              <div style={{ marginTop: '20px' }}>
                <Button
                  variant={isSelected ? 'primary' : 'secondary'}
                  size="md"
                  fullWidth
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectPlan(plan);
                  }}
                  rightIcon={<ArrowRight size={15} />}
                >
                  {isSelected ? 'Select This Plan →' : 'Choose Plan'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center' }}>
        <Button
          variant="primary"
          size="lg"
          onClick={() => onSelectPlan(chosenPlan)}
          rightIcon={<ArrowRight size={18} />}
          style={{ minWidth: '220px' }}
        >
          Confirm & Begin →
        </Button>
      </div>
    </div>
  );
}
