/**
 * Unit Test: MuAPI Enhanced Initialization Export
 * 
 * Tests that initializeEnhancedMuAPI function exists and is callable.
 * This test will FAIL until the function is properly exported from muapiEnhanced.js
 * 
 * Expected behavior:
 * - initializeEnhancedMuAPI should be a function
 * - It should return a boolean (true on success, false on failure)
 * - It should be idempotent (can be called multiple times safely)
 */

import { describe, test, expect } from 'vitest';
import { initializeEnhancedMuAPI } from '../src/lib/muapiEnhanced';

describe('MuAPI Enhanced Initialization', () => {
  test('initializeEnhancedMuAPI is exported and is a function', () => {
    expect(typeof initializeEnhancedMuAPI).toBe('function');
  });

  test('initializeEnhancedMuAPI returns true when successful', async () => {
    const result = await initializeEnhancedMuAPI();
    expect(typeof result).toBe('boolean');
    expect(result).toBe(true);
  });

  test('initializeEnhancedMuAPI is idempotent - can be called multiple times', async () => {
    const result1 = await initializeEnhancedMuAPI();
    const result2 = await initializeEnhancedMuAPI();
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });

  test('initializeEnhancedMuAPI accepts optional config parameter', async () => {
    const config = { apiKey: 'test-key', endpoint: 'https://test.api' };
    const result = await initializeEnhancedMuAPI(config);
    expect(result).toBe(true);
  });
});

  test('initializeEnhancedMuAPI returns true when successful', async () => {
    // Ensure clean state
    if (typeof muapiEnhanced?.reset === 'function') {
      muapiEnhanced.reset();
    }
    
    const result = await initializeEnhancedMuAPI();
    expect(typeof result).toBe('boolean');
    expect(result).toBe(true);
  });

  test('initializeEnhancedMuAPI is idempotent - can be called multiple times', async () => {
    const result1 = await initializeEnhancedMuAPI();
    const result2 = await initializeEnhancedMuAPI();
    const result3 = await initializeEnhancedMuAPI();
    
    expect(result1).toBe(true);
    expect(result2).toBe(true);
    expect(result3).toBe(true);
  });

  test('initializeEnhancedMuAPI accepts optional config parameter', async () => {
    const config = { apiKey: 'test-key', endpoint: 'https://test.api' };
    const result = await initializeEnhancedMuAPI(config);
    expect(result).toBe(true);
  });

  test('initializeEnhancedMuAPI handles missing API key gracefully', async () => {
    // Temporarily clear any stored API key
    const originalGetApiKey = getApiKey;
    
    // Mock getApiKey to return null
    if (typeof muapiEnhanced?.setApiKey === 'function') {
      muapiEnhanced.setApiKey(null);
    }
    
    const result = await initializeEnhancedMuAPI();
    // Should return false when no API key available
    expect(typeof result).toBe('boolean');
    
    // Restore
    if (originalGetApiKey) {
      // restore logic if needed
    }
  });
});
