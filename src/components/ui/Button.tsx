'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  style,
  ...props
}: ButtonProps) {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'primary':
        return {
          background: 'linear-gradient(180deg, #0ea5e9 0%, #0284c7 100%)',
          color: '#ffffff',
          boxShadow: '0 2px 8px rgba(2, 132, 199, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          border: '1px solid rgba(2, 132, 199, 0.4)',
        };
      case 'secondary':
        return {
          background: '#f0f0f4',
          color: '#1d1d1f',
          border: '1px solid rgba(0, 0, 0, 0.04)',
        };
      case 'outline':
        return {
          background: '#ffffff',
          color: '#0284c7',
          border: '1.5px solid #0284c7',
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: '#6e6e73',
          border: 'none',
        };
      case 'danger':
        return {
          background: '#fee2e2',
          color: '#ef4444',
          border: '1px solid #fca5a5',
        };
    }
  };

  const getSizeStyles = (): React.CSSProperties => {
    switch (size) {
      case 'sm':
        return {
          padding: '6px 14px',
          fontSize: '0.84rem',
          borderRadius: '999px',
          fontWeight: 500,
        };
      case 'md':
        return {
          padding: '10px 20px',
          fontSize: '0.94rem',
          borderRadius: '999px',
          fontWeight: 600,
        };
      case 'lg':
        return {
          padding: '14px 28px',
          fontSize: '1.05rem',
          borderRadius: '999px',
          fontWeight: 600,
          letterSpacing: '-0.01em',
        };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.5 : 1,
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        ...getSizeStyles(),
        ...getVariantStyles(),
        ...style,
      }}
      className={className}
      {...props}
    >
      {isLoading ? <Loader2 size={16} className="animate-spin" /> : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
}
