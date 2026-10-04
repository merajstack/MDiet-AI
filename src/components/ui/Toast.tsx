'use client';

import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export function Toast({ toast, onClose }: ToastProps) {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} color="#10b981" />;
      case 'error':
        return <AlertCircle size={18} color="#ef4444" />;
      case 'info':
      default:
        return <Info size={18} color="#0284c7" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 10000,
        backgroundColor: '#ffffff',
        border: '1px solid rgba(0, 0, 0, 0.08)',
        borderRadius: '999px',
        padding: '10px 18px 10px 14px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        boxShadow: '0 12px 32px rgba(0, 0, 0, 0.12), 0 2px 6px rgba(0, 0, 0, 0.04)',
        animation: 'slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        maxWidth: '90vw',
      }}
    >
      {getIcon()}
      <span
        style={{
          fontSize: '0.88rem',
          fontWeight: 500,
          color: '#1d1d1f',
        }}
      >
        {toast.message}
      </span>
      <button
        onClick={onClose}
        style={{
          color: '#86868b',
          marginLeft: '4px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}
