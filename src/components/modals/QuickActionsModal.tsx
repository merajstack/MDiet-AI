'use client';

import React from 'react';
import { Modal } from '@/ui/Modal';
import { Camera, FileText, Droplet, Flame, Scale } from 'lucide-react';

interface QuickActionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAction: (
    action: 'camera_food' | 'manual_food' | 'water' | 'exercise' | 'weight'
  ) => void;
}

export function QuickActionsModal({
  isOpen,
  onClose,
  onSelectAction,
}: QuickActionsModalProps) {
  const actions = [
    {
      id: 'camera_food',
      title: 'Scan Food with Mdiet AI',
      subtitle: 'Snap a picture of your dish for instant vision recognition',
      icon: <Camera size={22} color="#0284c7" />,
      bgColor: '#f0f9ff',
      borderColor: '#bae6fd',
    },
    {
      id: 'manual_food',
      title: 'Describe Meal with Mdiet AI',
      subtitle: 'Natural language text — Mdiet AI calculates the breakdown',
      icon: <FileText size={22} color="#0284c7" />,
      bgColor: '#f0f9ff',
      borderColor: '#bae6fd',
    },
    {
      id: 'exercise',
      title: 'Log Activity',
      subtitle: 'Calculate workout burn (Walking, Gym, Running, etc.)',
      icon: <Flame size={22} color="#f97316" />,
      bgColor: '#fff7ed',
      borderColor: '#fed7aa',
    },
    {
      id: 'water',
      title: 'Add Water',
      subtitle: 'Quick log 250ml, 500ml, or custom amount',
      icon: <Droplet size={22} color="#0ea5e9" />,
      bgColor: '#f0fdf4',
      borderColor: '#bbf7d0',
    },
    {
      id: 'weight',
      title: 'Record Weight',
      subtitle: 'Log today\'s scale reading and track progress',
      icon: <Scale size={22} color="#6366f1" />,
      bgColor: '#eef2ff',
      borderColor: '#c7d2fe',
    },
  ] as const;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Quick Log"
      subtitle="What would you like to record?"
      maxWidth="460px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {actions.map((act) => (
          <button
            key={act.id}
            onClick={() => {
              onClose();
              onSelectAction(act.id);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              borderRadius: '18px',
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.06)',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.02)',
              textAlign: 'left',
              width: '100%',
              transition: 'all 0.16s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = act.bgColor;
              e.currentTarget.style.borderColor = act.borderColor;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff';
              e.currentTarget.style.borderColor = 'rgba(0, 0, 0, 0.06)';
            }}
          >
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '14px',
                backgroundColor: act.bgColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              {act.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.94rem', fontWeight: 600, color: '#1d1d1f' }}>
                {act.title}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#86868b', marginTop: '2px' }}>
                {act.subtitle}
              </div>
            </div>
          </button>
        ))}
      </div>
    </Modal>
  );
}
