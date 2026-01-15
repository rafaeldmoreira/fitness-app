import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Helper to safely get environment variables
const getEnvVar = (key: string) => {
  try {
    // Check if import.meta.env exists (Vite)
    if (import.meta && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch (e) {
    // Ignore
  }

  try {
    // Check if process.env exists (Node/Webpack)
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
  } catch (e) {
    // Ignore
  }

  return undefined;
};

// Default to a valid-looking URL to prevent "Invalid URL" crash during initialization
// if environment variables are missing.
const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://project.supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'public-anon-key';

if (supabaseUrl === 'https://project.supabase.co') {
  console.warn('VITE_SUPABASE_URL not set. Using placeholder URL. Supabase calls will fail.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);