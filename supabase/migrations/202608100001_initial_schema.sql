begin;

create extension if not exists pgcrypto;

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'side_income', 'expense')),
  title text not null check (char_length(title) between 2 and 120),
  amount numeric(18, 2) not null check (amount > 0),
  occurred_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.installment_plans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null check (char_length(title) between 2 and 120),
  total_amount numeric(18, 2) not null check (total_amount > 0),
  installment_amount numeric(18, 2) not null check (installment_amount > 0),
  total_installments integer not null check (total_installments > 0),
  paid_installments integer not null default 0 check (paid_installments >= 0 and paid_installments <= total_installments),
  start_date date not null,
  due_day integer not null check (due_day between 1 and 31),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.gold_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('buy', 'sell')),
  grams numeric(12, 3) not null check (grams > 0),
  price_per_gram numeric(18, 2) not null check (price_per_gram > 0),
  occurred_at timestamptz not null default now(),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  gold_price_per_gram numeric(18, 2) not null default 7500000 check (gold_price_per_gram >= 0),
  theme text not null default 'dark' check (theme in ('dark', 'light', 'system')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists transactions_user_occurred_idx on public.transactions (user_id, occurred_at desc);
create index if not exists transactions_user_type_idx on public.transactions (user_id, type);
create index if not exists installment_plans_user_idx on public.installment_plans (user_id, created_at desc);
create index if not exists gold_transactions_user_occurred_idx on public.gold_transactions (user_id, occurred_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists transactions_set_updated_at on public.transactions;
create trigger transactions_set_updated_at before update on public.transactions for each row execute function public.set_updated_at();
drop trigger if exists installment_plans_set_updated_at on public.installment_plans;
create trigger installment_plans_set_updated_at before update on public.installment_plans for each row execute function public.set_updated_at();
drop trigger if exists gold_transactions_set_updated_at on public.gold_transactions;
create trigger gold_transactions_set_updated_at before update on public.gold_transactions for each row execute function public.set_updated_at();
drop trigger if exists user_settings_set_updated_at on public.user_settings;
create trigger user_settings_set_updated_at before update on public.user_settings for each row execute function public.set_updated_at();

alter table public.transactions enable row level security;
alter table public.installment_plans enable row level security;
alter table public.gold_transactions enable row level security;
alter table public.user_settings enable row level security;

drop policy if exists "Users manage own transactions" on public.transactions;
create policy "Users manage own transactions" on public.transactions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own installment plans" on public.installment_plans;
create policy "Users manage own installment plans" on public.installment_plans for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own gold transactions" on public.gold_transactions;
create policy "Users manage own gold transactions" on public.gold_transactions for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
drop policy if exists "Users manage own settings" on public.user_settings;
create policy "Users manage own settings" on public.user_settings for all to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

alter table public.transactions replica identity full;
alter table public.installment_plans replica identity full;
alter table public.gold_transactions replica identity full;
alter table public.user_settings replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'transactions') then alter publication supabase_realtime add table public.transactions; end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'installment_plans') then alter publication supabase_realtime add table public.installment_plans; end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'gold_transactions') then alter publication supabase_realtime add table public.gold_transactions; end if;
  if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'user_settings') then alter publication supabase_realtime add table public.user_settings; end if;
end $$;

commit;
