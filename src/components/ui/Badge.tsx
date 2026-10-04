'use client';

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'sky' | 'emerald' | 'amber' | 'rose' | 'neutral';
  size?: 'sm' | 'md';
}

export function Badge({ children, variant = 'sky', size = 'sm' }: BadgeProps) {
  const getStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'sky':
        return {
          background: '#f0f9ff',
          color: '#0284c7',
          border: '1px solid #bae6fd',
        };
      case 'emerald':
        return {
          background: '#ecfdf5',
          color: '#059669',
          border: '1px solid #a7f3d0',
        };
      case 'amber':
        return {
          background: '#fffbeb',
          color: '#d97706',
          border: '1px solid #fde68a',
        };
      case 'rose':
        return {
          background: '#fff1f2',
          color: '#e11d48',
          border: '1px solid #fecdd3',
        };
      case 'neutral':
      default:
        return {
          background: '#f4f4f6',
          color: '#52525b',
          border: '1px solid #e4e4e7',
        };
    }
  };

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: size === 'sm' ? '0.75rem' : '0.82rem',
        fontWeight: 600,
        padding: size === 'sm' ? '3px 8px' : '4px 12px',
        borderRadius: '999px',
        letterSpacing: '0.01em',
        ...getStyles(),
      }}
    >
      {children}
    </span>
  );
}
