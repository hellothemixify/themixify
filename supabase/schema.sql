-- ============================================================================
-- THEMIXIFY — complete database schema
--
-- One file. Run it once in the Supabase SQL editor and the entire backend
-- exists: tables, views, functions, triggers, row-level security and seed data.
--
-- It is written to be idempotent. Running it a second time is harmless, so you
-- can paste it again after editing rather than hunting for the delta.
--
-- Every policy below assumes the application only ever holds the anon key.
-- Authorisation lives here, in the database, not in the application — which is
-- why the service-role key is never imported into the Next.js app.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. EXTENSIONS
-- ----------------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. TABLES
-- ----------------------------------------------------------------------------

-- Plans -----------------------------------------------------------------------
-- Mirrors the pricing page. Kept in the database rather than hard-coded so a
-- price change does not require a deploy, and so orders can reference a real row.
create table if not exists public.plans (
  id            text primary key,
  name          text        not null,
  sites_allowed integer     not null check (sites_allowed > 0),
  price_cents   integer     not null check (price_cents >= 0),
  sort_order    integer     not null default 0,
  is_active     boolean     not null default true,
  created_at    timestamptz not null default now()
);

-- Profiles --------------------------------------------------------------------
-- One row per auth user, created automatically by a trigger so a user can never
-- exist without a profile.
create table if not exists public.profiles (
  id             uuid primary key references auth.users (id) on delete cascade,
  email          text        not null,
  full_name      text,
  role           text        not null default 'user' check (role in ('user', 'admin')),
  country        text,
  created_at     timestamptz not null default now(),
  last_active_at timestamptz
);

create index if not exists profiles_email_idx on public.profiles (lower(email));
create index if not exists profiles_role_idx  on public.profiles (role);

-- Orders ----------------------------------------------------------------------
create table if not exists public.orders (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid        not null references public.profiles (id) on delete cascade,
  plan_id      text        not null references public.plans (id),
  amount_cents integer     not null check (amount_cents >= 0),
  currency     text        not null default 'USD',
  status       text        not null default 'pending'
                 check (status in ('pending', 'paid', 'refunded', 'failed')),
  provider     text,
  provider_ref text,
  created_at   timestamptz not null default now()
);

create index if not exists orders_user_idx   on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

-- Licences --------------------------------------------------------------------
create table if not exists public.licenses (
  id            uuid primary key default gen_random_uuid(),
  license_key   text        not null unique,
  user_id       uuid        not null references public.profiles (id) on delete cascade,
  plan_id       text        not null references public.plans (id),
  order_id      uuid        references public.orders (id) on delete set null,
  sites_allowed integer     not null check (sites_allowed > 0),
  status        text        not null default 'active'
                  check (status in ('active', 'revoked', 'expired')),
  notes         text,
  created_at    timestamptz not null default now()
);

create index if not exists licenses_user_idx   on public.licenses (user_id);
create index if not exists licenses_key_idx    on public.licenses (license_key);
create index if not exists licenses_status_idx on public.licenses (status);

-- Activations -----------------------------------------------------------------
-- One row per site a licence has been installed on. Releasing a site is a soft
-- status change rather than a delete, so the history survives a support dispute.
create table if not exists public.license_activations (
  id            uuid primary key default gen_random_uuid(),
  license_id    uuid        not null references public.licenses (id) on delete cascade,
  site_url      text        not null,
  site_name     text,
  status        text        not null default 'active' check (status in ('active', 'released')),
  activated_at  timestamptz not null default now(),
  last_check_at timestamptz
);

create index if not exists activations_license_idx on public.license_activations (license_id);

-- One active activation per site per licence. Reinstalling on the same domain
-- must never silently consume a second slot.
create unique index if not exists activations_unique_site
  on public.license_activations (license_id, lower(site_url))
  where status = 'active';

-- Releases --------------------------------------------------------------------
create table if not exists public.releases (
  id           uuid primary key default gen_random_uuid(),
  version      text        not null unique,
  headline     text        not null,
  notes        text,
  download_url text,
  is_latest    boolean     not null default false,
  released_at  timestamptz not null default now()
);

-- Contact messages ------------------------------------------------------------
create table if not exists public.contact_messages (
  id         uuid primary key default gen_random_uuid(),
  name       text        not null,
  email      text        not null,
  topic      text        not null default 'presales',
  message    text        not null,
  status     text        not null default 'new' check (status in ('new', 'read', 'closed')),
  created_at timestamptz not null default now()
);

create index if not exists messages_status_idx on public.contact_messages (status, created_at desc);

-- ----------------------------------------------------------------------------
-- 2. HELPER FUNCTIONS
-- ----------------------------------------------------------------------------

-- Is the caller an administrator?
--
-- SECURITY DEFINER on purpose: policies on `profiles` call this, and a policy
-- that queries the table it protects would recurse. Running as the definer
-- reads the row without re-entering the policy.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Generate a readable, collision-resistant licence key: TMX-XXXX-XXXX-XXXX.
-- Ambiguous glyphs (0/O, 1/I) are excluded so a key can be read down a phone.
create or replace function public.generate_license_key()
returns text
language plpgsql
volatile
as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  candidate text;
  block     text;
  i         integer;
  j         integer;
begin
  loop
    candidate := 'TMX';
    for i in 1..3 loop
      block := '';
      for j in 1..4 loop
        block := block || substr(alphabet, 1 + floor(random() * length(alphabet))::int, 1);
      end loop;
      candidate := candidate || '-' || block;
    end loop;

    exit when not exists (select 1 from public.licenses where license_key = candidate);
  end loop;

  return candidate;
end;
$$;

-- Create the profile row for every new auth user.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- 3. VIEWS
--
-- The application reads these rather than joining in the client. They inherit
-- the row-level security of the underlying tables (security_invoker), so a
-- customer selecting from a view still only ever sees their own rows.
-- ----------------------------------------------------------------------------

