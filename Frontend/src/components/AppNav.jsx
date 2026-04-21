import { Link, useLocation, useNavigate } from 'react-router-dom'

function NavLink({ to, label, isActive }) {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-xl text-sm font-medium transition whitespace-nowrap ${
        isActive
          ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm'
          : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  )
}

export default function AppNav({ rightActions = null }) {
  const navigate = useNavigate()
  const location = useLocation()
  const teacher = JSON.parse(localStorage.getItem('teacher') || '{}')
  const isAdmin = Boolean(teacher.is_staff || teacher.is_superuser)

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refresh')
    localStorage.removeItem('teacher')
    navigate('/login')
  }

  return (
    <header className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_10px_30px_rgba(15,23,42,0.08)] p-4 md:p-5">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-teal-300 to-transparent" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-600 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-sm">
            S
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900 tracking-wide">SmartLearn Analytics</h1>
            <p className="text-xs text-gray-500">Teacher workspace</p>
          </div>
        </div>

        <nav className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 lg:flex-wrap">
          <NavLink to="/" label="Home" isActive={location.pathname === '/'} />
          <NavLink to="/dashboard" label="Dashboard" isActive={location.pathname.startsWith('/dashboard')} />
          <NavLink to="/records" label="Records" isActive={location.pathname.startsWith('/records')} />
          <NavLink to="/students" label="Students" isActive={location.pathname.startsWith('/students')} />
          {isAdmin && (
            <a
              href="http://127.0.0.1:8000/admin/"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-2 rounded-xl text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition whitespace-nowrap"
            >
              Admin Portal
            </a>
          )}
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:justify-end">
          {rightActions}
          <button
            onClick={handleLogout}
            className="bg-slate-100 text-slate-700 px-3 py-2 rounded-xl text-sm font-medium hover:bg-slate-200 transition whitespace-nowrap"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  )
}
