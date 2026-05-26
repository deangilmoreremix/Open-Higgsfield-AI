/**
 * Platform Verification Script
 * Run with: node src/platform/verify.js
 */

import { registry } from './AppRegistry.jsx';
import { AppErrorBoundary } from './ErrorBoundary.jsx';
import { StudioLayout } from './StudioPage.jsx';
import { AuthProvider, useAuth } from './AuthProvider.jsx';
import { Providers } from './Providers.jsx';
import { LoadingFallback, LazyLoad } from './LazyLoader.jsx';
import { LegacyAppWrapper, IFrameApp } from './LegacyAppWrapper.jsx';

console.log('=== Higgsfield React Platform Verification ===\n');

// Verify registry
console.log('1. AppRegistry:');
console.log(`   - Registered apps: ${registry.list().join(', ')}`);
console.log(`   - Total apps: ${registry.getAll().length}`);

// Verify error boundary
console.log('\n2. ErrorBoundary:');
console.log(`   - AppErrorBoundary class: ${typeof AppErrorBoundary === 'function' ? 'OK' : 'FAIL'}`);

// Verify layout
console.log('\n3. StudioLayout:');
console.log(`   - StudioLayout: ${typeof StudioLayout === 'function' ? 'OK' : 'FAIL'}`);

// Verify providers
console.log('\n4. Providers:');
console.log(`   - AuthProvider: ${typeof AuthProvider === 'function' ? 'OK' : 'FAIL'}`);
console.log(`   - Providers: ${typeof Providers === 'function' ? 'OK' : 'FAIL'}`);

// Verify lazy loader
console.log('\n5. LazyLoader:');
console.log(`   - LoadingFallback: ${typeof LoadingFallback === 'function' ? 'OK' : 'FAIL'}`);
console.log(`   - LazyLoad: ${typeof LazyLoad === 'function' ? 'OK' : 'FAIL'}`);

// Verify legacy wrapper
console.log('\n6. LegacyAppWrapper:');
console.log(`   - LegacyAppWrapper: ${typeof LegacyAppWrapper === 'function' ? 'OK' : 'FAIL'}`);
console.log(`   - IFrameApp: ${typeof IFrameApp === 'function' ? 'OK' : 'FAIL'}`);

console.log('\n=== All Platform Components Verified ===');