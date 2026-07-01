import { Kernel } from '../kernel/kernel.js';

export class AppFactory {
  constructor(kernel) {
    this.kernel = kernel;
  }

  create(app) {
    return {
      id: app.id,
      meta: app.meta || {},
      run: async (input) => {
        const graph = this.buildGraph(app, input);
        const executionId = await this.kernel.submit(graph);
        return this.kernel.execute(executionId);
      },
      buildGraph: (app, input) => this.buildGraph(app, input),
    };
  }

  buildGraph(app, input) {
    return {
      id: crypto.randomUUID(),
      appId: app.id,
      nodes: [
        {
          id: 'entry',
          type: app.entry,
          input,
          providers: app.providers || [],
        },
      ],
      edges: [],
    };
  }
}