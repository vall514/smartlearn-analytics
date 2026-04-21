import { AlertCircle, TrendingDown, CheckCircle } from 'lucide-react'

export default function StudentRiskCard({ student }) {
  const getRiskColor = (risk) => {
    if (risk >= 3) return 'red'
    if (risk === 2) return 'yellow'
    return 'green'
  }

  const getRiskLabel = (risk) => {
    if (risk >= 3) return 'High Risk'
    if (risk === 2) return 'Medium Risk'
    return 'Low Risk'
  }

  const color = getRiskColor(student.risk_score)
  const colorClasses = {
    red: 'bg-amber-50 border-amber-200 text-amber-900',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-900',
    green: 'bg-green-50 border-green-200 text-green-900',
  }

  const badgeClasses = {
    red: 'bg-amber-100 text-amber-800',
    yellow: 'bg-yellow-100 text-yellow-800',
    green: 'bg-green-100 text-green-800',
  }

  const getIcon = (risk) => {
    if (risk >= 3) return <AlertCircle className="w-5 h-5" />
    if (risk === 2) return <TrendingDown className="w-5 h-5" />
    return <CheckCircle className="w-5 h-5" />
  }

  return (
    <div className={`rounded-lg border-2 p-6 ${colorClasses[color]}`}>
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold">{student.name}</h3>
          <p className="text-sm opacity-75">ID: {student.student_id}</p>
        </div>
        <div className={`rounded-full p-2 ${badgeClasses[color]}`}>
          {getIcon(color)}
        </div>
      </div>

      {/* Risk Badge */}
      <div className="mb-4">
        <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${badgeClasses[color]}`}>
          {getRiskLabel(student.risk_score)}
        </span>
      </div>

      {/* Risk Score Indicator */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Risk Score</span>
          <span className="text-lg font-bold">{student.risk_score}/3</span>
        </div>
        <div className="w-full bg-gray-300 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              color === 'red' ? 'bg-amber-500' : color === 'yellow' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${(student.risk_score / 3) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Exam Score */}
        <div className="bg-white bg-opacity-60 rounded p-3">
          <p className="text-xs opacity-75 mb-1">Avg Exam Score</p>
          <p className="text-xl font-bold">{student.avg_exam_score}</p>
          <p className="text-xs opacity-60 mt-1">/100</p>
        </div>

        {/* Attendance */}
        <div className="bg-white bg-opacity-60 rounded p-3">
          <p className="text-xs opacity-75 mb-1">Attendance Rate</p>
          <p className="text-xl font-bold">{(student.attendance_rate * 100).toFixed(0)}%</p>
        </div>

        {/* Assignments */}
        <div className="bg-white bg-opacity-60 rounded p-3">
          <p className="text-xs opacity-75 mb-1">Assignment Completion</p>
          <p className="text-xl font-bold">{(student.assignment_completion_rate * 100).toFixed(0)}%</p>
        </div>

        {/* Assignment Score */}
        <div className="bg-white bg-opacity-60 rounded p-3">
          <p className="text-xs opacity-75 mb-1">Avg Assignment Score</p>
          <p className="text-xl font-bold">{student.avg_assignment_score}</p>
        </div>
      </div>

      {/* Warning Messages */}
      {student.at_risk && (
        <div className="mt-4 pt-4 border-t border-current border-opacity-20">
          <p className="text-sm font-semibold mb-2">⚠️ Areas of Concern:</p>
          <ul className="text-xs space-y-1 opacity-85">
            {student.avg_exam_score < 50 && (
              <li>• Below average exam performance</li>
            )}
            {student.attendance_rate < 0.8 && (
              <li>• Attendance below 80%</li>
            )}
            {student.assignment_completion_rate < 0.7 && (
              <li>• Low assignment submission rate</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}
