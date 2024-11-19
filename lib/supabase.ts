import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
});

export async function fetchLeads() {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchLeads:', error);
    throw error;
  }
}

// Enable realtime subscription for the leads table
supabase.channel('custom-all-channel')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'leads',
    },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();