create or replace view public.licenses_with_usage
with (security_invoker = true) as
select
  l.id,
  l.license_key,
  l.user_id,
  l.plan_id,
  p.name  as plan_name,
  l.sites_allowed,
  l.status,
  l.notes,
  l.created_at,
  coalesce(a.used, 0)::integer as sites_used
from public.licenses l
join public.plans p on p.id = l.plan_id
left join lateral (
  select count(*) as used
  from public.license_activations act
  where act.license_id = l.id and act.status = 'active'
) a on true;

create or replace view public.admin_license_rows
with (security_invoker = true) as
select
  v.*,
  pr.email     as owner_email,
  pr.full_name as owner_name
from public.licenses_with_usage v
join public.profiles pr on pr.id = v.user_id;

create or replace view public.admin_user_rows
with (security_invoker = true) as
select
  pr.*,
  coalesce(lic.count, 0)::integer   as license_count,
  coalesce(act.count, 0)::integer   as activation_count,
  coalesce(paid.total, 0)::integer  as total_paid_cents
from public.profiles pr
left join lateral (
  select count(*) as count from public.licenses l where l.user_id = pr.id
) lic on true
left join lateral (
  select count(*) as count
  from public.license_activations a
  join public.licenses l on l.id = a.license_id
  where l.user_id = pr.id and a.status = 'active'
) act on true
left join lateral (
  select sum(o.amount_cents) as total
  from public.orders o
  where o.user_id = pr.id and o.status = 'paid'
) paid on true;

-- ----------------------------------------------------------------------------
-- 4. RPC — admin overview
--
-- One call returns the whole dashboard. Counting in Postgres rather than
-- shipping every row to the browser keeps the screen fast at any scale and
-- means the numbers cannot be reconstructed by a caller who is not an admin.
-- ----------------------------------------------------------------------------

create or replace function public.admin_overview()
returns json
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  result json;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  select json_build_object(
    'total_users',        (select count(*) from public.profiles),
    'active_users',       (select count(*) from public.profiles
                            where last_active_at > now() - interval '30 days'),
    'new_users_30d',      (select count(*) from public.profiles
                            where created_at > now() - interval '30 days'),
    'total_licenses',     (select count(*) from public.licenses),
    'active_licenses',    (select count(*) from public.licenses where status = 'active'),
    'total_activations',  (select count(*) from public.license_activations
                            where status = 'active'),
    'orders_paid',        (select count(*) from public.orders where status = 'paid'),
    'revenue_cents',      (select coalesce(sum(amount_cents), 0) from public.orders
                            where status = 'paid'),
    'revenue_30d_cents',  (select coalesce(sum(amount_cents), 0) from public.orders
                            where status = 'paid' and created_at > now() - interval '30 days'),
    'plan_mix',           (select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
                             select l.plan_id, p.name as plan_name, count(*) as count
                             from public.licenses l
                             join public.plans p on p.id = l.plan_id
                             group by l.plan_id, p.name
                             order by count(*) desc
                           ) t),
    'signup_series',      (select coalesce(json_agg(row_to_json(s)), '[]'::json) from (
                             select to_char(d.day, 'YYYY-MM-DD') as day,
                                    count(pr.id)                 as count
                             from generate_series(
                               (current_date - interval '29 days')::date,
                               current_date,
                               interval '1 day'
                             ) as d(day)
                             left join public.profiles pr
                               on pr.created_at::date = d.day::date
                             group by d.day
                             order by d.day
                           ) s)
  ) into result;

  return result;
end;
$$;

-- ----------------------------------------------------------------------------
-- 5. RPC — issue a licence by hand
--
-- Used for manual sales, replacements and review copies. The key is generated
-- here so it can never collide, and the caller must already be an admin.
-- ----------------------------------------------------------------------------

create or replace function public.admin_issue_license(
  p_email   text,
  p_plan_id text,
  p_notes   text default null
)
returns json
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
  v_sites   integer;
  v_key     text;
begin
  if not public.is_admin() then
    raise exception 'Not authorised' using errcode = '42501';
  end if;

  select id into v_user_id
  from public.profiles
  where lower(email) = lower(trim(p_email));

  if v_user_id is null then
    raise exception 'No account exists for %. Ask them to sign up first.', p_email;
  end if;

  select sites_allowed into v_sites from public.plans where id = p_plan_id;
  if v_sites is null then
    raise exception 'Unknown plan: %', p_plan_id;
  end if;

  v_key := public.generate_license_key();

  insert into public.licenses (license_key, user_id, plan_id, sites_allowed, notes)
  values (v_key, v_user_id, p_plan_id, v_sites, p_notes);

  return json_build_object('license_key', v_key);
end;
$$;

-- ----------------------------------------------------------------------------
-- 6. RPC — activate a licence on a site
--
-- Called by the WordPress theme, not by this website. Returns a plain JSON
-- verdict the theme can act on without interpreting Postgres errors.
-- ----------------------------------------------------------------------------

create or replace function public.activate_license(
  p_key       text,
  p_site_url  text,
  p_site_name text default null
)
returns json
language plpgsql
volatile
security definer
set search_path = public
as $$
declare
  v_license public.licenses%rowtype;
  v_used    integer;
begin
  select * into v_license
  from public.licenses
  where license_key = upper(trim(p_key));

  if v_license.id is null then
    return json_build_object('ok', false, 'error', 'Unknown licence key.');
  end if;

  if v_license.status <> 'active' then
    return json_build_object('ok', false, 'error', 'That licence is ' || v_license.status || '.');
  end if;

  -- Re-activating the same domain is a no-op, not a second seat. Without this
  -- a site that migrates hosts and reconnects would burn a slot every time.
  if exists (
    select 1 from public.license_activations
    where license_id = v_license.id
      and lower(site_url) = lower(trim(p_site_url))
      and status = 'active'
  ) then
    update public.license_activations
       set last_check_at = now()
     where license_id = v_license.id
       and lower(site_url) = lower(trim(p_site_url));

    return json_build_object('ok', true, 'message', 'Already activated on this site.');
  end if;

  select count(*) into v_used
  from public.license_activations
  where license_id = v_license.id and status = 'active';

  if v_used >= v_license.sites_allowed then
    return json_build_object(
      'ok', false,
      'error', format(
        'This licence is already active on %s of %s sites. Release one from your dashboard first.',
        v_used, v_license.sites_allowed
      )
    );
  end if;

  insert into public.license_activations (license_id, site_url, site_name, last_check_at)
  values (v_license.id, trim(p_site_url), p_site_name, now());

  return json_build_object('ok', true, 'message', 'Licence activated.');
