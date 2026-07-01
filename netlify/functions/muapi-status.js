const MUAPI_KEY = process.env.MUAPI_API_KEY;

export async function handler(event) {
  const { id } = event.queryStringParameters || {};
  
  if (!id) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing id parameter' }),
    };
  }

  if (!MUAPI_KEY) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'MuAPI key not configured' }),
    };
  }

  try {
    const res = await fetch(`https://api.muapi.ai/api/v1/predictions/${id}/result`, {
      headers: { 'x-api-key': MUAPI_KEY },
    });

    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('[MuAPI Status] Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}