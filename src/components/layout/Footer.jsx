import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* 브랜드 */}
        <div className="mb-6">
          <p className="text-base font-bold text-primary mb-1">UpBand</p>
          <p className="text-xs text-text-secondary">IELTS Writing AI 피드백 · 아이엘츠 올인원 학습 사이트</p>
        </div>

        {/* 사업자 정보 */}
        <div className="text-xs text-text-secondary space-y-1 mb-6">
          <p><span className="text-text font-medium">상호</span> 밀리 에듀케이션 &nbsp;|&nbsp; <span className="text-text font-medium">대표자</span> 박지연</p>
          <p><span className="text-text font-medium">사업자등록번호</span> 567-18-02826</p>
          <p><span className="text-text font-medium">통신판매업신고</span> 제2026-인천미추홀-0496호</p>
          <p><span className="text-text font-medium">주소</span> 인천광역시 미추홀구 길파로27번길 70</p>
          <p><span className="text-text font-medium">이메일</span> milliejiyeon@gmail.com</p>
        </div>

        {/* 카카오 문의 */}
        <a
          href="http://pf.kakao.com/_xbKxlCX"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-yellow-400 hover:bg-yellow-500 text-black text-xs font-medium rounded-lg no-underline transition-colors mb-6"
        >
          <MessageCircle size={14} />
          카카오톡 문의하기
        </a>

        {/* 약관 링크 */}
        <div className="flex flex-wrap gap-4 text-xs text-text-secondary mb-6">
          <Link to="/terms" className="hover:text-primary no-underline transition-colors">이용약관</Link>
          <Link to="/privacy" className="hover:text-primary no-underline transition-colors font-medium">개인정보처리방침</Link>
          <Link to="/refund" className="hover:text-primary no-underline transition-colors">환불/취소 규정</Link>
        </div>

        <p className="text-[11px] text-text-secondary">© 2026 밀리 에듀케이션. All rights reserved.</p>
      </div>
    </footer>
  )
}