end;
$$;

-- ----------------------------------------------------------------------------
-- 7. ROW-LEVEL SECURITY
--
-- Default posture: deny. Every table is locked, then opened only where a
-- specific role genuinely needs access.
-- ----------------------------------------------------------------------------

alter table public.plans               enable row level security;
alter table public.profiles            enable row level security;
alter table public.orders              enable row level security;
alter table public.licenses            enable row level security;
alter table public.license_activations enable row level security;
alter table public.releases            enable row level security;
alter table public.contact_messages    enable row level security;

-- Plans: public catalogue, readable by anyone; writable only by admins.
drop policy if exists plans_read       on public.plans;
drop policy if exists plans_admin_all  on public.plans;
create policy plans_read      on public.plans for select using (true);
create policy plans_admin_all on public.plans for all
  using (public.is_admin()) with check (public.is_admin());

-- Profiles: your own row, or anything if you are an admin.
drop policy if exists profiles_select_own    on public.profiles;
drop policy if exists profiles_update_own    on public.profiles;
drop policy if exists profiles_admin_select  on public.profiles;
drop policy if exists profiles_admin_update  on public.profiles;
create policy profiles_select_own   on public.profiles for select using (id = auth.uid());
create policy profiles_update_own   on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());
create policy profiles_admin_select on public.profiles for select using (public.is_admin());
create policy profiles_admin_update on public.profiles for update
  using (public.is_admin()) with check (public.is_admin());

-- Orders: read your own; admins read and write everything. Customers never
-- insert orders from the browser — payment webhooks do that server-side.
drop policy if exists orders_select_own   on public.orders;
drop policy if exists orders_admin_all    on public.orders;
create policy orders_select_own on public.orders for select using (user_id = auth.uid());
create policy orders_admin_all  on public.orders for all
  using (public.is_admin()) with check (public.is_admin());

-- Licences: read your own; admins do everything.
drop policy if exists licenses_select_own on public.licenses;
drop policy if exists licenses_admin_all  on public.licenses;
create policy licenses_select_own on public.licenses for select using (user_id = auth.uid());
create policy licenses_admin_all  on public.licenses for all
  using (public.is_admin()) with check (public.is_admin());

-- Activations: readable and releasable by the licence owner. Note the update
-- policy allows a customer to free a slot but not to create one — new
-- activations only ever come through activate_license().
drop policy if exists activations_select_own on public.license_activations;
drop policy if exists activations_update_own on public.license_activations;
drop policy if exists activations_admin_all  on public.license_activations;
create policy activations_select_own on public.license_activations for select
  using (exists (
    select 1 from public.licenses l
    where l.id = license_id and l.user_id = auth.uid()
  ));
create policy activations_update_own on public.license_activations for update
  using (exists (
    select 1 from public.licenses l
    where l.id = license_id and l.user_id = auth.uid()
  ))
  with check (exists (
    select 1 from public.licenses l
    where l.id = license_id and l.user_id = auth.uid()
  ));
create policy activations_admin_all on public.license_activations for all
  using (public.is_admin()) with check (public.is_admin());

-- Releases: readable by anyone (the changelog is public); admins write.
drop policy if exists releases_read      on public.releases;
drop policy if exists releases_admin_all on public.releases;
create policy releases_read      on public.releases for select using (true);
create policy releases_admin_all on public.releases for all
  using (public.is_admin()) with check (public.is_admin());

-- Contact messages: anyone may send one, only admins may read them. There is
-- deliberately no select policy for anonymous callers, so the contact form
-- cannot be turned into a way to read other people's messages.
drop policy if exists messages_insert_any  on public.contact_messages;
drop policy if exists messages_admin_read  on public.contact_messages;
drop policy if exists messages_admin_write on public.contact_messages;
create policy messages_insert_any  on public.contact_messages for insert with check (true);
create policy messages_admin_read  on public.contact_messages for select using (public.is_admin());
create policy messages_admin_write on public.contact_messages for update
  using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- 8. GRANTS
-- ----------------------------------------------------------------------------

grant usage on schema public to anon, authenticated;
grant select on public.plans, public.releases to anon, authenticated;
grant insert on public.contact_messages to anon, authenticated;
grant select, update on public.profiles to authenticated;
grant select on public.orders, public.licenses to authenticated;
grant select, update on public.license_activations to authenticated;
grant select on public.licenses_with_usage, public.admin_license_rows, public.admin_user_rows
  to authenticated;
grant all on public.plans, public.profiles, public.orders, public.licenses,
             public.license_activations, public.releases, public.contact_messages
  to authenticated;

grant execute on function public.admin_overview()               to authenticated;
grant execute on function public.admin_issue_license(text, text, text) to authenticated;
grant execute on function public.activate_license(text, text, text)    to anon, authenticated;
grant execute on function public.is_admin()                     to authenticated;

-- ----------------------------------------------------------------------------
-- 9. SEED
--
-- The four plans from the pricing page, and the first release. Re-runnable.
-- ----------------------------------------------------------------------------

insert into public.plans (id, name, sites_allowed, price_cents, sort_order) values
  ('single', 'Single Site', 1,   6900, 1),
  ('five',   '5 Sites',     5,   9900, 2),
  ('ten',    '10 Sites',    10, 14900, 3),
  ('agency', '100 Sites',   100, 49900, 4)
on conflict (id) do update
  set name          = excluded.name,
      sites_allowed = excluded.sites_allowed,
      price_cents   = excluded.price_cents,
      sort_order    = excluded.sort_order;

