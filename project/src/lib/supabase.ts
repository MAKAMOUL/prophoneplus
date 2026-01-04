import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

console.log('Supabase Config:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey && supabaseAnonKey !== 'placeholder-key',
  isValid: supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')
});

export const supabase = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('placeholder')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

if (!supabase) {
  console.error('Supabase client not initialized! Check environment variables.');
}
