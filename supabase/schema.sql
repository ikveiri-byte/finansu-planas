-- ============================================================================
-- Finansų planavimo programėlė — duomenų bazės struktūra (Supabase / Postgres)
-- Paleisk šį failą per Supabase Dashboard -> SQL Editor -> New query -> Run
-- ============================================================================

-- Leidžiamos išlaidų kategorijos (tvarka svarbi rodymui programėlėje)
create type expense_category as enum (
  'Maistas',
  'Takeout',
  'Nuoma',
  'Transportas',
  'Telefonas, mini mokesčiai',
  'Pramogos',
  'Šmutkės',
  'Kita'
);

-- ----------------------------------------------------------------------------
-- Fiksuotų išlaidų taisyklės (pvz. nuoma, kurios kartojasi kas mėnesį)
-- ----------------------------------------------------------------------------
create table fixed_expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  category expense_category not null,
  amount numeric(12,2) not null,
  start_year int not null,
  start_month int not null check (start_month between 1 and 12),
  end_year int,             -- null = tebevyksta / neapribota
  end_month int check (end_month between 1 and 12),
  -- mėnesiai (formatu 'YYYY-MM'), kuriuose ši fiksuota išlaida buvo rankiniu būdu
  -- ištrinta iš konkretaus mėnesio (kad neatsirastų vėl generuojant)
  deleted_instances text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Pajamos ir išlaidos (visos konkretaus mėnesio eilutės, taip pat ir tos,
-- kurios buvo sugeneruotos iš fixed_expenses taisyklės)
-- ----------------------------------------------------------------------------
create table transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('income', 'expense')),
  description text not null,
  category expense_category,          -- tik expense tipui; income = null
  amount numeric(12,2) not null,
  txn_date date not null,             -- konkreti data (rikiavimui / "3 paskutinės")
  year int not null,
  month int not null check (month between 1 and 12),
  is_fixed boolean not null default false,
  fixed_expense_id uuid references fixed_expenses(id) on delete cascade,
  is_historical_import boolean not null default false, -- pažymi duomenis, atkeltus iš Excel
  created_at timestamptz not null default now()
);

create index transactions_user_month_idx on transactions (user_id, year, month);
create index transactions_user_date_idx on transactions (user_id, txn_date);
create unique index fixed_instance_unique_idx on transactions (fixed_expense_id, year, month)
  where fixed_expense_id is not null;

-- ----------------------------------------------------------------------------
-- Santaupų tikslas kiekvienam mėnesiui
-- ----------------------------------------------------------------------------
create table savings_goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  year int not null,
  month int not null check (month between 1 and 12),
  goal_amount numeric(12,2) not null default 0,
  unique (user_id, year, month)
);

-- ----------------------------------------------------------------------------
-- Skolos (pinigai, kuriuos kiti skolingi tau)
-- ----------------------------------------------------------------------------
create table debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  person_name text not null,
  amount numeric(12,2) not null,
  year int not null,
  month int not null check (month between 1 and 12),
  is_settled boolean not null default false,
  settled_at timestamptz,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- Planuojami pirkiniai (to-do sąrašo principu)
-- ----------------------------------------------------------------------------
create table planned_purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  description text not null,
  amount numeric(12,2),
  year int not null,
  month int not null check (month between 1 and 12),
  is_purchased boolean not null default false,
  purchased_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================================
-- Row Level Security — kiekvienas vartotojas mato tik savo duomenis
-- ============================================================================
alter table fixed_expenses enable row level security;
alter table transactions enable row level security;
alter table savings_goals enable row level security;
alter table debts enable row level security;
alter table planned_purchases enable row level security;

create policy "own rows only" on fixed_expenses
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows only" on transactions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows only" on savings_goals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows only" on debts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "own rows only" on planned_purchases
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
