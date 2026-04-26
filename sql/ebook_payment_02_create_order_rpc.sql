-- ② create_ebook_order RPC
CREATE OR REPLACE FUNCTION create_ebook_order(p_ebook_id UUID)
RETURNS TABLE(order_id UUID, amount INTEGER, ebook_title TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $body$
DECLARE
  v_user_id UUID := auth.uid();
  v_ebook ebooks;
  v_already_purchased BOOLEAN;
  v_order_id UUID;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION '로그인이 필요합니다.';
  END IF;

  SELECT * INTO v_ebook FROM ebooks WHERE id = p_ebook_id AND is_published = TRUE;
  IF v_ebook.id IS NULL THEN
    RAISE EXCEPTION '유효하지 않은 자료입니다.';
  END IF;

  IF v_ebook.price IS NULL OR v_ebook.price <= 0 THEN
    RAISE EXCEPTION '무료 자료는 결제가 필요하지 않습니다.';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM ebook_purchases
    WHERE user_id = v_user_id AND ebook_id = p_ebook_id
  ) INTO v_already_purchased;

  IF v_already_purchased THEN
    RAISE EXCEPTION '이미 구매한 자료입니다.';
  END IF;

  INSERT INTO ebook_orders (user_id, ebook_id, amount, status)
  VALUES (v_user_id, v_ebook.id, v_ebook.price, 'pending')
  RETURNING id INTO v_order_id;

  RETURN QUERY SELECT v_order_id, v_ebook.price, v_ebook.title;
END;
$body$;

GRANT EXECUTE ON FUNCTION create_ebook_order(UUID) TO authenticated;
