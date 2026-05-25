/**
 * @deprecated Use `src/lib/hybrid-supabase.js` (the canonical Supabase client) instead.
 * This file is kept only for backward compatibility and now re-exports the canonical implementation.
 */

export * from './hybrid-supabase.js';
export { supabase as default } from './hybrid-supabase.js';
