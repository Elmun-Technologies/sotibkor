-- 0005_secure_sessions.sql — atomic, owner-scoped session create/finalize.
-- Apply after 0001–0004. App service-role routes call these RPCs only after
-- resolving the user from a verified Supabase Auth cookie.

create or replace function public.create_training_session(
  p_user_id uuid,
  p_soha text,
  p_persona text,
  p_level integer,
  p_trial_limit integer
)
returns table (
  session_id uuid,
  trial_used integer,
  has_active_subscription boolean
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_trial_used integer;
  v_has_subscription boolean;
  v_session_id uuid;
begin
  if p_user_id is null then
    raise exception using errcode = '28000', message = 'auth_required';
  end if;
  if p_trial_limit is null or p_trial_limit < 1 then
    raise exception using errcode = '22023', message = 'invalid_trial_limit';
  end if;
  if p_level is null or p_level < 1 or p_level > 6 then
    raise exception using errcode = '22023', message = 'invalid_level';
  end if;
  if p_soha is null or p_persona is null then
    raise exception using errcode = '22023', message = 'invalid_session';
  end if;

  -- A row lock serializes concurrent session creation for this user, so parallel
  -- requests cannot overshoot the free-trial counter.
  select u.trial_used
    into v_trial_used
    from public.users as u
    where u.id = p_user_id
    for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'profile_missing';
  end if;

  select exists (
    select 1
      from public.subscriptions as s
      where s.user_id = p_user_id
        and s.status = 'active'
        and (s.expires_at is null or s.expires_at > now())
  ) into v_has_subscription;

  if not v_has_subscription then
    update public.users as u
      set trial_used = u.trial_used + 1
      where u.id = p_user_id
        and u.trial_used < p_trial_limit
      returning u.trial_used into v_trial_used;
    if not found then
      raise exception using errcode = 'P0001', message = 'trial_exhausted';
    end if;
  end if;

  insert into public.sessions (user_id, soha, persona, level, status)
    values (p_user_id, p_soha, p_persona, p_level, 'active')
    returning id into v_session_id;

  return query select v_session_id, v_trial_used, v_has_subscription;
end;
$$;

revoke all on function public.create_training_session(uuid, text, text, integer, integer) from public;
revoke execute on function public.create_training_session(uuid, text, text, integer, integer) from anon, authenticated;
grant execute on function public.create_training_session(uuid, text, text, integer, integer) to service_role;

create or replace function public.complete_training_session(
  p_user_id uuid,
  p_session_id uuid,
  p_status text,
  p_duration_ms integer,
  p_transcript jsonb,
  p_score jsonb
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_level integer;
  v_turn record;
  v_total_chars integer := 0;
  v_role text;
  v_text text;
begin
  if p_user_id is null or p_session_id is null then
    raise exception using errcode = '28000', message = 'auth_required';
  end if;
  if p_status is distinct from 'finished'
    and p_status is distinct from 'abandoned' then
    raise exception using errcode = '22023', message = 'invalid_status';
  end if;
  if p_duration_ms is not null and (p_duration_ms < 0 or p_duration_ms > 14400000) then
    raise exception using errcode = '22023', message = 'invalid_duration';
  end if;

  select s.level
    into v_level
    from public.sessions as s
    where s.id = p_session_id
      and s.user_id = p_user_id
      and s.status = 'active'
    for update;
  if not found then
    raise exception using errcode = 'P0001', message = 'session_not_found_or_closed';
  end if;

  if p_status = 'finished' then
    if jsonb_typeof(p_transcript) is distinct from 'array' then
      raise exception using errcode = '22023', message = 'invalid_transcript';
    end if;
    if jsonb_array_length(p_transcript) = 0 or jsonb_array_length(p_transcript) > 60 then
      raise exception using errcode = '22023', message = 'invalid_transcript';
    end if;
    if jsonb_typeof(p_score) is distinct from 'object'
      or jsonb_typeof(p_score -> 'breakdown') is distinct from 'object'
      or jsonb_typeof(p_score -> 'mistakes') is distinct from 'array'
      or jsonb_typeof(p_score -> 'strengths') is distinct from 'array'
      or jsonb_typeof(p_score -> 'closed') is distinct from 'boolean'
      or jsonb_typeof(p_score -> 'total') is distinct from 'number' then
      raise exception using errcode = '22023', message = 'invalid_score';
    end if;
    if (p_score ->> 'total')::numeric <> trunc((p_score ->> 'total')::numeric)
      or (p_score ->> 'total')::numeric < 0
      or (p_score ->> 'total')::numeric > 100 then
      raise exception using errcode = '22023', message = 'invalid_score_total';
    end if;

    -- Replace any previous partial write while the row is locked. This makes
    -- retries safe and prevents duplicate turn-index rows.
    delete from public.transcripts where session_id = p_session_id;
    delete from public.scores where session_id = p_session_id;

    for v_turn in
      select value, ordinality
        from jsonb_array_elements(p_transcript) with ordinality
    loop
      if jsonb_typeof(v_turn.value) is distinct from 'object' then
        raise exception using errcode = '22023', message = 'invalid_transcript_turn';
      end if;
      v_role := v_turn.value ->> 'role';
      v_text := btrim(v_turn.value ->> 'content');
      if (v_role is distinct from 'user' and v_role is distinct from 'assistant')
        or v_text is null
        or v_text = ''
        or char_length(v_text) > 4000 then
        raise exception using errcode = '22023', message = 'invalid_transcript_turn';
      end if;
      v_total_chars := v_total_chars + char_length(v_text);
      if v_total_chars > 40000 then
        raise exception using errcode = '22023', message = 'transcript_too_large';
      end if;
      insert into public.transcripts (session_id, turn_index, speaker, text)
        values (
          p_session_id,
          (v_turn.ordinality - 1)::integer,
          case when v_role = 'user' then 'sotuvchi' else 'mijoz' end,
          v_text
        );
    end loop;

    insert into public.scores (
      session_id, total, breakdown, mistakes, strengths, xp_awarded
    ) values (
      p_session_id,
      (p_score ->> 'total')::integer,
      p_score -> 'breakdown',
      p_score -> 'mistakes',
      p_score -> 'strengths',
      coalesce((p_score ->> 'xp_awarded')::integer, 0)
    );
  end if;

  update public.sessions
    set status = p_status,
        duration_ms = p_duration_ms,
        ended_at = now()
    where id = p_session_id
      and user_id = p_user_id
      and status = 'active';

  return true;
end;
$$;

revoke all on function public.complete_training_session(uuid, uuid, text, integer, jsonb, jsonb) from public;
revoke execute on function public.complete_training_session(uuid, uuid, text, integer, jsonb, jsonb) from anon, authenticated;
grant execute on function public.complete_training_session(uuid, uuid, text, integer, jsonb, jsonb) to service_role;
