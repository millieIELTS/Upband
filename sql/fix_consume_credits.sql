-- ═══════════════════════════════════════════════════════════════════
-- 🔧 consume_credits + ensure_daily_credits RPC 강제 재생성
-- ═══════════════════════════════════════════════════════════════════
-- CREATE OR REPLACE가 시그니처 불일치로 실패할 수 있어 DROP 후 CREATE

DROP FUNCTION IF EXISTS consume_credits(INTEGER);
DROP FUNCTION IF EXISTS ensure_daily_credits();

-- ensure_daily_credits — 오늘 아직 리필 안 됐으면 2로 리셋
CREATE FUNCTION ensure_daily_credits()
RETURNS TABLE(daily_credits INTEGER, refilled BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_today DATE := (now() AT TIME ZONE 'Asia/Seoul')::DATE;
  v_user_id UUID := auth.uid();
  v_last_refill DATE;
  v_refilled BOOLEAN := FALSE;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '로그인이 필요합니다.';
  END IF;

  SELECT p.daily_credits_refilled_on INTO v_last_refill
  FROM profiles p WHERE p.id = v_user_id;

  IF v_last_refill IS NULL OR v_last_refill < v_today THEN
    UPDATE profiles
      SET daily_credits = 2,
          daily_credits_refilled_on = v_today
      WHERE id = v_user_id;
    v_refilled := TRUE;
  END IF;

  RETURN QUERY
    SELECT p.daily_credits, v_refilled
    FROM profiles p WHERE p.id = v_user_id;
END;
$$;

GRANT EXECUTE ON FUNCTION ensure_daily_credits() TO authenticated;

-- consume_credits — daily 먼저 소진, 부족하면 paid
CREATE FUNCTION consume_credits(p_amount INTEGER)
RETURNS TABLE(success BOOLEAN, daily_credits INTEGER, credits INTEGER, error TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_daily INTEGER;
  v_paid INTEGER;
  v_use_daily INTEGER;
  v_use_paid INTEGER;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 0, 'unauthorized'::TEXT;
    RETURN;
  END IF;

  PERFORM ensure_daily_credits();

  SELECT p.daily_credits, p.credits INTO v_daily, v_paid
    FROM profiles p WHERE p.id = v_user_id;

  IF (v_daily + v_paid) < p_amount THEN
    RETURN QUERY SELECT FALSE, v_daily, v_paid, 'insufficient_credits'::TEXT;
    RETURN;
  END IF;

  v_use_daily := LEAST(v_daily, p_amount);
  v_use_paid  := p_amount - v_use_daily;

  UPDATE profiles
    SET daily_credits = daily_credits - v_use_daily,
        credits = credits - v_use_paid
    WHERE id = v_user_id;

  RETURN QUERY
    SELECT TRUE, (v_daily - v_use_daily), (v_paid - v_use_paid), NULL::TEXT;
END;
$$;

GRANT EXECUTE ON FUNCTION consume_credits(INTEGER) TO authenticated;

-- 테스트: 본인 크레딧 확인
-- SELECT id, email, credits, daily_credits FROM profiles WHERE id = auth.uid();
