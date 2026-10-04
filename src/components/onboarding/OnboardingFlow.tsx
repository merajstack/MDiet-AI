'use client';

import React, { useState } from 'react';
import { Card } from '@/ui/Card';
import { Button } from '@/ui/Button';
import { UserProfile, GoalType, ActivityLevel, PersonalPlan } from '@/types';
import { PlanSelection } from './PlanSelection';
import { saveUserProfile, savePersonalPlan } from '@/utils/storage';
import {
  ArrowRight,
  ArrowLeft,
  Sparkles,
  TrendingDown,
  Activity,
  TrendingUp,
  HeartHandshake,
  Armchair,
  Footprints,
  Flame,
  Zap,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

interface OnboardingFlowProps {
  onComplete: () => void;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 7;

  // Real user inputs (no fake hardcoded numbers)
  const [name, setName] = useState('');
  const [age, setAge] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [currentWeight, setCurrentWeight] = useState<string>('');
  const [goal, setGoal] = useState<GoalType>('lose');
  const [targetWeight, setTargetWeight] = useState<string>('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');

  // Error & state
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlans, setGeneratedPlans] = useState<PersonalPlan[] | null>(null);

  const goalOptions: Array<{
    type: GoalType;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }> = [
    {
      type: 'lose',
      title: 'Lose weight',
      subtitle: 'Target fat reduction while preserving lean muscle',
      icon: <TrendingDown size={24} color="#0284c7" />,
    },
    {
      type: 'maintain',
      title: 'Maintain weight',
      subtitle: 'Keep current composition with energy balance',
      icon: <Activity size={24} color="#10b981" />,
    },
    {
      type: 'gain',
      title: 'Gain weight',
      subtitle: 'Caloric surplus for muscle hypertrophy and strength',
      icon: <TrendingUp size={24} color="#f97316" />,
    },
    {
      type: 'habits',
      title: 'Build healthier eating habits',
      subtitle: 'Improve nutrition density, hydration, and mindful eating',
      icon: <HeartHandshake size={24} color="#6366f1" />,
    },
  ];

  const activityOptions: Array<{
    type: ActivityLevel;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
  }> = [
    {
      type: 'sedentary',
      title: 'Mostly sedentary',
      subtitle: 'Desk job, minimal intentional movement during the day',
      icon: <Armchair size={24} color="#86868b" />,
    },
    {
      type: 'light',
      title: 'Lightly active',
      subtitle: 'Casual walking, light daily tasks (~4,000–6,000 steps)',
      icon: <Footprints size={24} color="#10b981" />,
    },
    {
      type: 'moderate',
      title: 'Moderately active',
      subtitle: 'Regular workouts 3–4 days/week or active on your feet',
      icon: <Flame size={24} color="#f97316" />,
    },
    {
      type: 'very',
      title: 'Very active',
      subtitle: 'Heavy workouts 5–7 days/week or physically demanding job',
      icon: <Zap size={24} color="#0284c7" />,
    },
  ];

  const validateStep = (step: number): boolean => {
    setValidationError(null);
    if (step === 1) {
      if (!name.trim()) {
        setValidationError('Please enter your name.');
        return false;
      }
    } else if (step === 2) {
      const parsedAge = parseInt(age, 10);
      if (!age.trim() || isNaN(parsedAge) || parsedAge < 12 || parsedAge > 120) {
        setValidationError('Please enter a valid age between 12 and 120.');
        return false;
      }
    } else if (step === 3) {
      const parsedHeight = parseInt(height, 10);
      if (!height.trim() || isNaN(parsedHeight) || parsedHeight < 100 || parsedHeight > 250) {
        setValidationError('Please enter a valid height in cm (e.g. 175).');
        return false;
      }
    } else if (step === 4) {
      const parsedWeight = parseFloat(currentWeight);
      if (!currentWeight.trim() || isNaN(parsedWeight) || parsedWeight < 30 || parsedWeight > 300) {
        setValidationError('Please enter your actual weight in kg (e.g. 75).');
        return false;
      }
    } else if (step === 6) {
      const parsedTarget = parseFloat(targetWeight);
      if (!targetWeight.trim() || isNaN(parsedTarget) || parsedTarget < 30 || parsedTarget > 300) {
        setValidationError('Please enter your realistic target weight in kg.');
        return false;
      }
    }
    return true;
  };

  const handleNext = () => {
    if (!validateStep(currentStep)) return;

    if (currentStep < totalSteps) {
      if (currentStep === 5 && (goal === 'maintain' || goal === 'habits')) {
        setTargetWeight(currentWeight);
      }
      setCurrentStep((prev) => prev + 1);
    } else {
      handleGeneratePlan();
    }
  };

  const handleBack = () => {
    setValidationError(null);
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleGeneratePlan = async () => {
    setIsGenerating(true);
    setApiError(null);

    const realAge = parseInt(age, 10);
    const realHeight = parseInt(height, 10);
    const realCurrentWeight = parseFloat(currentWeight);
    const realTargetWeight = parseFloat(targetWeight) || realCurrentWeight;

    const profileData: UserProfile = {
      name: name.trim(),
      age: realAge,
      height: realHeight,
      currentWeight: realCurrentWeight,
      targetWeight: realTargetWeight,
      goal,
      activityLevel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      const res = await fetch('/api/gemini/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to generate plan with Mdiet AI.');
      }

      if (data.plans && data.plans.length > 0) {
        saveUserProfile(profileData);
        setGeneratedPlans(data.plans);
      } else {
        throw new Error('Mdiet AI did not return any nutrition plans.');
      }
    } catch (err: any) {
      console.error('Plan generation failed:', err);
      setApiError(err.message || 'Mdiet AI request could not be completed. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectPlan = (plan: PersonalPlan) => {
    savePersonalPlan(plan);
    onComplete();
  };

  // If plans were generated, display plan selection view
  if (generatedPlans && generatedPlans.length > 0) {
    return (
      <PlanSelection
        plans={generatedPlans}
        onSelectPlan={handleSelectPlan}
        userName={name || 'there'}
      />
    );
  }

  // Loading Screen for Plan Generation
  if (isGenerating) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center',
          padding: '24px',
        }}
        className="animate-fade-in"
      >
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(2, 132, 199, 0.15)',
            animation: 'pulseGlow 2s infinite',
          }}
        >
          <Sparkles size={36} color="#0284c7" />
        </div>
        <h2
          style={{
            fontSize: '1.75rem',
            fontWeight: 700,
            letterSpacing: '-0.03em',
            color: '#1d1d1f',
            marginBottom: '8px',
          }}
        >
          Analyzing with Mdiet AI...
        </h2>
        <p style={{ fontSize: '0.95rem', color: '#6e6e73', maxWidth: '440px' }}>
          Formulating clinical metabolic plans strictly derived from your actual age, height, weight, and goals.
        </p>
      </div>
    );
  }

  // Step-by-step questions
  return (
    <div
      style={{
        maxWidth: '580px',
        margin: '0 auto',
        padding: '36px 16px',
        minHeight: '80vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}
      className="animate-fade-in"
    >
      {/* Brand Header */}
      <div style={{ textAlign: 'center', marginBottom: '28px' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px',
          }}
        >
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
            }}
          >
            M
          </div>
          <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1d1d1f' }}>
            M Diet
          </span>
        </div>

        {/* Minimal Progress Indicator */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '0.78rem',
            fontWeight: 600,
            color: '#86868b',
          }}
        >
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map((stepNum) => {
            const isCompleted = stepNum < currentStep;
            const isCurrent = stepNum === currentStep;

            return (
              <React.Fragment key={stepNum}>
                <span
                  style={{
                    color: isCurrent ? '#0284c7' : isCompleted ? '#1d1d1f' : '#d1d1d6',
                    fontWeight: isCurrent ? 700 : 500,
                  }}
                >
                  {String(stepNum).padStart(2, '0')}
                </span>
                {stepNum < totalSteps && (
                  <span
                    style={{
                      width: '16px',
                      height: '2px',
                      backgroundColor: isCompleted ? '#0284c7' : 'rgba(0,0,0,0.1)',
                      borderRadius: '999px',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* API Error Notification */}
      {apiError && (
        <div
          style={{
            marginBottom: '16px',
            padding: '14px 16px',
            backgroundColor: '#fff1f2',
            border: '1px solid #fecdd3',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '10px',
            fontSize: '0.88rem',
            color: '#9f1239',
          }}
        >
          <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600 }}>Mdiet AI Request Notice:</div>
            <div style={{ marginTop: '2px' }}>{apiError}</div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleGeneratePlan}
              style={{ marginTop: '10px' }}
              leftIcon={<RefreshCw size={13} />}
            >
              Retry Real Generation
            </Button>
          </div>
        </div>
      )}

      {/* Validation Alert */}
      {validationError && (
        <div
          style={{
            marginBottom: '16px',
            padding: '10px 14px',
            backgroundColor: '#fffbeb',
            border: '1px solid #fde68a',
            borderRadius: '14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.84rem',
            color: '#b45309',
          }}
        >
          <AlertCircle size={16} />
          <span>{validationError}</span>
        </div>
      )}

      {/* Active Question Card */}
      <Card className="mobile-card-padding" style={{ padding: '36px 32px', minHeight: '380px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          {/* STEP 1: Name */}
          {currentStep === 1 && (
            <div className="animate-slide-up">
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase' }}>
                Step 1 of 7
              </span>
              <h2 style={{ fontSize: 'clamp(1.4rem, 4.5vw, 1.8rem)', fontWeight: 700, color: '#1d1d1f', margin: '8px 0 20px 0', letterSpacing: '-0.03em' }}>
                What's your name?
              </h2>
              <input
                type="text"
                placeholder="Enter your first name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setValidationError(null);
                }}
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                style={{ fontSize: '1.25rem', padding: '16px', borderRadius: '16px' }}
              />
            </div>
          )}

          {/* STEP 2: Age */}
          {currentStep === 2 && (
            <div className="animate-slide-up">
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase' }}>
                Step 2 of 7
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1d1d1f', margin: '8px 0 20px 0', letterSpacing: '-0.03em' }}>
                What's your age?
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="e.g. 26"
                  value={age}
                  onChange={(e) => {
                    setAge(e.target.value);
                    setValidationError(null);
                  }}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  style={{ fontSize: '1.5rem', fontWeight: 700, padding: '14px 18px', width: '160px' }}
                />
                <span style={{ fontSize: '1.1rem', color: '#86868b', fontWeight: 500 }}>years old</span>
              </div>
            </div>
          )}

          {/* STEP 3: Height */}
          {currentStep === 3 && (
            <div className="animate-slide-up">
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase' }}>
                Step 3 of 7
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1d1d1f', margin: '8px 0 20px 0', letterSpacing: '-0.03em' }}>
                What's your height?
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  placeholder="e.g. 178"
                  value={height}
                  onChange={(e) => {
                    setHeight(e.target.value);
                    setValidationError(null);
                  }}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  style={{ fontSize: '1.5rem', fontWeight: 700, padding: '14px 18px', width: '160px' }}
                />
                <span style={{ fontSize: '1.1rem', color: '#86868b', fontWeight: 500 }}>cm</span>
              </div>
            </div>
          )}

          {/* STEP 4: Current Weight */}
          {currentStep === 4 && (
            <div className="animate-slide-up">
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase' }}>
                Step 4 of 7
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1d1d1f', margin: '8px 0 20px 0', letterSpacing: '-0.03em' }}>
                What's your current weight?
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 74.5"
                  value={currentWeight}
                  onChange={(e) => {
                    setCurrentWeight(e.target.value);
                    setValidationError(null);
                    if (!targetWeight) setTargetWeight(e.target.value);
                  }}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  style={{ fontSize: '1.5rem', fontWeight: 700, padding: '14px 18px', width: '160px' }}
                />
                <span style={{ fontSize: '1.1rem', color: '#86868b', fontWeight: 500 }}>kg</span>
              </div>
            </div>
          )}

          {/* STEP 5: Goal */}
          {currentStep === 5 && (
            <div className="animate-slide-up">
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase' }}>
                Step 5 of 7
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1d1d1f', margin: '8px 0 16px 0', letterSpacing: '-0.03em' }}>
                What is your primary goal?
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {goalOptions.map((opt) => {
                  const isSelected = goal === opt.type;
                  return (
                    <div
                      key={opt.type}
                      onClick={() => setGoal(opt.type)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 16px',
                        borderRadius: '16px',
                        backgroundColor: isSelected ? '#f0f9ff' : '#fbfbfd',
                        border: isSelected ? '1.5px solid #0284c7' : '1px solid rgba(0, 0, 0, 0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          backgroundColor: isSelected ? '#ffffff' : '#f0f0f4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {opt.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.96rem', fontWeight: 600, color: '#1d1d1f' }}>
                          {opt.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#6e6e73' }}>
                          {opt.subtitle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 6: Target Weight */}
          {currentStep === 6 && (
            <div className="animate-slide-up">
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase' }}>
                Step 6 of 7
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1d1d1f', margin: '8px 0 8px 0', letterSpacing: '-0.03em' }}>
                What's your target weight?
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#6e6e73', marginBottom: '20px' }}>
                Current weight: {currentWeight} kg
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 68.0"
                  value={targetWeight}
                  onChange={(e) => {
                    setTargetWeight(e.target.value);
                    setValidationError(null);
                  }}
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                  style={{ fontSize: '1.5rem', fontWeight: 700, padding: '14px 18px', width: '160px' }}
                />
                <span style={{ fontSize: '1.1rem', color: '#86868b', fontWeight: 500 }}>kg</span>
              </div>
            </div>
          )}

          {/* STEP 7: Activity Level */}
          {currentStep === 7 && (
            <div className="animate-slide-up">
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#0284c7', textTransform: 'uppercase' }}>
                Step 7 of 7
              </span>
              <h2 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1d1d1f', margin: '8px 0 16px 0', letterSpacing: '-0.03em' }}>
                How active are you?
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {activityOptions.map((act) => {
                  const isSelected = activityLevel === act.type;
                  return (
                    <div
                      key={act.type}
                      onClick={() => setActivityLevel(act.type)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '14px',
                        padding: '14px 16px',
                        borderRadius: '16px',
                        backgroundColor: isSelected ? '#f0f9ff' : '#fbfbfd',
                        border: isSelected ? '1.5px solid #0284c7' : '1px solid rgba(0, 0, 0, 0.06)',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '12px',
                          backgroundColor: isSelected ? '#ffffff' : '#f0f0f4',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}
                      >
                        {act.icon}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.96rem', fontWeight: 600, color: '#1d1d1f' }}>
                          {act.title}
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#6e6e73' }}>
                          {act.subtitle}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          {currentStep > 1 ? (
            <Button
              variant="ghost"
              onClick={handleBack}
              leftIcon={<ArrowLeft size={16} />}
            >
              Back
            </Button>
          ) : (
            <div />
          )}

          <Button
            variant="primary"
            size="lg"
            onClick={handleNext}
            rightIcon={currentStep === totalSteps ? <Sparkles size={18} /> : <ArrowRight size={18} />}
          >
            {currentStep === totalSteps ? 'Calculate Plan with Mdiet AI →' : 'Continue'}
          </Button>
        </div>
      </Card>
    </div>
  );
}
