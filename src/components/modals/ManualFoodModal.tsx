'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/ui/Modal';
import { Button } from '@/ui/Button';
import { Sparkles, Check, X, RotateCcw, AlertCircle } from 'lucide-react';
import { FoodItem, MealType } from '@/types';

interface ManualFoodModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
  onConfirmFood: (foodItem: FoodItem, mealType: MealType) => void;
}

export function ManualFoodModal({
  isOpen,
  onClose,
  defaultMealType = 'lunch',
  onConfirmFood,
}: ManualFoodModalProps) {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Result & confirmation state
  const [hasResult, setHasResult] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState<MealType>(defaultMealType);
  const [editName, setEditName] = useState('');
  const [editPortion, setEditPortion] = useState('');
  const [editCalories, setEditCalories] = useState(0);
  const [editProtein, setEditProtein] = useState(0);
  const [editCarbs, setEditCarbs] = useState(0);
  const [editFat, setEditFat] = useState(0);

  useEffect(() => {
    setSelectedMealType(defaultMealType);
  }, [defaultMealType]);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setIsAnalyzing(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/gemini/manual-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to estimate meal nutrition.');
      }

      const primary = data.items[0];
      setEditName(data.items.length > 1 ? data.items.map((i: any) => i.name).join(' & ') : primary.name);
      setEditPortion(primary.estimatedPortion || '1 serving');
      setEditCalories(data.totalCalories);
      setEditProtein(data.totalProtein);
      setEditCarbs(data.totalCarbs);
      setEditFat(data.totalFat);
      setHasResult(true);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not analyze description. Try describing ingredients more specifically.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirm = () => {
    const item: FoodItem = {
      id: `manual-food-${Date.now()}`,
      name: editName.trim() || 'Meal',
      estimatedPortion: editPortion.trim() || '1 serving',
      calories: Number(editCalories) || 0,
      protein: Number(editProtein) || 0,
      carbs: Number(editCarbs) || 0,
      fat: Number(editFat) || 0,
    };

    onConfirmFood(item, selectedMealType);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setInputText('');
    setHasResult(false);
    setErrorMsg(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleReset();
        onClose();
      }}
      title="Describe Food with Mdiet AI"
      subtitle="Type what you ate in natural language — Mdiet AI will calculate the breakdown"
      maxWidth="540px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {errorMsg && (
          <div
            style={{
              padding: '10px 14px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.84rem',
              color: '#be123c',
            }}
          >
            <AlertCircle size={16} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* INPUT STAGE */}
        {!hasResult ? (
          <form onSubmit={handleAnalyze} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.86rem',
                  fontWeight: 600,
                  color: '#1d1d1f',
                  marginBottom: '8px',
                }}
              >
                What did you eat?
              </label>
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="e.g. 2 eggs and 2 slices of whole grain toast with 1 tbsp butter"
                rows={3}
                style={{
                  width: '100%',
                  fontSize: '0.96rem',
                  lineHeight: 1.4,
                  resize: 'none',
                }}
                autoFocus
              />
              <span style={{ fontSize: '0.76rem', color: '#86868b', marginTop: '4px', display: 'block' }}>
                Tip: Mention amounts (e.g. 1 bowl, 200g, 2 slices) for maximum accuracy.
              </span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isAnalyzing}
              leftIcon={<Sparkles size={18} />}
              disabled={!inputText.trim()}
            >
              {isAnalyzing ? 'Analyzing with Mdiet AI...' : 'Analyze with Mdiet AI'}
            </Button>
          </form>
        ) : (
          /* CONFIRMATION STAGE ("Does this look right?") */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }} className="animate-fade-in">
            <div
              style={{
                backgroundColor: '#f0f9ff',
                border: '1.5px solid #bae6fd',
                borderRadius: '20px',
                padding: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#0284c7',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '8px',
                }}
              >
                Does this look right?
              </div>

              {/* Food Name & Portion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Food Name"
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    backgroundColor: '#ffffff',
                  }}
                />
                <input
                  type="text"
                  value={editPortion}
                  onChange={(e) => setEditPortion(e.target.value)}
                  placeholder="Portion size"
                  style={{
                    fontSize: '0.88rem',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Calories */}
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '16px' }}>
                <input
                  type="number"
                  value={editCalories}
                  onChange={(e) => setEditCalories(Number(e.target.value))}
                  style={{
                    width: '130px',
                    fontSize: '1.8rem',
                    fontWeight: 800,
                    color: '#0284c7',
                    padding: '4px 10px',
                    backgroundColor: '#ffffff',
                  }}
                />
                <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#6e6e73' }}>kcal</span>
              </div>

              {/* Macros Breakdown */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '10px',
                  paddingTop: '12px',
                  borderTop: '1px solid #e0f2fe',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.74rem', color: '#0284c7', fontWeight: 600 }}>Protein</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      value={editProtein}
                      onChange={(e) => setEditProtein(Number(e.target.value))}
                      style={{ padding: '4px 8px', fontSize: '0.9rem', fontWeight: 600 }}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#86868b' }}>g</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#d97706', fontWeight: 600 }}>Carbs</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      value={editCarbs}
                      onChange={(e) => setEditCarbs(Number(e.target.value))}
                      style={{ padding: '4px 8px', fontSize: '0.9rem', fontWeight: 600 }}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#86868b' }}>g</span>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.74rem', color: '#ec4899', fontWeight: 600 }}>Fat</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <input
                      type="number"
                      value={editFat}
                      onChange={(e) => setEditFat(Number(e.target.value))}
                      style={{ padding: '4px 8px', fontSize: '0.9rem', fontWeight: 600 }}
                    />
                    <span style={{ fontSize: '0.78rem', color: '#86868b' }}>g</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Meal Category */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: '#6e6e73',
                  marginBottom: '6px',
                }}
              >
                Log into meal:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
                {(['breakfast', 'lunch', 'dinner', 'snack'] as MealType[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSelectedMealType(m)}
                    style={{
                      padding: '8px 4px',
                      borderRadius: '12px',
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      textTransform: 'capitalize',
                      backgroundColor: selectedMealType === m ? '#0284c7' : '#f4f4f6',
                      color: selectedMealType === m ? '#ffffff' : '#52525b',
                    }}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Confirm Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleConfirm}
                leftIcon={<Check size={18} />}
              >
                ✓ I ate this
              </Button>
              <Button
                variant="ghost"
                fullWidth
                size="md"
                onClick={() => setHasResult(false)}
                leftIcon={<RotateCcw size={15} />}
              >
                Edit Description
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
