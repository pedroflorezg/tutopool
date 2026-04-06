import { Routes, Route, Link } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import SubjectDetailPage from './pages/SubjectDetailPage'
import JoinPoolPage from './pages/JoinPoolPage'
import RequestTutoringPage from './pages/RequestTutoringPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import AdminPage from './pages/AdminPage'
import AuthCallbackPage from './pages/AuthCallbackPage'
import TutorLoginPage from './pages/TutorLoginPage'
import TutorRegisterPage from './pages/TutorRegisterPage'
import TutorDashboard from './pages/TutorDashboard'
import StudentDashboard from './pages/StudentDashboard'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/"                    element={<HomePage />} />
          <Route path="/materia/:id"         element={<SubjectDetailPage />} />
          <Route path="/unirse/:poolId"      element={<JoinPoolPage />} />
          <Route path="/solicitar/:materiaId" element={<RequestTutoringPage />} />
          <Route path="/login"              element={<LoginPage />} />
          <Route path="/registro"           element={<RegisterPage />} />
          <Route path="/tutor/login"        element={<TutorLoginPage />} />
          <Route path="/tutor/registro"     element={<TutorRegisterPage />} />
          <Route path="/tutor/dashboard"    element={<TutorDashboard />} />
          <Route path="/mis-tutorias"       element={<StudentDashboard />} />
          <Route path="/admin"              element={<AdminPage />} />
          <Route path="/auth/callback"    element={<AuthCallbackPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

function NotFoundPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--color-gray-200)', fontFamily: 'var(--font-heading)', lineHeight: 1 }}>404</p>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.3rem', fontWeight: 700, color: 'var(--color-gray-900)', margin: '12px 0 6px' }}>
          Página no encontrada
        </h1>
        <p style={{ color: 'var(--color-gray-500)', fontSize: '0.9rem', marginBottom: '24px' }}>
          La dirección que buscas no existe.
        </p>
        <Link to="/" className="btn btn-primary">Ir al inicio</Link>
      </div>
    </div>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid var(--color-gray-200)',
      padding: '32px 0',
      background: 'white',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '0.9rem', color: 'var(--color-gray-900)' }}>TutoPool</span>
        <p style={{ color: 'var(--color-gray-400)', fontSize: '0.78rem' }}>© 2026 Universidad EIA · Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