insert into public.releases (version, headline, notes, is_latest, released_at) values
  ('1.13.0',
   'The agentic layer',
   'llms.txt and llms-full.txt, a Markdown twin of every article, the read-only JSON content API, the agent manifest and OpenAPI document, per-crawler AI policy with activity logging, eleven answer blocks, the AEO/GEO readiness score, and author E-E-A-T entity fields.',
   true,
   now())
on conflict (version) do nothing;

-- ----------------------------------------------------------------------------
-- 10. ADMINISTRATORS
--
-- The owner's address is promoted automatically the moment that account signs
-- up. Doing it with a trigger rather than a manual UPDATE means the order of
-- operations does not matter: run this file before or after signing up and the
-- result is the same.
--
-- Add further addresses to the array to grant more administrators.
-- ----------------------------------------------------------------------------

create or replace function public.grant_owner_admin()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  owners constant text[] := array['itsinjamul@gmail.com'];
begin
  if lower(new.email) = any (select lower(unnest(owners))) then
    new.role := 'admin';
  end if;
  return new;
end;
$$;

drop trigger if exists on_profile_created_grant_admin on public.profiles;
create trigger on_profile_created_grant_admin
  before insert on public.profiles
  for each row execute function public.grant_owner_admin();

-- Promote the owner if the account already exists from an earlier run.
update public.profiles
   set role = 'admin'
 where lower(email) = lower('itsinjamul@gmail.com')
   and role <> 'admin';

/* ==========================================================================
   LICENCE ENFORCEMENT
   ==========================================================================
   Everything above describes what a customer bought. This part describes what
   a WordPress install is allowed to do with it, and it is the half that has to
   survive somebody actively trying to get around it.

   Two things worth stating plainly, because a licence system that oversells
   itself is worse than one that does not exist:

   1. This makes unauthorised use detectable, revocable and inconvenient. It
      does not make it impossible. The theme is PHP on somebody else's server —
      they can open the file and delete the check. No WordPress licence system
      has ever solved that, and any vendor claiming otherwise is either using an
      encoder most shared hosts cannot run, or is lying.

   2. What it does solve is the realistic case: a key shared between friends, a
      single purchase used across fifty client sites, a file passed on after a
      refund. Those all phone home, and all of them can be shut off from here.

   The signing key is deliberately absent from this file. Responses are signed
   with an Ed25519 private key that lives only as a Worker secret; the theme
   ships the matching public key. That asymmetry is the point — a shared secret
   would be inside every copy of the theme, and anyone could forge a "valid"
   response with it.
   ========================================================================== */

-- A site can be blocked on its own, without touching the licence it belongs to.
-- Needed for the common support case: one of a customer's ten sites is a copy
-- they were not entitled to, and revoking the whole key would punish nine
-- innocent installs.
alter table public.license_activations
  drop constraint if exists license_activations_status_check;

alter table public.license_activations
  add constraint license_activations_status_check
  check (status in ('active', 'released', 'blocked'));

-- Fingerprint of the install, so the same site moving hosts is recognisable and
-- two different installs claiming the same URL are not silently merged.
alter table public.license_activations
  add column if not exists site_hash    text,
  add column if not exists wp_version   text,
  add column if not exists theme_version text,
  add column if not exists last_ip      inet,
  add column if not exists check_count  integer not null default 0;

-- Every call the theme makes, including the ones that fail ------------------
-- The failures are the interesting rows. A key that does not exist, a site over
-- its limit, or one key checking in from thirty domains in an afternoon are all
-- visible here and nowhere else.
create table if not exists public.license_checks (
  id          uuid        primary key default gen_random_uuid(),
  license_key text,
  license_id  uuid        references public.licenses (id) on delete set null,
  site_url    text,
  action      text        not null check (action in ('activate', 'validate', 'deactivate')),
  outcome     text        not null
                check (outcome in ('ok', 'unknown_key', 'revoked', 'blocked',
                                   'limit_reached', 'site_mismatch', 'malformed')),
  ip          inet,
  user_agent  text,
  created_at  timestamptz not null default now()
);

create index if not exists license_checks_key_idx     on public.license_checks (license_key);
create index if not exists license_checks_outcome_idx on public.license_checks (outcome, created_at desc);
create index if not exists license_checks_site_idx    on public.license_checks (lower(site_url));

-- Nobody reads this table through the public API. Admins read it through the
-- dashboard; the licence endpoints write to it with the service role, which
-- bypasses RLS by design. So: deny by default, and grant only to admins.
alter table public.license_checks enable row level security;

drop policy if exists "admins read license checks" on public.license_checks;
create policy "admins read license checks"
  on public.license_checks for select
  using (public.is_admin());

/* Suspicious activity, ready to read ----------------------------------------
   A licence checking in from more domains than it is allowed to run on is the
   single clearest signal of a shared key, and it is the one number a support
   person actually needs. Computed rather than stored, so it cannot go stale. */
create or replace view public.license_abuse_signals as
select
  l.id                                          as license_id,
  l.license_key,
  l.status,
  l.sites_allowed,
  p.email                                       as owner_email,
  count(distinct lower(c.site_url))             as distinct_sites_seen,
  count(*) filter (where c.outcome <> 'ok')     as failed_checks,
  max(c.created_at)                             as last_seen_at
from public.licenses l
join public.profiles p on p.id = l.user_id
left join public.license_checks c on c.license_id = l.id
group by l.id, l.license_key, l.status, l.sites_allowed, p.email
having count(distinct lower(c.site_url)) > l.sites_allowed;
/* The licence check itself, as one database function -------------------------
   The obvious way to write this endpoint is to give the Worker a service-role
   key and let it query the tables directly. That works, and it hands a public
   HTTP endpoint the ability to read and write every row in the database —
   including every customer's email and order history — in order to answer a
   question about one licence key.

   A security-definer function is the narrow version of the same thing. The anon
   key can call exactly this, it does exactly this, and it can do nothing else.
   If the endpoint is ever compromised the blast radius is the licence logic
   rather than the whole schema.

   It also keeps the rule in one place. The endpoint decides nothing: it passes
   through a key, a site and an action, and reports what came back. */
