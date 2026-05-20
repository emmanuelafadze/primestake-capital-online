-- PrimeStake Capital — Production Schema
-- ⚠️ Run this entire file in your Supabase SQL Editor (https://supabase.com/dashboard/project/mdggprigudcglsozaeoy/sql)
-- Then deploy the edge function in `db/functions/verify-paystack/index.ts`

-- =========================================================
-- ENUMS
-- =========================================================
do $$ begin
  create type app_role as enum ('user', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type purchase_status as enum (
    'pending_payment','payment_processing','awaiting_admin_approval',
    'approved','released','won','lost','void','archived','failed'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type kyc_status as enum ('not_started','pending','under_review','approved','rejected','requires_resubmission');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tx_type as enum ('deposit','purchase','withdrawal','investment','adjustment','refund');
exception when duplicate_object then null; end $$;

do $$ begin
  create type tx_status as enum ('pending','success','failed','reversed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type withdrawal_status as enum ('pending','approved','rejected','paid');
exception when duplicate_object then null; end $$;

-- PROFILES
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  full_name text, country text, currency text default 'USD',
  phone text, avatar_url text,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- USER ROLES
create table if not exists public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null, created_at timestamptz default now(),
  unique (user_id, role)
);

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role);
$$;

-- WALLETS
create table if not exists public.wallets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  balance_usd numeric(14,2) not null default 0,
  managed_balance_usd numeric(14,2) not null default 0,
  updated_at timestamptz default now()
);

-- PACKAGES
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null, name text not null, description text,
  price_usd numeric(10,2) not null, features jsonb default '[]'::jsonb,
  active boolean default true, created_at timestamptz default now()
);

-- FIXED MATCHES
create table if not exists public.fixed_matches (
  id uuid primary key default gen_random_uuid(),
  package_id uuid references public.packages(id) on delete set null,
  league text, home_team text not null, away_team text not null,
  match_date timestamptz not null, predicted_score text, odds numeric(6,2),
  result text, status text default 'scheduled',
  created_at timestamptz default now()
);

-- PURCHASES
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  package_id uuid not null references public.packages(id),
  amount_usd numeric(10,2) not null,
  paystack_reference text unique,
  status purchase_status not null default 'pending_payment',
  unlocked_at timestamptz, result text,
  created_at timestamptz default now()
);

-- TRANSACTIONS
create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type tx_type not null, status tx_status not null default 'pending',
  amount_usd numeric(14,2) not null,
  local_currency text, local_amount numeric(14,2),
  reference text unique, description text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- KYC ONBOARDING
create table if not exists public.onboarding_forms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique not null references auth.users(id) on delete cascade,
  status kyc_status not null default 'not_started',
  full_legal_name text, date_of_birth date, gender text,
  nationality text, country_of_residence text, address text, phone text,
  id_document_url text, passport_url text, selfie_url text, utility_bill_url text,
  nok_name text, nok_relationship text, nok_phone text, nok_address text, nok_email text,
  investment_experience text, preferred_amount numeric(14,2), risk_appetite text,
  monthly_income text, betting_platform text, expected_roi text,
  signature text, terms_accepted boolean default false,
  review_notes text, submitted_at timestamptz, reviewed_at timestamptz,
  created_at timestamptz default now(), updated_at timestamptz default now()
);

-- INVESTMENTS
create table if not exists public.investments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_usd numeric(14,2) not null,
  current_value_usd numeric(14,2) not null,
  roi_percent numeric(6,2) default 0,
  started_at timestamptz default now(),
  active boolean default true
);

create table if not exists public.investment_history (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  balance_usd numeric(14,2) not null,
  delta_usd numeric(14,2) not null default 0,
  note text, recorded_at timestamptz default now()
);

-- WITHDRAWALS
create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount_usd numeric(14,2) not null, destination text,
  status withdrawal_status not null default 'pending',
  admin_note text, created_at timestamptz default now(),
  reviewed_at timestamptz
);

-- NOTIFICATIONS
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, body text, read boolean default false,
  created_at timestamptz default now()
);

-- SUPPORT CHAT
create table if not exists public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  sender text not null check (sender in ('user','admin')),
  body text not null, created_at timestamptz default now()
);

-- ADMIN LOGS
create table if not exists public.admin_logs (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid references auth.users(id) on delete set null,
  action text not null, target text,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

-- TRIGGERS
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)))
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, 'user') on conflict do nothing;
  insert into public.wallets (user_id) values (new.id) on conflict do nothing;
  insert into public.onboarding_forms (user_id) values (new.id) on conflict do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

drop trigger if exists trg_profiles_touch on public.profiles;
create trigger trg_profiles_touch before update on public.profiles
for each row execute function public.touch_updated_at();

drop trigger if exists trg_kyc_touch on public.onboarding_forms;
create trigger trg_kyc_touch before update on public.onboarding_forms
for each row execute function public.touch_updated_at();

-- SEED PACKAGES
insert into public.packages (slug, name, description, price_usd, features) values
  ('single','Single Correct Score','One precision-vetted correct score from our analyst desk.',50,
   '["1 correct score fixture","Pre-match analyst notes","Release within 24h","Result tracking"]'),
  ('combo','Combo Correct Score','Two correlated correct scores for a higher conviction ticket.',70,
   '["2 correct scores","Combined odds boost","Pre-match analyst notes","Result tracking"]'),
  ('premium','Premium Package','Three correct scores in a row — our flagship release.',90,
   '["3 correct scores","Highest conviction tier","Priority release","Dedicated analyst access"]')
on conflict (slug) do nothing;

