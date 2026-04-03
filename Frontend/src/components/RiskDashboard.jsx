import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import StudentRiskCard from './StudentRiskCard'
import RiskStats from './RiskStats'
import { getAtRiskStudents } from '../utils/api'

export default function RiskDashboard() {
  const navigate = useNavigate()
  const [data, setData] = useState({
    at_risk_students: [],
    all_students: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRisk, setSelectedRisk] = useState('all')

  // Get teacher name from localStorage
  const teacher = JSON.parse(localStorage.getItem('teacher') || '{}')

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('teacher')
    navigate('/login')
  }

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true)
        const response = await getAtRiskStudents()
        setData({
          at_risk_students: response.data.at_risk_students || [],
          all_students: response.data.all_students || [],
        })
        setError(null)
      } catch (err) {
        if (err.response?.status === 401) {
          // Token expired or invalid → send to login
          localStorage.removeItem('token')
          localStorage.removeItem('teacher')
          navigate('/login')
        } else {
          setError(err.message)
        }
        setData({ at_risk_students: [], all_students: [] })
      } finally {
        setLoading(false)
      }
    }

    fetchRiskData()
    const interval = setInterval(fetchRiskData, 30000)
    return () => clearInterval(interval)
  }, [])

  const displayStudents = selectedRisk === 'at-risk' ? data.at_risk_students : data.all_students
  const riskStats = {
    total: data.all_students.length,
    atRisk: data.at_risk_students.length,
    riskPercentage: data.all_students.length > 0
      ? Math.round((data.at_risk_students.length / data.all_students.length) * 100)
      : 0,
  }

  if (loading && data.all_students.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
   
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 space-y-8">
      {/* Header with teacher name and logout */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
          <p className="text-gray-500 text-sm">
            Welcome, {teacher.first_name} {teacher.last_name}
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="bg-red-50 text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-100 transition"
        >
          Sign Out
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h3 className="font-semibold">Error loading data</h3>
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Risk Statistics Cards */}
      <RiskStats stats={riskStats} />

      {/* Filter Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setSelectedRisk('all')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedRisk === 'all'
              ? 'border-teal-600 text-teal-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          All Students ({data.all_students.length})
        </button>
        <button
          onClick={() => setSelectedRisk('at-risk')}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            selectedRisk === 'at-risk'
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-600 hover:text-gray-900'
          }`}
        >
          At-Risk Students ({data.at_risk_students.length})
        </button>
      </div>

      {/* Students Grid */}
      {displayStudents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            {selectedRisk === 'at-risk'
              ? 'No at-risk students found. Great job!'
              : 'No students added yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayStudents.map((student) => (
            <StudentRiskCard key={student.student_id} student={student} />
          ))}
        </div>
      )}

      <div className="text-center text-sm text-gray-500 mt-8">
        Data updates automatically every 30 seconds
      </div>
    </div>
  )
}