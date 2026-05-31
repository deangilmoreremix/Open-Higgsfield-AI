const MUAPI_BASE = 'https://api.muapi.ai';

export async function generateText(apiKey, prompt, model = 'gpt-5-nano') {
    const response = await fetch(`${MUAPI_BASE}/api/v1/chat/completions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey
        },
        body: JSON.stringify({
            model,
            messages: [
                { role: 'system', content: 'You are a senior marketing strategist. Output only valid JSON, no markdown or explanations.' },
                { role: 'user', content: prompt }
            ],
            max_tokens: 2000,
            temperature: 0.7
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Text generation failed: ${response.status} - ${errText.slice(0, 100)}`);
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || '';
}

function getApiKey(request) {
    const headerKey = request.headers.get('x-api-key');
    if (headerKey) return headerKey;

    const cookieKey = request.cookies.get('muapi_key')?.value;
    return cookieKey;
}

export async function POST(request) {
    try {
        const { goal, direction, brandDNA } = await request.json();

        if (!goal || !brandDNA) {
            return Response.json({ error: 'goal and brandDNA required' }, { status: 400 });
        }

        const apiKey = getApiKey(request);
        if (!apiKey) {
            return Response.json({ error: 'API key required' }, { status: 401 });
        }

        const prompt = `Generate 4 campaign concepts for ${goal}${direction ? ` in ${direction}` : ''}. Each concept should be distinct and on-brand.

BrandDNA: ${JSON.stringify(brandDNA)}

Output JSON array only:
[
  { "title": "Campaign Title 1", "angle": "Core messaging angle", "audienceHook": "Hook for target audience", "cta": "Call to action" },
  { "title": "Campaign Title 2", "angle": "Core messaging angle", "audienceHook": "Hook for target audience", "cta": "Call to action" },
  { "title": "Campaign Title 3", "angle": "Core messaging angle", "audienceHook": "Hook for target audience", "cta": "Call to action" },
  { "title": "Campaign Title 4", "angle": "Core messaging angle", "audienceHook": "Hook for target audience", "cta": "Call to action" }
]`;

        const responseText = await generateText(apiKey, prompt);

        let concepts;
        try {
            concepts = JSON.parse(responseText);
        } catch {
            concepts = [
                { id: 'c1', title: 'Concept 1', angle: 'First campaign angle', audienceHook: 'Hook 1', cta: 'CTA 1' },
                { id: 'c2', title: 'Concept 2', angle: 'Second campaign angle', audienceHook: 'Hook 2', cta: 'CTA 2' },
                { id: 'c3', title: 'Concept 3', angle: 'Third campaign angle', audienceHook: 'Hook 3', cta: 'CTA 3' },
                { id: 'c4', title: 'Concept 4', angle: 'Fourth campaign angle', audienceHook: 'Hook 4', cta: 'CTA 4' }
            ];
        }

        const formattedConcepts = Array.isArray(concepts)
            ? concepts.map((c, i) => ({
                id: c.id || `c${i + 1}`,
                title: c.title || c.name || `Concept ${i + 1}`,
                angle: c.angle || c.description || '',
                audienceHook: c.audienceHook || c.hook || '',
                cta: c.cta || c.callToAction || ''
            }))
            : concepts.campaignConcepts || [];

        return Response.json(formattedConcepts, { status: 200 });
    } catch (error) {
        console.error('pomelli/campaign error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}