import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/payment/ebook-prepare
 * Body: { ebook_id: '<uuid>' }
 * Headers: Authorization: Bearer <user_jwt>
 *
 * 응답: { order_id, amount, ebook_title }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { ebook_id } = req.body || {}
  if (!ebook_id) {
    return res.status(400).json({ error: 'ebook_id is required' })
  }

  const authHeader = req.headers.authorization || ''
  const token = authHeader.replace(/^Bearer\s+/i, '')
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const supabase = createClient(
    process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
    process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY,
    {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false },
    }
  )

  const { data, error } = await supabase.rpc('create_ebook_order', { p_ebook_id: ebook_id })
  if (error) {
    console.error('create_ebook_order error:', error)
    return res.status(400).json({ error: error.message })
  }

  const order = Array.isArray(data) ? data[0] : data
  return res.status(200).json({
    order_id: order.order_id,
    amount: order.amount,
    ebook_title: order.ebook_title,
  })
}
