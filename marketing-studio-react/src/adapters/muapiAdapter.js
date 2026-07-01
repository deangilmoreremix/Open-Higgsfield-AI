/**
 * MuAPI Adapter
 * Handles image and video generation via MuAPI.ai
 */

import * as marketingService from '../services/marketingStudioService';

const MUAPI_BASE_URL = 'https://api.muapi.ai';

/**
 * Submit a generation request
 * @param {string} apiKey - MuAPI API key
 * @param {string} endpoint - Model endpoint
 * @param {Object} payload - Request payload
 * @returns {Promise<Object>} - Response data with request_id
 */
export async function submitGeneration(apiKey, endpoint, payload) {
  const response = await fetch(`${MUAPI_BASE_URL}/api/v1/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Generation failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

/**
 * Poll for result
 * @param {string} apiKey - API key
 * @param {string} requestId - Request ID
 * @param {number} maxAttempts - Maximum attempts
 * @returns {Promise<Object>} - Final result
 */
export async function pollForResult(apiKey, requestId, maxAttempts = 30) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch(`${MUAPI_BASE_URL}/api/v1/predictions/${requestId}/result`, {
      headers: { 'x-api-key': apiKey }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.status === 'completed' && data.output_url) {
        return data;
      }
      if (data.status === 'failed') {
        throw new Error('Generation failed');
      }
    }
  }
  
  throw new Error('Generation timed out');
}

/**
 * Generate image
 * @param {string} apiKey - API key
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Result with output_url
 */
export async function generateImage(apiKey, options) {
  const response = await submitGeneration(apiKey, 'flux-dev', {
    prompt: options.prompt,
    width: options.width || 1024,
    height: options.height || 1024
  });

  const requestId = response.request_id || response.id;
  if (requestId) {
    return pollForResult(apiKey, requestId);
  }
  return response;
}

/**
 * Generate video
 * @param {string} apiKey - API key
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} - Result with output_url
 */
export async function generateVideo(apiKey, options) {
  const response = await submitGeneration(apiKey, options.endpoint || 'kling-v2.1', {
    prompt: options.prompt,
    duration: options.duration || 5,
    aspect_ratio: options.aspectRatio || '16:9'
  });

  const requestId = response.request_id || response.id;
  if (requestId) {
    return pollForResult(apiKey, requestId);
  }
  return response;
}

// Re-export from marketing service
export const uploadFile = marketingService.uploadFile;
export const generateMarketingStudioAd = marketingService.generateMarketingStudioAd;

export default {
  submitGeneration,
  pollForResult,
  generateImage,
  generateVideo,
  uploadFile,
  generateMarketingStudioAd
};