import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface CreateShareRequest {
  resourceType: 'generation' | 'project' | 'storyboard' | 'character';
  resourceId: string;
  expiresIn?: number;
  password?: string;
  allowDownload?: boolean;
}

function generateShareToken(): string {
  return crypto.randomUUID().replace(/-/g, '');
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get('token');

  if (req.method === "GET" && token) {
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const { data: share, error } = await supabase
        .from('shared_content')
        .select('*')
        .eq('share_token', token)
        .eq('is_active', true)
        .maybeSingle();

      if (error || !share) {
        return new Response(
          JSON.stringify({ error: 'Share not found or expired' }),
          {
            status: 404,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      if (share.expires_at && new Date(share.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: 'Share link has expired' }),
          {
            status: 410,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      await supabase
        .from('shared_content')
        .update({ view_count: share.view_count + 1 })
        .eq('id', share.id);

      return new Response(
        JSON.stringify({
          success: true,
          share: {
            resourceType: share.resource_type,
            resourceId: share.resource_id,
            allowDownload: share.allow_download,
            viewCount: share.view_count + 1
          }
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      console.error('[create-share] GET error:', error);
      return new Response(
        JSON.stringify({ error: 'Internal server error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }
  }

  if (req.method === "POST") {
    try {
      const body: CreateShareRequest = await req.json();
      const { resourceType, resourceId, expiresIn, password, allowDownload } = body;

      if (!resourceType || !resourceId) {
        return new Response(
          JSON.stringify({ error: 'resourceType and resourceId are required' }),
          {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );

      const shareToken = generateShareToken();

      let expiresAt = null;
      if (expiresIn && expiresIn > 0) {
        const expireDate = new Date();
        expireDate.setHours(expireDate.getHours() + expiresIn);
        expiresAt = expireDate.toISOString();
      }

      const { data: share, error } = await supabase
        .from('shared_content')
        .insert({
          resource_type: resourceType,
          resource_id: resourceId,
          share_token: shareToken,
          expires_at: expiresAt,
          password_hash: password || null,
          allow_download: allowDownload !== false,
          is_active: true,
          view_count: 0
        })
        .select()
        .single();

      if (error) {
        console.error('[create-share] Insert error:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to create share link' }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }

      const shareUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/create-share?token=${shareToken}`;

      console.log(`[create-share] Created share link: ${shareToken}`);

      return new Response(
        JSON.stringify({
          success: true,
          shareUrl,
          shareToken,
          expiresAt: share.expires_at
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );

    } catch (error) {
      console.error('[create-share] POST error:', error);

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
  }

  return new Response(
    JSON.stringify({ error: 'Method not allowed' }),
    {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    }
  );
});
