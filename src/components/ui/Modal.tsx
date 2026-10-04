'use client';

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = '520px',
}: ModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="modal-card"
        style={{
          maxWidth,
        }}
      >
        {/* iOS Drag Handle (Mobile only) */}
        <div
          className="visible-mobile-only"
          style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '8px',
            paddingBottom: '2px',
          }}
        >
          <div
            style={{
              width: '36px',
              height: '4px',
              borderRadius: '999px',
              backgroundColor: '#d1d1d6',
            }}
          />
        </div>

        {/* Header */}
        <div
          style={{
            padding: '16px 20px 14px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <div>
            {title && (
              <h2
                style={{
                  fontSize: '1.2rem',
                  fontWeight: 600,
                  letterSpacing: '-0.02em',
                  color: '#1d1d1f',
                }}
              >
                {title}
              </h2>
            )}
            {subtitle && (
              <p
                style={{
                  fontSize: '0.82rem',
                  color: '#6e6e73',
                  marginTop: '2px',
                }}
              >
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              backgroundColor: '#f4f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#6e6e73',
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
