-- Run this in Supabase SQL Editor if sensor threshold saves fail due to RLS
create policy "Authenticated users can update sensors" on sensors
  for update to authenticated using (true);
