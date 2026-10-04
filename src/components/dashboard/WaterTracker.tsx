'use client';

import React, { useState } from 'react';
import { Card } from '@/ui/Card';
import { Droplet, Plus, RotateCcw } from 'lucide-react';
import { addWaterIntake, resetWaterForDate } from '@/utils/storage';

interface WaterTrackerProps {
  currentDate: string;
  amountMl: number;
  targetMl: number;
  onWaterUpdated: () => void;
}

export function WaterTracker({
  currentDate,
  amountMl,
  targetMl,
  onWaterUpdated,
}: WaterTrackerProps) {
  const [unit, setUnit] = useState<'L' | 'ml'>('L');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customMl, setCustomMl] = useState('');

  const targetL = targetMl / 1000;
  const currentL = amountMl / 1000;
  const percentage = Math.min(100, Math.round((amountMl / (targetMl || 2500)) * 100));

  const handleAdd = (ml: number) => {
    addWaterIntake(currentDate, ml, targetL);
    onWaterUpdated();
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseInt(customMl, 10);
    if (!isNaN(val) && val > 0) {
      handleAdd(val);
      setCustomMl('');
      setShowCustomInput(false);
    }
  };

  const handleReset = () => {
    if (confirm('Reset water intake for this day?')) {
      resetWaterForDate(currentDate, targetL);
      onWaterUpdated();
    }
  };

  const displayAmount =
    unit === 'L'
      ? `${currentL.toFixed(1)}L / ${targetL.toFixed(1)}L`
      : `${amountMl.toLocaleString()}ml / ${targetMl.toLocaleString()}ml`;

  return (
    <Card className="mobile-card-padding" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '18px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              backgroundColor: '#e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Droplet size={18} color="#0284c7" />
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
              Hydration
            </h3>
            <span style={{ fontSize: '0.78rem', color: '#86868b' }}>
              Daily cellular water intake
            </span>
          </div>
        </div>

        {/* Unit Toggle & Reset */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              backgroundColor: '#f4f4f6',
              borderRadius: '999px',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setUnit('L')}
              style={{
                padding: '4px 10px',
                fontSize: '0.76rem',
                fontWeight: 600,
                borderRadius: '999px',
                backgroundColor: unit === 'L' ? '#ffffff' : 'transparent',
                color: unit === 'L' ? '#0284c7' : '#6e6e73',
                boxShadow: unit === 'L' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              L
            </button>
            <button
              onClick={() => setUnit('ml')}
              style={{
                padding: '4px 10px',
                fontSize: '0.76rem',
                fontWeight: 600,
                borderRadius: '999px',
                backgroundColor: unit === 'ml' ? '#ffffff' : 'transparent',
                color: unit === 'ml' ? '#0284c7' : '#6e6e73',
                boxShadow: unit === 'ml' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              ml
            </button>
          </div>

          <button
            onClick={handleReset}
            title="Reset today's water"
            style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#86868b',
              backgroundColor: '#f4f4f6',
            }}
          >
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '24px',
          marginBottom: '20px',
        }}
      >
        {/* Animated Water Reservoir Glass */}
        <div
          style={{
            width: '74px',
            height: '110px',
            borderRadius: '16px 16px 22px 22px',
            border: '2.5px solid #bae6fd',
            backgroundColor: '#f0f9ff',
            position: 'relative',
            overflow: 'hidden',
            flexShrink: 0,
            boxShadow: 'inset 0 2px 6px rgba(2, 132, 199, 0.12)',
          }}
        >
          {/* Water Fluid Level */}
          <div
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              height: `${percentage}%`,
              background: 'linear-gradient(180deg, #38bdf8 0%, #0284c7 100%)',
              transition: 'height 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}
          >
            {/* Top liquid wave ripple reflection */}
            <div
              style={{
                width: '100%',
                height: '6px',
                background: 'rgba(255, 255, 255, 0.45)',
                filter: 'blur(1px)',
              }}
            />
          </div>

          {/* Measuring lines */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              padding: '10px 4px',
              pointerEvents: 'none',
              opacity: 0.35,
            }}
          >
            <div style={{ width: '8px', height: '1px', background: '#0284c7' }} />
            <div style={{ width: '12px', height: '1px', background: '#0284c7' }} />
            <div style={{ width: '8px', height: '1px', background: '#0284c7' }} />
          </div>
        </div>

        {/* Big numbers & percent */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '1.9rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#1d1d1f',
              lineHeight: 1.1,
            }}
          >
            {displayAmount}
          </div>
          <div
            style={{
              fontSize: '0.84rem',
              color: '#0284c7',
              fontWeight: 600,
              marginTop: '4px',
            }}
          >
            {percentage}% of daily goal
          </div>
          <div
            style={{
              fontSize: '0.8rem',
              color: '#6e6e73',
              marginTop: '4px',
            }}
          >
            {amountMl >= targetMl
              ? '🎉 Daily hydration target accomplished!'
              : `${((targetMl - amountMl) / 1000).toFixed(1)}L remaining to optimal hydration`}
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '8px',
          marginBottom: '10px',
        }}
      >
        <button
          onClick={() => handleAdd(250)}
          style={{
            padding: '8px 4px',
            borderRadius: '12px',
            backgroundColor: '#f0f9ff',
            color: '#0284c7',
            border: '1px solid #bae6fd',
            fontSize: '0.84rem',
            fontWeight: 600,
          }}
        >
          +250ml
        </button>
        <button
          onClick={() => handleAdd(500)}
          style={{
            padding: '8px 4px',
            borderRadius: '12px',
            backgroundColor: '#f0f9ff',
            color: '#0284c7',
            border: '1px solid #bae6fd',
            fontSize: '0.84rem',
            fontWeight: 600,
          }}
        >
          +500ml
        </button>
        <button
          onClick={() => handleAdd(750)}
          style={{
            padding: '8px 4px',
            borderRadius: '12px',
            backgroundColor: '#f0f9ff',
            color: '#0284c7',
            border: '1px solid #bae6fd',
            fontSize: '0.84rem',
            fontWeight: 600,
          }}
        >
          +750ml
        </button>
        <button
          onClick={() => handleAdd(1000)}
          style={{
            padding: '8px 4px',
            borderRadius: '12px',
            backgroundColor: '#0284c7',
            color: '#ffffff',
            border: '1px solid #0284c7',
            fontSize: '0.84rem',
            fontWeight: 600,
            boxShadow: '0 2px 6px rgba(2, 132, 199, 0.25)',
          }}
        >
          +1 L
        </button>
      </div>

      {/* Custom Amount Expander */}
      {!showCustomInput ? (
        <button
          onClick={() => setShowCustomInput(true)}
          style={{
            fontSize: '0.78rem',
            color: '#6e6e73',
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            marginTop: '6px',
          }}
        >
          <Plus size={14} />
          <span>Add custom amount</span>
        </button>
      ) : (
        <form
          onSubmit={handleCustomSubmit}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginTop: '8px',
          }}
        >
          <input
            type="number"
            placeholder="e.g. 350"
            value={customMl}
            onChange={(e) => setCustomMl(e.target.value)}
            autoFocus
            style={{
              padding: '6px 12px',
              fontSize: '0.84rem',
              borderRadius: '10px',
              flex: 1,
            }}
          />
          <span style={{ fontSize: '0.8rem', color: '#6e6e73', fontWeight: 600 }}>ml</span>
          <button
            type="submit"
            style={{
              padding: '6px 14px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              borderRadius: '10px',
              fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            Add
          </button>
          <button
            type="button"
            onClick={() => setShowCustomInput(false)}
            style={{
              padding: '6px 10px',
              color: '#86868b',
              fontSize: '0.82rem',
            }}
          >
            Cancel
          </button>
        </form>
      )}
    </Card>
  );
}
