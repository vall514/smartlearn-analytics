import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getStudentInsights } from '../utils/api'
import AppNav from '../components/AppNav'

export default function StudentInsights() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [insights, setInsights] = useState(null)

  useEffect(() => {
    const fetchInsights = async () => {
      try {
        setLoading(true)
        const response = await getStudentInsights(id)
        setInsights(response.data)
        setError('')
      } catch (err) {
        if (err.response?.status === 401) {
          localStorage.removeItem('token')
          localStorage.removeItem('refresh')
          localStorage.removeItem('teacher')
          navigate('/login')
          return
        }
        setError(err.response?.data?.detail || 'Failed to load student insights.')
      } finally {
        setLoading(false)
      }
    }

    fetchInsights()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 space-y-6">
        <AppNav />
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-teal-600 mx-auto"></div>
            <p className="text-gray-600 mt-3">Loading insights...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 space-y-6">
        <AppNav />
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-amber-800">{error}</div>
      </div>
    )
  }

  const student = insights?.student || {}
  const attendance = insights?.attendance || {}
  const assignments = insights?.assignments || {}
  const termPerformance = insights?.term_performance || []
  const weakSubjects = insights?.weak_subjects || []
  const weakTopics = insights?.weak_topics || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8 space-y-6">
      <AppNav />

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Student Insights</h1>
          <p className="text-sm text-gray-600">
            {student.name} ({student.admission_number}) - {student.student_class} {student.stream ? `| ${student.stream}` : ''}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Attendance Rate</p>
          <p className="text-2xl font-semibold text-gray-900">{Math.round((attendance.attendance_rate || 0) * 100)}%</p>
          <p className="text-xs text-gray-500 mt-1">Present {attendance.present_days || 0} of {attendance.total_days || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Assignment Completion</p>
          <p className="text-2xl font-semibold text-gray-900">{Math.round((assignments.completion_rate || 0) * 100)}%</p>
          <p className="text-xs text-gray-500 mt-1">Submitted {assignments.submitted || 0} of {assignments.total || 0}</p>
        </div>
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <p className="text-sm text-gray-500">Late Submission Rate</p>
          <p className="text-2xl font-semibold text-gray-900">{Math.round((assignments.late_submission_rate || 0) * 100)}%</p>
          <p className="text-xs text-gray-500 mt-1">Lower is better</p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Exam Performance by Term</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {termPerformance.map((term) => (
            <div key={term.term} className="rounded-lg border border-gray-200 p-4">
              <p className="text-sm text-gray-500">{term.term}</p>
              <p className="text-xl font-semibold text-gray-900 mt-1">
                {term.average_score === null ? 'No data' : `${term.average_score}%`}
              </p>
              <p className="text-xs text-gray-500 mt-1">Exams: {term.exam_count}</p>
              {term.subject_breakdown.length > 0 && (
                <div className="mt-3 space-y-1 text-sm">
                  {term.subject_breakdown.map((item) => (
                    <div key={`${term.term}-${item.subject}`} className="flex justify-between text-gray-700">
                      <span>{item.subject}</span>
                      <span>{item.average_score}%</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Weak Subjects</h2>
          {weakSubjects.length === 0 ? (
            <p className="text-sm text-gray-500">No weak subjects identified yet.</p>
          ) : (
            <div className="space-y-2">
              {weakSubjects.map((subject) => (
                <div key={subject.subject} className="flex justify-between rounded-lg bg-amber-50 px-3 py-2 text-sm">
                  <span className="text-gray-800">{subject.subject}</span>
                  <span className="font-medium text-amber-700">{subject.average_score}%</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Weak Topics</h2>
          {weakTopics.length === 0 ? (
            <p className="text-sm text-gray-500">No weak topics identified yet.</p>
          ) : (
            <div className="space-y-2 max-h-72 overflow-auto">
              {weakTopics.map((topic, idx) => (
                <div key={`${topic.subject}-${topic.topic}-${idx}`} className="rounded-lg bg-rose-50 px-3 py-2 text-sm">
                  <p className="font-medium text-gray-900">{topic.subject} - {topic.topic}</p>
                  <p className="text-rose-700">Score: {topic.score_percentage}%</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
