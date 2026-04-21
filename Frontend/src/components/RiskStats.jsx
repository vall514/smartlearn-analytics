import { Users, AlertTriangle, TrendingUp } from 'lucide-react'

export default function RiskStats({ stats }) {
  const statCards = [
    {
      title: 'Total Students',
      value: stats.total,
      icon: <Users className="w-8 h-8" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-900',
      iconColor: 'text-blue-600',
    },
    {
      title: 'At-Risk Students',
      value: stats.atRisk,
      icon: <AlertTriangle className="w-8 h-8" />,
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      textColor: 'text-amber-900',
      iconColor: 'text-amber-600',
    },
    {
      title: 'Risk Rate',
      value: `${stats.riskPercentage}%`,
      icon: <TrendingUp className="w-8 h-8" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      textColor: 'text-yellow-900',
      iconColor: 'text-yellow-600',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {statCards.map((stat, idx) => (
        <div
          key={idx}
          className={`${stat.bgColor} border-2 ${stat.borderColor} rounded-lg p-6`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium opacity-75 mb-2 ${stat.textColor}`}>
                {stat.title}
              </p>
              <p className={`text-3xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div className={`${stat.iconColor}`}>
              {stat.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
