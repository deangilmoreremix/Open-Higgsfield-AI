import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey, X-Webhook-Signature",
};

interface WebhookPayload {
  request_id: string;
  status: string;
  output?: any;
  outputs?: string[];
  url?: string;
  error?: string;
  metadata?: Record<string, any>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const webhookSecret = Deno.env.get('MUAPI_WEBHOOK_SECRET');
    const signature = req.headers.get('x-webhook-signature');

    if (webhookSecret && signature !== webhookSecret) {
      console.error('[muapi-webhook] Invalid signature');
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const payload: WebhookPayload = await req.json();
    const { request_id, status, outputs, url, output, error, metadata } = payload;

    console.log(`[muapi-webhook] Received: request_id=${request_id}, status=${status}`);

    const outputUrl = outputs?.[0] || url || output?.url || null;

    console.log(`[muapi-webhook] Processing webhook for ${request_id}: ${status}`);

    if (outputUrl) {
      console.log(`[muapi-webhook] Output URL: ${outputUrl.slice(0, 50)}...`);
    }

    if (error) {
      console.error(`[muapi-webhook] Error reported: ${error}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Webhook received and logged',
        request_id
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[muapi-webhook] Error:', error);

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
