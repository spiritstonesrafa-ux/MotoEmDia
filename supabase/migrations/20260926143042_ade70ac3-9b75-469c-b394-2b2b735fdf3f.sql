create type public.app_role as enum ('admin','user');
create type public.quote_status as enum ('novo','em_contato','orcamento_enviado','servico_realizado','encerrado');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  role app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.user_roles where user_id = _user_id and role = _role) $$;

create policy "own roles readable" on public.user_roles for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  name text not null default '',
  email text,
  phone text,
  created_at timestamptz not null default now()
);
grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
alter table public.profiles enable row level security;
create policy "profiles select" on public.profiles for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "profiles update own" on public.profiles for update to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "profiles insert own" on public.profiles for insert to authenticated
with check (user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (user_id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name',''), new.email);
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  return new;
end; $$;
create trigger on_auth_user_created after insert on auth.users
for each row execute function public.handle_new_user();

create table public.motorcycles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  manufacturer text not null,
  model text not null,
  year int not null,
  engine_capacity int,
  plate text,
  nickname text,
  current_mileage int not null default 0 check (current_mileage >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.motorcycles(user_id);
grant select, insert, update, delete on public.motorcycles to authenticated;
grant all on public.motorcycles to service_role;
alter table public.motorcycles enable row level security;
create policy "moto select" on public.motorcycles for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "moto insert" on public.motorcycles for insert to authenticated with check (user_id = auth.uid());
create policy "moto update" on public.motorcycles for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "moto delete" on public.motorcycles for delete to authenticated using (user_id = auth.uid());

create table public.mileage_updates (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles(id) on delete cascade,
  user_id uuid not null,
  mileage int not null,
  created_at timestamptz not null default now()
);
grant select on public.mileage_updates to authenticated;
grant all on public.mileage_updates to service_role;
alter table public.mileage_updates enable row level security;
create policy "km select" on public.mileage_updates for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));

create or replace function public.moto_mileage_guard()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  if tg_op = 'UPDATE' then
    if new.current_mileage < old.current_mileage then
      raise exception 'A nova quilometragem não pode ser menor que a atual';
    end if;
    new.updated_at = now();
    if new.current_mileage <> old.current_mileage then
      insert into public.mileage_updates (motorcycle_id, user_id, mileage) values (new.id, new.user_id, new.current_mileage);
    end if;
  end if;
  return new;
end; $$;
create trigger moto_mileage_guard before update on public.motorcycles
for each row execute function public.moto_mileage_guard();

create table public.maintenance_records (
  id uuid primary key default gen_random_uuid(),
  motorcycle_id uuid not null references public.motorcycles(id) on delete cascade,
  user_id uuid not null,
  service_type text not null,
  service_date date not null,
  mileage int not null check (mileage >= 0),
  cost numeric(10,2),
  workshop text,
  notes text,
  created_at timestamptz not null default now()
);
create index on public.maintenance_records(user_id);
grant select, insert, update, delete on public.maintenance_records to authenticated;
grant all on public.maintenance_records to service_role;
alter table public.maintenance_records enable row level security;
create policy "mr select" on public.maintenance_records for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "mr insert" on public.maintenance_records for insert to authenticated
with check (user_id = auth.uid() and exists (select 1 from public.motorcycles m where m.id = motorcycle_id and m.user_id = auth.uid()));
create policy "mr update" on public.maintenance_records for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "mr delete" on public.maintenance_records for delete to authenticated using (user_id = auth.uid());

create table public.maintenance_intervals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  motorcycle_id uuid not null references public.motorcycles(id) on delete cascade,
  category text not null,
  interval_km int check (interval_km is null or interval_km > 0),
  updated_at timestamptz not null default now(),
  unique (motorcycle_id, category)
);
grant select, insert, update, delete on public.maintenance_intervals to authenticated;
grant all on public.maintenance_intervals to service_role;
alter table public.maintenance_intervals enable row level security;
create policy "mi all own" on public.maintenance_intervals for all to authenticated
using (user_id = auth.uid()) with check (user_id = auth.uid() and exists (select 1 from public.motorcycles m where m.id = motorcycle_id and m.user_id = auth.uid()));

create table public.quote_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  motorcycle_id uuid references public.motorcycles(id) on delete set null,
  service_type text not null,
  description text,
  contact_name text not null,
  phone text not null,
  motorcycle_label text,
  mileage int,
  preferred_contact text not null default 'whatsapp',
  status quote_status not null default 'novo',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on public.quote_requests(user_id);
grant select, insert, update on public.quote_requests to authenticated;
grant all on public.quote_requests to service_role;
alter table public.quote_requests enable row level security;
create policy "qr select" on public.quote_requests for select to authenticated
using (user_id = auth.uid() or public.has_role(auth.uid(),'admin'));
create policy "qr insert own" on public.quote_requests for insert to authenticated with check (user_id = auth.uid());
create policy "qr admin update" on public.quote_requests for update to authenticated
using (public.has_role(auth.uid(),'admin')) with check (public.has_role(auth.uid(),'admin'));

create or replace function public.quote_guard()
returns trigger language plpgsql set search_path = public
as $$
begin
  if tg_op = 'INSERT' then new.status = 'novo'; end if;
  new.updated_at = now();
  return new;
end; $$;
create trigger quote_guard before insert or update on public.quote_requests
for each row execute function public.quote_guard();