'use client';

import React from 'react';
import { Card } from '@/ui/Card';

interface MacroPillsProps {
  proteinConsumed: number;
  proteinTarget: number;
  carbsConsumed: number;
  carbsTarget: number;
  fatConsumed: number;
  fatTarget: number;
}

export function MacroPills({
  proteinConsumed,
  proteinTarget,
  carbsConsumed,
  carbsTarget,
  fatConsumed,
  fatTarget,
}: MacroPillsProps) {
  const macros = [
    {
      name: 'Protein',
      consumed: proteinConsumed,
      target: proteinTarget,
      color: '#0284c7', // Sky blue
      bgColor: '#f0f9ff',
      tag: 'Build & Satiety',
    },
    {
      name: 'Carbs',
      consumed: carbsConsumed,
      target: carbsTarget,
      color: '#f59e0b', // Amber/Honey
      bgColor: '#fffbeb',
      tag: 'Energy',
    },
    {
      name: 'Fat',
      consumed: fatConsumed,
      target: fatTarget,
      color: '#ec4899', // Rose/Pink
      bgColor: '#fdf2f8',
      tag: 'Hormones',
    },
  ];

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
        gap: '12px',
        margin: '16px 0',
      }}
    >
      {macros.map((m) => {
        const pct = m.target > 0 ? Math.min(100, Math.round((m.consumed / m.target) * 100)) : 0;
        const remaining = Math.max(0, m.target - m.consumed);

        return (
          <Card key={m.name} className="mobile-card-padding" style={{ padding: '16px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '8px',
                gap: '4px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: m.color,
                    flexShrink: 0,
                  }}
                />
                <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#1d1d1f' }}>
                  {m.name}
                </span>
              </div>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 600,
                  backgroundColor: m.bgColor,
                  color: m.color,
                  padding: '2px 6px',
                  borderRadius: '999px',
                  whiteSpace: 'nowrap',
                }}
              >
                {remaining}g left
              </span>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: '5px',
                marginBottom: '10px',
              }}
            >
              <span
                style={{
                  fontSize: 'clamp(1.35rem, 4vw, 1.75rem)',
                  fontWeight: 700,
                  letterSpacing: '-0.03em',
                  color: '#1d1d1f',
                  lineHeight: 1,
                }}
              >
                {m.consumed}
              </span>
              <span style={{ fontSize: '0.84rem', color: '#86868b', fontWeight: 500 }}>
                / {m.target}g
              </span>
            </div>

            {/* Micro progress bar */}
            <div
              style={{
                width: '100%',
                height: '7px',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                borderRadius: '999px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${pct}%`,
                  height: '100%',
                  borderRadius: '999px',
                  backgroundColor: m.color,
                  transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
