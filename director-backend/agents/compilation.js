import { runAgent, withVideoDB } from './_shared.js';

export async function compilation(userId, { input, options = {} }) {
  const query = input || options.query;
  if (!query) throw new Error('query is required');
  return runAgent(userId, 'compilation', async (params) => {
    const stream = await withVideoDB((conn) => conn.compileSearchResults({ query: params.input || params.options.query }));
    return { output: { query, streamId: stream.id }, streamUrl: stream.url };
  }, { input, options });
}
