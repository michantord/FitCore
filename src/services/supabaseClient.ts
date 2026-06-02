import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://dzmyyihrepddyexkcjqa.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR6bXl5aWhyZXBkZHlleGtjanFhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk4NDAwMzEsImV4cCI6MjA5NTQxNjAzMX0.Vz13imjyhIEERF6kBkVyJErzLV3FvSOMsjkoaqutZUs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
