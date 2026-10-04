'use client';

import React, { useState } from 'react';
import { Card } from '@/ui/Card';
import { FoodLogEntry, MealType, FoodItem } from '@/types';
import { deleteFoodLogEntry, updateFoodLogEntry } from '@/utils/storage';
import { Plus, Trash2, Edit2, Camera, Type, Check, X } from 'lucide-react';

interface MealsTimelineProps {
  currentDate: string;
  foodLogs: FoodLogEntry[];
  onAddFood: (mealType?: MealType) => void;
  onLogsUpdated: () => void;
}

const MEAL_SECTIONS: Array<{ type: MealType; label: string; icon: string }> = [
  { type: 'breakfast', label: 'Breakfast', icon: '☀️' },
  { type: 'lunch', label: 'Lunch', icon: '🥪' },
  { type: 'dinner', label: 'Dinner', icon: '🍽️' },
  { type: 'snack', label: 'Snacks', icon: '🍎' },
];

export function MealsTimeline({
  currentDate,
  foodLogs,
  onAddFood,
  onLogsUpdated,
}: MealsTimelineProps) {
  const [editingItem, setEditingItem] = useState<FoodLogEntry | null>(null);
  const [editCalories, setEditCalories] = useState('');
  const [editPortion, setEditPortion] = useState('');

  const handleDelete = (id: string) => {
    if (confirm('Delete this food entry?')) {
      deleteFoodLogEntry(currentDate, id);
      onLogsUpdated();
    }
  };

  const startEdit = (entry: FoodLogEntry) => {
    setEditingItem(entry);
    setEditCalories(entry.food.calories.toString());
    setEditPortion(entry.food.estimatedPortion);
  };

  const saveEdit = () => {
    if (!editingItem) return;
    const cals = parseInt(editCalories, 10);
    const updated: FoodLogEntry = {
      ...editingItem,
      food: {
        ...editingItem.food,
        calories: isNaN(cals) ? editingItem.food.calories : cals,
        estimatedPortion: editPortion || editingItem.food.estimatedPortion,
      },
    };
    updateFoodLogEntry(updated);
    setEditingItem(null);
    onLogsUpdated();
  };

  return (
    <div style={{ marginTop: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#1d1d1f',
          }}
        >
          Today's Meals
        </h2>
        <button
          onClick={() => onAddFood()}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.84rem',
            fontWeight: 600,
            color: '#0284c7',
            backgroundColor: '#f0f9ff',
            border: '1px solid #bae6fd',
            padding: '6px 14px',
            borderRadius: '999px',
          }}
        >
          <Plus size={15} />
          <span>Add Food</span>
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {MEAL_SECTIONS.map((section) => {
          const sectionLogs = foodLogs.filter((entry) => entry.mealType === section.type);
          const totalCals = sectionLogs.reduce((acc, curr) => acc + curr.food.calories, 0);

          return (
            <Card key={section.type} className="mobile-card-padding" style={{ padding: '20px' }}>
              {/* Meal Section Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                  marginBottom: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
                  <span
                    style={{
                      fontSize: '1.05rem',
                      fontWeight: 600,
                      color: '#1d1d1f',
                      letterSpacing: '-0.015em',
                    }}
                  >
                    {section.label}
                  </span>
                  <span style={{ fontSize: '0.84rem', color: '#86868b', fontWeight: 500 }}>
                    ({totalCals} kcal)
                  </span>
                </div>

                <button
                  onClick={() => onAddFood(section.type)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    color: '#0284c7',
                    padding: '4px 10px',
                    borderRadius: '999px',
                    backgroundColor: '#f0f9ff',
                  }}
                >
                  <Plus size={13} />
                  <span>Add</span>
                </button>
              </div>

              {/* Items in this meal section */}
              {sectionLogs.length === 0 ? (
                <div
                  style={{
                    padding: '12px',
                    textAlign: 'center',
                    fontSize: '0.82rem',
                    color: '#aeaeb2',
                  }}
                >
                  No food logged for {section.label.toLowerCase()} yet.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {sectionLogs.map((entry) => {
                    const isBeingEdited = editingItem?.id === entry.id;

                    return (
                      <div
                        key={entry.id}
                        style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: '12px',
                          padding: '10px 14px',
                          backgroundColor: '#fbfbfd',
                          borderRadius: '14px',
                          border: '1px solid rgba(0, 0, 0, 0.04)',
                        }}
                      >
                        {isBeingEdited ? (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              flex: 1,
                              flexWrap: 'wrap',
                            }}
                          >
                            <input
                              type="text"
                              value={editPortion}
                              onChange={(e) => setEditPortion(e.target.value)}
                              placeholder="Portion"
                              style={{ width: '130px', padding: '4px 8px', fontSize: '0.82rem' }}
                            />
                            <input
                              type="number"
                              value={editCalories}
                              onChange={(e) => setEditCalories(e.target.value)}
                              placeholder="Calories"
                              style={{ width: '100px', padding: '4px 8px', fontSize: '0.82rem' }}
                            />
                            <button
                              onClick={saveEdit}
                              style={{
                                color: '#10b981',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                              }}
                            >
                              <Check size={16} /> Save
                            </button>
                            <button
                              onClick={() => setEditingItem(null)}
                              style={{ color: '#86868b', fontSize: '0.8rem' }}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <div style={{ flex: 1, minWidth: '130px' }}>
                              <div
                                style={{
                                  fontSize: '0.94rem',
                                  fontWeight: 600,
                                  color: '#1d1d1f',
                                }}
                              >
                                {entry.food.name}
                              </div>
                              <div
                                style={{
                                  fontSize: '0.78rem',
                                  color: '#86868b',
                                  marginTop: '2px',
                                }}
                              >
                                {entry.food.estimatedPortion}
                              </div>

                              {/* Macros pill tags */}
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  fontSize: '0.74rem',
                                  color: '#6e6e73',
                                  marginTop: '4px',
                                }}
                              >
                                <span style={{ color: '#0284c7', fontWeight: 600 }}>
                                  P: {entry.food.protein}g
                                </span>
                                <span>•</span>
                                <span style={{ color: '#d97706', fontWeight: 600 }}>
                                  C: {entry.food.carbs}g
                                </span>
                                <span>•</span>
                                <span style={{ color: '#ec4899', fontWeight: 600 }}>
                                  F: {entry.food.fat}g
                                </span>
                                {entry.source === 'camera' && (
                                  <span
                                    style={{
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '3px',
                                      backgroundColor: '#e0f2fe',
                                      color: '#0284c7',
                                      padding: '1px 6px',
                                      borderRadius: '999px',
                                      fontSize: '0.68rem',
                                      fontWeight: 600,
                                      marginLeft: '4px',
                                    }}
                                  >
                                    <Camera size={10} /> Mdiet AI Scan
                                  </span>
                                )}
                              </div>
                            </div>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '14px',
                              }}
                            >
                              <span
                                style={{
                                  fontSize: '1.05rem',
                                  fontWeight: 700,
                                  color: '#1d1d1f',
                                  letterSpacing: '-0.02em',
                                }}
                              >
                                {entry.food.calories} kcal
                              </span>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <button
                                  onClick={() => startEdit(entry)}
                                  title="Edit entry"
                                  style={{ color: '#aeaeb2', padding: '4px' }}
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => handleDelete(entry.id)}
                                  title="Delete entry"
                                  style={{ color: '#aeaeb2', padding: '4px' }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
