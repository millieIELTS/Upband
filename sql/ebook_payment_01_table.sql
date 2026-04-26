-- ① ebook_orders 테이블 + RLS
CREATE TABLE IF NOT EXISTS ebook_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  ebook_id UUID NOT NULL REFERENCES ebooks(id) ON DELETE RESTRICT,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'failed', 'cancelled', 'refunded')),
  pg_payment_id TEXT,
  pg_response JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_ebook_orders_user ON ebook_orders(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ebook_orders_status ON ebook_orders(status);

ALTER TABLE ebook_orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "users read own ebook orders" ON ebook_orders;
CREATE POLICY "users read own ebook orders" ON ebook_orders
  FOR SELECT USING (auth.uid() = user_id);