create or replace function public.license_check(
  p_key    text,
  p_site   text,
  p_action text,
  p_meta   jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_license public.licenses%rowtype;
  v_row     public.license_activations%rowtype;
  v_active  integer;
  v_found   boolean := false;
begin
  if p_action not in ('activate', 'validate', 'deactivate')
     or coalesce(p_key, '') = ''
     or coalesce(p_site, '') = '' then
    insert into public.license_checks (license_key, site_url, action, outcome)
    values (p_key, p_site, coalesce(nullif(p_action, ''), 'validate'), 'malformed');

    return jsonb_build_object(
      'status', 'unknown', 'plan', null, 'sites_allowed', 0, 'sites_used', 0,
      'message', 'Malformed request.');
  end if;

  select * into v_license from public.licenses where license_key = upper(p_key);

  if not found then
    insert into public.license_checks (license_key, site_url, action, outcome)
    values (upper(p_key), p_site, p_action, 'unknown_key');

    return jsonb_build_object(
      'status', 'unknown', 'plan', null, 'sites_allowed', 0, 'sites_used', 0,
      'message', 'That licence key was not recognised.');
  end if;

  if v_license.status <> 'active' then
    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'revoked');

    return jsonb_build_object(
      'status', 'revoked', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', 0,
      'message', 'This licence is no longer active.');
  end if;

  select * into v_row
    from public.license_activations
   where license_id = v_license.id and lower(site_url) = lower(p_site);
  v_found := found;

  select count(*) into v_active
    from public.license_activations
   where license_id = v_license.id and status = 'active';

  /* A single site blocked without revoking the key. The usual support case is
     one unauthorised copy among a customer's ten legitimate installs, and
     revoking the key would take down the nine that did nothing wrong. */
  if v_found and v_row.status = 'blocked' then
    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'blocked');

    return jsonb_build_object(
      'status', 'blocked', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', v_active,
      'message', 'This site has been blocked on this licence.');
  end if;

  if p_action = 'deactivate' then
    if v_found then
      update public.license_activations set status = 'released' where id = v_row.id;
      if v_row.status = 'active' then
        v_active := v_active - 1;
      end if;
    end if;

    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'ok');

    return jsonb_build_object(
      'status', 'released', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', greatest(v_active, 0),
      'message', 'This site has been released.');
  end if;

  /* Already activated here: record the check-in and say yes. */
  if v_found and v_row.status = 'active' then
    update public.license_activations
       set last_check_at = now(),
           check_count   = check_count + 1,
           wp_version    = coalesce(p_meta ->> 'wp', wp_version),
           theme_version = coalesce(p_meta ->> 'version', theme_version)
     where id = v_row.id;

    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'ok');

    return jsonb_build_object(
      'status', 'active', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', v_active,
      'message', 'Licence active.');
  end if;

  /* New site for this licence, or one coming back after being released. */
  if v_active >= v_license.sites_allowed then
    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'limit_reached');

    return jsonb_build_object(
      'status', 'limit_reached', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', v_active,
      'message', format('This licence covers %s site(s) and they are all in use. Release one from your dashboard, or upgrade.', v_license.sites_allowed));
  end if;

  if p_action <> 'activate' then
    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'site_mismatch');

    return jsonb_build_object(
      'status', 'unknown', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', v_active,
      'message', 'This site is not activated on that licence.');
  end if;

  if v_found then
    update public.license_activations
       set status = 'active', last_check_at = now(), check_count = check_count + 1
     where id = v_row.id;
  else
    insert into public.license_activations
      (license_id, site_url, site_name, wp_version, theme_version, last_check_at)
    values
      (v_license.id, p_site, left(coalesce(p_meta ->> 'name', ''), 200),
       p_meta ->> 'wp', p_meta ->> 'version', now());
  end if;

  insert into public.license_checks (license_key, license_id, site_url, action, outcome)
  values (v_license.license_key, v_license.id, p_site, p_action, 'ok');

  return jsonb_build_object(
    'status', 'active', 'plan', v_license.plan_id,
    'sites_allowed', v_license.sites_allowed, 'sites_used', v_active + 1,
    'message', 'Licence activated for this site.');
end;
$fn$;

/* Callable without a session: the caller is a WordPress install, not a person. */
grant execute on function public.license_check(text, text, text, jsonb) to anon, authenticated;
/* ==========================================================================
   APPROVAL, TRIAL AND THE MONEY
   ==========================================================================
   Signing up does not get you in. An account is created in `pending`, the
   customer is shown how to reach us, and somebody approves it by hand. That is
   deliberate for a product sold one licence at a time in a market where the
   payment often happens over WhatsApp or bKash before any software is
   involved — the approval step is where a real conversation gets recorded
   against a real row.

   Two money columns, not one, and this is the part most licence schemas get
   wrong: `price_cents` is what the customer was quoted and `paid_cents` is what
   has actually arrived. Collapsing them into a single "amount" makes partial
   payment unrepresentable, and partial payment is the normal case here. Income
   is the sum of what arrived, never the sum of what was agreed.

   A price of zero means an owner rather than a free customer. Two people run
   this, both need full access, and neither is revenue.
   ========================================================================== */

-- Approval and trial state -----------------------------------------------------
alter table public.profiles
  add column if not exists approval_status text not null default 'pending'
    check (approval_status in ('pending', 'approved', 'suspended')),
  add column if not exists approved_at   timestamptz,
  add column if not exists approved_by   uuid references public.profiles (id) on delete set null,
  add column if not exists phone         text,
  add column if not exists trial_ends_at timestamptz,
  add column if not exists notes         text;

create index if not exists profiles_approval_idx on public.profiles (approval_status);

/* What the customer was quoted, and what has actually turned up.
   Kept on the licence rather than the order because the number that gets
   renegotiated over a chat window is the licence, and orders are meant to be an
   immutable record of a transaction. */