-- ENABLE RLS
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.wallets enable row level security;
alter table public.packages enable row level security;
alter table public.fixed_matches enable row level security;
alter table public.purchases enable row level security;
alter table public.transactions enable row level security;
alter table public.onboarding_forms enable row level security;
alter table public.investments enable row level security;
alter table public.investment_history enable row level security;
alter table public.withdrawals enable row level security;
alter table public.notifications enable row level security;
alter table public.support_messages enable row level security;
alter table public.admin_logs enable row level security;

-- POLICIES
drop policy if exists "profiles_self_read" on public.profiles;
create policy "profiles_self_read" on public.profiles for select using (auth.uid() = id or public.has_role(auth.uid(),'admin'));
drop policy if exists "profiles_self_update" on public.profiles;
create policy "profiles_self_update" on public.profiles for update using (auth.uid() = id);
drop policy if exists "profiles_admin_all" on public.profiles;
create policy "profiles_admin_all" on public.profiles for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "roles_self_read" on public.user_roles;
create policy "roles_self_read" on public.user_roles for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
drop policy if exists "roles_admin_all" on public.user_roles;
create policy "roles_admin_all" on public.user_roles for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "wallets_self_read" on public.wallets;
create policy "wallets_self_read" on public.wallets for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
drop policy if exists "wallets_admin_all" on public.wallets;
create policy "wallets_admin_all" on public.wallets for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "packages_public_read" on public.packages;
create policy "packages_public_read" on public.packages for select using (true);
drop policy if exists "packages_admin_all" on public.packages;
create policy "packages_admin_all" on public.packages for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "matches_read_auth" on public.fixed_matches;
create policy "matches_read_auth" on public.fixed_matches for select using (auth.role() = 'authenticated');
drop policy if exists "matches_admin_all" on public.fixed_matches;
create policy "matches_admin_all" on public.fixed_matches for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "purchases_self_read" on public.purchases;
create policy "purchases_self_read" on public.purchases for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
drop policy if exists "purchases_self_insert" on public.purchases;
create policy "purchases_self_insert" on public.purchases for insert with check (auth.uid() = user_id);
drop policy if exists "purchases_self_update" on public.purchases;
create policy "purchases_self_update" on public.purchases for update using (auth.uid() = user_id);
drop policy if exists "purchases_admin_all" on public.purchases;
create policy "purchases_admin_all" on public.purchases for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "tx_self_read" on public.transactions;
create policy "tx_self_read" on public.transactions for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
drop policy if exists "tx_self_insert" on public.transactions;
create policy "tx_self_insert" on public.transactions for insert with check (auth.uid() = user_id);
drop policy if exists "tx_admin_all" on public.transactions;
create policy "tx_admin_all" on public.transactions for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "kyc_self_read" on public.onboarding_forms;
create policy "kyc_self_read" on public.onboarding_forms for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
drop policy if exists "kyc_self_update" on public.onboarding_forms;
create policy "kyc_self_update" on public.onboarding_forms for update using (auth.uid() = user_id);
drop policy if exists "kyc_self_insert" on public.onboarding_forms;
create policy "kyc_self_insert" on public.onboarding_forms for insert with check (auth.uid() = user_id);
drop policy if exists "kyc_admin_all" on public.onboarding_forms;
create policy "kyc_admin_all" on public.onboarding_forms for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "inv_self_read" on public.investments;
create policy "inv_self_read" on public.investments for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
drop policy if exists "inv_admin_all" on public.investments;
create policy "inv_admin_all" on public.investments for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "invh_self_read" on public.investment_history;
create policy "invh_self_read" on public.investment_history for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
drop policy if exists "invh_admin_all" on public.investment_history;
create policy "invh_admin_all" on public.investment_history for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "wd_self_read" on public.withdrawals;
create policy "wd_self_read" on public.withdrawals for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
drop policy if exists "wd_self_insert" on public.withdrawals;
create policy "wd_self_insert" on public.withdrawals for insert with check (auth.uid() = user_id);
drop policy if exists "wd_admin_all" on public.withdrawals;
create policy "wd_admin_all" on public.withdrawals for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "notif_self_read" on public.notifications;
create policy "notif_self_read" on public.notifications for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
drop policy if exists "notif_self_update" on public.notifications;
create policy "notif_self_update" on public.notifications for update using (auth.uid() = user_id);
drop policy if exists "notif_admin_all" on public.notifications;
create policy "notif_admin_all" on public.notifications for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "chat_self_read" on public.support_messages;
create policy "chat_self_read" on public.support_messages for select using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
drop policy if exists "chat_self_insert" on public.support_messages;
create policy "chat_self_insert" on public.support_messages for insert with check (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
drop policy if exists "chat_admin_all" on public.support_messages;
create policy "chat_admin_all" on public.support_messages for all using (public.has_role(auth.uid(),'admin'));

drop policy if exists "logs_admin_all" on public.admin_logs;
create policy "logs_admin_all" on public.admin_logs for all using (public.has_role(auth.uid(),'admin'));

-- STORAGE BUCKET
insert into storage.buckets (id, name, public) values ('kyc-documents','kyc-documents', false)
on conflict (id) do nothing;

drop policy if exists "kyc_storage_self_read" on storage.objects;
create policy "kyc_storage_self_read" on storage.objects for select using (
  bucket_id = 'kyc-documents' and (auth.uid()::text = (storage.foldername(name))[1] or public.has_role(auth.uid(),'admin'))
);
drop policy if exists "kyc_storage_self_write" on storage.objects;
create policy "kyc_storage_self_write" on storage.objects for insert with check (
  bucket_id = 'kyc-documents' and auth.uid()::text = (storage.foldername(name))[1]
);

-- REALTIME (ignore errors if already added)
do $$ begin
  alter publication supabase_realtime add table public.support_messages;
exception when others then null; end $$;
do $$ begin
  alter publication supabase_realtime add table public.notifications;
exception when others then null; end $$;
