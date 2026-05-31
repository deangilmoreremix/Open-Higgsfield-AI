import { generateImage } from '../../../../src/lib/muapi.js';

function getApiKey(request) {
    const headerKey = request.headers.get('x-api-key');
    if (headerKey) return headerKey;

    const cookieKey = request.cookies.get('muapi_key')?.value;
    return cookieKey;
}

const PLATFORM_ASPECT_RATIOS = {
    instagram: '1:1',
    facebook: '16:9',
    twitter: '16:9',
    linkedin: '16:9',
    youtube: '16:9',
    tiktok: '9:16'
};

export async function POST(request) {
    try {
        const { prompt, aspect_ratio, brandDNA, concept } = await request.json();

        if (!prompt) {
            return Response.json({ error: 'prompt required' }, { status: 400 });
        }

        const apiKey = getApiKey(request);
        if (!apiKey) {
            return Response.json({ error: 'API key required' }, { status: 401 });
        }

        let finalPrompt = prompt;
        if (brandDNA) {
            const tone = Array.isArray(brandDNA.tone) ? brandDNA.tone.join(', ') : '';
            const colors = Array.isArray(brandDNA.colors) ? brandDNA.colors.join(', ') : (brandDNA.colors?.primary || '');
            finalPrompt = `${prompt}. Brand style: tone=${tone}, colors=${colors}`;
        }

        if (concept) {
            finalPrompt = `${prompt}. Concept: ${concept.title || ''} - ${concept.description || ''}`;
        }

        const ar = aspect_ratio || (brandDNA?.platform ? PLATFORM_ASPECT_RATIOS[brandDNA.platform] : '1:1');

        const result = await generateImage(apiKey, {
            prompt: finalPrompt,
            aspect_ratio: ar,
            model: 'flux-dev'
        });

        const url = result.url || result.output || result.outputs?.[0];

        return Response.json({ url }, { status: 200 });
    } catch (error) {
        console.error('pomelli/creative error:', error);
        return Response.json({ error: error.message }, { status: 500 });
    }
}