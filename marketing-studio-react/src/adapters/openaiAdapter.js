/**
 * OpenAI Adapter
 * Handles LLM calls for prompt enhancement and marketing strategy
 */

const OPENAI_BASE_URL = 'https://api.openai.com/v1';

/**
 * Enhance a marketing prompt
 * @param {string} prompt - Original prompt
 * @param {Object} options - Enhancement options
 * @returns {Promise<string>} - Enhanced prompt
 */
export async function enhancePrompt(prompt, options = {}) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    console.warn('OPENAI_API_KEY not set, returning original prompt');
    return prompt;
  }

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a marketing expert. Enhance the user prompt to create compelling AI video ad copy. Make it vivid, detailed, and optimized for video generation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 500,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Generate campaign strategy
 * @param {Object} brief - Campaign brief
 * @returns {Promise<Object>} - Campaign strategy
 */
export async function generateCampaignStrategy(brief) {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
  
  if (!apiKey) {
    return {
      target_audience: 'General',
      key_message: brief,
      tone: 'Engaging',
      call_to_action: 'Learn more'
    };
  }

  const response = await fetch(`${OPENAI_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'Generate a marketing campaign strategy with: target_audience, key_message, tone, call_to_action'
        },
        {
          role: 'user',
          content: `Product: ${brief.product || brief}\nAudience: ${brief.audience || 'General'}\nGoal: ${brief.goal || 'Awareness'}`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const data = await response.json();
  try {
    return JSON.parse(data.choices[0].message.content);
  } catch {
    return { strategy: data.choices[0].message.content };
  }
}

export default {
  enhancePrompt,
  generateCampaignStrategy
};