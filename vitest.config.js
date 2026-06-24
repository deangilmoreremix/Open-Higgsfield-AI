import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts', './src/test-teardown.ts'],
    include: [
      'src/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'apps/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'modules/**/*.{test,spec}.{js,ts,jsx,tsx}',
      'tests/**/*.{test,spec}.{js,ts,jsx,tsx}'
    ],
    exclude: [
      'node_modules/**',
      'dist/**',
      'build/**',
      '**/*.d.ts'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'build/**',
        '**/*.d.ts',
        '**/*.config.{js,ts}',
        'src/test/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80
        }
      }
    },
    testTimeout: 40000,
    hookTimeout: 40000
  },
  resolve: {
    alias: {
      '@': '/workspace/0c85e0dc-1244-40ab-8f84-e11668f857da/sessions/agent_9a89a665-46bc-478e-a120-000038198ef7',
      '@test': '/workspace/0c85e0dc-1244-40ab-8f84-e11668f857da/sessions/agent_9a89a665-46bc-478e-a120-000038198ef7/tests'
    }
  }
});