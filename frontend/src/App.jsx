import { Routes, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import HomePage from './pages/HomePage'
import SubjectDetailPage from './pages/SubjectDetailPage'
import JoinPoolPage from './pages/JoinPoolPage'
import RequestTutoringPage from './pages/RequestTutoringPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/materia/:id" element={<SubjectDetailPage />} />
          <Route path="/unirse/:poolId" element={<JoinPoolPage />} />
          <Route path="/solicitar/:materiaId" element={<RequestTutoringPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/registro" element={<RegisterPage />} />
        </Routes>
      </main>
      <Footer />
    </>
  )
}

function Footer() {
  return (
    <footer style={{
      borderTop: '1px solid rgba(159,179,200,0.1)',
      padding: '24px 0',
      textAlign: 'center',
      color: 'var(--color-navy-500)',
      fontSize: '0.8rem',
    }}>
      <div className="container">
        <p>© 2026 TutoPool — Tutorías universitarias inteligentes. Todos los derechos reservados.</p>
      </div>
    </footer>
  )
}
