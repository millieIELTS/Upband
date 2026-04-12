import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { PenLine, Mic, LayoutDashboard, History, LogIn, LogOut, User, Coins, Menu, X, BookText, BookOpen, Users } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'

const navItems = [
  { to: '/writing', label: 'Writing', icon: PenLine },
  { to: '/speaking', label: 'Speaking', icon: Mic },
  { to: '/vocab', label: '단어학습', icon: BookText },
  { to: '/store', label: 'E-Book', icon: BookOpen },
  { to: '/community', label: '커뮤니티', icon: Users },
  { to: '/history', label: '히스토리', icon: History },
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

  const NavLink = ({ to, label, icon: Icon }) => (
    <Link
      to={to}
      onClick={() => setMobileOpen(false)}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm no-underline transition-colors ${
        pathname.startsWith(to)
          ? 'bg-primary text-white'
          : 'text-text-secondary hover:bg-gray-100'
      }`}
    >
      <Icon size={16} />
      {label}
    </Link>
  )

  return (
    <nav className="bg-surface border-b border-border sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold text-primary no-underline" onClick={() => setMobileOpen(false)}>
          UpBand
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
          {isTeacher && <NavLink to="/dashboard" label="대시보드" icon={LayoutDashboard} />}

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
                {profile?.display_name || '사용자'}
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

        {/* Mobile hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg text-text-secondary hover:bg-gray-100 transition-colors"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface px-4 py-3 space-y-1">
          {navItems.map((item) => (
            <NavLink key={item.to} {...item} />
          ))}
          {isTeacher && <NavLink to="/dashboard" label="대시보드" icon={LayoutDashboard} />}

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
                  {profile?.display_name || '사용자'}
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
