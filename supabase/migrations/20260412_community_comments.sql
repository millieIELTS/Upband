-- 커뮤니티 댓글 테이블
create table if not exists community_comments (
  id uuid default gen_random_uuid() primary key,
  post_id uuid references community_posts(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  content text not null,
  author_name text not null,
  created_at timestamptz default now()
);

create index idx_community_comments_post on community_comments(post_id, created_at asc);

alter table community_comments enable row level security;

-- 누구나 읽기
create policy "community_comments_read" on community_comments
  for select using (true);

-- 로그인 유저 댓글 작성
create policy "community_comments_insert" on community_comments
  for insert with check (auth.uid() = user_id);

-- 본인 댓글 삭제
create policy "community_comments_delete_own" on community_comments
  for delete using (auth.uid() = user_id);

-- 선생님/어드민 모든 댓글 삭제
create policy "community_comments_delete_teacher" on community_comments
  for delete using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('teacher', 'admin')
    )
  );
