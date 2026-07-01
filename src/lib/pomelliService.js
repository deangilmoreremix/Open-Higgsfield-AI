import { analyzeBrandFromUrl, generateCampaignConcepts } from '../lib/marketingStudioApiClient.js';

export async function extractBrandDNA({ url }, apiKey) {
  return analyzeBrandFromUrl({ url, apiKey });
}

export async function generateCampaignConcepts(brandDna, goal, apiKey) {
  return generateCampaignConcepts({ brandDna, campaignType: goal, apiKey });
}