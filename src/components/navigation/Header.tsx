'use client';

import React from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Sparkles } from 'lucide-react';
import { formatFriendlyDate, formatDate, parseDateString, getTodayString } from '@/utils/dateUtils';

interface HeaderProps {
  currentDate: string;
  onDateChange: (newDate: string) => void;
  greeting?: string;
  isAiConfigured?: boolean;
  onOpenProfile?: () => void;
  userName?: string;
  isProfileActive?: boolean;
}

export function Header({
  currentDate,
  onDateChange,
  greeting,
  isAiConfigured = false,
  onOpenProfile,
  userName,
  isProfileActive = false,
}: HeaderProps) {
  const isToday = currentDate === getTodayString();

  const handlePrevDay = () => {
    const d = parseDateString(currentDate);
    d.setDate(d.getDate() - 1);
    onDateChange(formatDate(d));
  };

  const handleNextDay = () => {
    const d = parseDateString(currentDate);
    d.setDate(d.getDate() + 1);
    onDateChange(formatDate(d));
  };

  const handleTodayClick = () => {
    onDateChange(getTodayString());
  };

  return (
    <header style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
      {/* Mobile Top Bar (Brand + AI status + Profile button) */}
      <div
        className="visible-mobile-only"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #38bdf8 0%, #0284c7 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '1.1rem',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.25)',
            }}
          >
            M
          </div>
          <span style={{ fontSize: '1.15rem', fontWeight: 700, color: '#1d1d1f', letterSpacing: '-0.02em' }}>
            M Diet
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 10px',
              backgroundColor: isAiConfigured ? '#f0fdf4' : '#f0f9ff',
              border: `1px solid ${isAiConfigured ? '#bbf7d0' : '#bae6fd'}`,
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 600,
              color: isAiConfigured ? '#15803d' : '#0369a1',
            }}
          >
            <Sparkles size={11} />
            <span>{isAiConfigured ? 'Mdiet AI' : 'Offline'}</span>
          </div>

          {onOpenProfile && (
            <button
              onClick={onOpenProfile}
              aria-label="Profile and Settings"
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                backgroundColor: isProfileActive ? '#e0f2fe' : '#ffffff',
                border: isProfileActive ? '2px solid #0284c7' : '1px solid rgba(0,0,0,0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.86rem',
                fontWeight: 700,
                color: isProfileActive ? '#0284c7' : '#1d1d1f',
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              }}
            >
              {userName ? userName.charAt(0).toUpperCase() : 'M'}
            </button>
          )}
        </div>
      </div>

      {/* Main Greeting & Navigation Row */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
        }}
      >
        <div>
          {greeting && (
            <h1
              style={{
                fontSize: 'clamp(1.3rem, 4vw, 1.75rem)',
                fontWeight: 700,
                letterSpacing: '-0.03em',
                color: '#1d1d1f',
                lineHeight: 1.15,
              }}
            >
              {greeting}
            </h1>
          )}
          <p
            style={{
              fontSize: '0.84rem',
              color: '#86868b',
              marginTop: '2px',
            }}
          >
            Let's stay on track today.
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Date Selector Navigation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#ffffff',
              border: '1px solid rgba(0, 0, 0, 0.08)',
              borderRadius: '999px',
              padding: '3px',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
          >
            <button
              onClick={handlePrevDay}
              aria-label="Previous day"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#52525b',
              }}
            >
              <ChevronLeft size={18} />
            </button>

            <button
              onClick={handleTodayClick}
              style={{
                padding: '4px 10px',
                fontSize: '0.84rem',
                fontWeight: 600,
                color: isToday ? '#0284c7' : '#1d1d1f',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <CalendarIcon size={14} color={isToday ? '#0284c7' : '#86868b'} />
              <span>{formatFriendlyDate(currentDate)}</span>
            </button>

            <button
              onClick={handleNextDay}
              disabled={isToday}
              aria-label="Next day"
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isToday ? '#d1d1d6' : '#52525b',
                cursor: isToday ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Desktop AI Status Badge */}
          <div
            className="hidden-mobile"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              backgroundColor: isAiConfigured ? '#f0fdf4' : '#f0f9ff',
              border: `1px solid ${isAiConfigured ? '#bbf7d0' : '#bae6fd'}`,
              borderRadius: '999px',
              fontSize: '0.76rem',
              fontWeight: 600,
              color: isAiConfigured ? '#15803d' : '#0369a1',
            }}
            title={isAiConfigured ? 'Mdiet AI Active' : 'Mdiet AI Offline'}
          >
            <Sparkles size={13} />
            <span>{isAiConfigured ? 'Mdiet AI Active' : 'Mdiet AI Offline'}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
