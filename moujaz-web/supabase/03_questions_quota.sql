-- MOUJAZ: 2 generations per rolling 24-hour window, starting with first use.
-- Safe to run on a database containing the previous daily-usage table.
create table if not exists public.question_usage_window (
 user_id uuid primary key references auth.users(id) on delete cascade,
 window_started_at timestamptz not null default now(),
 used_count integer not null default 0 check (used_count between 0 and 2)
);
alter table public.question_usage_window enable row level security;
revoke all on public.question_usage_window from anon, authenticated;
create or replace function public.consume_question_quota()
returns jsonb language plpgsql security definer set search_path = '' as $$
declare v_used integer; v_start timestamptz; v_now timestamptz := now();
begin
 if auth.uid() is null then raise exception 'authentication required'; end if;
 insert into public.question_usage_window(user_id,window_started_at,used_count)
 values(auth.uid(),v_now,0) on conflict(user_id) do nothing;
 -- Lock this user's row to prevent concurrent requests exceeding the limit.
 select used_count,window_started_at into v_used,v_start
 from public.question_usage_window where user_id=auth.uid() for update;
 if v_start <= v_now - interval '24 hours' then
   v_start:=v_now; v_used:=0;
 end if;
 if v_used>=2 then
   return jsonb_build_object('remaining',0,'allowed',false,'reset_at',v_start+interval '24 hours');
 end if;
 v_used:=v_used+1;
 update public.question_usage_window set used_count=v_used,window_started_at=v_start where user_id=auth.uid();
 return jsonb_build_object('remaining',2-v_used,'allowed',true,'reset_at',v_start+interval '24 hours');
end $$;
revoke all on function public.consume_question_quota() from public, anon;
grant execute on function public.consume_question_quota() to authenticated;
-- Old question_daily_usage table is no longer used. It is left intact to preserve history.
