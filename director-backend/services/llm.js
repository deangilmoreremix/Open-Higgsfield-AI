import OpenAI from 'openai';
import { AppError, ErrorCodes } from '../lib/errors.js';

let _client = null;

function getClient() {
  if (!_client) {
    if (!process.env.OPENAI_API_KEY) throw new AppError(ErrorCodes.INVALID_INPUT, 'OPENAI_API_KEY not configured', 500);
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

export async function generateScript({ systemPrompt, userPrompt, maxTokens = 500, model = 'gpt-4o-mini' }) {
  let lastErr;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await getClient().chat.completions.create({
        model,
        messages: [
          ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
          { role: 'user', content: userPrompt },
        ],
        max_tokens: maxTokens,
        timeout: 60_000,
      });
      return res.choices[0].message.content.trim();
    } catch (err) {
      lastErr = err;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1000 * Math.pow(2, attempt)));
    }
  }
  throw new AppError(ErrorCodes.LLM_TIMEOUT, 'LLM timed out after 3 retries', 504, { original: lastErr?.message });
}
