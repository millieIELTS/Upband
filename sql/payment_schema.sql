-- ═══════════════════════════════════════════════════════════════════
-- 💳 PortOne 결제 시스템 스키마
-- ═══════════════════════════════════════════════════════════════════
-- 테이블:
--   credit_packs — 판매 중인 크레딧 팩 (Starter/실전/집중/마스터)
--   payment_orders — 결제 주문 (prepare 시 생성, verify 시 상태 변경)
-- RPC:
--   get_credit_packs() — 공개 크레딧 팩 조회
--   create_payment_order(p_pack_id) — 주문 생성
--   process_payment_success(p_order_id, p_pg_payment_id) — 결제 완료 처리

-- ────────────────────────────────────────────────────────────────
-- 1️⃣ credit_packs 테이블
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS credit_packs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 초기 데이터 (Pricing.jsx와 일치)
INSERT INTO credit_packs (id, name, description, price, credits, sort_order) VALUES
  ('starter',  'Starter',  '처음 써보는 분께', 9900,   10,  1),
  ('standard', '실전',     '가장 많이 선택해요', 29900,  35,  2),
  ('focus',    '집중',     '시험이 곧 다가올 때', 64900,  80,  3),
  ('master',   '마스터',   '최고의 가성비',    119900, 160, 4)
ON CONFLICT (id) DO UPDATE
  SET name = EXCLUDED.name,
      description = EXCLUDED.description,
      price = EXCLUDED.price,
      credits = EXCLUDED.credits,
      sort_order = EXCLUDED.sort_order;

ALTER TABLE credit_packs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "credit_packs readable by all" ON credit_packs;
CREATE POLICY "credit_packs readable by all" ON credit_packs
  FOR SELECT USING (TRUE);

-- ────────────────────────────────────────────────────────────────
-- 2️⃣ payment_orders 테이블
-- ────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payment_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pack_id TEXT NOT NULL REFERENCES credit_packs(id),
  amount INTEGER NOT NULL,
  credits INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  pg_payment_id TEXT,  -- PortOne payment ID (verify 후 저장)
  pg_response JSONB,    -- PortOne API 전체 응답 (감사용)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_payment_orders_user ON payment_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_payment_orders_status ON payment_orders(status);

ALTER TABLE payment_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own orders" ON payment_orders;
CREATE POLICY "users read own orders" ON payment_orders
  FOR SELECT USING (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- 3️⃣ RPC: 공개 크레딧 팩 조회
-- ────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS get_credit_packs();
CREATE FUNCTION get_credit_packs()
RETURNS SETOF credit_packs
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT * FROM credit_packs WHERE is_active = TRUE ORDER BY sort_order;
$$;
GRANT EXECUTE ON FUNCTION get_credit_packs() TO anon, authenticated;

-- ────────────────────────────────────────────────────────────────
-- 4️⃣ RPC: 주문 생성 (prepare 단계)
-- ────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS create_payment_order(TEXT);
CREATE FUNCTION create_payment_order(p_pack_id TEXT)
RETURNS TABLE(order_id UUID, amount INTEGER, credits INTEGER, pack_name TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id UUID := auth.uid();
  v_pack credit_packs;
  v_order_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '로그인이 필요합니다.';
  END IF;

  SELECT * INTO v_pack FROM credit_packs WHERE id = p_pack_id AND is_active = TRUE;
  IF v_pack.id IS NULL THEN
    RAISE EXCEPTION '유효하지 않은 크레딧 팩입니다.';
  END IF;

  INSERT INTO payment_orders (user_id, pack_id, amount, credits, status)
  VALUES (v_user_id, v_pack.id, v_pack.price, v_pack.credits, 'pending')
  RETURNING id INTO v_order_id;

  RETURN QUERY SELECT v_order_id, v_pack.price, v_pack.credits, v_pack.name;
END;
$$;
GRANT EXECUTE ON FUNCTION create_payment_order(TEXT) TO authenticated;

-- ────────────────────────────────────────────────────────────────
-- 5️⃣ RPC: 결제 성공 처리 (verify 단계 — 서버에서 service_role로 호출)
-- ────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS process_payment_success(UUID, TEXT, INTEGER, JSONB);
CREATE FUNCTION process_payment_success(
  p_order_id UUID,
  p_pg_payment_id TEXT,
  p_verified_amount INTEGER,
  p_pg_response JSONB
)
RETURNS TABLE(success BOOLEAN, credits_granted INTEGER, error TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_order payment_orders;
BEGIN
  -- 주문 조회 + 락
  SELECT * INTO v_order FROM payment_orders WHERE id = p_order_id FOR UPDATE;

  IF v_order.id IS NULL THEN
    RETURN QUERY SELECT FALSE, 0, 'order_not_found'::TEXT;
    RETURN;
  END IF;

  IF v_order.status = 'paid' THEN
    -- 이미 처리됨 (멱등성)
    RETURN QUERY SELECT TRUE, v_order.credits, NULL::TEXT;
    RETURN;
  END IF;

  IF v_order.status != 'pending' THEN
    RETURN QUERY SELECT FALSE, 0, ('invalid_status:' || v_order.status)::TEXT;
    RETURN;
  END IF;

  -- 금액 검증
  IF v_order.amount != p_verified_amount THEN
    UPDATE payment_orders SET status = 'failed', pg_response = p_pg_response WHERE id = p_order_id;
    RETURN QUERY SELECT FALSE, 0, 'amount_mismatch'::TEXT;
    RETURN;
  END IF;

  -- 주문 상태 업데이트 + 크레딧 지급
  UPDATE payment_orders
    SET status = 'paid',
        pg_payment_id = p_pg_payment_id,
        pg_response = p_pg_response,
        paid_at = NOW()
    WHERE id = p_order_id;

  UPDATE profiles
    SET credits = profiles.credits + v_order.credits
    WHERE profiles.id = v_order.user_id;

  RETURN QUERY SELECT TRUE, v_order.credits, NULL::TEXT;
END;
$$;
GRANT EXECUTE ON FUNCTION process_payment_success(UUID, TEXT, INTEGER, JSONB) TO service_role;

-- ────────────────────────────────────────────────────────────────
-- 6️⃣ RPC: 내 결제 내역 조회 (마이페이지용)
-- ────────────────────────────────────────────────────────────────
DROP FUNCTION IF EXISTS get_my_payments();
CREATE FUNCTION get_my_payments()
RETURNS TABLE(
  id UUID,
  pack_id TEXT,
  pack_name TEXT,
  amount INTEGER,
  credits INTEGER,
  status TEXT,
  created_at TIMESTAMPTZ,
  paid_at TIMESTAMPTZ
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    po.id, po.pack_id, cp.name AS pack_name,
    po.amount, po.credits, po.status,
    po.created_at, po.paid_at
  FROM payment_orders po
  JOIN credit_packs cp ON cp.id = po.pack_id
  WHERE po.user_id = auth.uid()
  ORDER BY po.created_at DESC;
$$;
GRANT EXECUTE ON FUNCTION get_my_payments() TO authenticated;
