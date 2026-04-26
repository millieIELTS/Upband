-- ④-b Fix process_ebook_payment_success: column reference "ebook_id" is ambiguous
CREATE OR REPLACE FUNCTION process_ebook_payment_success(
  p_order_id UUID,
  p_pg_payment_id TEXT,
  p_verified_amount INTEGER,
  p_pg_response JSONB
)
RETURNS TABLE(success BOOLEAN, ebook_id UUID, file_url TEXT, error TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $body$
#variable_conflict use_column
DECLARE
  v_order ebook_orders;
  v_file_url TEXT;
BEGIN
  SELECT * INTO v_order FROM ebook_orders WHERE id = p_order_id FOR UPDATE;

  IF v_order.id IS NULL THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'order_not_found'::TEXT;
    RETURN;
  END IF;

  IF v_order.status = 'paid' THEN
    SELECT ebooks.file_url INTO v_file_url FROM ebooks WHERE ebooks.id = v_order.ebook_id;
    RETURN QUERY SELECT TRUE, v_order.ebook_id, v_file_url, NULL::TEXT;
    RETURN;
  END IF;

  IF v_order.status != 'pending' THEN
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, ('invalid_status:' || v_order.status)::TEXT;
    RETURN;
  END IF;

  IF v_order.amount != p_verified_amount THEN
    UPDATE ebook_orders SET status = 'failed', pg_response = p_pg_response WHERE id = p_order_id;
    RETURN QUERY SELECT FALSE, NULL::UUID, NULL::TEXT, 'amount_mismatch'::TEXT;
    RETURN;
  END IF;

  UPDATE ebook_orders
    SET status = 'paid',
        pg_payment_id = p_pg_payment_id,
        pg_response = p_pg_response,
        paid_at = NOW()
    WHERE id = p_order_id;

  INSERT INTO ebook_purchases (user_id, ebook_id)
  VALUES (v_order.user_id, v_order.ebook_id)
  ON CONFLICT (user_id, ebook_id) DO NOTHING;

  SELECT ebooks.file_url INTO v_file_url FROM ebooks WHERE ebooks.id = v_order.ebook_id;

  RETURN QUERY SELECT TRUE, v_order.ebook_id, v_file_url, NULL::TEXT;
END;
$body$;

GRANT EXECUTE ON FUNCTION process_ebook_payment_success(UUID, TEXT, INTEGER, JSONB) TO service_role;
