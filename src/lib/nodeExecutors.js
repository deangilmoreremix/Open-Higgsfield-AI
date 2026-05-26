import { muapi } from './muapi.js';
import { withRetry } from './retry.js';

class ImageGenNodeExecutor {
  async execute(node, inputs, execution) {
    const { prompt, image_url, aspect_ratio, width, height, model } = inputs;
    
    const result = await withRetry(async () => {
      const response = await muapi.generateImage(null, {
        prompt,
        image_url,
        aspect_ratio: aspect_ratio || '16:9',
        resolution: `${width}x${height}`,
        model
      });
      return response;
    }, { maxRetries: 2 });

    return {
      output: result.url,
      metadata: {
        model: result.model,
        duration: result.duration,
        requestId: result.request_id
      }
    };
  }
}

class VideoGenNodeExecutor {
  async execute(node, inputs, execution) {
    const { prompt, image_url, aspect_ratio, duration, model } = inputs;
    
    const result = await withRetry(async () => {
      const response = await muapi.generateVideo(null, {
        prompt,
        image_url,
        aspect_ratio: aspect_ratio || '16:9',
        duration: duration || 5,
        model
      });
      return response;
    }, { maxRetries: 2 });

    return {
      output: result.url,
      metadata: {
        model: result.model,
        duration: result.duration,
        requestId: result.request_id
      }
    };
  }
}

class LLMNodeExecutor {
  async execute(node, inputs, execution) {
    const { prompt, temperature, max_tokens, model } = inputs;
    
    const response = await fetch('/.netlify/functions/openai-generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt,
        model: model || 'gpt-4o',
        temperature: temperature || 0.7,
        max_tokens: max_tokens || 1000
      })
    });

    if (!response.ok) throw new Error(`OpenAI call failed: ${response.status}`);
    const data = await response.json();

    return {
      output: data.choices[0].message.content,
      metadata: { model: data.model, usage: data.usage }
    };
  }
}

class PromptNodeExecutor {
  async execute(node, inputs, execution) {
    const { template, variables } = inputs;
    const prompt = this.renderPrompt(template, variables);
    
    return {
      output: prompt,
      metadata: { template, variableCount: Object.keys(variables).length }
    };
  }

  renderPrompt(template, variables) {
    if (!variables) return template;
    return template.replace(/\{(\w+)\}/g, (match, key) => variables[key] || match);
  }
}

class OutputNodeExecutor {
  async execute(node, inputs, execution) {
    const { url, title, description, tags } = inputs;
    
    const asset = await sendToLibrary({
      app_id: 'workflow',
      app_name: 'Vibe Workflow',
      type: node.type || 'output',
      title: title || 'Workflow Output',
      output_url: url,
      settings: { tags, description }
    });

    return {
      output: asset,
      metadata: { saved: true }
    };
  }
}

export {
  ImageGenNodeExecutor,
  VideoGenNodeExecutor,
  LLMNodeExecutor,
  PromptNodeExecutor,
  OutputNodeExecutor
};