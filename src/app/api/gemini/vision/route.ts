import { NextRequest, NextResponse } from 'next/server';
import { generateWithGemini, extractJsonFromText } from '@/utils/geminiServer';

interface VisionRequestBody {
  imageBase64: string;
  mimeType?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as VisionRequestBody;
    const { imageBase64, mimeType = 'image/jpeg' } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided for food analysis.' },
        { status: 400 }
      );
    }

    // Strip data URL prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-zA-Z0-9+.-]+;base64,/, '');

    const prompt = `
You are a precision clinical nutritionist and computer vision AI.
Inspect this photo carefully.
1. Determine if this image contains consumable food or meals. If it does NOT contain food (or is blank, unrelated, or indecipherable), set "detectedFood": false and explain in "message".
2. If food is present, identify all visible food items, their estimated real portion sizes, and their nutritional breakdown (calories, protein, carbohydrates, fat, fiber).

CRITICAL REQUIREMENTS:
- Return strictly valid JSON only.
- Output JSON structure:
{
  "detectedFood": boolean,
  "message": "string (only if detectedFood is false)",
  "confidence": "high" | "medium" | "low",
  "items": [
    {
      "name": "string (exact name of the identified dish/item)",
      "estimatedPortion": "string (e.g. 1 plate, 200g, 2 pieces)",
      "calories": number (integer kcal),
      "protein": number (integer grams),
      "carbs": number (integer grams),
      "fat": number (integer grams),
      "fiber": number (integer grams, optional),
      "notes": "string (brief culinary and macro notes)"
    }
  ],
  "totalCalories": number (sum of calories),
  "totalProtein": number (sum of protein),
  "totalCarbs": number (sum of carbs),
  "totalFat": number (sum of fat)
}
`;

    const imagePart = {
      inlineData: {
        data: cleanBase64,
        mimeType: mimeType || 'image/jpeg',
      },
    };

    const rawResponse = await generateWithGemini(prompt, [imagePart]);
    const parsed = extractJsonFromText<any>(rawResponse);

    if (parsed.detectedFood === false) {
      return NextResponse.json(
        {
          error:
            parsed.message ||
            "Mdiet AI could not detect food in this image. Please take a clear photo of your dish.",
          detectedFood: false,
        },
        { status: 422 }
      );
    }

    if (!parsed.items || !Array.isArray(parsed.items) || parsed.items.length === 0) {
      return NextResponse.json(
        {
          error:
            "Mdiet AI could not identify specific meal items in this photo. Please try a closer, well-lit shot.",
          detectedFood: false,
        },
        { status: 422 }
      );
    }

    // Calculate deterministic sums from Gemini's detected items
    let calculatedTotalCals = 0;
    let calculatedProtein = 0;
    let calculatedCarbs = 0;
    let calculatedFat = 0;

    const realItems = parsed.items.map((item: any, i: number) => {
      const cals = Math.round(Number(item.calories ?? item.kcal ?? item.energy) || 0);
      const prot = Math.round(Number(item.protein ?? item.protein_g ?? item.proteinGrams) || 0);
      const carbs = Math.round(Number(item.carbs ?? item.carbs_g ?? item.carbohydrates ?? item.carbohydrates_g) || 0);
      const fat = Math.round(Number(item.fat ?? item.fat_g ?? item.fatGrams ?? item.total_fat) || 0);
      const fiber = item.fiber ?? item.fiber_g ? Math.round(Number(item.fiber ?? item.fiber_g)) : undefined;

      calculatedTotalCals += cals;
      calculatedProtein += prot;
      calculatedCarbs += carbs;
      calculatedFat += fat;

      return {
        id: `food-item-${Date.now()}-${i}`,
        name: String(item.name || 'Identified Dish'),
        estimatedPortion: String(item.estimatedPortion || item.portion || item.quantity || '1 serving'),
        calories: cals,
        protein: prot,
        carbs: carbs,
        fat: fat,
        fiber: fiber,
        notes: item.notes ? String(item.notes) : undefined,
      };
    });

    return NextResponse.json({
      items: realItems,
      totalCalories: calculatedTotalCals,
      totalProtein: calculatedProtein,
      totalCarbs: calculatedCarbs,
      totalFat: calculatedFat,
      confidence: parsed.confidence || 'high',
      detectedFood: true,
      source: 'gemini_vision_live',
    });
  } catch (error: any) {
    console.error('Error analyzing food image with Gemini vision:', error);
    return NextResponse.json(
      {
        error:
          error.message ||
          "Mdiet AI failed to analyze this image. Please ensure your food is clearly visible and try again.",
      },
      { status: 500 }
    );
  }
}
