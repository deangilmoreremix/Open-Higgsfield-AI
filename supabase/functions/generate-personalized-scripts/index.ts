import OpenAI from 'openai';
import { createClient } from 'npm:@supabase/supabase-js@2';

const openai = new OpenAI({ apiKey: Deno.env.get('OPENAI_API_KEY')! });

Deno.serve(async (req) => {
  // Verify authentication
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return new Response('Unauthorized', { status: 401 });
  
  const token = authHeader.replace('Bearer ', '');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user) return new Response('Unauthorized', { status: 401 });

  const { campaignId, contactIds } = await req.json();
  if (!campaignId || !contactIds?.length) {
    return new Response('Missing campaignId or contactIds', { status: 400 });
  }

  // Verify user has access to campaign via workspace membership
  const { data: campaign } = await supabase
    .from('campaigns')
    .select('*, workspaces!inner(*, workspace_members!inner(user_id))')
    .eq('id', campaignId)
    .single();

  const hasAccess = campaign?.workspaces?.workspace_members?.some(
    (m: any) => m.user_id === user.id
  );
  if (!hasAccess) return new Response('Forbidden', { status: 403 });

  // Get contacts for this campaign
  const { data: contacts } = await supabase
    .from('contacts')
    .select('*')
    .in('id', contactIds)
    .eq('campaign_id', campaignId);

  const results = [];
  for (const contact of contacts ?? []) {
    const response = await openai.responses.create({
      model: 'gpt-4.1',
      input: [
        {
          role: 'system',
          content: 'You are a sales outreach specialist. Generate personalized video scripts for cold outreach. Return ONLY valid JSON with fields: hook, script, subject_line, email_body, cta, muapi_prompt'
        },
        {
          role: 'user',
          content: JSON.stringify({
            campaign: {
              name: campaign.name,
              offer: campaign.offer,
              audience: campaign.audience,
              cta_text: campaign.cta_text
            },
            contact: {
              first_name: contact.first_name,
              last_name: contact.last_name,
              company: contact.company,
              industry: contact.industry
            }
          })
        }
      ]
    });

    const output = JSON.parse(response.output_text || '{}');
    const { data } = await supabase.from('personalized_scripts').upsert({
      campaign_id: campaign.id,
      contact_id: contact.id,
      hook: output.hook,
      script: output.script,
      subject_line: output.subject_line,
      email_body: output.email_body,
      cta: output.cta,
      prompt: { muapi_prompt: output.muapi_prompt },
      status: 'generated'
    }).select('*').single();
    
    results.push(data);
  }

  return Response.json({ success: true, scripts: results });
});
