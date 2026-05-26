/**
 * Marketing Studio Service
 * Handles API calls for file upload and video generation
 */

const MUAPI_BASE_URL = 'https://api.muapi.ai';

/**
 * Upload a file to MuAPI
 * @param {File} file - The file to upload
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} - URL of uploaded file
 */
export async function uploadFile(file, onProgress = () => {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = Math.round((e.loaded / e.total) * 100);
        onProgress(progress);
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response.url || response.file_url || response);
        } catch (e) {
          reject(new Error('Invalid response from upload'));
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', `${MUAPI_BASE_URL}/api/v1/upload_file`);
    xhr.setRequestHeader('x-api-key', import.meta.env.VITE_MUAPI_API_KEY || '');
    xhr.send(formData);
  });
}

/**
 * Generate a marketing studio ad
 * @param {Object} params - Generation parameters
 * @param {string} params.apiKey - MuAPI API key
 * @param {string} params.prompt - Text prompt
 * @param {string} params.productImage - Product image URL
 * @param {string} params.avatarImage - Avatar image URL
 * @param {string[]} params.additionalImages - Additional reference images
 * @param {string} params.ratio - Aspect ratio
 * @param {string} params.format - UGC format name
 * @param {string} params.videoUrl - Reference video URL
 * @param {string} params.resolution - Video resolution (720p or 1080p)
 * @param {number} params.duration - Video duration in seconds
 * @returns {Promise<Object>} - Generation result with output_url
 */
export async function generateMarketingStudioAd(params) {
  const { apiKey, prompt, productImage, avatarImage, additionalImages, ratio, videoUrl, resolution, duration } = params;

  const endpoint = resolution === '1080p' 
    ? 'sd-2-vip-omni-reference-1080p' 
    : 'seedance-2-vip-omni-reference';

  const aspectRatio = ratio.replace(':', '_');
  
  const payload = {
    prompt,
    aspect_ratio: aspectRatio,
    duration,
    images_list: [productImage, avatarImage, ...(additionalImages || [])].filter(Boolean),
    video_files: videoUrl ? [videoUrl] : []
  };

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

  const data = await response.json();
  
  let result = data;
  const requestId = data.request_id || data.id;
  
  if (requestId) {
    result = await pollForResult(requestId, apiKey, 30);
  }

  return result;
}

/**
 * Poll for generation result
 * @param {string} requestId - Request ID from initial submission
 * @param {string} apiKey - API key
 * @param {number} maxAttempts - Maximum polling attempts
 * @returns {Promise<Object>} - Final result
 */
async function pollForResult(requestId, apiKey, maxAttempts) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const response = await fetch(`${MUAPI_BASE_URL}/api/v1/predictions/${requestId}/result`, {
      headers: {
        'x-api-key': apiKey
      }
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

export default {
  uploadFile,
  generateMarketingStudioAd
};