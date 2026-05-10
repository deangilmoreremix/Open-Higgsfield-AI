import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export default async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const body = await req.json();
    const internalJobId = body?.metadata?.internal_job_id || body?.internal_job_id;
    
    if (!internalJobId) {
      return new Response('Missing internal_job_id', { status: 400 });
    }

    const status = body.status === 'failed' ? 'failed' : 'completed';
    
    await supabase.from('generation_jobs').update({
      status,
      output: body,
      error: body.error ?? null,
      updated_at: new Date().toISOString()
    }).eq('id', internalJobId);

    // If completed, create personalized video entry
    if (status === 'completed') {
      const { data: job } = await supabase
        .from('generation_jobs')
        .select('*, campaigns(workspace_id)')
        .eq('id', internalJobId)
        .single();

      if (job) {
        const outputUrl = body?.outputs?.[0] || body?.output?.video_url || body?.video_url;
        if (outputUrl) {
          await supabase.from('personalized_videos').insert({
            workspace_id: job.campaigns?.workspace_id || job.workspace_id,
            campaign_id: job.campaign_id,
            contact_id: job.contact_id,
            generation_job_id: job.id,
            video_url: outputUrl,
            status: 'ready',
            landing_page_slug: `video-${job.id.slice(0, 8)}`,
            landing_page_url: `${process.env.PUBLIC_SITE_URL}/v/video-${job.id.slice(0, 8)}`
          });
        }
      }
    }

    return Response.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
};
