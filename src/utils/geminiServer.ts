import { GoogleGenerativeAI, Part } from '@google/generative-ai';

/**
 * Server-side Gemini AI integration utilities
 * NEVER import this file in client components.
 */

export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'YOUR_API_KEY_HERE' || key.trim() === '') {
    return null;
  }
  return key.trim();
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey() !== null;
}

/**
 * Executes a Gemini request using official Gemini models.
 * Automatically tries siblings (gemini-3.5-flash -> gemini-3.5-flash-lite -> gemini-3.8-flash)
 * if temporary 503 (demand spike) or 429 (rate limit) occurs on a model.
 * Zero fake metrics — all results are genuine output from Google Generative AI.
 */
export async function generateWithGemini(
  prompt: string,
  extraParts?: Part[]
): Promise<string> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Mdiet AI service key is not configured in .env.local. Please check your GEMINI_API_KEY.');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  // High-availability priority list of active models in Google Generative AI
  const modelsToTry = [
    'gemini-3.5-flash',
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      const model = genAI.getGenerativeModel({
        model: modelName,
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      });

      const contents = extraParts && extraParts.length > 0
        ? [prompt, ...extraParts]
        : prompt;

      const result = await model.generateContent(contents);
      const text = result.response.text();
      if (text && text.trim().length > 0) {
        return text;
      }
    } catch (err: any) {
      console.warn(`[Gemini API] Notice for model ${modelName}:`, err.message);
      lastError = err;

      // If temporary overload (503), rate limit (429), or deprecated (404), continue to next model
      if (
        err.status === 503 ||
        err.status === 429 ||
        err.status === 404 ||
        err.message?.includes('503') ||
        err.message?.includes('429') ||
        err.message?.includes('404') ||
        err.message?.includes('quota')
      ) {
        continue;
      }

      // If auth issue, throw immediately
      if (err.status === 400 || err.status === 401 || err.message?.includes('API_KEY_INVALID')) {
        throw new Error('The GEMINI_API_KEY in .env.local is invalid or unauthorized.');
      }
    }
  }

  throw new Error(
    lastError?.message || 'Mdiet AI service is temporarily unavailable. Please try again shortly.'
  );
}

/**
 * Extracts and safely parses JSON from a model output text,
 * stripping markdown code fence blocks if present.
 */
export function extractJsonFromText<T>(text: string): T {
  let cleaned = text.trim();
  // Strip markdown ```json ... ``` or ``` ... ```
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/```\s*$/, '');
  }

  // Find first { or [ and last } or ]
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIdx = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1) {
      cleaned = cleaned.substring(startIdx, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    const lastBracket = cleaned.lastIndexOf(']');
    if (lastBracket !== -1) {
      cleaned = cleaned.substring(startIdx, lastBracket + 1);
    }
  }

  return JSON.parse(cleaned) as T;
}