alter table public.licenses
  add column if not exists price_cents integer not null default 0 check (price_cents >= 0),
  add column if not exists paid_cents  integer not null default 0 check (paid_cents  >= 0);

/* The two owners. Recognised by a zero price rather than by a hard-coded list
   of email addresses, so adding a third partner later is a data change and not
   a deploy. */
create or replace function public.license_is_owner(p_price_cents integer, p_role text)
returns boolean
language sql
immutable
as $$
  select p_role = 'admin' or coalesce(p_price_cents, 0) = 0;
$$;

/* Approve an account, start its trial ---------------------------------------
   The trial runs from approval, not from signup. Somebody who signs up on a
   Friday and gets approved on a Monday has not used three days of anything, and
   billing them for it is the kind of small unfairness that turns into a refund
   request and a bad review. */
create or replace function public.approve_account(p_user_id uuid, p_trial_days integer default 7)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not public.is_admin() then
    raise exception 'Not authorised';
  end if;

  update public.profiles
     set approval_status = 'approved',
         approved_at     = coalesce(approved_at, now()),
         approved_by     = auth.uid(),
         trial_ends_at   = coalesce(trial_ends_at, now() + make_interval(days => greatest(p_trial_days, 0)))
   where id = p_user_id;
end;
$fn$;

grant execute on function public.approve_account(uuid, integer) to authenticated;

