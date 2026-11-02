-- Run once in Supabase SQL editor (free tier). Change the email if the admin login differs.
create or replace function public.is_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt()->>'email','') = 'raihanarifuzzaman@gmail.com' $$;

create table if not exists site_content(id text primary key, data jsonb not null, updated_at timestamptz default now());
create table if not exists posts(id uuid primary key default gen_random_uuid(), slug text unique not null, title text not null,
  cover_url text, excerpt text, body text, published boolean default false, published_at timestamptz, created_at timestamptz default now(), updated_at timestamptz default now());
create table if not exists clients(id uuid primary key default gen_random_uuid(), name text not null, email text not null unique, notes text, created_at timestamptz default now());
create table if not exists orders(id uuid primary key default gen_random_uuid(), client_name text not null check(length(client_name)<=120),
  client_email text not null check(length(client_email)<=200), project_type text check(length(project_type)<=80), requirements text not null check(length(requirements)<=5000),
  budget text check(length(budget)<=60), timeline text check(length(timeline)<=120), status text not null default 'pending' check(status in('pending','confirmed','rejected')),
  client_id uuid references clients(id), created_at timestamptz default now());
create sequence if not exists invoice_seq start 1001;
create table if not exists invoices(id uuid primary key default gen_random_uuid(), number text unique not null default ('INV-'||to_char(now(),'YYYY')||'-'||nextval('invoice_seq')),
  order_id uuid references orders(id) on delete set null, client_id uuid references clients(id), items jsonb not null default '[]', amount numeric(12,2) not null default 0,
  currency text default 'USD', issue_date date default current_date, due_date date default current_date+14, status text default 'unpaid' check(status in('unpaid','paid','void')), created_at timestamptz default now());
create table if not exists milestones(id uuid primary key default gen_random_uuid(), order_id uuid references orders(id) on delete cascade, title text not null,
  due_date date, status text default 'todo' check(status in('todo','in_progress','done','blocked')), sort int default 0, created_at timestamptz default now());

alter table site_content enable row level security; alter table posts enable row level security; alter table clients enable row level security;
alter table orders enable row level security; alter table invoices enable row level security; alter table milestones enable row level security;

create policy "public read content" on site_content for select using (true);
create policy "admin write content" on site_content for all using (is_admin()) with check (is_admin());
create policy "public read published" on posts for select using (published or is_admin());
create policy "admin write posts" on posts for all using (is_admin()) with check (is_admin());
create policy "anyone can place order" on orders for insert to anon, authenticated with check (status='pending' and client_id is null);
create policy "admin orders" on orders for all using (is_admin()) with check (is_admin());
create policy "admin clients" on clients for all using (is_admin()) with check (is_admin());
create policy "admin invoices" on invoices for all using (is_admin()) with check (is_admin());
create policy "admin milestones" on milestones for all using (is_admin()) with check (is_admin());

-- Storage bucket for blog cover images (public read, admin write)
insert into storage.buckets(id,name,public) values('covers','covers',true) on conflict do nothing;
create policy "public read covers" on storage.objects for select using (bucket_id='covers');
create policy "admin upload covers" on storage.objects for insert with check (bucket_id='covers' and is_admin());
create policy "admin modify covers" on storage.objects for update using (bucket_id='covers' and is_admin());
create policy "admin delete covers" on storage.objects for delete using (bucket_id='covers' and is_admin());
