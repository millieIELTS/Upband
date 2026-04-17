import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface mt-16">
      <div className="max-w-5xl mx-auto px-4 py-10">

        {/* 브랜드 */}
        <div className="mb-6">
          <p className="text-base font-bold text-primary mb-1">UpBand</p>
          <p className="text-xs text-text-secondary">IELTS Writing & Speaking AI 피드백 플랫폼</p>
        </div>

        {/* 사업자 정보 */}
        <div className="text-xs text-text-secondary space-y-1 mb-6">
          <p><span className="text-text font-medium">상호</span> 밀리 에듀케이션 &nbsp;|&nbsp; <span className="text-text font-medium">대표자</span> 박지연</p>
          <p><span className="text-text font-medium">사업자등록번호</span> 567-18-02826</p>
          <p><span className="text-text font-medium">통신판매업신고</span> 제2026-인천미추홀-0496호</p>
          <p><span className="text-text font-medium">주소</span> 인천광역시 미추홀구 길파로27번길 70, A동</p>
          <p><span className="text-text font-medium">이메일</span> milliejiyeon@gmail.com</p>
        </div>

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
