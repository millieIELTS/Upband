-- ═══════════════════════════════════════════════════════════════════
-- 매일 2 크레딧 자동 충전 시스템 (갱신형, 누적 X)
-- ═══════════════════════════════════════════════════════════════════
-- 설계:
--   - profiles.daily_credits — 오늘 남은 무료 크레딧 (기본 2, 매일 리셋)
--   - profiles.daily_credits_refilled_on — 마지막 리필된 날짜 (KST)
--   - ensure_daily_credits() RPC — 로그인 시 호출하면 오늘 리필 상태 확인 후 2개로 리셋
--   - Writing 제출 / Mock Test 시 daily_credits를 먼저 소진한 뒤, 부족하면 paid credits 사용
-- ═══════════════════════════════════════════════════════════════════

-- 1️⃣ 컬럼 추가
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS daily_credits INTEGER NOT NULL DEFAULT 2,
  ADD COLUMN IF NOT EXISTS daily_credits_refilled_on DATE;

-- 2️⃣ 일일 크레딧 리필 RPC 함수
-- 호출 시점: 로그인 직후, 또는 크레딧 사용 직전
-- 동작: 오늘 날짜와 refilled_on 비교 → 다르면 daily_credits를 2로 리셋
CREATE OR REPLACE FUNCTION ensure_daily_credits()
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

  -- 오늘 아직 리필 안 됐거나 처음이면 2로 리셋
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

-- 3️⃣ 크레딧 차감 RPC (daily 우선, 모자라면 paid)
-- Writing 제출·Mock Test에서 사용
CREATE OR REPLACE FUNCTION consume_credits(p_amount INTEGER)
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

  -- 먼저 오늘 리필 보장
  PERFORM ensure_daily_credits();

  SELECT p.daily_credits, p.credits INTO v_daily, v_paid
    FROM profiles p WHERE p.id = v_user_id;

  IF (v_daily + v_paid) < p_amount THEN
    RETURN QUERY SELECT FALSE, v_daily, v_paid, 'insufficient_credits'::TEXT;
    RETURN;
  END IF;

  -- daily 먼저 차감
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

-- 4️⃣ 기존 유저들 초기화 (이미 가입한 사람도 오늘부터 매일 2개 받음)
UPDATE profiles
  SET daily_credits = 2,
      daily_credits_refilled_on = (now() AT TIME ZONE 'Asia/Seoul')::DATE
  WHERE daily_credits_refilled_on IS NULL;

-- ═══════════════════════════════════════════════════════════════════
-- 5️⃣ get_my_profile에 daily_credits / daily_credits_refilled_on 포함
-- ═══════════════════════════════════════════════════════════════════
-- 기존 함수 시그니처를 모르므로 SELECT * 기반으로 재작성
-- (profiles 테이블의 모든 컬럼을 반환하도록)
CREATE OR REPLACE FUNCTION get_my_profile()
RETURNS SETOF profiles
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM profiles WHERE id = auth.uid();
$$;

GRANT EXECUTE ON FUNCTION get_my_profile() TO authenticated;
