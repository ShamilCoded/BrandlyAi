import type { CampaignAgentInput, NormalizedCampaignSpec } from '@/lib/types/domain';

export function detectMissingAndAssumptions(input: CampaignAgentInput): {
  missing: string[];
  assumptions: string[];
} {
  const missing: string[] = [];
  const assumptions: string[] = [];

  if (!input.category || !input.category.trim()) {
    missing.push('Business category was not specified.');
  }
  if (!input.product_or_service || !input.product_or_service.trim()) {
    missing.push('Specific product or service name was not provided.');
  }
  if (!input.objective || !input.objective.trim()) {
    missing.push('Campaign objective was not specified.');
  }
  if (!input.budget || Number(input.budget) <= 0) {
    missing.push('Campaign budget was not provided or is zero.');
  }
  if (!input.target_audience || !input.target_audience.trim()) {
    missing.push('Target audience demographics are missing.');
  }
  if (!input.locations || input.locations.length === 0) {
    missing.push('Target geographic cities were not specified.');
  }
  if (!input.platforms || input.platforms.length === 0) {
    missing.push('Target social media platforms were not selected.');
  }
  if (!input.deliverables || input.deliverables.length === 0) {
    missing.push('Deliverables were not listed.');
  }
  if (!input.duration || !input.duration.trim()) {
    missing.push('Campaign duration was not specified.');
  }
  if (!input.languages || input.languages.length === 0) {
    missing.push('Content languages were not specified.');
  }

  const desc = (input.campaign_description || '').toLowerCase();
  if (desc.includes('not yet finalized') || desc.includes('tbd')) {
    missing.push('Description mentions unfinalized operational details.');
  }

  const includesUgc = (input.creator_types || []).some((t) =>
    t.toLowerCase().includes('ugc')
  );
  if (includesUgc && (!input.minimum_followers || input.minimum_followers === 0)) {
    assumptions.push(
      'Follower floor is set to 0 because UGC Creators are evaluated on content quality rather than audience size.'
    );
  }

  if (!input.currency) {
    assumptions.push('Defaulted currency to PKR.');
  }

  return { missing, assumptions };
}

export function buildNormalizedCampaignSpec(
  input: CampaignAgentInput
): NormalizedCampaignSpec {
  const checks = detectMissingAndAssumptions(input);
  const category = input.category?.trim() || 'General';
  const product = input.product_or_service?.trim() || 'General Product';
  const objective = input.objective?.trim() || 'Brand Awareness';
  const budget = Number(input.budget) || 0;
  const currency = input.currency?.trim() || 'PKR';
  const locations = input.locations || ['Karachi', 'Lahore', 'Islamabad'];
  const platforms = input.platforms || ['Instagram', 'TikTok'];
  const niches = input.niches || ['Technology'];
  const creatorTypes = input.creator_types || ['Influencer', 'UGC Creator'];
  const deliverables = input.deliverables || ['Reel', 'Product review'];
  const languages = input.languages || ['English', 'Urdu'];

  return {
    campaign_category: category,
    product_or_service: product,
    objective,
    budget,
    currency,
    target_audience: input.target_audience?.trim() || 'Target Consumers',
    target_location: locations,
    platforms,
    niches,
    creator_types: creatorTypes,
    minimum_followers: creatorTypes.includes('UGC Creator') ? 0 : Number(input.minimum_followers) || 0,
    deliverables,
    content_style: [
      'Authentic product demonstration',
      'Native vertical video storytelling',
    ],
    duration: input.duration?.trim() || '4 Weeks',
    languages,
    missing_information: checks.missing,
    assumptions: checks.assumptions,
    summary_explanation: `Normalized ${category} campaign for "${product}" (${objective}) with budget ${currency} ${budget.toLocaleString()} targeting ${locations.join(
      ', '
    )} across ${platforms.join(', ')}.`,
  };
}
