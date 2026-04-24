-- ═══════════════════════════════════════════════════════════════════
-- 🔧 get_my_profile RPC 강제 재생성 (daily_credits 필드 포함 확실히)
-- ═══════════════════════════════════════════════════════════════════
-- 기존 함수가 다른 시그니처로 존재하면 CREATE OR REPLACE가 실패하므로,
-- DROP 후 CREATE로 확실히 교체

DROP FUNCTION IF EXISTS get_my_profile();

CREATE FUNCTION get_my_profile()
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION get_my_profile() TO authenticated;

-- ═══════════════════════════════════════════════════════════════════
-- 🔍 진단용 — 현재 프로필 상태 확인
-- ═══════════════════════════════════════════════════════════════════
-- 이걸 SELECT로 돌려서 daily_credits 컬럼이 정상인지 보세요
-- SELECT id, email, credits, daily_credits, daily_credits_refilled_on
-- FROM profiles
-- WHERE id = auth.uid();

-- ═══════════════════════════════════════════════════════════════════
-- 🩹 기존 유저 중 daily_credits가 NULL이거나 refilled_on이 NULL이면
--    오늘 날짜 기준으로 2로 세팅 (혹시 초기화가 빠졌을 경우 대비)
-- ═══════════════════════════════════════════════════════════════════
UPDATE profiles
  SET daily_credits = COALESCE(daily_credits, 2),
      daily_credits_refilled_on = COALESCE(
        daily_credits_refilled_on,
        (now() AT TIME ZONE 'Asia/Seoul')::DATE
      )
  WHERE daily_credits IS NULL
     OR daily_credits_refilled_on IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 🛡️ 새 사용자가 프로필 생성할 때도 확실히 2 크레딧이 들어가도록
--    컬럼 default 재확인 (이미 있어도 덮어쓰기)
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE profiles ALTER COLUMN daily_credits SET DEFAULT 2;
