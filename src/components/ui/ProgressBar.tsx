'use client';

import React from 'react';

interface ProgressBarProps {
  value: number; // current value
  max: number; // max target
  color?: string;
  gradient?: string;
  height?: number;
  label?: string;
  unit?: string;
  showPercent?: boolean;
}

export function ProgressBar({
  value,
  max,
  color = '#0284c7',
  gradient,
  height = 8,
  label,
  unit = '',
  showPercent = false,
}: ProgressBarProps) {
  const percentage = max > 0 ? Math.min(100, Math.max(0, Math.round((value / max) * 100))) : 0;

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercent) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '6px',
            fontSize: '0.84rem',
          }}
        >
          {label && (
            <span style={{ fontWeight: 600, color: '#1d1d1f' }}>
              {label}
            </span>
          )}
          <span style={{ color: '#6e6e73', fontWeight: 500 }}>
            {value} / {max} {unit} {showPercent && `(${percentage}%)`}
          </span>
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: `${height}px`,
          backgroundColor: 'rgba(0, 0, 0, 0.06)',
          borderRadius: '999px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          style={{
            width: `${percentage}%`,
            height: '100%',
            borderRadius: '999px',
            background: gradient || color,
            transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </div>
    </div>
  );
}