create or replace function public.set_account_status(p_user_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not public.is_admin() then
    raise exception 'Not authorised';
  end if;

  if p_status not in ('pending', 'approved', 'suspended') then
    raise exception 'Unknown status';
  end if;

  update public.profiles set approval_status = p_status where id = p_user_id;
end;
$fn$;

grant execute on function public.set_account_status(uuid, text) to authenticated;

/* Record what a customer owes and what they have paid ------------------------
   One function rather than a direct table update, so the admin client never
   needs write access to `licenses` and every change goes through the same
   authorisation check. */
create or replace function public.set_license_money(
  p_license_id uuid,
  p_price_cents integer,
  p_paid_cents integer
)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not public.is_admin() then
    raise exception 'Not authorised';
  end if;

  update public.licenses
     set price_cents = greatest(coalesce(p_price_cents, 0), 0),
         paid_cents  = greatest(coalesce(p_paid_cents, 0), 0)
   where id = p_license_id;
end;
$fn$;

grant execute on function public.set_license_money(uuid, integer, integer) to authenticated;

/* Everything the User Manage screen needs, in one row per account ------------
   Assembled here rather than in the browser because the payment state is a
   judgement made from three columns at once — quoted, paid, and role — and
   three different screens computing it three slightly different ways is how a
   revenue figure ends up disagreeing with itself. */
create or replace view public.admin_accounts as
select
  p.id,
  p.email,
  p.full_name,
  p.phone,
  p.role,
  p.approval_status,
  p.approved_at,
  p.trial_ends_at,
  p.created_at,
  p.last_active_at,
  l.id                                as license_id,
  l.license_key,
  l.plan_id,
  l.status                            as license_status,
  coalesce(l.price_cents, 0)          as price_cents,
  coalesce(l.paid_cents, 0)           as paid_cents,
  coalesce(l.sites_allowed, 0)        as sites_allowed,
  (
    select count(*) from public.license_activations a
     where a.license_id = l.id and a.status = 'active'
  )                                   as sites_used,
  case
    when p.role = 'admin' or coalesce(l.price_cents, 0) = 0 then 'owner'
    when coalesce(l.paid_cents, 0) >= coalesce(l.price_cents, 0) then 'paid'
    when coalesce(l.paid_cents, 0) > 0                          then 'partial'
    else 'unpaid'
  end                                 as payment_state,
  case
    when l.id is not null and l.status = 'active' then 'licensed'
    when p.trial_ends_at is not null and p.trial_ends_at > now() then 'trial'
    when p.trial_ends_at is not null then 'trial_expired'
    else 'none'
  end                                 as access_state
from public.profiles p
left join lateral (
  select * from public.licenses
   where user_id = p.id
   order by created_at desc
   limit 1
) l on true;

/* Revenue, counted once ------------------------------------------------------
   Income is the sum of what arrived, not the sum of what was agreed. Owners are
   excluded: two people run this and neither of them is a customer. */
create or replace function public.admin_revenue()
returns jsonb
language sql
security definer
set search_path = public
as $fn$
  select case when not public.is_admin() then jsonb_build_object('error', 'Not authorised')
  else (
    select jsonb_build_object(
      'total_paid_cents',    coalesce(sum(paid_cents)  filter (where payment_state <> 'owner'), 0),
      'total_quoted_cents',  coalesce(sum(price_cents) filter (where payment_state <> 'owner'), 0),
      'outstanding_cents',   coalesce(sum(greatest(price_cents - paid_cents, 0))
                                        filter (where payment_state <> 'owner'), 0),
      'accounts',            count(*),
      'owners',              count(*) filter (where payment_state = 'owner'),
      'paid',                count(*) filter (where payment_state = 'paid'),
      'partial',             count(*) filter (where payment_state = 'partial'),
      'unpaid',              count(*) filter (where payment_state = 'unpaid'),
      'pending',             count(*) filter (where approval_status = 'pending'),
      'on_trial',            count(*) filter (where access_state = 'trial'),
      'trial_expired',       count(*) filter (where access_state = 'trial_expired'),
      'licensed',            count(*) filter (where access_state = 'licensed')
    )
    from public.admin_accounts
  ) end;
$fn$;

grant execute on function public.admin_revenue() to authenticated;

/* The view inherits nothing from RLS, so it is locked at the grant level and
   every consumer is an admin-only screen. */
revoke all on public.admin_accounts from anon, authenticated;

create or replace function public.admin_list_accounts(p_search text default '')
returns setof public.admin_accounts
language plpgsql
security definer
set search_path = public
as $fn$
begin
  if not public.is_admin() then
    raise exception 'Not authorised';
  end if;

  return query
    select * from public.admin_accounts
     where coalesce(p_search, '') = ''
        or email     ilike '%' || p_search || '%'
        or coalesce(full_name, '') ilike '%' || p_search || '%'
        or coalesce(phone, '')     ilike '%' || p_search || '%'
        or coalesce(license_key, '') ilike '%' || p_search || '%'
     order by created_at desc;
end;
$fn$;

grant execute on function public.admin_list_accounts(text) to authenticated;

/* Existing accounts predate approval, and locking out the people already using
   the product in order to introduce a gate for new ones would be a strange way
   to ship a feature. */
update public.profiles
   set approval_status = 'approved',
       approved_at     = coalesce(approved_at, created_at)
 where approval_status = 'pending'
   and created_at < now();
/* ==========================================================================
   TRIALS, PHONE NUMBERS AND THE DOWNLOAD
   ==========================================================================
   The trial is a licence key with an expiry date, not a separate concept.

   That is the whole design decision here and it is worth defending. The theme
   already knows how to hold a key, activate it against a site, revalidate it
   and switch itself off when the answer stops being yes. Teaching it a second,
   parallel notion of "trial" would mean two code paths that must agree, and the
   one that gets tested less is the one customers meet on day seven.

   So approval issues a real key on a `trial` plan that expires in seven days.
   Everything downstream — activation, the site limit, revalidation, the admin
   notice, the kill switch — works without knowing it is a trial at all. Buying
   a licence swaps the plan and clears the expiry on the same row.
   ========================================================================== */

alter table public.licenses
  add column if not exists expires_at timestamptz;

create index if not exists licenses_expiry_idx on public.licenses (expires_at)
  where expires_at is not null;

/* The trial plan. sites_allowed is 1 on purpose: a trial is for trying the
   theme on one site, and anyone who needs seven is not evaluating. */
insert into public.plans (id, name, sites_allowed, price_cents, sort_order, is_active)
values ('trial', '7-day trial', 1, 0, -1, true)
on conflict (id) do update
  set name = excluded.name,
      sites_allowed = excluded.sites_allowed;

/* Phone, captured at signup ---------------------------------------------------
   The whole approval flow runs over WhatsApp, so an account without a number is
   an account nobody can chase. */
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $fn$
begin
  insert into public.profiles (id, email, full_name, phone)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    nullif(new.raw_user_meta_data ->> 'phone', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$fn$;

/* Approval now issues the trial key ------------------------------------------
   Idempotent: approving twice does not hand out a second key, and approving
   somebody who already bought a licence does not overwrite it with a trial. */
create or replace function public.approve_account(p_user_id uuid, p_trial_days integer default 7)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_has_license boolean;
  v_days        integer := greatest(coalesce(p_trial_days, 7), 0);
begin
  if not public.is_admin() then
    raise exception 'Not authorised';
  end if;

  update public.profiles
     set approval_status = 'approved',
         approved_at     = coalesce(approved_at, now()),
         approved_by     = auth.uid(),
         trial_ends_at   = coalesce(trial_ends_at, now() + make_interval(days => v_days))
   where id = p_user_id;

  select exists (select 1 from public.licenses where user_id = p_user_id)
    into v_has_license;

  if not v_has_license and v_days > 0 then
    insert into public.licenses
      (license_key, user_id, plan_id, sites_allowed, status, price_cents, paid_cents, expires_at, notes)
    values
      (public.generate_license_key(), p_user_id, 'trial', 1, 'active', 0, 0,
       now() + make_interval(days => v_days), 'Issued automatically on approval');
  end if;
end;
$fn$;

grant execute on function public.approve_account(uuid, integer) to authenticated;

/* Turn a trial into a real licence -------------------------------------------
   Same row, same key. The customer does not have to re-activate anything on
   their site — the next scheduled check simply starts coming back with a
   bigger site allowance and no expiry. */
create or replace function public.upgrade_license(
  p_license_id uuid,
  p_plan_id text,
  p_price_cents integer default null,
  p_paid_cents integer default null
)
returns void
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_sites integer;
begin
  if not public.is_admin() then
    raise exception 'Not authorised';
  end if;

  select sites_allowed into v_sites from public.plans where id = p_plan_id;

  if v_sites is null then
    raise exception 'Unknown plan';
  end if;

  update public.licenses
     set plan_id       = p_plan_id,
         sites_allowed = v_sites,
         status        = 'active',
         expires_at    = null,
         price_cents   = coalesce(p_price_cents, price_cents),
         paid_cents    = coalesce(p_paid_cents,  paid_cents)
   where id = p_license_id;
end;
$fn$;

grant execute on function public.upgrade_license(uuid, text, integer, integer) to authenticated;

/* The licence check now understands expiry ------------------------------------
   Replaces the earlier version. Only the expiry branch is new; everything else
   is unchanged, and it is repeated in full rather than patched because a
   half-defined function is not a thing Postgres will let you have. */
create or replace function public.license_check(
  p_key    text,
  p_site   text,
  p_action text,
  p_meta   jsonb default '{}'::jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_license public.licenses%rowtype;
  v_row     public.license_activations%rowtype;
  v_active  integer;
  v_found   boolean := false;
begin
  if p_action not in ('activate', 'validate', 'deactivate')
     or coalesce(p_key, '') = ''
     or coalesce(p_site, '') = '' then
    insert into public.license_checks (license_key, site_url, action, outcome)
    values (p_key, p_site, coalesce(nullif(p_action, ''), 'validate'), 'malformed');
    return jsonb_build_object('status', 'unknown', 'plan', null,
      'sites_allowed', 0, 'sites_used', 0, 'message', 'Malformed request.');
  end if;

  select * into v_license from public.licenses where license_key = upper(p_key);

  if not found then
    insert into public.license_checks (license_key, site_url, action, outcome)
    values (upper(p_key), p_site, p_action, 'unknown_key');
    return jsonb_build_object('status', 'unknown', 'plan', null,
      'sites_allowed', 0, 'sites_used', 0,
      'message', 'That licence key was not recognised.');
  end if;

  if v_license.status <> 'active' then
    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'revoked');
    return jsonb_build_object('status', 'revoked', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', 0,
      'message', 'This licence is no longer active.');
  end if;

  /* Expired trial. Reported as its own status rather than folded into
     "revoked", because the two need completely different words in front of the
     customer: one of them is being told their trial ended and here is where to
     buy, the other is being told something went wrong. */
  if v_license.expires_at is not null and v_license.expires_at < now() then
    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'expired');
    return jsonb_build_object('status', 'expired', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', 0,
      'message', 'This trial has ended. Buy a licence to switch the premium modules back on.');
  end if;

  select * into v_row
    from public.license_activations
   where license_id = v_license.id and lower(site_url) = lower(p_site);
  v_found := found;

  select count(*) into v_active
    from public.license_activations
   where license_id = v_license.id and status = 'active';

  if v_found and v_row.status = 'blocked' then
    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'blocked');
    return jsonb_build_object('status', 'blocked', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', v_active,
      'message', 'This site has been blocked on this licence.');
  end if;

  if p_action = 'deactivate' then
    if v_found then
      update public.license_activations set status = 'released' where id = v_row.id;
      if v_row.status = 'active' then v_active := v_active - 1; end if;
    end if;
    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'ok');
    return jsonb_build_object('status', 'released', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', greatest(v_active, 0),
      'message', 'This site has been released.');
  end if;

  if v_found and v_row.status = 'active' then
    update public.license_activations
       set last_check_at = now(),
           check_count   = check_count + 1,
           wp_version    = coalesce(p_meta ->> 'wp', wp_version),
           theme_version = coalesce(p_meta ->> 'version', theme_version)
     where id = v_row.id;
    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'ok');
    return jsonb_build_object('status', 'active', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', v_active,
      'message', 'Licence active.');
  end if;

  if v_active >= v_license.sites_allowed then
    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'limit_reached');
    return jsonb_build_object('status', 'limit_reached', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', v_active,
      'message', format('This licence covers %s site(s) and they are all in use. Release one from your dashboard, or upgrade.', v_license.sites_allowed));
  end if;

  if p_action <> 'activate' then
    insert into public.license_checks (license_key, license_id, site_url, action, outcome)
    values (v_license.license_key, v_license.id, p_site, p_action, 'site_mismatch');
    return jsonb_build_object('status', 'unknown', 'plan', v_license.plan_id,
      'sites_allowed', v_license.sites_allowed, 'sites_used', v_active,
      'message', 'This site is not activated on that licence.');
  end if;

  if v_found then
    update public.license_activations
       set status = 'active', last_check_at = now(), check_count = check_count + 1
     where id = v_row.id;
  else
    insert into public.license_activations
      (license_id, site_url, site_name, wp_version, theme_version, last_check_at)
    values
      (v_license.id, p_site, left(coalesce(p_meta ->> 'name', ''), 200),
       p_meta ->> 'wp', p_meta ->> 'version', now());
  end if;

  insert into public.license_checks (license_key, license_id, site_url, action, outcome)
  values (v_license.license_key, v_license.id, p_site, p_action, 'ok');

  return jsonb_build_object('status', 'active', 'plan', v_license.plan_id,
    'sites_allowed', v_license.sites_allowed, 'sites_used', v_active + 1,
    'message', 'Licence activated for this site.');
