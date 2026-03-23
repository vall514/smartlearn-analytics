import { useState, useEffect } from 'react'
import StudentRiskCard from './StudentRiskCard'
import RiskStats from './RiskStats'

const API_BASE_URL = 'http://127.0.0.1:8000/api'

export default function RiskDashboard() {
  const [data, setData] = useState({
    at_risk_students: [],
    all_students: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedRisk, setSelectedRisk] = useState('all') // 'all' or 'at-risk'

  useEffect(() => {
    const fetchRiskData = async () => {
      try {
        setLoading(true)
        const response = await fetch(`${API_BASE_URL}/predictions/at-risk-students/`)
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`)
        }
        const result = await response.json()
        setData(result)
        setError(null)
      } catch (err) {
        setError(err.message)
        setData({ at_risk_students: [], all_students: [] })
      } finally {
        setLoading(false)
      }
    }

    fetchRiskData()

    // Refresh data every 30 seconds
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading risk analysis...</p>
          <p className="text-sm text-gray-500 mt-2">Make sure Django backend is running on port 8000</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          <h3 className="font-semibold">Error loading data</h3>
          <p className="text-sm">{error}</p>
          <p className="text-sm mt-2">Make sure the Django server is running on http://127.0.0.1:8000</p>
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
              ? 'border-indigo-600 text-indigo-600'
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
              : 'No student data available yet.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayStudents.map((student) => (
            <StudentRiskCard key={student.student_id} student={student} />
          ))}
        </div>
      )}

      {/* Last Updated */}
      <div className="text-center text-sm text-gray-500 mt-8">
        Data updates automatically every 30 seconds
      </div>
    </div>
  )
}
