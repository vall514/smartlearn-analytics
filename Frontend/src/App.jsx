import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import RiskDashboard from './components/RiskDashboard'
import Students from './pages/Students'
import StudentInsights from './pages/StudentInsights'
import Home from './pages/Home'
import Records from './pages/Records'

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token')
  if (!token) {
    return <Navigate to="/login" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Home />
            </PrivateRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <RiskDashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/records"
          element={
            <PrivateRoute>
              <Records />
            </PrivateRoute>
          }
        />
         <Route path="/students" element={<PrivateRoute><Students /></PrivateRoute>} />
         <Route path="/students/:id/insights" element={<PrivateRoute><StudentInsights /></PrivateRoute>} />
        <Route
          path="*"
          element={<Navigate to={localStorage.getItem('token') ? '/' : '/login'} replace />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App