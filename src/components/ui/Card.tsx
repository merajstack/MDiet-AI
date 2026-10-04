'use client';

import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  variant?: 'default' | 'subtle' | 'interactive' | 'highlight';
  className?: string;
}

export function Card({
  children,
  variant = 'default',
  className = '',
  style,
  ...props
}: CardProps) {
  let baseStyles: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: '24px',
    border: '1px solid rgba(0, 0, 0, 0.06)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03), 0 1px 2px rgba(0, 0, 0, 0.02)',
    padding: '24px',
    position: 'relative',
    overflow: 'hidden',
    transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
    ...style,
  };

  if (variant === 'subtle') {
    baseStyles.background = '#fbfbfd';
    baseStyles.boxShadow = 'none';
  } else if (variant === 'highlight') {
    baseStyles.background = '#ffffff';
    baseStyles.border = '1.5px solid #0284c7';
    baseStyles.boxShadow = '0 8px 24px rgba(2, 132, 199, 0.12)';
  } else if (variant === 'interactive') {
    baseStyles.cursor = 'pointer';
  }

  return (
    <div
      style={baseStyles}
      className={`apple-card ${variant === 'interactive' ? 'apple-card-interactive' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
