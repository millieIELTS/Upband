-- ═══════════════════════════════════════════════════════════════════
-- 🔧 get_all_profiles RPC 재생성 — daily_credits 포함 보장
-- ═══════════════════════════════════════════════════════════════════
-- 대시보드에서 daily_credits가 안 보이는 이슈
-- → 기존 함수가 daily_credits 컬럼 추가 전에 만들어졌을 수 있음
-- → SETOF profiles로 강제하면 모든 컬럼 반환됨

DROP FUNCTION IF EXISTS get_all_profiles();

CREATE FUNCTION get_all_profiles()
RETURNS SETOF profiles
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- 관리자/선생님만 조회 가능
  IF NOT EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
      AND role IN ('admin', 'teacher')
  ) THEN
    RAISE EXCEPTION '권한이 없습니다.';
  END IF;

  RETURN QUERY SELECT * FROM profiles ORDER BY created_at DESC;
END;
$$;

GRANT EXECUTE ON FUNCTION get_all_profiles() TO authenticated;
