import { Link } from 'react-router-dom'
import { LogIn } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

export default function RequireAuth({ children }) {
  const { user, loading } = useAuth()

  if (loading) return null

  if (!user) {
    return (
      <div className="text-center py-20">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <LogIn size={28} className="text-primary" />
        </div>
        <h2 className="text-xl font-bold mb-2">로그인이 필요합니다</h2>
        <p className="text-text-secondary text-sm mb-6">
          이 기능을 이용하려면 먼저 로그인해주세요.
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg font-medium text-sm no-underline hover:bg-primary-dark transition-colors"
        >
          <LogIn size={16} /> 로그인하기
        </Link>
      </div>
    )
  }

  return children
}
