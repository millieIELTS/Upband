import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/payment/ebook-verify
 * Body: { order_id: '...', pg_payment_id: '...' }
 *
 * 1. PortOne API로 결제 정보 조회
 * 2. process_ebook_payment_success RPC 호출 (주문 paid 처리 + ebook_purchases 기록)
 * 3. file_url 반환
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { order_id, pg_payment_id } = req.body || {}
  if (!order_id || !pg_payment_id) {
    return res.status(400).json({ error: 'order_id and pg_payment_id required' })
  }

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

  if (payment.status !== 'PAID') {
    return res.status(400).json({ error: 'payment_not_paid', status: payment.status })
  }

  const supabaseAdmin = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  )

  const verifiedAmount = payment.amount?.total ?? 0

  const { data, error } = await supabaseAdmin.rpc('process_ebook_payment_success', {
    p_order_id: order_id,
    p_pg_payment_id: pg_payment_id,
    p_verified_amount: verifiedAmount,
    p_pg_response: payment,
  })

  if (error) {
    console.error('process_ebook_payment_success error:', error)
    return res.status(500).json({ error: error.message })
  }

  const result = Array.isArray(data) ? data[0] : data
  if (!result.success) {
    return res.status(400).json({ error: result.error || 'processing_failed' })
  }

  return res.status(200).json({
    success: true,
    ebook_id: result.ebook_id,
    file_url: result.file_url,
  })
}
