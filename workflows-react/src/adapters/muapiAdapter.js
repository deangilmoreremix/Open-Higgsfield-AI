const API_BASE = 'https://api.muapi.ai/api/v1';

export const muapiAdapter = {
  async generateImage(params) {
    const apiKey = localStorage.getItem('muapi_key');
    if (!apiKey) {
      return generateMockImage(params);
    }

    const { model = 'flux-dev', prompt, aspect_ratio = '1:1', quality = 'high', size = '1024x1024', image_url, images_list } = params;

    const payload = {
      model,
      prompt,
      aspect_ratio,
      quality,
      size,
      ...(image_url && { image_url }),
      ...(images_list?.length && { images_list }),
    };

    try {
      const response = await fetch(`${API_BASE}/image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const requestId = data.request_id;

      if (!requestId) {
        throw new Error('No request_id returned');
      }

      const result = await this.pollForResult(requestId);
      return {
        status: 'completed',
        outputs: [{ type: 'image_url', value: result.output || result.url }],
        resultUrl: result.output || result.url,
      };
    } catch (error) {
      console.error('MuAPI image generation error:', error);
      return generateMockImage(params);
    }
  },

  async generateVideo(params) {
    const apiKey = localStorage.getItem('muapi_key');
    if (!apiKey) {
      return generateMockVideo(params);
    }

    const {
      model = 'wan-2-1',
      prompt,
      aspect_ratio = '16:9',
      duration = 5,
      quality = 'high',
      image_url,
      last_image,
      video_url,
      audio_url,
      images_list,
      videos_list,
      audios_list,
    } = params;

    const payload = {
      model,
      prompt,
      aspect_ratio,
      duration,
      quality,
      ...(image_url && { image_url }),
      ...(last_image && { last_image }),
      ...(video_url && { video_url }),
      ...(audio_url && { audio_url }),
      ...(images_list?.length && { images_list }),
      ...(videos_list?.length && { videos_list }),
      ...(audios_list?.length && { audios_list }),
    };

    try {
      const response = await fetch(`${API_BASE}/video`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const requestId = data.request_id;

      if (!requestId) {
        throw new Error('No request_id returned');
      }

      const result = await this.pollForResult(requestId);
      return {
        status: 'completed',
        outputs: [{ type: 'video_url', value: result.output || result.video?.url }],
        resultUrl: result.output || result.video?.url,
      };
    } catch (error) {
      console.error('MuAPI video generation error:', error);
      return generateMockVideo(params);
    }
  },

  async generateAudio(params) {
    const apiKey = localStorage.getItem('muapi_key');
    if (!apiKey) {
      return generateMockAudio(params);
    }

    const { model = 'music-gen', prompt, audio_url } = params;

    const payload = {
      model,
      prompt,
      ...(audio_url && { audio_url }),
    };

    try {
      const response = await fetch(`${API_BASE}/audio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const requestId = data.request_id;

      if (!requestId) {
        throw new Error('No request_id returned');
      }

      const result = await this.pollForResult(requestId);
      return {
        status: 'completed',
        outputs: [{ type: 'audio_url', value: result.output || result.audio?.url }],
        resultUrl: result.output || result.audio?.url,
      };
    } catch (error) {
      console.error('MuAPI audio generation error:', error);
      return generateMockAudio(params);
    }
  },

  async checkStatus(requestId) {
    const apiKey = localStorage.getItem('muapi_key');
    if (!apiKey) {
      return { status: 'completed', output: 'https://picsum.photos/1024/1024' };
    }

    try {
      const response = await fetch(`${API_BASE}/predictions/${requestId}/result`, {
        headers: {
          'x-api-key': apiKey,
        },
      });

      if (!response.ok) {
        throw new Error(`Status check error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('MuAPI status check error:', error);
      throw error;
    }
  },

  async pollForResult(requestId, maxAttempts = 60) {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const interval = setInterval(async () => {
        attempts++;
        try {
          const result = await this.checkStatus(requestId);
          if (result.status === 'completed') {
            clearInterval(interval);
            resolve(result);
          } else if (result.status === 'failed') {
            clearInterval(interval);
            reject(new Error(result.error || 'Generation failed'));
          } else if (attempts >= maxAttempts) {
            clearInterval(interval);
            reject(new Error('Polling timeout'));
          }
        } catch (error) {
          clearInterval(interval);
          reject(error);
        }
      }, 3000);
    });
  },

  async lipSync(params) {
    const apiKey = localStorage.getItem('muapi_key');
    if (!apiKey) {
      return {
        status: 'completed',
        outputs: [{ type: 'video_url', value: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4' }],
        resultUrl: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4',
      };
    }

    const { image_url, video_url, audio_url, model = 'infinitetalk-image-to-video' } = params;

    const payload = {
      model,
      ...(image_url && { image_url }),
      ...(video_url && { video_url }),
      audio_url,
    };

    try {
      const response = await fetch(`${API_BASE}/lipsync`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const requestId = data.request_id;

      if (!requestId) {
        throw new Error('No request_id returned');
      }

      const result = await this.pollForResult(requestId);
      return {
        status: 'completed',
        outputs: [{ type: 'video_url', value: result.output || result.video?.url }],
        resultUrl: result.output || result.video?.url,
      };
    } catch (error) {
      console.error('MuAPI lip sync error:', error);
      throw error;
    }
  },
};

function generateMockImage(params) {
  const seed = Math.random().toString(36).substr(2, 9);
  const size = params.size || '1024x1024';
  const [width, height] = size.split('x').map(Number);
  return {
    status: 'completed',
    outputs: [{
      type: 'image_url',
      value: `https://picsum.photos/seed/${seed}/${width || 1024}/${height || 1024}`,
    }],
    resultUrl: `https://picsum.photos/seed/${seed}/${width || 1024}/${height || 1024}`,
  };
}

function generateMockVideo(params) {
  return {
    status: 'completed',
    outputs: [{
      type: 'video_url',
      value: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    }],
    resultUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  };
}

function generateMockAudio(params) {
  return {
    status: 'completed',
    outputs: [{
      type: 'audio_url',
      value: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    }],
    resultUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  };
}

export default muapiAdapter;