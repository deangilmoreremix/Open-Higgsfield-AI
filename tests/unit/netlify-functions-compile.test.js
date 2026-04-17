/**
 * Unit Test: Netlify Functions TypeScript Compilation
 * 
 * Tests that all TypeScript Netlify functions compile to JavaScript.
 * This ensures Netlify can actually deploy and execute the functions.
 * 
 * Expected behavior:
 * - All .ts files in netlify/functions/ should compile
 * - Compiled .js files should exist after compilation
 * - Compilation should succeed without errors
 */

import { describe, test, expect } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import glob from 'glob';

describe('Netlify Functions Compilation', () => {
  const FUNCTIONS_DIR = 'netlify/functions';

  test('all TypeScript files compile to JavaScript', () => {
    // Find all .ts files in netlify/functions (excluding node_modules and .d.ts)
    const tsFiles = glob.sync('netlify/functions/**/*.ts', {
      ignore: ['**/node_modules/**', '**/*.d.ts', '**/tsconfig.json']
    });

    expect(tsFiles.length).toBeGreaterThan(0, 'Should have TypeScript function files');

    // Run compilation
    try {
      execSync('cd netlify/functions && npm run build', { stdio: 'pipe' });
    } catch (error) {
      throw new Error(`TypeScript compilation failed: ${error.message}`);
    }

    // Verify each .ts file has a corresponding .js output
    tsFiles.forEach(tsFile => {
      const jsFile = tsFile.replace(/\.ts$/, '.js');
      expect(fs.existsSync(jsFile)).toBe(true, `Expected compiled JS for ${tsFile}`);
    });
  });

  test('compiled JavaScript files are valid CommonJS modules', () => {
    const jsFiles = glob.sync('netlify/functions/**/*.js', {
      ignore: ['**/node_modules/**']
    });

    expect(jsFiles.length).toBeGreaterThan(0);

    jsFiles.forEach(jsFile => {
      const content = fs.readFileSync(jsFile, 'utf8');
      // Should contain 'export' or 'module.exports' or 'exports.'
      const isModule = content.includes('export ') || 
                       content.includes('module.exports') || 
                       content.includes('exports.');
      expect(isModule).toBe(true, `${jsFile} should be a valid module`);
    });
  });

  test('director-backend.js exists and is executable', () => {
    const backendJs = path.join(FUNCTIONS_DIR, 'director-backend.js');
    expect(fs.existsSync(backendJs)).toBe(true);
    
    const content = fs.readFileSync(backendJs, 'utf8');
    expect(content).toContain('export default');
    expect(content).toContain('function handler');
  });
});
