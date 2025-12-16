
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xucjthadwjynijgevgms.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1Y2p0aGFkd2p5bmlqZ2V2Z21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4MTY0MTQsImV4cCI6MjA4MTM5MjQxNH0.F-0lvwcycfgYCSdWOVm_R2ljnKwpTIaWVVXbPs71DFs';

export const supabase = createClient(supabaseUrl, supabaseKey);
