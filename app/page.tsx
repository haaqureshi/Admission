import { redirect } from 'next/navigation';
import { headers, cookies } from 'next/headers';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';

export default async function Home() {
  const supabase = createServerComponentClient({ cookies });
  
  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (session) {
      redirect('/dashboard');
    }

    redirect('/login');
  } catch (error) {
    console.error('Auth error:', error);
    redirect('/login');
  }
}