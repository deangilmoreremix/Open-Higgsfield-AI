import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface GenerateRequest {
  endpoint: string;
  params: Record<string, any>;
  generationType: 'image' | 'video' | 'i2i' | 'i2v' | 'v2v';
  studioType?: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: GenerateRequest = await req.json();
    const { endpoint, params, generationType, studioType } = body;

    const muapiKey = Deno.env.get('MUAPI_API_KEY');
    if (!muapiKey) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error: API key not set' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const muapiUrl = `https://api.muapi.ai/api/v1/${endpoint}`;

    console.log(`[muapi-proxy] Forwarding ${generationType} request to ${endpoint}`);

    const method = generationType === 'poll' ? 'GET' : 'POST';
    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': muapiKey
      }
    };

    if (method === 'POST') {
      fetchOptions.body = JSON.stringify(params);
    }

    const muapiResponse = await fetch(muapiUrl, fetchOptions);

    if (!muapiResponse.ok) {
      const errorText = await muapiResponse.text();
      console.error(`[muapi-proxy] API error: ${muapiResponse.status} - ${errorText}`);

      return new Response(
        JSON.stringify({
          error: `API Request Failed: ${muapiResponse.status} ${muapiResponse.statusText}`,
          details: errorText.slice(0, 200)
        }),
        {
          status: muapiResponse.status,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const result = await muapiResponse.json();

    console.log(`[muapi-proxy] Success: ${JSON.stringify(result).slice(0, 100)}`);

    return new Response(
      JSON.stringify(result),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[muapi-proxy] Error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
