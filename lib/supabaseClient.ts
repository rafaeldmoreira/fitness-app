import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/types';

// Helper to safely get environment variables from Vite or generic process.env
const getEnvVar = (key: string) => {
  // 1. Try Vite import.meta.env
  try {
    if (import.meta && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch (e) { /* ignore */ }

  // 2. Try process.env (Standard Node/Webpack/Vercel)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) { /* ignore */ }

  return undefined;
};

// Check for VITE_ prefix (Standard Vite) AND NEXT_PUBLIC_ (Standard Vercel Integration)
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || getEnvVar('NEXT_PUBLIC_SUPABASE_URL');
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    'CRITICAL: Supabase Environment Variables are missing. \n' +
    'Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file or Vercel Project Settings.'
  );
}

// Fallback to prevent crash, but requests will fail if env vars are missing
const validUrl = supabaseUrl || 'https://placeholder.supabase.co';
const validKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient<Database>(validUrl, validKey);