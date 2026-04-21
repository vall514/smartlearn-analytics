import { Link } from 'react-router-dom'
import AppNav from '../components/AppNav'

export default function Home() {
  const teacher = JSON.parse(localStorage.getItem('teacher') || '{}')
  const teacherName = `${teacher.first_name || 'Teacher'} ${teacher.last_name || ''}`.trim()
  const isAdmin = Boolean(teacher.is_staff || teacher.is_superuser)

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-100 p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8 relative">
        <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="pointer-events-none absolute -top-20 right-0 h-64 w-64 rounded-full bg-blue-200/40 blur-3xl" />

        <AppNav />

        <div className="relative overflow-hidden rounded-3xl border border-cyan-100 bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 p-8 md:p-10 shadow-lg">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/20" />
          <div className="absolute right-20 bottom-4 h-20 w-20 rounded-full bg-white/10" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6 items-end">
            <div className="lg:col-span-2">
              <p className="text-cyan-100 text-sm font-semibold tracking-wide uppercase">Teacher Home</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">Welcome back, {teacherName}</h1>
              <p className="text-cyan-50/95 mt-3 max-w-2xl">
                Track learner risk, manage students, and identify weak subjects or topics from one place.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/15 backdrop-blur px-4 py-3 border border-white/20">
                <p className="text-cyan-100 text-xs">Main Hub</p>
                <p className="text-white font-semibold mt-1">Home</p>
              </div>
              <div className="rounded-xl bg-white/15 backdrop-blur px-4 py-3 border border-white/20">
                <p className="text-cyan-100 text-xs">Quick Route</p>
                <p className="text-white font-semibold mt-1">Dashboard</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <Link
            to="/dashboard"
            className="group bg-white/95 border border-teal-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold">D</div>
            <p className="text-sm text-teal-600 font-semibold mt-4">Analytics</p>
            <h2 className="text-xl font-bold text-gray-900 mt-1">Dashboard</h2>
            <p className="text-sm text-gray-600 mt-2">See at-risk learners and monitor class risk trends.</p>
            <p className="text-sm text-teal-700 mt-4 font-medium group-hover:translate-x-1 transition">Open Dashboard -></p>
          </Link>

          <Link
            to="/students"
            className="group bg-white/95 border border-blue-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">S</div>
            <p className="text-sm text-blue-600 font-semibold mt-4">Management</p>
            <h2 className="text-xl font-bold text-gray-900 mt-1">Students</h2>
            <p className="text-sm text-gray-600 mt-2">Add, view, delete students, and open learner insights.</p>
            <p className="text-sm text-blue-700 mt-4 font-medium group-hover:translate-x-1 transition">Open Students -></p>
          </Link>

          <Link
            to="/records"
            className="group bg-white/95 border border-cyan-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
          >
            <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">A</div>
            <p className="text-sm text-cyan-600 font-semibold mt-4">Data Entry</p>
            <h2 className="text-xl font-bold text-gray-900 mt-1">Frontend Records</h2>
            <p className="text-sm text-gray-600 mt-2">Add exams, attendance, assignments, and topic scores from the app.</p>
            <p className="text-sm text-cyan-700 mt-4 font-medium group-hover:translate-x-1 transition">Open Records -></p>
          </Link>

          {isAdmin && (
            <a
              href="http://127.0.0.1:8000/admin/"
              target="_blank"
              rel="noreferrer"
              className="group bg-white/95 border border-cyan-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition"
            >
              <div className="w-10 h-10 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">A</div>
              <p className="text-sm text-cyan-600 font-semibold mt-4">Data Entry</p>
              <h2 className="text-xl font-bold text-gray-900 mt-1">Admin Portal</h2>
              <p className="text-sm text-gray-600 mt-2">Admin-only access to all school records and management tools.</p>
              <p className="text-sm text-cyan-700 mt-4 font-medium group-hover:translate-x-1 transition">Open Admin -></p>
            </a>
          )}
        </div>

        <div className="bg-white/95 rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Suggested workflow</h3>
          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl p-4 border border-cyan-100">
              <p className="font-semibold text-gray-800">1. Register Students</p>
              <p className="text-gray-600 mt-1">Add your class list in the Students page.</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl p-4 border border-cyan-100">
              <p className="font-semibold text-gray-800">2. Set Subjects</p>
              <p className="text-gray-600 mt-1">Create subjects in Admin Portal if you are an admin.</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl p-4 border border-cyan-100">
              <p className="font-semibold text-gray-800">3. Record Performance</p>
              <p className="text-gray-600 mt-1">Use the Records page to enter exams, attendance, assignments, and topic marks.</p>
            </div>
            <div className="bg-gradient-to-br from-slate-50 to-cyan-50 rounded-xl p-4 border border-cyan-100">
              <p className="font-semibold text-gray-800">4. Review Insights</p>
              <p className="text-gray-600 mt-1">Find weak subjects/topics and intervention areas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
