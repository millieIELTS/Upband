import PortOne from '@portone/browser-sdk/v2'
import { supabase } from './supabase'

/**
 * 결제수단별 PortOne payMethod 매핑
 * - 'CARD': 신용/체크카드
 * - 'KAKAOPAY' / 'NAVERPAY' / 'TOSSPAY' / 'SAMSUNGPAY': 간편결제
 */
function buildPayMethodParams(method) {
  switch (method) {
    case 'KAKAOPAY':
      return {
        payMethod: 'EASY_PAY',
        easyPay: { easyPayProvider: 'EASY_PAY_PROVIDER_KAKAOPAY' },
      }
    case 'NAVERPAY':
      return {
        payMethod: 'EASY_PAY',
        easyPay: { easyPayProvider: 'EASY_PAY_PROVIDER_NAVERPAY' },
      }
    case 'TOSSPAY':
      return {
        payMethod: 'EASY_PAY',
        easyPay: { easyPayProvider: 'EASY_PAY_PROVIDER_TOSSPAY' },
      }
    case 'SAMSUNGPAY':
      return {
        payMethod: 'EASY_PAY',
        easyPay: { easyPayProvider: 'EASY_PAY_PROVIDER_SAMSUNGPAY' },
      }
    case 'CARD':
    default:
      return { payMethod: 'CARD' }
  }
}

/**
 * 크레딧 팩 결제 전체 플로우
 *
 * @param {string} packId - 'starter' | 'standard' | 'focus' | 'master'
 * @param {string} payMethod - 'CARD' | 'KAKAOPAY' | 'NAVERPAY' | 'TOSSPAY' | 'SAMSUNGPAY'
 * @returns {Promise<{success: boolean, credits?: number, error?: string}>}
 */
export async function purchaseCreditPack(packId, payMethod = 'CARD') {
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

  const response = await PortOne.requestPayment({
    storeId,
    channelKey,
    paymentId: `pay-${order_id}`,
    orderName: `UpBand ${pack_name} (${credits}크레딧)`,
    totalAmount: amount,
    currency: 'CURRENCY_KRW',
    ...buildPayMethodParams(payMethod),
  })

  // 유저 취소 / 결제 실패
  if (response?.code !== undefined) {
    // 테스트 모드에서 간편결제 미지원 케이스 친절하게 처리
    const msg = response.message || ''
    if (/지원되지 않는|지원하지 않는|미지원/.test(msg) && payMethod !== 'CARD') {
      return {
        success: false,
        error: `현재 ${payMethod === 'KAKAOPAY' ? '카카오페이' : payMethod === 'NAVERPAY' ? '네이버페이' : payMethod === 'TOSSPAY' ? '토스페이' : '간편결제'}는 준비 중이에요. 카드 결제로 진행해주세요.`,
      }
    }
    return { success: false, error: msg || '결제가 취소되었습니다.' }
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
