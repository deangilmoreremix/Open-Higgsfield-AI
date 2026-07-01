/**
 * Netlify Function: /api/upload
 *
 * Server-side upload endpoint. Receives a file via multipart/form-data,
 * uploads to Supabase Storage, and returns the asset + clip metadata.
 *
 * This is the API entry point for the processFileUpload pipeline. External
 * clients (mobile, desktop, webhooks) can POST files here and get back
 * the same result as the client-side pipeline.
 *
 * Backwards compatible: if Supabase is not configured, returns a 503
 * and the client falls back to its own processFileUpload.
 */

import type { Handler } from '@netlify/functions';
import { createClient } from '@supabase/supabase-js';

interface UploadResponse {
  success: boolean;
  assetId?: string;
  url?: string;
  metadata?: Record<string, unknown>;
  error?: string;
}

const handler: Handler = async (event) => {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: ''
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: corsHeaders(),
      body: JSON.stringify({ success: false, error: 'Method not allowed' })
    };
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return {
      statusCode: 503,
      headers: corsHeaders(),
      body: JSON.stringify({
        success: false,
        error: 'Supabase not configured on server; client fallback required'
      })
    };
  }

  try {
    // Parse multipart body
    const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';
    if (!contentType.startsWith('multipart/form-data')) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({
          success: false,
          error: 'Content-Type must be multipart/form-data'
        })
      };
    }

    // In Netlify Functions, the body is base64-encoded for binary content
    // We need to parse the multipart form. Netlify provides helpers for this.
    const file = await extractFileFromMultipart(event);

    if (!file) {
      return {
        statusCode: 400,
        headers: corsHeaders(),
        body: JSON.stringify({ success: false, error: 'No file in request' })
      };
    }

    // Upload to Supabase Storage
    const supabase = createClient(supabaseUrl, supabaseKey);
    const fileName = `${Date.now()}_${randomString(8)}`;
    const filePath = `uploads/${fileName}`;

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('uploads')
      .upload(filePath, file.buffer, {
        contentType: file.contentType || 'application/octet-stream',
        upsert: false
      });

    if (uploadError) {
      return {
        statusCode: 500,
        headers: corsHeaders(),
        body: JSON.stringify({ success: false, error: uploadError.message })
      };
    }

    // Get public URL
    const { data: urlData } = supabase.storage.from('uploads').getPublicUrl(filePath);

    const response: UploadResponse = {
      success: true,
      assetId: fileName,
      url: urlData.publicUrl,
      metadata: {
        size: file.buffer.length,
        contentType: file.contentType,
        name: file.name
      }
    };

    return {
      statusCode: 200,
      headers: corsHeaders(),
      body: JSON.stringify(response)
    };
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ success: false, error: message })
    };
  }
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };
}

function randomString(len: number): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return s;
}

/**
 * Extract a file from a multipart/form-data request.
 * Netlify Functions deliver the body as a base64 string in event.body.
 * For production, use a library like busboy; this is a simplified
 * extractor for single-file uploads.
 */
async function extractFileFromMultipart(event: any): Promise<{ buffer: Buffer; name: string; contentType: string } | null> {
  const body = event.body || '';
  const contentType = event.headers['content-type'] || event.headers['Content-Type'] || '';

  // Boundary from content-type header
  const boundaryMatch = contentType.match(/boundary=(.+)$/);
  if (!boundaryMatch) return null;
  const boundary = `--${boundaryMatch[1]}`;

  // Body is base64 in Netlify; decode
  let bodyStr = body;
  if (event.isBase64Encoded) {
    bodyStr = Buffer.from(body, 'base64').toString('binary');
  }

  // Find filename and content-type in the multipart
  const parts = bodyStr.split(boundary);
  for (const part of parts) {
    if (part.includes('filename=')) {
      const nameMatch = part.match(/filename="([^"]+)"/);
      const ctMatch = part.match(/Content-Type: ([^\r\n]+)/i);
      const name = nameMatch ? nameMatch[1] : 'upload';
      const ct = ctMatch ? ctMatch[1].trim() : 'application/octet-stream';
      // Body content is after the double CRLF
      const bodyStart = part.indexOf('\r\n\r\n');
      if (bodyStart === -1) continue;
      const content = part.slice(bodyStart + 4);
      // Strip trailing \r\n
      const cleaned = content.replace(/\r\n$/, '');
      return {
        buffer: Buffer.from(cleaned, 'binary'),
        name,
        contentType: ct
      };
    }
  }
  return null;
}

export { handler };
