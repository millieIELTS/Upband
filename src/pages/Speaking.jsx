import { Link } from 'react-router-dom'
import { Volume2, Eye, MessageSquare, Mic } from 'lucide-react'

export default function Speaking() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">스피킹 연습</h1>
      <p className="text-text-secondary mb-6">Part를 선택하세요.</p>

      {/* 녹음 권장 안내 */}
      <div className="max-w-3xl bg-primary/5 border border-primary/20 rounded-xl p-4 mb-6 flex items-start gap-3">
        <Mic size={18} className="text-primary mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-medium text-primary">혼자 연습하실 때는 꼭 휴대폰·녹음기로 본인 답변을 녹음해보세요!</p>
          <p className="text-xs text-text-secondary mt-0.5 leading-relaxed">
            말한 걸 다시 들어보면 발음·연결어·자주 쓰는 표현의 습관이 보여요. 약점 잡는 가장 빠른 방법이에요.
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 max-w-3xl">
        <Link
          to="/speaking/part1"
          className="group bg-surface rounded-2xl border border-border p-6 no-underline text-left hover:border-primary hover:shadow-lg transition-all"
        >
          <Volume2 size={28} className="text-primary mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Part 1</h2>
          <p className="text-text-secondary text-sm">
            질문 음성을 듣고 바로 답변해보세요. 일상적인 주제에 대한 짧은 답변입니다.
          </p>
        </Link>

        <Link
          to="/speaking/part2"
          className="group bg-surface rounded-2xl border border-border p-6 no-underline text-left hover:border-primary hover:shadow-lg transition-all"
        >
          <Eye size={28} className="text-primary mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Part 2</h2>
          <p className="text-text-secondary text-sm">
            주제 카드를 보고 1분간 준비한 뒤 2분 스피치를 이어가보세요.
          </p>
        </Link>

        <Link
          to="/speaking/part3"
          className="group bg-surface rounded-2xl border border-border p-6 no-underline text-left hover:border-primary hover:shadow-lg transition-all"
        >
          <MessageSquare size={28} className="text-primary mb-3" />
          <h2 className="text-lg font-semibold text-text mb-2">Part 3</h2>
          <p className="text-text-secondary text-sm">
            질문 음성을 듣고 심화 답변을 해보세요. Part 2 주제와 연관된 토론형 질문입니다.
          </p>
        </Link>
      </div>
    </div>
  )
}
