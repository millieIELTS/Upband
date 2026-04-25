import { Link, useNavigate } from 'react-router-dom'
import {
  Sparkles, Zap, Crown, ArrowRight, Loader2,
  CreditCard, X, Calendar, Award, ExternalLink,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { purchaseCreditPack } from '../lib/payment'

// 💳 결제수단 옵션
const PAY_METHODS = [
  {
    id: 'CARD',
    label: '신용·체크카드',
    desc: 'Visa · Master · 국내 모든 카드',
    icon: '💳',
    bgClass: 'bg-bg hover:bg-primary/5',
    borderClass: 'border-border hover:border-primary',
  },
  {
    id: 'KAKAOPAY',
    label: '카카오페이',
    desc: '카카오톡으로 빠르게',
    icon: '🟡',
    bgClass: 'bg-[#FEE500]/10 hover:bg-[#FEE500]/20',
    borderClass: 'border-[#FEE500]/40 hover:border-[#FEE500]',
  },
  {
    id: 'NAVERPAY',
    label: '네이버페이',
    desc: '네이버 아이디로 간편하게',
    icon: '🟢',
    bgClass: 'bg-[#03C75A]/10 hover:bg-[#03C75A]/20',
    borderClass: 'border-[#03C75A]/40 hover:border-[#03C75A]',
  },
  {
    id: 'TOSSPAY',
    label: '토스페이',
    desc: '토스로 1초 결제',
    icon: '🔵',
    bgClass: 'bg-[#0064FF]/10 hover:bg-[#0064FF]/20',
    borderClass: 'border-[#0064FF]/40 hover:border-[#0064FF]',
  },
]

// 💎 플랜 정의 (기간제 무제한 모델)
// pack id는 기존 DB값(standard/focus/master) 유지 — 결제 호환성
const PLANS = [
  {
    id: 'standard', // DB: standard
    name: '실전',
    tagline: '시험 1주 전 추천',
    recommendedFor: '시험 1주 전',
    price: 29900,
    duration: '1주 무제한',
    icon: Zap,
    color: 'text-primary',
    bgColor: 'bg-primary/5',
    borderColor: 'border-border',
    features: [
      {
        icon: '📚',
        text: 'E-Book 자료실 무제한 이용',
        emphasis: true,
        sub: 'Writing 모범답안 · Speaking 토픽별 정리 · 어휘집 전체',
      },
      { icon: '✍️', text: 'Writing AI 첨삭 무제한 (1주)' },
      { icon: '📝', text: 'Writing 모의고사 무제한' },
      { icon: '🎓', text: '커뮤니티 답변' },
    ],
    highlight: false,
  },
  {
    id: 'focus', // DB: focus
    name: '집중',
    tagline: '시험 2-3주 전 · 가장 많이 선택',
    recommendedFor: '시험 2-3주 전',
    price: 49000,
    duration: '2주 무제한',
    icon: Crown,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-primary',
    features: [
      { icon: '✍️', text: 'Writing AI 첨삭 무제한 (2주)' },
      { icon: '📝', text: 'Writing 모의고사 무제한' },
      {
        icon: '🎙️',
        text: 'Speaking 모의고사 강사 음성 피드백',
        emphasis: true,
        sub: '학생 녹음본을 밀리쌤이 직접 듣고 음성으로 답변',
      },
      { icon: '📚', text: 'E-Book 자료실 무제한 이용' },
      { icon: '🎓', text: '커뮤니티 우선 답변' },
    ],
    highlight: true,
    badge: '가장 많이 선택',
  },
  {
    id: 'master', // DB: master
    name: '마스터',
    tagline: '시험 2주 전 · 1:1 Zoom 코칭 포함',
    recommendedFor: '시험 2주 전 · 1:1',
    price: 99000,
    duration: '2주 무제한',
    icon: Award,
    color: 'text-accent',
    bgColor: 'bg-accent/5',
    borderColor: 'border-accent/50',
    features: [
      { icon: '✍️', text: 'Writing AI 첨삭 무제한 (2주)' },
      { icon: '📝', text: 'Writing/Speaking 모의고사 무제한' },
      {
        icon: '🎯',
        text: '강사 1:1 Zoom 첨삭 10회',
        emphasis: true,
        sub: '회당 20분 · 시험 + 즉석 피드백',
      },
      { icon: '📚', text: 'E-Book 자료실 무제한 이용' },
      { icon: '⚡', text: '12시간 내 우선 답변' },
    ],
    highlight: false,
    badge: '프리미엄',
  },
]

const FAQ = [
  {
    q: '플랜 기간이 끝나면 어떻게 되나요?',
    a: '플랜 기간이 종료되면 무제한 첨삭/모의고사가 멈춰요. 다시 시작하시려면 플랜을 다시 선택하시면 됩니다. 매일 무료 2회 첨삭은 그대로 유지돼요!',
  },
  {
    q: '환불 가능한가요?',
    a: '결제 후 7일 이내, 첨삭 2회 이하 사용 시 미사용분 환불이 가능합니다. 자세한 환불 규정은 결제 안내를 확인해주세요.',
  },
  {
    q: '강사님이 직접 첨삭하는 게 추가되면 뭐가 다른가요?',
    a: '보통 AI 첨삭 시스템들은 Speaking을 대부분 TTS(Text-to-Speech) 형태로만 처리해요. 그런데 이건 IELTS Speaking 시험의 핵심인 fluency(유창성)와 발음을 잡지 못합니다. 시험 포인트를 정확히 아는 강사가 학생 녹음을 직접 듣고 음성으로 피드백할 때 비로소 점수가 오릅니다. UpBand는 그 부분을 강사 직접 첨삭으로 채워요.',
  },
  {
    q: '학원이랑 비교하면 가성비는?',
    a: 'IELTS 1:1 학원 코스가 약 180만원, 그룹 강의가 60-120만원이에요. UpBand 마스터(99,000원/2주)는 1:1 Zoom 10회 + 무제한 첨삭으로 혼자서도 1:1 코칭을 받을 수 있게 설계했습니다.',
  },
  {
    q: '모든 결제수단을 사용할 수 있나요?',
    a: '카드(Visa, Master 등)와 카카오페이, 네이버페이, 토스페이 모두 가능해요. 안전한 토스페이먼츠 결제 시스템을 사용합니다.',
  },
]

export default function Pricing() {
  const navigate = useNavigate()
  const { user, refreshProfile } = useAuth()
  const [loadingPack, setLoadingPack] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState(null)

  const openPaySheet = (plan) => {
    if (!user) {
      navigate('/login')
      return
    }
    setSelectedPlan(plan)
  }

  const handlePaymentMethod = async (payMethod) => {
    if (!selectedPlan) return
    const planId = selectedPlan.id
    setSelectedPlan(null)
    setLoadingPack(planId)
    try {
      const result = await purchaseCreditPack(planId, payMethod)
      if (result.success) {
        await refreshProfile()
        alert(`🎉 결제 완료! ${selectedPlan?.name || ''} 플랜이 활성화되었어요.`)
        navigate('/mypage')
      } else {
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
          <Sparkles size={14} />
          시험 일정에 맞춰 시작하세요
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4 leading-tight">
          학원보다 <span className="text-primary">저렴하게</span>,<br />
          AI보다 <span className="text-accent">진짜 사람이</span>
        </h1>
        <p className="text-text-secondary text-sm md:text-base max-w-xl mx-auto">
          <strong className="text-text">밀리쌤이 직접 첨삭</strong>하는 IELTS 학습 플랜.
          시험 일정에 맞춰 골라보세요.
        </p>
      </section>

      {/* 🎓 강사 강조 박스 */}
      <section className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-5 md:p-6 mb-8 border border-border">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Award size={22} className="text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm md:text-base font-bold mb-1">
              🎯 시험 출제 포인트를 아는 강사가 직접 봅니다
            </p>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed">
              AI는 도구일 뿐. 점수에 직결되는 핵심 피드백과 채점은
              <strong className="text-text"> IELTS 시험센터에서 강의해온 강사</strong>가 직접 합니다.
              <br />
              그래서 다른 AI 첨삭 사이트와 결과가 달라요.
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border text-[11px] font-medium text-text-secondary">
                📍 인천 IELTS 시험센터 강의
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border text-[11px] font-medium text-text-secondary">
                📍 홍대 IELTS 시험센터 강의
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface border border-border text-[11px] font-medium text-text-secondary">
                📍 강남 IELTS 시험센터 강의
              </span>
            </div>
            {/* 인스타 후기 CTA */}
            <a
              href="http://www.instagram.com/m_jy4278"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full text-xs md:text-sm font-medium no-underline hover:opacity-90 transition-opacity"
            >
              <ExternalLink size={14} /> 인스타에서 학생 후기 더 보기
            </a>
          </div>
        </div>
      </section>

      {/* 🏆 합리적 가격 Anchor */}
      <section className="mb-12 bg-surface rounded-2xl border border-border p-6">
        <p className="text-xs text-text-secondary mb-3 text-center">학원이 부담스러우신가요?</p>
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          <div className="text-center">
            <p className="text-[11px] md:text-xs text-text-secondary mb-1">학원 1:1 코스</p>
            <p className="text-sm md:text-xl font-bold text-text-secondary line-through">월 180만원</p>
          </div>
          <div className="text-center">
            <p className="text-[11px] md:text-xs text-text-secondary mb-1">학원 그룹 강의</p>
            <p className="text-sm md:text-xl font-bold text-text-secondary line-through">월 60-120만원</p>
          </div>
          <div className="text-center bg-primary/5 rounded-xl py-2 px-1">
            <p className="text-[11px] md:text-xs text-primary font-semibold mb-1">UpBand 마스터</p>
            <p className="text-sm md:text-xl font-bold text-primary">9.9만원<span className="text-[11px] md:text-sm font-medium">/2주</span></p>
          </div>
        </div>
        <p className="text-[11px] md:text-xs text-text-secondary text-center mt-4">
          🎯 1:1 Zoom 10회 + 무제한 첨삭으로 <strong className="text-text">혼자서도 1:1 코칭</strong>
        </p>
      </section>

      {/* Pricing Cards */}
      <section className="grid md:grid-cols-3 gap-5 md:gap-6 mb-16">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.id}
              className={`relative bg-surface rounded-2xl border-2 p-6 md:p-7 transition-all hover:shadow-xl hover:-translate-y-1 ${
                plan.highlight ? plan.borderColor + ' shadow-md' : 'border-border'
              }`}
            >
              {/* Badge */}
              {plan.badge && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[11px] font-bold text-white whitespace-nowrap ${
                  plan.highlight ? 'bg-primary' : 'bg-accent'
                }`}>
                  {plan.badge}
                </div>
              )}

              {/* 시험 일정 추천 라벨 */}
              <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium mb-4 ${
                plan.highlight ? 'bg-primary/10 text-primary' : 'bg-bg text-text-secondary'
              }`}>
                <Calendar size={11} />
                {plan.recommendedFor}
              </div>

              {/* Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${plan.bgColor} mb-3`}>
                <Icon size={24} className={plan.color} />
              </div>

              {/* Name */}
              <h3 className="text-2xl font-bold mb-1">{plan.name}</h3>
              <p className="text-xs text-text-secondary mb-5">{plan.tagline}</p>

              {/* Price */}
              <div className="mb-2">
                <span className="text-3xl md:text-4xl font-bold">
                  ₩{plan.price.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center gap-1.5 mb-6">
                <Sparkles size={14} className="text-accent" />
                <span className="text-sm font-semibold text-accent">{plan.duration}</span>
              </div>

              {/* Features */}
              <ul className="space-y-3 mb-7 text-sm">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="flex-shrink-0">{feature.icon}</span>
                    <div className="flex-1">
                      <span className={feature.emphasis ? 'text-text font-semibold' : 'text-text-secondary'}>
                        {feature.text}
                      </span>
                      {feature.sub && (
                        <p className="text-[11px] text-text-secondary mt-0.5">
                          {feature.sub}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <button
                onClick={() => openPaySheet(plan)}
                disabled={loadingPack !== null}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-1.5 disabled:opacity-60 ${
                  plan.highlight
                    ? 'bg-primary text-white hover:bg-primary-dark'
                    : 'bg-bg text-text hover:bg-primary/10 hover:text-primary border border-border'
                }`}
              >
                {loadingPack === plan.id && <Loader2 size={14} className="animate-spin" />}
                {loadingPack === plan.id ? '결제 진행 중...' : '시작하기'}
                {loadingPack !== plan.id && <ArrowRight size={14} />}
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
              가입만 해도 <span className="text-accent">매일 2회 무료</span> 첨삭!
            </h3>
            <p className="text-sm text-text-secondary">
              먼저 가입해서 매일 2회 무료 첨삭으로 밀리쌤 스타일을 경험해보세요.
              결제는 그 다음에 결정하셔도 늦지 않아요.
            </p>
          </div>
          {!user && (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-accent text-white rounded-lg text-sm font-semibold hover:bg-accent/90 transition-colors no-underline whitespace-nowrap"
            >
              가입하고 시작 <ArrowRight size={14} />
            </Link>
          )}
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

      {/* 💌 결제 후 안내 */}
      <section className="mb-8 bg-yellow-50 border border-yellow-200 rounded-2xl p-5 md:p-6">
        <div className="flex items-start gap-3">
          <span className="text-2xl flex-shrink-0">💌</span>
          <div className="flex-1">
            <p className="text-sm md:text-base font-bold text-text mb-2">
              결제 후 꼭 카카오톡 채널로 알려주세요!
            </p>
            <p className="text-xs md:text-sm text-text-secondary leading-relaxed mb-3">
              자동 알림 시스템 준비 중이라, 결제 후 아래 정보를 카카오톡 채널로 보내주시면
              밀리쌤이 직접 확인하고 플랜을 활성화해드려요.
            </p>
            <div className="bg-surface rounded-xl border border-yellow-200 p-3 mb-3">
              <p className="text-[11px] md:text-xs text-text-secondary mb-2 font-semibold">📋 보내주실 정보</p>
              <ul className="space-y-1 text-xs md:text-sm text-text">
                <li>① 가입한 <strong>이메일 주소</strong></li>
                <li>② <strong>이름</strong></li>
                <li>③ <strong>결제자 이름</strong> (카드 명의자)</li>
              </ul>
            </div>
            <a
              href="http://pf.kakao.com/_xbKxlCX"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FEE500] text-[#3A1D1D] rounded-full text-xs md:text-sm font-bold no-underline hover:opacity-90 transition-opacity"
            >
              💬 카카오톡 채널로 보내기
            </a>
          </div>
        </div>
      </section>

      {/* Trust strip */}
      <section className="text-center pb-12">
        <p className="text-xs text-text-secondary">
          문의: <a href="http://pf.kakao.com/_xbKxlCX" target="_blank" rel="noopener noreferrer" className="text-primary font-medium">카카오톡 채널</a>
        </p>
      </section>

      {/* 💳 결제수단 선택 시트 */}
      {selectedPlan && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedPlan(null)}
        >
          <div
            className="bg-surface w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 md:p-8 animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-1">
              <div>
                <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <CreditCard size={20} className="text-primary" />
                  결제수단 선택
                </h3>
              </div>
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-1 -m-1 text-text-secondary hover:text-text transition-colors"
                aria-label="닫기"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border mb-4">
              <div>
                <p className="text-sm font-medium">{selectedPlan.name}</p>
                <p className="text-xs text-text-secondary mt-0.5">
                  {selectedPlan.duration}
                </p>
              </div>
              <p className="text-xl font-bold">₩{selectedPlan.price.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              {PAY_METHODS.map((method) => (
                <button
                  key={method.id}
                  onClick={() => handlePaymentMethod(method.id)}
                  className={`w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${method.bgClass} ${method.borderClass}`}
                >
                  <span className="text-2xl">{method.icon}</span>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-semibold">{method.label}</p>
                    <p className="text-xs text-text-secondary">{method.desc}</p>
                  </div>
                  <ArrowRight size={16} className="text-text-secondary" />
                </button>
              ))}
            </div>

            <p className="text-[11px] text-text-secondary text-center mt-4">
              🔒 안전한 결제 · 토스페이먼츠 보안 인증
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
