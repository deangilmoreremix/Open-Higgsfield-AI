import { createClient } from '@supabase/supabase-js';
import crypto from 'node:crypto';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { video_id, campaign_id, contact_id, event_type, metadata } = await req.json();
    if (!video_id || !event_type) {
      return new Response('Missing video_id or event_type', { status: 400 });
    }

    // Get workspace_id from video if not provided
    let workspace_id = undefined;
    if (campaign_id) {
      const { data } = await supabase
        .from('campaigns')
        .select('workspace_id')
        .eq('id', campaign_id)
        .single();
      workspace_id = data?.workspace_id;
    }

    const ip = req.headers.get('x-forwarded-for') || '';
    const ip_hash = crypto.createHash('sha256').update(ip).digest('hex');
    
    await supabase.from('video_events').insert({
      video_id,
      campaign_id,
      contact_id,
      workspace_id,
      event_type,
      metadata: metadata ?? {},
      ip_hash,
      user_agent: req.headers.get('user-agent') ?? ''
    });

    return Response.json({ success: true });
  } catch (error: any) {
    console.error('Error tracking event:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
