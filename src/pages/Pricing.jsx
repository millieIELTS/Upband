import { Link, useNavigate } from 'react-router-dom'
import { Check, Coins, Sparkles, Zap, Crown, ArrowRight, Star, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { purchaseCreditPack } from '../lib/payment'

// 💳 크레딧 팩 정의
const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    tagline: '처음 써보는 분께',
    price: 9900,
    credits: 10,
    pricePerCredit: 990,
    icon: Sparkles,
    color: 'text-blue-500',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    features: [
      'Writing 피드백 약 3회',
      '단어·리스닝 학습 무제한',
      '기본 모의고사 이용',
      '1주일 녹음 보관',
    ],
    highlight: false,
  },
  {
    id: 'standard',
    name: '실전',
    tagline: '가장 많이 선택해요',
    price: 29900,
    credits: 35,
    pricePerCredit: 854,
    icon: Zap,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-primary',
    features: [
      'Writing 피드백 약 10회',
      'Speaking AI 피드백 포함',
      '전체 모의고사 이용',
      '단어·리스닝 학습 무제한',
      'E-Book 자료실 이용',
    ],
    highlight: true, // ⭐ 추천
    badge: '추천',
  },
  {
    id: 'focus',
    name: '집중',
    tagline: '시험이 곧 다가올 때',
    price: 64900,
    credits: 80,
    pricePerCredit: 811,
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    features: [
      'Writing 피드백 약 25회',
      'Speaking AI 피드백 포함',
      '모의고사 집중 모드',
      '밀리쌤 커뮤니티 우선 답변',
      '전자책 10% 추가 할인',
    ],
    highlight: false,
  },
  {
    id: 'master',
    name: '마스터',
    tagline: '최고의 가성비',
    price: 119900,
    credits: 160,
    pricePerCredit: 749,
    icon: Star,
    color: 'text-accent',
    bgColor: 'bg-accent/5',
    borderColor: 'border-accent/50',
    features: [
      'Writing 피드백 약 50회',
      'Speaking AI 피드백 무제한',
      '모든 모의고사 무제한',
      '1:1 첨삭 기회 1회 포함',
      '전자책 20% 추가 할인',
      '우선 고객 지원',
    ],
    highlight: false,
    badge: '최고 가성비',
  },
]

