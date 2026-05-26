const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function handler(event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: CORS_HEADERS, body: '' };
  }

  if (!OPENAI_API_KEY) {
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'OpenAI API key not configured' }),
    };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { prompt, model = 'gpt-4o', temperature = 0.7, max_tokens = 1000, messages = [] } = body;

    let requestBody;
    if (messages && messages.length > 0) {
      requestBody = JSON.stringify({ model, messages, temperature, max_tokens });
    } else {
      requestBody = JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens,
      });
    }

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: requestBody,
    });

    const data = await res.json();
    return {
      statusCode: res.status,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('[OpenAI Proxy] Error:', error);
    return {
      statusCode: 500,
      headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: error.message }),
    };
  }
}