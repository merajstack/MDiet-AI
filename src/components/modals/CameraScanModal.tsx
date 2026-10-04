'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Modal } from '@/ui/Modal';
import { Button } from '@/ui/Button';
import { Camera, RefreshCw, Check, X, Upload, Sparkles, AlertCircle } from 'lucide-react';
import { FoodItem, MealType } from '@/types';

interface CameraScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMealType?: MealType;
  onConfirmFood: (foodItem: FoodItem, mealType: MealType, imageUrl?: string) => void;
}

export function CameraScanModal({
  isOpen,
  onClose,
  defaultMealType = 'lunch',
  onConfirmFood,
}: CameraScanModalProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [detectedResult, setDetectedResult] = useState<{
    items: FoodItem[];
    totalCalories: number;
    totalProtein: number;
    totalCarbs: number;
    totalFat: number;
    notes?: string;
  } | null>(null);

  // Editable confirmation fields
  const [selectedMealType, setSelectedMealType] = useState<MealType>(defaultMealType);
  const [editName, setEditName] = useState('');
  const [editPortion, setEditPortion] = useState('');
  const [editCalories, setEditCalories] = useState(0);
  const [editProtein, setEditProtein] = useState(0);
  const [editCarbs, setEditCarbs] = useState(0);
  const [editFat, setEditFat] = useState(0);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Initialize camera when modal opens
  useEffect(() => {
    if (isOpen && !capturedImage && !detectedResult) {
      startCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen, capturedImage, detectedResult]);

  useEffect(() => {
    setSelectedMealType(defaultMealType);
  }, [defaultMealType]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported on this browser.');
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err: any) {
      console.warn('Camera access issue:', err);
      setCameraError(
        'Camera access was denied or is unavailable. You can upload a photo from your gallery instead.'
      );
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setDetectedResult(null);
    startCamera();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const result = uploadEvent.target?.result as string;
      setCapturedImage(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const handleUsePhoto = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setCameraError(null);

    try {
      const res = await fetch('/api/gemini/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: capturedImage,
          mimeType: 'image/jpeg',
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(
          data.error || "We couldn't analyze that meal. Try another photo with the food clearly visible."
        );
      }

      setDetectedResult({
        items: data.items,
        totalCalories: data.totalCalories,
        totalProtein: data.totalProtein,
        totalCarbs: data.totalCarbs,
        totalFat: data.totalFat,
      });

      // Populate editable fields with main detected item or summary
      const primaryItem = data.items[0];
      setEditName(data.items.length > 1 ? data.items.map((i: any) => i.name).join(' & ') : primaryItem.name);
      setEditPortion(primaryItem.estimatedPortion || '1 serving');
      setEditCalories(data.totalCalories);
      setEditProtein(data.totalProtein);
      setEditCarbs(data.totalCarbs);
      setEditFat(data.totalFat);
    } catch (err: any) {
      setCameraError(err.message || "We couldn't analyze that meal. Try another photo with the food clearly visible.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleConfirmAdd = () => {
    const finalItem: FoodItem = {
      id: `food-logged-${Date.now()}`,
      name: editName.trim() || 'Meal',
      estimatedPortion: editPortion.trim() || '1 serving',
      calories: Number(editCalories) || 0,
      protein: Number(editProtein) || 0,
      carbs: Number(editCarbs) || 0,
      fat: Number(editFat) || 0,
    };

    onConfirmFood(finalItem, selectedMealType, capturedImage || undefined);
    handleResetModal();
    onClose();
  };

  const handleResetModal = () => {
    stopCamera();
    setCapturedImage(null);
    setDetectedResult(null);
    setIsAnalyzing(false);
    setCameraError(null);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        handleResetModal();
        onClose();
      }}
      title="Scan Food with Mdiet AI"
      subtitle="Take a photo of your plate to estimate nutritional content"
      maxWidth="580px"
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Hidden elements */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileUpload}
          style={{ display: 'none' }}
        />

        {/* Error / Alert banner */}
        {cameraError && (
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: '#fff1f2',
              border: '1px solid #fecdd3',
              borderRadius: '16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.86rem',
              color: '#9f1239',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>{cameraError}</div>
          </div>
        )}

        {/* STAGE 1: Live Viewfinder */}
        {!capturedImage && !detectedResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                width: '100%',
                height: 'min(300px, 36vh)',
                backgroundColor: '#1d1d1f',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {/* Viewfinder Target Frame */}
              <div
                style={{
                  position: 'absolute',
                  width: '200px',
                  height: '200px',
                  border: '2px dashed rgba(255, 255, 255, 0.65)',
                  borderRadius: '24px',
                  pointerEvents: 'none',
                }}
              />

              <div
                style={{
                  position: 'absolute',
                  bottom: '12px',
                  fontSize: '0.76rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  padding: '4px 10px',
                  borderRadius: '999px',
                }}
              >
                Center plate inside frame
              </div>
            </div>

            {/* Camera Actions */}
            <div style={{ display: 'flex', gap: '10px', width: '100%' }}>
              <Button
                variant="primary"
                size="lg"
                onClick={handleCapture}
                leftIcon={<Camera size={19} />}
                style={{ flex: 1 }}
              >
                Capture Photo
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => fileInputRef.current?.click()}
                leftIcon={<Upload size={18} />}
                style={{ flex: 1 }}
              >
                Upload File
              </Button>
            </div>
          </div>
        )}

        {/* STAGE 2: Photo Captured Preview */}
        {capturedImage && !detectedResult && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div
              style={{
                width: '100%',
                height: 'min(300px, 36vh)',
                borderRadius: '20px',
                overflow: 'hidden',
                position: 'relative',
                backgroundColor: '#000000',
              }}
            >
              <img
                src={capturedImage}
                alt="Captured food"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />

              {isAnalyzing && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.65)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    color: '#ffffff',
                  }}
                >
                  {/* Animated laser scanning line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: '10%',
                      right: '10%',
                      height: '3px',
                      background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)',
                      boxShadow: '0 0 15px #0284c7',
                      animation: 'scanBeam 2s ease-in-out infinite',
                    }}
                  />
                  <Sparkles size={32} color="#38bdf8" className="animate-spin" />
                  <div style={{ fontSize: '1rem', fontWeight: 600 }}>
                    Analyzing with Mdiet AI...
                  </div>
                  <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>
                    Identifying ingredients and portion size
                  </div>
                </div>
              )}
            </div>

            {!isAnalyzing && (
              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleUsePhoto}
                  leftIcon={<Check size={18} />}
                >
                  ✓ Use Photo
                </Button>
                <Button
                  variant="secondary"
                  fullWidth
                  size="lg"
                  onClick={handleRetake}
                  leftIcon={<RefreshCw size={18} />}
                >
                  ✕ Retake
                </Button>
              </div>
            )}
          </div>
        )}

        {/* STAGE 3: FOOD CONFIRMATION ("Does this look right?") */}
        {detectedResult && (
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
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: '#0284c7',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '6px',
                }}
              >
                Does this look right?
              </div>

              {/* Editable Name & Portion */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Food Name"
                  style={{
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    color: '#1d1d1f',
                    backgroundColor: '#ffffff',
                  }}
                />
                <input
                  type="text"
                  value={editPortion}
                  onChange={(e) => setEditPortion(e.target.value)}
                  placeholder="Estimated portion (e.g. 1 plate, 350g)"
                  style={{
                    fontSize: '0.88rem',
                    backgroundColor: '#ffffff',
                  }}
                />
              </div>

              {/* Main Calories */}
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

            {/* Meal Type Selector */}
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

            {/* Confirmation Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
              <Button
                variant="primary"
                fullWidth
                size="lg"
                onClick={handleConfirmAdd}
                leftIcon={<Check size={18} />}
              >
                ✓ I ate this
              </Button>

              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  variant="secondary"
                  fullWidth
                  size="md"
                  onClick={handleRetake}
                  leftIcon={<RefreshCw size={15} />}
                >
                  ↻ Re-scan
                </Button>
                <Button
                  variant="ghost"
                  fullWidth
                  size="md"
                  onClick={() => {
                    handleResetModal();
                    onClose();
                  }}
                  leftIcon={<X size={15} />}
                >
                  ✕ Not this
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}
