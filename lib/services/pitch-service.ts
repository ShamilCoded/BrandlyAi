import type { Campaign, Creator } from '@/lib/types/domain';
import type {
  PitchGenerationRequest,
  PitchGenerationResponse,
} from '@/app/api/gemini/pitch/route';

export type PitchType = 'instagram_dm' | 'email' | 'short_message';
export type PitchTone = 'professional' | 'friendly' | 'concise';

export interface GeneratePitchParams {
  campaign: Partial<Campaign> & {
    businessName?: string;
  };
  creator: Creator;
  pitchType: PitchType;
  tone?: PitchTone;
}

export interface GeneratedPitchResult {
  pitchType: PitchType;
  subject: string;
  message: string;
  personalizationPoints: string[];
  isAiGenerated: boolean;
}

/**
 * Deterministic fallback pitch generator
 * Strictly adheres to truthfulness rules — uses only supplied data.
 */
function generateDeterministicPitch(
  params: GeneratePitchParams
): PitchGenerationResponse {
  const { campaign, creator, pitchType, tone = 'professional' } = params;
  const brandName = campaign.businessName || 'our brand';
  const campaignName = campaign.title || campaign.productOrService || 'our new campaign';
  const creatorName = creator.name;
  const niche = creator.primaryNiche;
  const platforms = creator.platforms.join(' & ');
  const deliverables = (campaign.deliverables && campaign.deliverables.length > 0)
    ? campaign.deliverables.slice(0, 2).join(' and ')
    : (creator.services && creator.services.length > 0 ? creator.services[0] : 'content collaboration');
  const budgetStr = campaign.budget ? `PKR ${campaign.budget.toLocaleString()}` : '';

  const points: string[] = [
    `Referenced creator's specialization in ${niche} content.`,
    `Aligned with required platforms (${platforms}).`,
  ];
  if (campaign.productOrService) {
    points.push(`Highlighted relevance to ${campaign.productOrService}.`);
  }
  if (deliverables) {
    points.push(`Specified required deliverables: ${deliverables}.`);
  }

  let message = '';
  let subject = '';

  if (pitchType === 'instagram_dm') {
    subject = '';
    if (tone === 'friendly') {
      message = `Hi ${creatorName}! 👋 Hope you're doing great. We love your ${niche} content on ${platforms}. We're currently planning a campaign at ${brandName} for ${campaignName} and think your style would be a fantastic fit for ${deliverables}. Would love to share our brief and discuss a paid collaboration—let us know if you're open to reviewing!`;
    } else if (tone === 'concise') {
      message = `Hi ${creatorName}, reaching out from ${brandName}. We're launching ${campaignName} and are looking for a ${creator.creatorType.toLowerCase()} specializing in ${niche} across ${platforms}. We'd love to collaborate with you on ${deliverables}${budgetStr ? ` (budget: ${budgetStr})` : ''}. Let us know if you're interested!`;
    } else {
      message = `Hello ${creatorName}, I'm reaching out on behalf of ${brandName}. We came across your work in the ${niche} space on ${platforms} and believe your content approach aligns well with our upcoming campaign for ${campaignName}. We're looking to partner on ${deliverables}. Please let us know if you'd be interested in discussing the details.`;
    }
  } else if (pitchType === 'email') {
    subject = `Collaboration Opportunity: ${brandName} × ${creatorName} (${campaignName})`;
    if (tone === 'friendly') {
      message = `Hi ${creatorName},\n\nHope this email finds you well!\n\nI'm reaching out from ${brandName}. We've been following your ${niche} content across ${platforms} and really appreciate the quality and authenticity of your work.\n\nWe are currently launching a campaign for "${campaignName}" and would love to collaborate with you on ${deliverables}. We believe your creative voice would resonate strongly with our target audience in Pakistan.\n\n${budgetStr ? `We have allocated an initial budget around ${budgetStr} for this partnership.\n\n` : ''}If you are currently accepting brand collaborations, please let us know so we can send over the complete brief and discuss terms.\n\nLooking forward to hearing from you!\n\nBest regards,\n${brandName} Team`;
    } else if (tone === 'concise') {
      message = `Dear ${creatorName},\n\nI am contacting you from ${brandName} regarding a paid partnership for our upcoming campaign: "${campaignName}".\n\nGiven your focus on ${niche} and your presence on ${platforms}, we would like to propose a collaboration for ${deliverables}${budgetStr ? ` with a budget of ${budgetStr}` : ''}.\n\nPlease let us know if you are available and interested in reviewing the full campaign brief.\n\nBest regards,\n${brandName} Team`;
    } else {
      message = `Dear ${creatorName},\n\nI hope you are having a productive week.\n\nI am reaching out on behalf of ${brandName} to explore a collaboration for our upcoming campaign, "${campaignName}".\n\nWe identified your profile as a strong match given your focus in ${niche} and active engagement on ${platforms}. We are seeking tailored deliverables including ${deliverables} to promote our ${campaign.category || 'product'}.\n\n${budgetStr ? `We have an allocated campaign budget of ${budgetStr}.\n\n` : ''}If this aligns with your current availability and schedule, we would be delighted to share the detailed proposal with you.\n\nWarm regards,\n${brandName} Team`;
    }
  } else {
    // short_message
    subject = '';
    if (tone === 'friendly') {
      message = `Hi ${creatorName}! We're at ${brandName} and love your ${niche} work on ${platforms}. We have a paid campaign for ${campaignName} and would love to partner with you on ${deliverables}. Let us know if you'd like to check out the brief!`;
    } else if (tone === 'concise') {
      message = `${brandName} is looking to collaborate with ${creatorName} for ${campaignName} (${niche} / ${deliverables}${budgetStr ? ` · ${budgetStr}` : ''}). Please let us know if you are open for collaboration.`;
    } else {
      message = `Hello ${creatorName}, reaching out from ${brandName} regarding a partnership for "${campaignName}". We'd like to work with you on ${deliverables} based on your expertise in ${niche} on ${platforms}. Let us know if you'd like to review the proposal.`;
    }
  }

  return {
    pitchType,
    subject,
    message,
    personalizationPoints: points.slice(0, 4),
  };
}

