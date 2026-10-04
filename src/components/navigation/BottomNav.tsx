'use client';

import React from 'react';
import { LayoutDashboard, UtensilsCrossed, Flame, LineChart, Sparkles } from 'lucide-react';
import { ActiveTab } from '@/types';

interface BottomNavProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickAdd: () => void;
}

export function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    {
      id: 'dashboard' as const,
      label: 'Today',
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 'food' as const,
      label: 'Food',
      icon: <UtensilsCrossed size={20} />,
    },
    {
      id: 'activity' as const,
      label: 'Activity',
      icon: <Flame size={20} />,
    },
    {
      id: 'progress' as const,
      label: 'Progress',
      icon: <LineChart size={20} />,
    },
    {
      id: 'recommendations' as const,
      label: 'Mdiet AI',
      icon: <Sparkles size={20} />,
    },
  ];

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9000,
        backgroundColor: 'rgba(255, 255, 255, 0.94)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
        padding: '6px 6px max(14px, env(safe-area-inset-bottom, 14px)) 6px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around',
        boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.03)',
      }}
      className="visible-mobile-only"
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '2px',
              padding: '6px 2px',
              borderRadius: '12px',
              color: isActive ? '#0284c7' : '#8e8e93',
              backgroundColor: isActive ? 'rgba(2, 132, 199, 0.08)' : 'transparent',
              transition: 'all 0.16s ease',
              minHeight: '46px',
            }}
          >
            {tab.icon}
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: isActive ? 700 : 500,
                letterSpacing: '-0.01em',
              }}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
