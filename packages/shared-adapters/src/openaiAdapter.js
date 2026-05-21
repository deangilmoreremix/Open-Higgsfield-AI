const OPENAI_BASE_URL = 'https://api.openai.com/v1';

async function openaiRequest(apiKey, endpoint, body) {
    const response = await fetch(`${OPENAI_BASE_URL}/${endpoint}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${errText.slice(0, 100)}`);
    }
    return response.json();
}

export async function generateText(apiKey, params) {
    const body = {
        model: params.model || 'gpt-4o',
        messages: params.messages || [{ role: 'user', content: params.prompt }],
        max_tokens: params.maxTokens || 1024,
        temperature: params.temperature ?? 0.7,
    };
    const data = await openaiRequest(apiKey, 'chat/completions', body);
    return data.choices?.[0]?.message?.content || '';
}

export async function generateImage(apiKey, params) {
    const body = {
        model: params.model || 'dall-e-3',
        prompt: params.prompt,
        n: params.n || 1,
        size: params.size || '1024x1024',
        quality: params.quality || 'standard',
    };
    const data = await openaiRequest(apiKey, 'images/generations', body);
    return data.data?.[0]?.url || '';
}

export async function transcribeAudio(apiKey, params) {
    const formData = new FormData();
    formData.append('file', params.file);
    formData.append('model', params.model || 'whisper-1');
    if (params.language) formData.append('language', params.language);
    if (params.prompt) formData.append('prompt', params.prompt);

    const response = await fetch(`${OPENAI_BASE_URL}/audio/transcriptions`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${apiKey}`,
        },
        body: formData,
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`OpenAI transcription error: ${response.status} - ${errText.slice(0, 100)}`);
    }
    const data = await response.json();
    return data.text || '';
}
