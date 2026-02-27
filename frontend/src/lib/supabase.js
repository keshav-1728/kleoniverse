/**
 * Supabase Client Configuration
 * Provides a singleton instance of the Supabase client for the frontend
 */

import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Create Supabase client instance
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    // Disable Navigator LockManager to prevent lock timeout errors
    useLock: false,
  },
});

// Initialize Supabase session from localStorage (for API login compatibility)
const initSupabaseSession = async () => {
  const token = localStorage.getItem('kleoni_token');
  if (token) {
    try {
      const { error } = await supabase.auth.setSession({
        access_token: token,
        refresh_token: localStorage.getItem('kleoni_refresh_token') || '',
      });
      if (error) {
        console.error('Error setting Supabase session:', error);
      }
    } catch (err) {
      console.error('Error initializing Supabase session:', err);
    }
  }
};

// Initialize on load
initSupabaseSession();

// Listen for storage changes (for cross-tab sync)
window.addEventListener('storage', (e) => {
  if (e.key === 'kleoni_token') {
    initSupabaseSession();
  }
});

export default supabase;
