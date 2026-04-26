import { CreditCard, X, ArrowRight } from 'lucide-react'

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

export default function PaymentMethodSheet({
  open,
  onClose,
  onSelect,
  itemName,
  itemDesc,
  amount,
}) {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-surface w-full md:max-w-md rounded-t-3xl md:rounded-3xl p-6 md:p-8 animate-in slide-in-from-bottom duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-1">
          <h3 className="text-lg md:text-xl font-bold flex items-center gap-2">
            <CreditCard size={20} className="text-primary" />
            결제수단 선택
          </h3>
          <button
            onClick={onClose}
            className="p-1 -m-1 text-text-secondary hover:text-text transition-colors"
            aria-label="닫기"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between py-3 border-b border-border mb-4">
          <div>
            <p className="text-sm font-medium">{itemName}</p>
            {itemDesc && <p className="text-xs text-text-secondary mt-0.5">{itemDesc}</p>}
          </div>
          <p className="text-xl font-bold">₩{amount.toLocaleString()}</p>
        </div>

        <div className="space-y-2">
          {PAY_METHODS.map((method) => (
            <button
              key={method.id}
              onClick={() => onSelect(method.id)}
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
  )
}
