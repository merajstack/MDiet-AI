import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini, extractJsonFromText } from '@/utils/geminiServer';

interface PlanRequestBody {
  name: string;
  age: number;
  height: number;
  currentWeight: number;
  targetWeight: number;
  goal: 'lose' | 'maintain' | 'gain' | 'habits';
  activityLevel: 'sedentary' | 'light' | 'moderate' | 'very';
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PlanRequestBody;
    const { name, age, height, currentWeight, targetWeight, goal, activityLevel } = body;

    if (!age || !height || !currentWeight || !goal || !activityLevel) {
      return NextResponse.json(
        { error: 'Missing required biometric fields. Please complete all onboarding questions.' },
        { status: 400 }
      );
    }

    const prompt = `
You are a precision sports nutritionist and clinical metabolic scientist.
The user provided their real biometric profile:
- Name: ${name || 'User'}
- Age: ${age} years old
- Height: ${height} cm
- Current Body Weight: ${currentWeight} kg
- Target Weight: ${targetWeight || currentWeight} kg
- Primary Goal: ${goal}
- Activity Level: ${activityLevel}

Perform an exact metabolic rate calculation (BMR & TDEE) and generate 2 to 3 distinct, scientifically personalized nutrition and fitness plans tailored specifically to this user's numbers.

CRITICAL REQUIREMENTS:
1. Return strictly valid JSON only. No conversational prose or text outside JSON.
2. Structure:
{
  "plans": [
    {
      "id": "string",
      "name": "string (e.g. Balanced Fat Loss, High Protein Recomp, Sustainable Deficit)",
      "description": "string (concise clinical strategy rationale)",
      "dailyCalories": number (exact integer kcal calculated from Mifflin-St Jeor),
      "protein": number (exact integer grams),
      "carbs": number (exact integer grams),
      "fat": number (exact integer grams),
      "waterLiters": number (recommended daily water intake in liters based on body weight),
      "steps": number (daily ambulation step target),
      "estimatedWeeklyChange": "string (realistic rate e.g. -0.4 kg/week or +0.3 kg/week)",
      "strategyNotes": "string (actionable dietary guidance)"
    }
  ]
}

Ensure macro calorie math aligns with dailyCalories: (protein * 4) + (carbs * 4) + (fat * 9) ≈ dailyCalories.
Provide 2 to 3 distinct strategic options (e.g., balanced deficit, athletic high protein, gentle sustainable).
`;

    const rawResponse = await generateWithGemini(prompt);
    const parsedData = extractJsonFromText<{ plans: any[] }>(rawResponse);

    if (!parsedData.plans || !Array.isArray(parsedData.plans) || parsedData.plans.length === 0) {
      return NextResponse.json(
        { error: 'Mdiet AI did not return a valid list of plans. Please try again.' },
        { status: 502 }
      );
    }

    // Normalize values directly from Gemini's live output
    const realAiPlans = parsedData.plans.map((p, idx) => ({
      id: p.id || `plan-mdiet-${Date.now()}-${idx + 1}`,
      name: String(p.name || `Plan ${idx + 1}`),
      description: String(p.description || ''),
      dailyCalories: Math.round(Number(p.dailyCalories)),
      protein: Math.round(Number(p.protein)),
      carbs: Math.round(Number(p.carbs)),
      fat: Math.round(Number(p.fat)),
      waterLiters: Number(Number(p.waterLiters || 2.5).toFixed(1)),
      steps: Math.round(Number(p.steps) || 8000),
      estimatedWeeklyChange: String(p.estimatedWeeklyChange || '0.0 kg'),
      strategyNotes: String(p.strategyNotes || ''),
    }));

    return NextResponse.json({
      plans: realAiPlans,
      source: 'gemini_live_ai',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/plan:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate personalized plan with Mdiet AI. Please try again.',
      },
      { status: 500 }
    );
  }
}