end;
$fn$;

grant execute on function public.license_check(text, text, text, jsonb) to anon, authenticated;

/* 'expired' has to be a legal outcome now that the check can return it. */
alter table public.license_checks drop constraint if exists license_checks_outcome_check;
alter table public.license_checks add constraint license_checks_outcome_check
  check (outcome in ('ok', 'unknown_key', 'revoked', 'blocked', 'expired',
                     'limit_reached', 'site_mismatch', 'malformed'));

/* ==========================================================================
   THE DOWNLOAD
   ==========================================================================
   A private bucket rather than a public one with an unguessable path. "Nobody
   will find the URL" stops being true the first time one customer posts it in
   a Facebook group, and at that point the paid product is a free download with
   extra steps. */
insert into storage.buckets (id, name, public)
values ('releases', 'releases', false)
on conflict (id) do update set public = false;

drop policy if exists "admins manage releases" on storage.objects;
create policy "admins manage releases"
  on storage.objects for all
  to authenticated
  using (bucket_id = 'releases' and public.is_admin())
  with check (bucket_id = 'releases' and public.is_admin());

/* Who may download: an approved account that is either licensed or still
   inside its trial. Enforced here rather than by hiding the button, because a
   hidden button is a UI preference and this is the actual product. */
drop policy if exists "entitled accounts read releases" on storage.objects;
create policy "entitled accounts read releases"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'releases'
    and exists (
      select 1
        from public.profiles p
        left join public.licenses l on l.user_id = p.id and l.status = 'active'
       where p.id = auth.uid()
         and p.approval_status = 'approved'
         and (
           (l.id is not null and (l.expires_at is null or l.expires_at > now()))
           or (p.trial_ends_at is not null and p.trial_ends_at > now())
         )
    )
  );

/* Publish a build ------------------------------------------------------------
   The file is uploaded to the bucket by the admin screen; this records it and
   moves the "latest" flag, which is the bit that is easy to get wrong by hand. */
create or replace function public.publish_release(
  p_version text,
  p_headline text,
  p_notes text,
  p_object_path text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $fn$
declare
  v_id uuid;
begin
  if not public.is_admin() then
    raise exception 'Not authorised';
  end if;

  update public.releases set is_latest = false where is_latest;

  insert into public.releases (version, headline, notes, download_url, is_latest)
  values (p_version, p_headline, p_notes, p_object_path, true)
  on conflict (version) do update
    set headline     = excluded.headline,
        notes        = excluded.notes,
        download_url = excluded.download_url,
        is_latest    = true
  returning id into v_id;

  return v_id;
end;
$fn$;

grant execute on function public.publish_release(text, text, text, text) to authenticated;
