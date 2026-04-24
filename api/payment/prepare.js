import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/payment/prepare
 * Body: { pack_id: 'standard' }
 * Headers: Authorization: Bearer <user_jwt>
 *
 * 응답: { order_id, amount, credits, pack_name }
 *
 * 동작:
 * 1. JWT 검증 → user_id 추출
 * 2. create_payment_order RPC 호출 (DB에 pending 주문 생성)
 * 3. order_id 반환 → 프론트에서 PortOne SDK의 paymentId로 사용
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { pack_id } = req.body || {}
  if (!pack_id) {
    return res.status(400).json({ error: 'pack_id is required' })
  }

  // JWT 헤더에서 토큰 추출
  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  // 유저 JWT로 Supabase 클라이언트 생성 (auth.uid()가 작동하도록)
  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    }
  )

  const { data, error } = await supabase.rpc('create_payment_order', { p_pack_id: pack_id })
  if (error) {
    console.error('create_payment_order error:', error)
    return res.status(400).json({ error: error.message })
  }

  const order = Array.isArray(data) ? data[0] : data
  return res.status(200).json({
    order_id: order.order_id,
    amount: order.amount,
    credits: order.credits,
    pack_name: order.pack_name,
  })
}
