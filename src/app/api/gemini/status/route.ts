import { NextResponse } from 'next/server';
import { isGeminiConfigured } from '@/utils/geminiServer';

export async function GET() {
  const configured = isGeminiConfigured();
  return NextResponse.json({
    configured,
    message: configured
      ? 'Mdiet AI is active and connected.'
      : 'Mdiet AI is not configured in .env.local.',
  });
}
