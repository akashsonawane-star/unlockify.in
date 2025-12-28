
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xucjthadwjynijgevgms.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y2p0aGFkd2p5bmlqZ2V2Z21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTY0MTQsImV4cCI6MjA4MTM5MjQxNH0.F-0lvwcycfgYCSdWOVm_R2ljnKwpTIaWVVXbPs71DFs';

// Initialize the client. The client itself is resilient, but we need to handle network failures on calls.
export const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Checks if the Supabase service is reachable.
 * Useful for proactively switching to offline mode.
 */
export const checkSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true }).limit(1);
    if (error && error.message === 'Failed to fetch') return false;
    return true;
  } catch (e) {
    return false;
  }
};
