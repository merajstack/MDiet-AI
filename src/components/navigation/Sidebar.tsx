'use client';

import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Flame,
  LineChart,
  Sparkles,
  Settings,
  Plus,
} from 'lucide-react';
import { ActiveTab } from '@/types';

interface SidebarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onQuickAdd: () => void;
  userName?: string;
}

export function Sidebar({ activeTab, onTabChange, onQuickAdd, userName }: SidebarProps) {
  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    badge?: string;
  }> = [
    {
      id: 'dashboard',
      label: 'Today',
      icon: <LayoutDashboard size={20} />,
    },
    {
      id: 'food',
      label: 'Food Log',
      icon: <UtensilsCrossed size={20} />,
    },
    {
      id: 'activity',
      label: 'Activity',
      icon: <Flame size={20} />,
    },
    {
      id: 'progress',
      label: 'Progress',
      icon: <LineChart size={20} />,
    },
    {
      id: 'recommendations',
      label: 'Mdiet AI Strategy',
      icon: <Sparkles size={20} />,
      badge: 'AI',
    },
    {
      id: 'settings',
      label: 'Profile',
      icon: <Settings size={20} />,
    },
  ];

  return (
    <aside
      style={{
        width: '240px',
        backgroundColor: '#ffffff',
        borderRight: '1px solid rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        height: '100vh',
        position: 'sticky',
        top: 0,
        flexShrink: 0,
      }}
      className="hidden-mobile"
    >
      <div>
        {/* Brand / Logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '8px 12px 24px 12px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.25rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.25)',
              letterSpacing: '-0.03em',
            }}
          >
            M
          </div>
          <div>
            <div
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                letterSpacing: '-0.025em',
                color: '#1d1d1f',
                lineHeight: 1.1,
              }}
            >
              M Diet
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                color: '#86868b',
                fontWeight: 500,
                letterSpacing: '0.01em',
              }}
            >
              Intelligent Nutrition
            </div>
          </div>
        </div>

        {/* Quick Log Action Button */}
        <div style={{ padding: '0 4px 20px 4px' }}>
          <button
            onClick={onQuickAdd}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              padding: '10px 16px',
              borderRadius: '999px',
              fontWeight: 600,
              fontSize: '0.88rem',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.24)',
            }}
          >
            <Plus size={18} />
            <span>Quick Log</span>
          </button>
        </div>

        {/* Navigation list */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '14px',
                  fontSize: '0.92rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#0284c7' : '#52525b',
                  backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                  border: isActive ? '1px solid #bae6fd' : '1px solid transparent',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ color: isActive ? '#0284c7' : '#86868b' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      backgroundColor: isActive ? '#0284c7' : '#e0f2fe',
                      color: isActive ? '#ffffff' : '#0284c7',
                      padding: '2px 6px',
                      borderRadius: '999px',
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User profile footer */}
      <div
        style={{
          borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          paddingTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            backgroundColor: '#f0f0f4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 600,
            fontSize: '0.88rem',
            color: '#1d1d1f',
          }}
        >
          {userName ? userName.charAt(0).toUpperCase() : 'M'}
        </div>
        <div style={{ overflow: 'hidden' }}>
          <div
            style={{
              fontSize: '0.88rem',
              fontWeight: 600,
              color: '#1d1d1f',
              whiteSpace: 'nowrap',
              textOverflow: 'ellipsis',
              overflow: 'hidden',
            }}
          >
            {userName || 'User'}
          </div>
          <div
            style={{
              fontSize: '0.72rem',
              color: '#86868b',
            }}
          >
            Daily Tracker
          </div>
        </div>
      </div>
    </aside>
  );
}
