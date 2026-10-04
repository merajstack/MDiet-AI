'use client';

import React from 'react';

interface CircularProgressProps {
  value: number;
  max: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  gradientStart?: string;
  gradientEnd?: string;
  children?: React.ReactNode;
}

export function CircularProgress({
  value,
  max,
  size = 140,
  strokeWidth = 12,
  color = '#0284c7',
  gradientStart = '#38bdf8',
  gradientEnd = '#0284c7',
  children,
}: CircularProgressProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const gradientId = `grad-${color.replace('#', '')}-${size}`;

  return (
    <div
      style={{
        position: 'relative',
        width: `${size}px`,
        height: `${size}px`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={size}
        height={size}
        style={{
          transform: 'rotate(-90deg)',
          transformOrigin: '50% 50%',
        }}
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={gradientStart} />
            <stop offset="100%" stopColor={gradientEnd} />
          </linearGradient>
        </defs>

        {/* Background Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="rgba(0, 0, 0, 0.06)"
          strokeWidth={strokeWidth}
          fill="transparent"
        />

        {/* Progress Value */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={`url(#${gradientId})`}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="transparent"
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </svg>

      {/* Center content */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
        }}
      >
        {children}
      </div>
    </div>
  );
}
