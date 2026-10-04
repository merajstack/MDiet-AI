'use client';

import React, { useState } from 'react';
import { Modal } from '@/ui/Modal';
import { Button } from '@/ui/Button';
import { Scale, Check } from 'lucide-react';
import { addWeightEntry } from '@/utils/storage';
import { WeightEntry } from '@/types';

interface WeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDate: string;
  currentWeightKg: number;
  targetWeightKg: number;
  onWeightRecorded: () => void;
}

export function WeightModal({
  isOpen,
  onClose,
  currentDate,
  currentWeightKg,
  targetWeightKg,
  onWeightRecorded,
}: WeightModalProps) {
  const [weightInput, setWeightInput] = useState(currentWeightKg ? currentWeightKg.toString() : '');
  const [note, setNote] = useState('');

  const numWeight = parseFloat(weightInput) || currentWeightKg;
  const differenceToGoal = Math.abs(numWeight - targetWeightKg).toFixed(1);
  const isLossGoal = targetWeightKg < numWeight;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalWeight = parseFloat(weightInput);
    if (isNaN(finalWeight) || finalWeight <= 0) return;

    const entry: WeightEntry = {
      id: `weight-${Date.now()}`,
      date: currentDate,
      weightKg: Number(finalWeight.toFixed(1)),
      timestamp: Date.now(),
      note: note.trim() || undefined,
    };

    addWeightEntry(entry);
    onWeightRecorded();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Record Weight"
      subtitle={`Track your weight change for ${currentDate}`}
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '8px' }}>
            Today's Body Weight (kg):
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="number"
              step="0.1"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              autoFocus
              style={{
                fontSize: '1.75rem',
                fontWeight: 700,
                color: '#1d1d1f',
                padding: '10px 16px',
              }}
            />
            <span style={{ fontSize: '1.25rem', fontWeight: 600, color: '#86868b' }}>kg</span>
          </div>
        </div>

        {/* Goal difference card */}
        {targetWeightKg > 0 && (
          <div
            style={{
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '16px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: '0.74rem', color: '#0369a1', fontWeight: 600, textTransform: 'uppercase' }}>
                Target Distance
              </div>
              <div style={{ fontSize: '0.86rem', color: '#52525b', marginTop: '2px' }}>
                Target: {targetWeightKg} kg
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0284c7' }}>
                {differenceToGoal} kg
              </span>
              <span style={{ fontSize: '0.76rem', color: '#0369a1', display: 'block' }}>
                {isLossGoal ? 'to lose' : 'to gain'}
              </span>
            </div>
          </div>
        )}

        {/* Optional note */}
        <div>
          <label style={{ display: 'block', fontSize: '0.84rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '6px' }}>
            Note (Optional):
          </label>
          <input
            type="text"
            placeholder="e.g. Morning fasting weight"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          leftIcon={<Scale size={18} />}
        >
          Save Weight Entry
        </Button>
      </form>
    </Modal>
  );
}
