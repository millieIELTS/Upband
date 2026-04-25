import PortOne from '@portone/browser-sdk/v2'
import { supabase } from './supabase'

/**
 * 크레딧 팩 결제 전체 플로우
 *
 * @param {string} packId - 'starter' | 'standard' | 'focus' | 'master'
 * @returns {Promise<{success: boolean, credits?: number, error?: string}>}
 */
export async function purchaseCreditPack(packId) {
  // 1. 로그인 세션 확인 + JWT 토큰 획득
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    return { success: false, error: '로그인이 필요합니다.' }
  }

  // 2. 서버에 주문 생성 요청
  const prepareRes = await fetch('/api/payment/prepare', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({ pack_id: packId }),
  })

  if (!prepareRes.ok) {
    const err = await prepareRes.json().catch(() => ({}))
    return { success: false, error: err.error || '주문 생성 실패' }
  }

  const { order_id, amount, credits, pack_name } = await prepareRes.json()

  // 3. PortOne 결제창 호출
  const storeId = import.meta.env.VITE_PORTONE_STORE_ID
  const channelKey = import.meta.env.VITE_PORTONE_CHANNEL_KEY

  if (!storeId || !channelKey) {
    return { success: false, error: 'PortOne 설정이 필요합니다. (환경변수 확인)' }
  }

  // NICE V1 (iamport00m 공용 테스트 가맹점) 호환 — 최소 파라미터만
  // customer 필드도 일부 NICE V1에서 파싱 에러 발생 → 제거
  const response = await PortOne.requestPayment({
    storeId,
    channelKey,
    paymentId: `pay-${order_id}`,
    orderName: `UpBand ${pack_name} (${credits}크레딧)`,
    totalAmount: amount,
    currency: 'CURRENCY_KRW',
    payMethod: 'CARD',
  })

  // 유저 취소 / 결제 실패
  if (response?.code !== undefined) {
    return { success: false, error: response.message || '결제가 취소되었습니다.' }
  }

  // 4. 서버에 결제 검증 요청
  const verifyRes = await fetch('/api/payment/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      order_id,
      pg_payment_id: response.paymentId,
    }),
  })

  if (!verifyRes.ok) {
    const err = await verifyRes.json().catch(() => ({}))
    return { success: false, error: err.error || '결제 검증 실패' }
  }

  const verifyData = await verifyRes.json()
  return { success: true, credits: verifyData.credits_granted }
}
