
-- Admin can delete any gig
create policy "Admins delete any gig"
on public.gigs for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Admin can update any gig
create policy "Admins update any gig"
on public.gigs for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Admin can view all transactions
create policy "Admins view all transactions"
on public.transactions for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Admin can update any profile (e.g., adjust balance)
create policy "Admins update any profile"
on public.profiles for update
to authenticated
using (public.has_role(auth.uid(), 'admin'));

-- Bootstrap function: first user can claim admin if no admin exists.
create or replace function public.claim_admin_if_none()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  has_admin boolean;
begin
  if auth.uid() is null then
    return false;
  end if;
  select exists(select 1 from public.user_roles where role = 'admin') into has_admin;
  if has_admin then
    return false;
  end if;
  insert into public.user_roles (user_id, role) values (auth.uid(), 'admin')
    on conflict do nothing;
  return true;
end;
$$;

revoke all on function public.claim_admin_if_none() from public;
grant execute on function public.claim_admin_if_none() to authenticated;
