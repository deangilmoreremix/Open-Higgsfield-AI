const API_BASE = 'https://api.openai.com/v1';

export const openaiAdapter = {
  async generateText(params) {
    const apiKey = localStorage.getItem('openai_key');
    if (!apiKey) {
      return generateMockText(params);
    }

    const { model = 'gpt-4o', prompt, system_prompt = '' } = params;

    try {
      const response = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            ...(system_prompt ? [{ role: 'system', content: system_prompt }] : []),
            { role: 'user', content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || '';

      return {
        status: 'completed',
        outputs: [{ type: 'text', value: text }],
        resultUrl: text,
      };
    } catch (error) {
      console.error('OpenAI text generation error:', error);
      return generateMockText(params);
    }
  },

  async enhancePrompt(prompt, context = '') {
    const apiKey = localStorage.getItem('openai_key');
    if (!apiKey) {
      return prompt;
    }

    const enhancementPrompt = `You are an AI image prompt enhancement specialist. Given a basic prompt, create an enhanced version with more detail, artistic style suggestions, and technical parameters for better AI generation results.

Original prompt: "${prompt}"
${context ? `Context: "${context}"` : ''}

Provide only the enhanced prompt, nothing else.`;

    try {
      const response = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: enhancementPrompt }],
          temperature: 0.8,
          max_tokens: 500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || prompt;
    } catch (error) {
      console.error('OpenAI prompt enhancement error:', error);
      return prompt;
    }
  },

  async planWorkflow(goal, availableNodes) {
    const apiKey = localStorage.getItem('openai_key');
    if (!apiKey) {
      return generateMockPlan(goal, availableNodes);
    }

    const planningPrompt = `You are an AI workflow planning assistant. Given a user goal and available node types, propose a workflow plan.

User goal: "${goal}"

Available nodes:
${availableNodes.map(n => `- ${n.type}: ${n.description}`).join('\n')}

Provide a JSON workflow plan with nodes and connections. Format:
{
  "nodes": [{"type": "...", "position": {"x": 0, "y": 0}, "config": {...}}],
  "edges": [{"source": "...", "target": "...", "sourceHandle": "...", "targetHandle": "..."}]
}`;

    try {
      const response = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: planningPrompt }],
          temperature: 0.5,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';

      try {
        return JSON.parse(content);
      } catch {
        return generateMockPlan(goal, availableNodes);
      }
    } catch (error) {
      console.error('OpenAI workflow planning error:', error);
      return generateMockPlan(goal, availableNodes);
    }
  },

  async transformContent(content, transformation) {
    const apiKey = localStorage.getItem('openai_key');
    if (!apiKey) {
      return content;
    }

    const transformPrompt = `Transform the following content using this instruction: "${transformation}"

Content: "${content}"

Provide only the transformed content.`;

    try {
      const response = await fetch(`${API_BASE}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: transformPrompt }],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || content;
    } catch (error) {
      console.error('OpenAI content transformation error:', error);
      return content;
    }
  },

  async moderateContent(content) {
    const apiKey = localStorage.getItem('openai_key');
    if (!apiKey) {
      return { flagged: false };
    }

    try {
      const response = await fetch(`${API_BASE}/moderations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({ input: content }),
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      const results = data.results?.[0];
      return {
        flagged: results?.flagged || false,
        categories: results?.categories || {},
      };
    } catch (error) {
      console.error('OpenAI moderation error:', error);
      return { flagged: false };
    }
  },
};

function generateMockText(params) {
  const { prompt } = params;
  return {
    status: 'completed',
    outputs: [{
      type: 'text',
      value: `This is a mock response to: "${prompt}". In production, this would be generated by OpenAI's GPT-4o model. Configure your OpenAI API key to enable real text generation.`,
    }],
    resultUrl: `Mock response for: "${prompt}"`,
  };
}

function generateMockPlan(goal, availableNodes) {
  const textNode = availableNodes.find(n => n.type === 'textNode');
  const imageNode = availableNodes.find(n => n.type === 'imageNode');

  return {
    nodes: [
      textNode && {
        id: 'text1',
        type: 'textNode',
        position: { x: 0, y: 100 },
        data: { label: 'Prompt', formValues: { prompt: goal } },
      },
      imageNode && {
        id: 'image1',
        type: 'imageNode',
        position: { x: 300, y: 100 },
        data: { label: 'Image Gen' },
      },
    ].filter(Boolean),
    edges: [
      textNode && imageNode && {
        source: 'text1',
        target: 'image1',
        sourceHandle: 'textOutput',
        targetHandle: 'imageInput',
      },
    ].filter(Boolean),
  };
}

export default openaiAdapter;