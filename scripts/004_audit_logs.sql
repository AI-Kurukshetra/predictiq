create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id),
  user_name text,
  action text not null,
  resource_type text not null,
  resource_id text,
  details jsonb,
  ip_address text,
  created_at timestamptz default now()
);

alter table audit_logs enable row level security;

create policy "Admins can read audit logs" on audit_logs
  for select to authenticated using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

create policy "Authenticated users can insert audit logs" on audit_logs
  for insert to authenticated with check (true);

create index idx_audit_created on audit_logs(created_at desc);
create index idx_audit_action on audit_logs(action);
