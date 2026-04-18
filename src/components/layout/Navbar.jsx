import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PenLine, Mic, LayoutDashboard, History, LogIn, LogOut, User, Coins, Menu, X, BookText, BookOpen, Users, FileText } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/writing/homework', label: 'Writing', icon: PenLine },
  { to: '/speaking', label: 'Speaking', icon: Mic },
  { to: '/vocab', label: '단어학습', icon: BookText },
  { to: '/store', label: 'E-Book 및 자료실', icon: BookOpen },
  { to: '/mock-test', label: 'Writing Mock Test', icon: FileText },
  { to: '/history', label: '히스토리', icon: History },
  { to: '/community', label: '커뮤니티', icon: Users },
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, profile, signOut, isTeacher } = useAuth()

  // 페이지 이동 시 모바일 메뉴 자동 닫기
  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  const handleSignOut = async () => {
    await signOut()
    setMobileOpen(false)
    navigate('/')
  }

  const NavLink = ({ to, label, icon: Icon, compact }) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center no-underline transition-colors ${
        compact
          ? `px-2.5 py-1.5 rounded-md text-[13px] font-medium ${
              pathname.startsWith(to)
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:text-text hover:bg-gray-100'
            }`
          : `gap-2 px-3 py-2 rounded-lg text-sm ${
              pathname.startsWith(to)
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-gray-100'
            }`
      }`}
    >
      {!compact && Icon && <Icon size={16} />}
      {label}
    </Link>
  )

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary no-underline" onClick={() => setMobileOpen(false)}>
          UpBand
        </Link>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-0.5">
          {navItems.map((item) => (
            <NavLink key={item.to} {...item} compact />
          ))}
          {isTeacher && (
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center px-2.5 py-1.5 rounded-md text-[13px] font-semibold no-underline transition-colors ${
                pathname.startsWith('/dashboard')
                  ? 'bg-accent text-white'
                  : 'text-accent hover:bg-accent/10'
              }`}
            >
              대시보드
            </Link>
          )}

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="flex items-center gap-1 text-xs text-text-secondary bg-bg px-2.5 py-1 rounded-full">
                <Coins size={12} className="text-accent" />
                {profile?.credits ?? 0}
              </span>
              <Link
                to="/mypage"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-text-secondary no-underline hover:bg-gray-100 transition-colors"
              >
                <User size={16} />
                {isTeacher ? (profile?.display_name || '사용자') : '마이페이지'}
              </Link>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1 px-2 py-1.5 rounded-lg text-sm text-text-secondary hover:bg-gray-100 transition-colors"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm border border-primary text-primary no-underline hover:bg-primary hover:text-white transition-colors"
            >
              <LogIn size={16} />
              로그인
            </Link>
          )}
        </div>

        {/* Mobile/Tablet hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-border bg-surface px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
          {isTeacher && (
            <Link
              to="/dashboard"
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold no-underline transition-colors ${
                pathname.startsWith('/dashboard')
                  ? 'bg-accent text-white'
                  : 'text-accent hover:bg-accent/10'
              }`}
            >
              <LayoutDashboard size={16} />
              대시보드
            </Link>
          )}

          <div className="border-t border-border my-2" />

          {user ? (
            <>
              <Link
                to="/mypage"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between px-3 py-2 no-underline rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-2 text-sm text-text-secondary">
                  <User size={16} />
                  {isTeacher ? (profile?.display_name || '사용자') : '마이페이지'}
                </div>
                <span className="flex items-center gap-1 text-xs text-text-secondary bg-bg px-2.5 py-1 rounded-full">
                  <Coins size={12} className="text-accent" />
                  {profile?.credits ?? 0} 크레딧
                </span>
              </Link>
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-error hover:bg-error/5 transition-colors"
              >
                <LogOut size={16} /> 로그아웃
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-primary font-medium no-underline hover:bg-primary/5 transition-colors"
            >
              <LogIn size={16} /> 로그인 / 회원가입
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
