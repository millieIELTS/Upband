-- ═══════════════════════════════════════════════════════════════════
-- 🔧 get_my_profile이 내부적으로 ensure_daily_credits 호출하도록
-- ═══════════════════════════════════════════════════════════════════
-- 버그: 프론트엔드에서 ensure_daily_credits fire-and-forget + get_my_profile 병렬
--       → get_my_profile이 리필 끝나기 전 옛날 값 읽음 (race condition)
-- 해결: get_my_profile을 plpgsql로 바꿔서 내부에서 ensure_daily_credits 호출

DROP FUNCTION IF EXISTS get_my_profile();

CREATE FUNCTION get_my_profile()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 호출 시점에 오늘 리필 안 됐으면 자동으로 2로 리셋
  PERFORM ensure_daily_credits();
  -- 리필된 최신 프로필 반환
  RETURN QUERY SELECT * FROM profiles WHERE id = auth.uid();
END;
$$;

GRANT EXECUTE ON FUNCTION get_my_profile() TO authenticated;
