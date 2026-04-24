import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/payment/verify
 * Body: { order_id: '...', pg_payment_id: '...' }
 *
 * 동작:
 * 1. PortOne API로 결제 정보 조회 (금액 검증의 소스 오브 트루스)
 * 2. process_payment_success RPC 호출 (주문 상태 업데이트 + 크레딧 지급)
 * 3. 결과 반환
 *
 * 보안: PortOne API Secret은 서버에만 존재 → 프론트에서 위조 불가
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { order_id, pg_payment_id } = req.body || {}
  if (!order_id || !pg_payment_id) {
    return res.status(400).json({ error: 'order_id and pg_payment_id required' })
  }

  // 1. PortOne API에서 결제 정보 조회
  const portoneResponse = await fetch(
    `https://api.portone.io/payments/${encodeURIComponent(pg_payment_id)}`,
    {
      headers: {
        Authorization: `PortOne ${process.env.PORTONE_API_SECRET}`,
      },
    }
  )

  if (!portoneResponse.ok) {
    const errText = await portoneResponse.text()
    console.error('PortOne API error:', portoneResponse.status, errText)
    return res.status(400).json({ error: 'portone_api_failed', detail: errText })
  }

  const payment = await portoneResponse.json()

  // 결제 상태 확인 (PAID여야 함)
  if (payment.status !== 'PAID') {
    return res.status(400).json({ error: 'payment_not_paid', status: payment.status })
  }

  // 2. 서비스 롤 키로 Supabase 클라이언트 (RPC가 service_role 전용)
  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )

  const verifiedAmount = payment.amount?.total ?? 0

  const { data, error } = await supabaseAdmin.rpc('process_payment_success', {
    p_order_id: order_id,
    p_pg_payment_id: pg_payment_id,
    p_verified_amount: verifiedAmount,
    p_pg_response: payment,
  })

  if (error) {
    console.error('process_payment_success error:', error)
    return res.status(500).json({ error: error.message })
  }

  const result = Array.isArray(data) ? data[0] : data
  if (!result.success) {
    return res.status(400).json({ error: result.error || 'processing_failed' })
  }

  return res.status(200).json({
    success: true,
    credits_granted: result.credits_granted,
  })
}
