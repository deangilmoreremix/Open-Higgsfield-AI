import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mpeg', 'video/quicktime', 'video/webm'];

interface UploadRequest {
  fileName: string;
  fileType: string;
  fileSize: number;
  base64Data: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const body: UploadRequest = await req.json();
    const { fileName, fileType, fileSize, base64Data } = body;

    if (fileSize > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({
          error: 'File too large',
          message: `Maximum file size is ${MAX_FILE_SIZE / 1024 / 1024}MB`
        }),
        {
          status: 413,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const isImage = ALLOWED_IMAGE_TYPES.includes(fileType);
    const isVideo = ALLOWED_VIDEO_TYPES.includes(fileType);

    if (!isImage && !isVideo) {
      return new Response(
        JSON.stringify({
          error: 'Invalid file type',
          message: 'Only images (JPEG, PNG, WebP, GIF) and videos (MP4, WebM, QuickTime) are allowed'
        }),
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

    const ext = fileName.split('.').pop() || 'bin';
    const uniqueName = `${Date.now()}_${crypto.randomUUID()}.${ext}`;
    const path = `anonymous/${uniqueName}`;

    const base64Clean = base64Data.replace(/^data:[^;]+;base64,/, '');
    const binaryData = Uint8Array.from(atob(base64Clean), c => c.charCodeAt(0));

    const { error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(path, binaryData, {
        contentType: fileType,
        upsert: false
      });

    if (uploadError) {
      console.error('[process-upload] Upload error:', uploadError);
      return new Response(
        JSON.stringify({
          error: 'Upload failed',
          message: uploadError.message
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const { data: urlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(path);

    console.log(`[process-upload] File uploaded: ${path}`);

    return new Response(
      JSON.stringify({
        success: true,
        url: urlData.publicUrl,
        path,
        fileName: uniqueName,
        fileType,
        fileSize
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('[process-upload] Error:', error);

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