const FAQ = [
  {
    q: '크레딧은 언제까지 쓸 수 있어요?',
    a: '구매일로부터 1년간 유효해요. 충분히 여유롭게 쓰실 수 있습니다.',
  },
  {
    q: '환불 가능한가요?',
    a: '사용하지 않은 크레딧은 7일 이내 100% 환불 가능해요. 자세한 내용은 환불 규정을 참고해주세요.',
  },
  {
    q: '크레딧은 어떻게 사용되나요?',
    a: 'Writing/Speaking AI 피드백, E-Book 구매 등에 사용돼요. 단어·리스닝 학습은 모든 플랜에서 무제한이에요!',
  },
  {
    q: '결제 방법은 뭐가 있나요?',
    a: '카드결제, 카카오페이, 네이버페이 등 모두 가능합니다.',
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [loadingPack, setLoadingPack] = useState(null)

  const handlePurchase = async (packId) => {
    if (!user) {
      navigate('/login')
      return
    }
    setLoadingPack(packId)
    try {
      const result = await purchaseCreditPack(packId)
      if (result.success) {
        await refreshProfile()
        alert(`🎉 결제 완료! ${result.credits}크레딧이 충전되었어요.`)
        navigate('/mypage')
      } else {
        // 유저가 취소한 경우 조용히 처리
        if (!/취소/.test(result.error || '')) {
          alert('결제 실패: ' + result.error)
        }
      }
    } catch (err) {
      alert('결제 중 오류: ' + err.message)
    } finally {
      setLoadingPack(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Hero */}
      <section className="text-center py-12 md:py-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium mb-4">
          <Coins size={14} />
          UpBand 크레딧 팩
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">
          믿고 따라오면<br />
          <span className="text-primary">진짜 점수가 오르는</span> 학습
        </h1>
        <p className="text-text-secondary text-sm md:text-base max-w-xl mx-auto">
          내게 맞는 플랜을 선택하세요. 크레딧은 <strong className="text-text">1년간</strong> 유효하고,
          사용하지 않으면 <strong className="text-text">7일 이내 전액 환불</strong>됩니다.
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-16">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.id}
              className={`relative bg-surface rounded-2xl border-2 p-6 transition-all hover:shadow-lg hover:-translate-y-1 ${
                plan.highlight ? plan.borderColor + ' shadow-md' : 'border-border'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-xs font-bold text-white ${
                  plan.highlight ? 'bg-primary' : 'bg-accent'
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${plan.bgColor} mb-4`}>
                <Icon size={22} className={plan.color} />
              </div>

              {/* Name & Tagline */}
              <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
              <p className="text-xs text-text-secondary mb-4">{plan.tagline}</p>

              {/* Price */}
              <div className="mb-1">
                <span className="text-2xl md:text-3xl font-bold">
                  ₩{plan.price.toLocaleString()}
                </span>
              </div>

              {/* Credits */}
              <div className="flex items-center gap-1 mb-4 text-sm text-text-secondary">
                <Coins size={14} className="text-accent" />
                <span><strong className="text-text">{plan.credits}</strong> 크레딧</span>
                <span className="text-xs">· ₩{plan.pricePerCredit}/credit</span>
              </div>

              {/* Features */}
              <ul className="space-y-2 mb-6 text-sm">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check size={16} className="text-primary mt-0.5 flex-shrink-0" />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => handlePurchase(plan.id)}
                disabled={loadingPack !== null}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 ${
                  plan.highlight
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-bg text-text hover:bg-primary/10 hover:text-primary'
                }`}
              >
                {loadingPack === plan.id && <Loader2 size={14} className="animate-spin" />}
                {loadingPack === plan.id ? '결제 진행 중...' : '구매하기'}
              </button>
            </div>
          )
        })}
      </section>

      {/* Daily Refill Bonus Box */}
      <section className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 md:p-8 mb-16 border border-border">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
              <Sparkles size={20} className="text-accent" />
              매일 <span className="text-accent">2 크레딧</span> 무료 충전!
            </h3>
            <p className="text-sm text-text-secondary">
              가입만 해도 매일 <strong className="text-text">2 크레딧</strong>이 새로 들어와요.
              Writing 제출·모의고사에 쓸 수 있고, <strong className="text-text">매일 새로 리필</strong>되니
              꾸준히 공부하면 꾸준히 성장할 수 있어요!
            </p>
            <p className="text-[11px] text-text-secondary mt-2">
              💡 안 쓴 크레딧은 다음날로 이월되지 않아요. 매일 2개로 리셋됩니다.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors no-underline whitespace-nowrap"
          >
            가입하고 시작 <ArrowRight size={14} />
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section className="mb-16">
        <h2 className="text-xl md:text-2xl font-bold mb-6 text-center">자주 묻는 질문</h2>
        <div className="space-y-3">
          {FAQ.map((item, idx) => (
            <details
              key={idx}
              className="group bg-surface rounded-xl border border-border p-5 cursor-pointer"
            >
              <summary className="list-none flex items-center justify-between font-medium text-sm">
                <span>Q. {item.q}</span>
                <span className="text-primary group-open:rotate-180 transition-transform">▾</span>
              </summary>
              <p className="mt-3 pt-3 border-t border-border text-sm text-text-secondary leading-relaxed">
                A. {item.a}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* Trust strip */}
      <section className="text-center pb-12">
        <p className="text-xs text-text-secondary mb-2">
          🔒 안전한 결제 · 🎓 밀리쌤 직접 설계 · 💯 환불 보장
        </p>
        <p className="text-xs text-text-secondary">
          문의: <a href="http://pf.kakao.com/_xbKxlCX" target="_blank" rel="noopener noreferrer" className="text-primary font-medium">카카오톡 채널</a> · milliejiyeon@gmail.com
        </p>
      </section>
    </div>
  )
}
