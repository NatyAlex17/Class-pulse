create extension if not exists pgcrypto;

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  subject text null,
  context_type text null check (
    context_type in ('general', 'support', 'course', 'cohort', 'clinical', 'compliance')
  ),
  context_id text null,
  created_by_user_id uuid not null references auth.users (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_thread_participants (
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  participant_role text not null check (
    participant_role in ('student', 'instructor', 'admin', 'auditor', 'staff')
  ),
  display_name text null,
  joined_at timestamptz not null default now(),
  last_read_at timestamptz null,
  primary key (thread_id, user_id)
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads (id) on delete cascade,
  sender_user_id uuid not null references auth.users (id) on delete cascade,
  sender_role text not null check (
    sender_role in ('student', 'instructor', 'admin', 'auditor', 'staff')
  ),
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create or replace function public.touch_chat_thread_updated_at()
returns trigger
language plpgsql
as $$
begin
  update public.chat_threads
  set updated_at = now()
  where id = new.thread_id;

  return new;
end;
$$;

drop trigger if exists chat_messages_touch_thread on public.chat_messages;

create trigger chat_messages_touch_thread
after insert on public.chat_messages
for each row
execute function public.touch_chat_thread_updated_at();

alter table public.chat_threads enable row level security;
alter table public.chat_thread_participants enable row level security;
alter table public.chat_messages enable row level security;

create policy "chat participants can read their threads"
on public.chat_threads
for select
using (
  exists (
    select 1
    from public.chat_thread_participants participants
    where participants.thread_id = chat_threads.id
      and participants.user_id = auth.uid()
  )
);

create policy "chat participants can read their memberships"
on public.chat_thread_participants
for select
using (user_id = auth.uid());

create policy "chat participants can update their own read marker"
on public.chat_thread_participants
for update
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "chat participants can read thread messages"
on public.chat_messages
for select
using (
  exists (
    select 1
    from public.chat_thread_participants participants
    where participants.thread_id = chat_messages.thread_id
      and participants.user_id = auth.uid()
  )
);

create policy "chat participants can send messages into their threads"
on public.chat_messages
for insert
with check (
  sender_user_id = auth.uid()
  and exists (
    select 1
    from public.chat_thread_participants participants
    where participants.thread_id = chat_messages.thread_id
      and participants.user_id = auth.uid()
  )
);

comment on table public.chat_threads is
'Operationally aligned inbox threads for student, instructor, admin, auditor, and staff communication.';

comment on table public.chat_messages is
'Realtime message stream for the Messaging Module. Use Supabase Realtime on this table.';

comment on table public.chat_thread_participants is
'Role-aware participant map with per-user read tracking for inbox unread counts.';

-- Optional starter seed for local testing after creating two Supabase users:
-- insert into public.chat_threads (subject, context_type, context_id, created_by_user_id)
-- values ('Clinical Scheduling Follow-up', 'clinical', 'cohort-12', '00000000-0000-0000-0000-000000000001')
-- returning id;
--
-- insert into public.chat_thread_participants (thread_id, user_id, participant_role, display_name)
-- values
--   ('returned-thread-id', '00000000-0000-0000-0000-000000000001', 'student', 'Student User'),
--   ('returned-thread-id', '00000000-0000-0000-0000-000000000002', 'instructor', 'Instructor User');
--
-- insert into public.chat_messages (thread_id, sender_user_id, sender_role, body)
-- values
--   ('returned-thread-id', '00000000-0000-0000-0000-000000000002', 'instructor', 'Welcome to the messaging workspace.');