/**
 * Primary Client Service: generateCreatorPitch
 * Tries the server-side Gemini route first; falls back gracefully to deterministic generator.
 */
export async function generateCreatorPitch(
  params: GeneratePitchParams
): Promise<GeneratedPitchResult> {
  const { campaign, creator, pitchType, tone = 'professional' } = params;

  const payload: PitchGenerationRequest = {
    campaign: {
      businessName: campaign.businessName,
      campaignName: campaign.title,
      category: campaign.category,
      productOrService: campaign.productOrService,
      objective: campaign.objective,
      budget: campaign.budget,
      currency: campaign.currency || 'PKR',
      targetAudience: campaign.audienceAgeRange
        ? `${campaign.audienceAgeRange}, ${campaign.audienceGender || 'All'}`
        : undefined,
      targetLocation: campaign.targetLocations,
      platforms: campaign.platforms,
      niches: campaign.preferredNiches,
      creatorTypes: campaign.creatorTypes,
      deliverables: campaign.deliverables,
      contentStyle: undefined,
      languages: campaign.languages,
    },
    creator: {
      id: creator.id,
      name: creator.name,
      creatorType: creator.creatorType,
      location: creator.location,
      platforms: creator.platforms,
      primaryNiche: creator.primaryNiche,
      secondaryNiches: creator.secondaryNiches,
      services: creator.services,
      languages: creator.languages,
      followers: creator.followers,
      averageViews: creator.averageViews,
      engagementRate: creator.engagementRate,
    },
    pitchType,
    tone,
  };

  try {
    const res = await fetch('/api/gemini/pitch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const data = (await res.json()) as PitchGenerationResponse;
      if (data && data.message) {
        return {
          pitchType: data.pitchType || pitchType,
          subject: data.subject || '',
          message: data.message,
          personalizationPoints:
            data.personalizationPoints && data.personalizationPoints.length > 0
              ? data.personalizationPoints
              : [
                  `Tailored for ${creator.name}'s ${creator.primaryNiche} specialization.`,
                  `Matched to ${creator.platforms.join(' & ')} delivery.`,
                ],
          isAiGenerated: true,
        };
      }
    }
  } catch (err) {
    console.warn('[Brandly.ai] Server-side pitch generation note, using deterministic fallback:', err);
  }

  // Graceful deterministic fallback
  const fallback = generateDeterministicPitch(params);
  return {
    pitchType: fallback.pitchType,
    subject: fallback.subject,
    message: fallback.message,
    personalizationPoints: fallback.personalizationPoints,
    isAiGenerated: false,
  };
}
