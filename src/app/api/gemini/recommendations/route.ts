import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini, extractJsonFromText } from '@/utils/geminiServer';
import { PersonalPlan } from '@/types';

interface RecRequestBody {
  plan: PersonalPlan;
  recentStats: {
    avgCalories: number;
    avgProtein: number;
    avgWaterLiters: number;
    daysLogged: number;
    goal: string;
    weightChangeKg?: number;
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as RecRequestBody;
    const { plan, recentStats } = body;

    const prompt = `
You are a sports science intelligence engine for M Diet.
Based strictly on the user's real current nutrition plan and their actual logged tracking stats, formulate 2 to 3 structured actionable adjustments.

Current Real Plan:
- Daily Calories: ${plan?.dailyCalories} kcal
- Protein: ${plan?.protein}g
- Carbs: ${plan?.carbs}g
- Fat: ${plan?.fat}g
- Water: ${plan?.waterLiters}L
- Steps: ${plan?.steps}

Recent Tracking Stats:
- Average Daily Calories Consumed: ${recentStats?.avgCalories || plan?.dailyCalories} kcal
- Average Daily Protein: ${recentStats?.avgProtein || plan?.protein}g
- Average Daily Water: ${recentStats?.avgWaterLiters || plan?.waterLiters}L
- Primary Goal: ${recentStats?.goal || 'healthy habits'}
- Days Logged: ${recentStats?.daysLogged || 1}

CRITICAL REQUIREMENTS:
1. Do NOT act like a conversational chatbot. No introductory or pleasantry text.
2. Return strictly valid JSON containing 2 to 3 structured recommendation cards.
3. Structure:
{
  "recommendations": [
    {
      "id": "string",
      "title": "string (e.g. Calibrate Daily Calorie Budget)",
      "tagline": "string (e.g. 1,750 kcal/day or 140g protein)",
      "description": "string (1-2 sentences on clinical rationale)",
      "type": "calorie_adjustment" | "macro_rebalance" | "hydration_focus" | "activity_boost",
      "suggestedPlan": {
        "dailyCalories": number (optional integer),
        "protein": number (optional integer),
        "carbs": number (optional integer),
        "fat": number (optional integer),
        "waterLiters": number (optional float),
        "steps": number (optional integer)
      },
      "reasons": ["string", "string"]
    }
  ]
}
`;

    const rawResponse = await generateWithGemini(prompt);
    const parsed = extractJsonFromText<{ recommendations: any[] }>(rawResponse);

    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
      return NextResponse.json(
        { error: 'Mdiet AI did not return recommendations in the required structure.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      recommendations: parsed.recommendations,
      source: 'gemini_live_ai',
    });
  } catch (error: any) {
    console.error('Error generating AI recommendations with Gemini:', error);
    return NextResponse.json(
      {
        error: error.message || 'Failed to generate recommendations with Mdiet AI.',
      },
      { status: 500 }
    );
  }
}
