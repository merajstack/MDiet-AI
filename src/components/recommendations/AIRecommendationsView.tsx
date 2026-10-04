'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { PersonalPlan, AIRecommendation, UserProfile } from '@/types';
import { savePersonalPlan, markRecommendationApplied } from '@/utils/storage';
import { Sparkles, Check, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

interface AIRecommendationsViewProps {
  user: UserProfile;
  plan: PersonalPlan;
  onPlanUpdated: () => void;
  onShowToast: (msg: string) => void;
}

export function AIRecommendationsView({
  user,
  plan,
  onPlanUpdated,
  onShowToast,
}: AIRecommendationsViewProps) {
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const fetchRecommendations = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/gemini/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan,
          recentStats: {
            avgCalories: plan.dailyCalories,
            avgProtein: plan.protein,
            avgWaterLiters: plan.waterLiters,
            daysLogged: 7,
            goal: user.goal,
          },
        }),
      });
      const data = await res.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (err) {
      console.warn('Failed to load AI recommendations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const handleApplyRecommendation = (rec: AIRecommendation) => {
    const updatedPlan: PersonalPlan = {
      ...plan,
      ...(rec.suggestedPlan || {}),
    };

    savePersonalPlan(updatedPlan);
    markRecommendationApplied(rec.id);
    setAppliedId(rec.id);
    onPlanUpdated();
    onShowToast(`Applied recommendation: ${rec.title}`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }} className="animate-fade-in">
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '16px',
        }}
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#f0f9ff',
              border: '1px solid #bae6fd',
              borderRadius: '999px',
              padding: '3px 10px',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: '#0284c7',
              marginBottom: '8px',
            }}
          >
            <Sparkles size={14} />
            <span>Mdiet AI Strategy Engine</span>
          </div>
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: 700,
              letterSpacing: '-0.03em',
              color: '#1d1d1f',
            }}
          >
            Mdiet AI Strategy & Recommendations
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#6e6e73' }}>
            Actionable nutritional adjustments based on your adherence patterns (No chatbot clutter)
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          onClick={fetchRecommendations}
          isLoading={isLoading}
          leftIcon={<RefreshCw size={14} />}
        >
          Refresh Insights
        </Button>
      </div>

      {/* Structured Recommendation Cards Grid */}
      {isLoading ? (
        <div style={{ padding: '60px 0', textAlign: 'center' }}>
          <Sparkles size={32} color="#0284c7" className="animate-spin" style={{ margin: '0 auto 12px auto' }} />
          <p style={{ fontSize: '0.95rem', color: '#6e6e73', fontWeight: 500 }}>
            Analyzing with Mdiet AI...
          </p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
          }}
        >
          {recommendations.map((rec) => {
            const isApplied = appliedId === rec.id || rec.applied;

            return (
              <Card
                key={rec.id}
                className="mobile-card-padding"
                style={{
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  border: isApplied ? '1.5px solid #10b981' : '1px solid rgba(0, 0, 0, 0.08)',
                  backgroundColor: isApplied ? '#fbfdfc' : '#ffffff',
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '10px',
                    }}
                  >
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        backgroundColor: '#f0f9ff',
                        color: '#0284c7',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        letterSpacing: '0.02em',
                      }}
                    >
                      {rec.tagline}
                    </span>

                    {isApplied && (
                      <span
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                          fontSize: '0.74rem',
                          color: '#10b981',
                          fontWeight: 600,
                        }}
                      >
                        <CheckCircle2 size={14} /> Active
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: '1.2rem',
                      fontWeight: 700,
                      color: '#1d1d1f',
                      marginBottom: '8px',
                      letterSpacing: '-0.02em',
                    }}
                  >
                    {rec.title}
                  </h3>

                  <p
                    style={{
                      fontSize: '0.86rem',
                      color: '#52525b',
                      lineHeight: 1.45,
                      marginBottom: '16px',
                    }}
                  >
                    {rec.description}
                  </p>

                  {/* Bullet reasons */}
                  {rec.reasons && rec.reasons.length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <div
                        style={{
                          fontSize: '0.74rem',
                          fontWeight: 600,
                          color: '#86868b',
                          textTransform: 'uppercase',
                          marginBottom: '6px',
                        }}
                      >
                        Why this works:
                      </div>
                      <ul
                        style={{
                          paddingLeft: '18px',
                          fontSize: '0.82rem',
                          color: '#6e6e73',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px',
                        }}
                      >
                        {rec.reasons.map((r, i) => (
                          <li key={i}>{r}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <Button
                    variant={isApplied ? 'secondary' : 'primary'}
                    fullWidth
                    size="md"
                    disabled={isApplied}
                    onClick={() => handleApplyRecommendation(rec)}
                    rightIcon={isApplied ? <Check size={16} /> : <ArrowRight size={16} />}
                  >
                    {isApplied ? 'Selected & Applied' : 'Select Recommendation'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
