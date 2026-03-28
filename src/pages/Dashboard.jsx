import { LayoutDashboard } from 'lucide-react'

export default function Dashboard() {
  return (
    <div className="text-center py-16">
      <LayoutDashboard size={48} className="text-text-secondary mx-auto mb-4" />
      <h1 className="text-2xl font-bold mb-2">Teacher 대시보드</h1>
      <p className="text-text-secondary">
        강사 권한이 필요합니다. 관리자에게 문의해주세요.
      </p>
    </div>
  )
}
