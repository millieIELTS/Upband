-- 커뮤니티 게시판 테이블
create table if not exists community_posts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  category text not null check (category in ('qna', 'reviews')),
  title text not null,
  content text not null,
  author_name text not null,
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 인덱스
create index idx_community_posts_category on community_posts(category);
create index idx_community_posts_created on community_posts(created_at desc);
create index idx_community_posts_pinned on community_posts(is_pinned desc, created_at desc);

-- RLS 활성화
alter table community_posts enable row level security;

-- 누구나 읽기 가능
create policy "community_posts_read" on community_posts
  for select using (true);

-- 로그인한 유저 글 작성 가능
create policy "community_posts_insert" on community_posts
  for insert with check (auth.uid() = user_id);

-- 본인 글 수정 가능
create policy "community_posts_update_own" on community_posts
  for update using (auth.uid() = user_id);

-- 선생님/어드민은 모든 글 수정 가능
create policy "community_posts_update_teacher" on community_posts
  for update using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('teacher', 'admin')
    )
  );

-- 본인 글 삭제 가능
create policy "community_posts_delete_own" on community_posts
  for delete using (auth.uid() = user_id);

-- 선생님/어드민은 모든 글 삭제 가능
create policy "community_posts_delete_teacher" on community_posts
  for delete using (
    exists (
      select 1 from profiles
      where profiles.id = auth.uid()
      and profiles.role in ('teacher', 'admin')
    )
  );
