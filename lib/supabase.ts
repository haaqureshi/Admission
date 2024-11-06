import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mqsnsniztjalbciebkkg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xc25zbml6dGphbGJjaWVia2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjM2ODE0NTYsImV4cCI6MjAzOTI1NzQ1Nn0.PVZBkjt48makijU34-H-52gSDbvROWkKzB9torNUFtY';

export const supabase = createClient(supabaseUrl, supabaseKey);