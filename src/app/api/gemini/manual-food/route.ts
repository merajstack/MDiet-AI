import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini, extractJsonFromText } from '@/utils/geminiServer';

interface ManualFoodBody {
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ManualFoodBody;
    const { text } = body;

    if (!text || text.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please enter a description of what you ate.' },
        { status: 400 }
      );
    }

    const prompt = `
You are a precision clinical nutritional database and food science intelligence model.
The user described their meal in natural language: "${text.trim()}".

Deconstruct this description into exact food items, estimate realistic portion sizes, and calculate accurate macronutrients (calories, protein, carbohydrates, fat, fiber).

CRITICAL REQUIREMENTS:
1. Return strictly valid JSON only. No conversational prose or text outside JSON.
2. JSON structure:
{
  "items": [
    {
      "name": "string (food item name)",
      "estimatedPortion": "string (e.g. 2 large eggs, 2 slices whole wheat toast)",
      "calories": number (integer kcal),
      "protein": number (integer grams),
      "carbs": number (integer grams),
      "fat": number (integer grams),
      "fiber": number (integer grams, optional),
      "notes": "string (brief nutritional note)"
    }
  ],
  "totalCalories": number (sum of calories),
  "totalProtein": number (sum of protein),
  "totalCarbs": number (sum of carbs),
  "totalFat": number (sum of fat)
}
`;

    const rawResponse = await generateWithGemini(prompt);
    const parsed = extractJsonFromText<any>(rawResponse);

    if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      return NextResponse.json(
        { error: 'Mdiet AI was unable to parse recognizable food items from that description. Please try being more specific.' },
        { status: 422 }
      );
    }

    let totalCals = 0;
    let totalProt = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const realItems = parsed.items.map((item: any, i: number) => {
      const c = Math.round(Number(item.calories ?? item.kcal ?? item.energy) || 0);
      const p = Math.round(Number(item.protein ?? item.protein_g ?? item.proteinGrams) || 0);
      const cb = Math.round(Number(item.carbs ?? item.carbs_g ?? item.carbohydrates ?? item.carbohydrates_g) || 0);
      const f = Math.round(Number(item.fat ?? item.fat_g ?? item.fatGrams ?? item.total_fat) || 0);
      const fib = item.fiber ?? item.fiber_g ? Math.round(Number(item.fiber ?? item.fiber_g)) : undefined;

      totalCals += c;
      totalProt += p;
      totalCarbs += cb;
      totalFat += f;

      return {
        id: `food-manual-${Date.now()}-${i}`,
        name: String(item.name || text.slice(0, 30)),
        estimatedPortion: String(item.estimatedPortion || item.portion || item.quantity || '1 serving'),
        calories: c,
        protein: p,
        carbs: cb,
        fat: f,
        fiber: fib,
        notes: item.notes ? String(item.notes) : undefined,
      };
    });

    return NextResponse.json({
      items: realItems,
      totalCalories: totalCals,
      totalProtein: totalProt,
      totalCarbs: totalCarbs,
      totalFat: totalFat,
      source: 'gemini_nlp_live',
    });
  } catch (error: any) {
    console.error('Error in /api/gemini/manual-food:', error);
    return NextResponse.json(
      {
        error: error.message || 'Mdiet AI failed to process meal description. Please try again.',
      },
      { status: 500 }
    );
  }
}
