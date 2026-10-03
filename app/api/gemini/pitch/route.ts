import { GoogleGenAI, Type } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export interface PitchGenerationRequest {
  campaign: {
    businessName?: string;
    campaignName?: string;
    category?: string;
    productOrService?: string;
    objective?: string;
    budget?: number;
    currency?: string;
    targetAudience?: string;
    targetLocation?: string[];
    platforms?: string[];
    niches?: string[];
    creatorTypes?: string[];
    deliverables?: string[];
    contentStyle?: string[];
    languages?: string[];
  };
  creator: {
    id: string;
    name: string;
    creatorType: string;
    location: string;
    platforms: string[];
    primaryNiche: string;
    secondaryNiches?: string[];
    services?: string[];
    languages?: string[];
    followers?: number | null;
    averageViews?: number | null;
    engagementRate?: number | null;
  };
  pitchType: 'instagram_dm' | 'email' | 'short_message';
  tone?: 'professional' | 'friendly' | 'concise';
}

export interface PitchGenerationResponse {
  pitchType: 'instagram_dm' | 'email' | 'short_message';
  subject: string;
  message: string;
  personalizationPoints: string[];
}

const SYSTEM_INSTRUCTION = `You are Brandly.ai's professional creator outreach assistant.

Generate a concise, personalized outreach message for a business contacting a creator about a specific campaign.

Use only information supplied in the campaign and creator profile.

Personalize the message based on genuine creator-campaign relevance.

Never invent:
- follower statistics
- engagement statistics
- audience demographics
- previous collaborations
- brands worked with
- awards
- reviews
- portfolio achievements
- pricing
- availability
- creator interests
- personal information

Do not claim that the creator is verified.
Do not claim guaranteed campaign performance.
Do not exaggerate the creator's suitability.

The message should explain why the business is reaching out to this specific creator.
Keep the message natural rather than sounding like an AI-generated template.
Do not mention Brandly.ai unless the business/campaign context specifically requires it.
Do not reveal internal AI reasoning.

Return only the requested pitch content in the required structured format.
For instagram_dm and short_message, the subject field must be empty ("").
For email, the subject field must be a concise, engaging subject line.
The personalizationPoints field must contain 2 to 4 short factual reasons why the pitch was personalized based strictly on supplied data.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as PitchGenerationRequest;
    const { campaign, creator, pitchType, tone = 'professional' } = body;

    if (!creator || !creator.name) {
      return NextResponse.json(
        { error: 'Creator information is required' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
      return NextResponse.json(
        { error: 'GEMINI_API_KEY is not configured on the server' },
        { status: 503 }
      );
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });

    const userPrompt = JSON.stringify({
      campaign: {
        businessName: campaign?.businessName || 'Our Brand',
        campaignName: campaign?.campaignName || 'Product Collaboration',
        category: campaign?.category || '',
        productOrService: campaign?.productOrService || '',
        objective: campaign?.objective || '',
        budget: campaign?.budget || 0,
        currency: campaign?.currency || 'PKR',
        targetAudience: campaign?.targetAudience || '',
        targetLocation: campaign?.targetLocation || [],
        platforms: campaign?.platforms || [],
        niches: campaign?.niches || [],
        creatorTypes: campaign?.creatorTypes || [],
        deliverables: campaign?.deliverables || [],
        contentStyle: campaign?.contentStyle || [],
        languages: campaign?.languages || [],
      },
      creator: {
        id: creator.id,
        name: creator.name,
        creatorType: creator.creatorType,
        location: creator.location,
        platforms: creator.platforms,
        primaryNiche: creator.primaryNiche,
        secondaryNiches: creator.secondaryNiches || [],
        services: creator.services || [],
        languages: creator.languages || [],
        followers: creator.followers ?? null,
        averageViews: creator.averageViews ?? null,
        engagementRate: creator.engagementRate ?? null,
      },
      pitchType,
      tone,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            pitchType: {
              type: Type.STRING,
              enum: ['instagram_dm', 'email', 'short_message'],
            },
            subject: {
              type: Type.STRING,
              description: 'Subject line for email, empty string for DM or short message',
            },
            message: {
              type: Type.STRING,
              description: 'The complete personalized outreach text',
            },
            personalizationPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: '2-4 short factual reasons for personalization based only on provided data',
            },
          },
          required: ['pitchType', 'subject', 'message', 'personalizationPoints'],
        },
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Empty response received from Gemini model');
    }

    const parsed: PitchGenerationResponse = JSON.parse(text);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error('[Brandly.ai] Error generating pitch via Gemini:', error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Unable to generate personalized pitch right now.',
      },
      { status: 500 }
    );
  }
}
