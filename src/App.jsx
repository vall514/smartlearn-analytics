import { useState, useEffect } from 'react'
import './App.css'
import RiskDashboard from './components/RiskDashboard'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">SmartLearn Analytics</h1>
          <p className="text-gray-600 mt-2">Learning Analytics & Risk Prediction Dashboard</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <RiskDashboard />
      </main>
    </div>
  )
}

export default App
