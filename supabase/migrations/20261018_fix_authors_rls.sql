-- ==============================================================================
-- Migration: 20261018_fix_authors_rls.sql
-- Description: Protect author email from public anonymous queries.
--              Revoke broad SELECT on authors table and grant only public columns,
--              or provide public_authors view without PII.
-- ==============================================================================

-- 1. Ensure RLS is active on authors
alter table if exists public.authors enable row level security;

-- 2. Drop overly-broad public policy
drop policy if exists "public_read_authors" on public.authors;

-- 3. Only allow reading non-deleted active authors publicly
create policy "public_read_authors"
  on public.authors for select
  using (deleted_at is null and status = 'active');

-- 4. Create public view excluding email/sensitive fields
create or replace view public.public_authors as
  select
    id,
    name,
    slug,
    role,
    bio,
    avatar,
    twitter,
    linkedin,
    website,
    status,
    joined_date,
    created_at,
    updated_at
  from public.authors
  where deleted_at is null and status = 'active';

-- 5. Permissions: Revoke direct access to base authors table, grant access to sanitized view
revoke select on public.authors from anon, authenticated;
grant select on public.public_authors to anon, authenticated;
