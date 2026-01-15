/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/types';

// Helper to handle environment variable access safely across Vite/Vercel/Node
// We access properties directly to allow bundlers to replace the strings at build time.
const getSupabaseConfig = () => {
  let url = '';
  let key = '';

  // 1. Try Vite import.meta.env (Standard Vite way)
  try {
    // With envPrefix: ['VITE_', 'NEXT_PUBLIC_'] in vite.config.ts, 
    // these will be populated by Vercel's automatic env vars.
    if (import.meta.env.VITE_SUPABASE_URL) url = import.meta.env.VITE_SUPABASE_URL;
    else if (import.meta.env.NEXT_PUBLIC_SUPABASE_URL) url = import.meta.env.NEXT_PUBLIC_SUPABASE_URL;
    
    if (import.meta.env.VITE_SUPABASE_ANON_KEY) key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    else if (import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) key = import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  } catch (e) {
    // Ignore errors if import.meta is not defined
  }

  // 2. Fallback to process.env (Node/Webpack/Old Build Systems)
  // We check typeof process to avoid ReferenceError in strict browsers
  if (!url || !key) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        if (!url) url = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
        if (!key) key = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
      }
    } catch (e) {
       // Ignore process access errors
    }
  }

  return { url, key };
};

const { url: supabaseUrl, key: supabaseAnonKey } = getSupabaseConfig();

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'CRITICAL: Supabase Environment Variables are missing.\n' +
    'Checking for: VITE_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL, SUPABASE_URL\n' +
    'Make sure your vite.config.ts has "envPrefix: [\'VITE_\', \'NEXT_PUBLIC_\']"'
  );
}

// Fallback to allow app to render error messages instead of crashing immediately
const validUrl = supabaseUrl || 'https://placeholder.supabase.co';
const validKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient<Database>(validUrl, validKey);