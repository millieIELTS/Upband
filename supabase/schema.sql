-- UpBand Database Schema
-- Run this in Supabase SQL Editor after creating your project

-- 1. Profiles (extends Supabase auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  display_name text,
  role text not null default 'student' check (role in ('student', 'teacher', 'admin')),
  credits integer not null default 5,  -- 가입 시 무료 5 토큰
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Auto-create profile on signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- 2. Writing Submissions
create table writing_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  task_type text not null check (task_type in ('task1', 'task2')),
  essay text not null,
  word_count integer not null,
  overall_band numeric(2,1) not null,
  score_ta numeric(2,1),   -- Task Achievement (Task 1)
  score_tr numeric(2,1),   -- Task Response (Task 2)
  score_cc numeric(2,1) not null,
  score_lr numeric(2,1) not null,
  score_gra numeric(2,1) not null,
  feedback_json jsonb not null,  -- full structured feedback from Claude
  created_at timestamptz not null default now()
);

alter table writing_submissions enable row level security;

create policy "Users can view own writing"
  on writing_submissions for select using (auth.uid() = user_id);

create policy "Users can insert own writing"
  on writing_submissions for insert with check (auth.uid() = user_id);

-- Teachers can view their students' writing
create policy "Teachers can view student writing"
  on writing_submissions for select using (
    exists (
      select 1 from teacher_students ts
      join profiles p on p.id = auth.uid()
      where ts.teacher_id = auth.uid()
        and ts.student_id = writing_submissions.user_id
        and p.role = 'teacher'
    )
  );

-- 3. Speaking Submissions
create table speaking_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  part text not null check (part in ('part1', 'part2', 'part3')),
  question text not null,
  transcript text,                -- STT 변환 텍스트
  audio_url text,                 -- storage bucket URL
  audio_expires_at timestamptz,   -- 1주 후 자동 삭제용
  overall_band numeric(2,1) not null,
  score_fluency numeric(2,1) not null,
  score_lexical numeric(2,1) not null,
  score_grammar numeric(2,1) not null,
  score_pronunciation numeric(2,1), -- 음성 분석 시에만
  feedback_json jsonb not null,
  model_answer text,
  created_at timestamptz not null default now()
);

alter table speaking_submissions enable row level security;

create policy "Users can view own speaking"
  on speaking_submissions for select using (auth.uid() = user_id);

create policy "Users can insert own speaking"
  on speaking_submissions for insert with check (auth.uid() = user_id);

-- 4. Teacher-Student relationship
create table teacher_students (
  id uuid primary key default gen_random_uuid(),
  teacher_id uuid references profiles(id) on delete cascade not null,
  student_id uuid references profiles(id) on delete cascade not null,
  group_name text,
  created_at timestamptz not null default now(),
  unique(teacher_id, student_id)
);

alter table teacher_students enable row level security;

create policy "Teachers can manage their students"
  on teacher_students for all using (auth.uid() = teacher_id);

create policy "Students can view their teacher"
  on teacher_students for select using (auth.uid() = student_id);

-- 5. Indexes
create index idx_writing_user_created on writing_submissions(user_id, created_at desc);
create index idx_speaking_user_created on speaking_submissions(user_id, created_at desc);
create index idx_teacher_students_teacher on teacher_students(teacher_id);
create index idx_teacher_students_student on teacher_students(student_id);

-- 6. Auto-delete expired audio (run as cron via Supabase pg_cron)
-- Enable pg_cron in Supabase Dashboard > Database > Extensions
-- Then run:
-- select cron.schedule(
--   'cleanup-expired-audio',
--   '0 3 * * *',  -- every day at 3 AM
--   $$
--     update speaking_submissions
--     set audio_url = null
--     where audio_expires_at < now() and audio_url is not null;
--   $$
-- );
