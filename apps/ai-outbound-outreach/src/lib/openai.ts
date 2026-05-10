import OpenAI from 'openai'

const apiKey = import.meta.env.VITE_OPENAI_API_KEY

export const openai = new OpenAI({
  apiKey,
  dangerouslyAllowBrowser: false // Only use server-side, but kept here for reference
})

export async function generatePersonalizedScript(
  campaign: any,
  contact: any,
  apiKeyOverride?: string
) {
  const key = apiKeyOverride || apiKey
  if (!key) throw new Error('OpenAI API key not configured')

  const client = new OpenAI({ apiKey: key })
  
  const response = await client.responses.create({
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
            cta_text: campaign.cta_text,
            cta_url: campaign.cta_url
          },
          contact: {
            first_name: contact.first_name,
            last_name: contact.last_name,
            company: contact.company,
            industry: contact.industry,
            city: contact.city,
            website: contact.website
          },
          required_json: {
            hook: 'string',
            script: 'string (45-90 second video script, conversational)',
            subject_line: 'string (email subject line)',
            email_body: 'string (short outreach email)',
            cta: 'string (call to action text)',
            muapi_prompt: 'string (prompt for AI video generation)'
          }
        })
      }
    ]
  })

  return JSON.parse(response.output_text || '{}')
}
