import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores/authStore'
import Layout from './components/Layout'
import HomePage from './pages/HomePage'
import EstimatesPage from './pages/EstimatesPage'
import ConsultationPage from './pages/ConsultationPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'

function App() {
  const { isAuthenticated } = useAuthStore()

  if (!isAuthenticated) {
    return <LoginPage />
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/estimates" element={<EstimatesPage />} />
        <Route path="/consultation" element={<ConsultationPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

export default App