import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import ContentAgent from './pages/ContentAgent'
import EmailAgent from './pages/EmailAgent'
import SchedulerAgent from './pages/SchedulerAgent'
import Events from './pages/Events'
import Orchestrator from './pages/Orchestrator'
import Analysis from './pages/Analysis'
import EventData from './pages/EventData'
import Login from './pages/Login'
import Register from './pages/Register'
import { AuthProvider, useAuth } from './context/AuthContext'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="bottom-right" toastOptions={{
        style:{ background:'var(--bg-2)', color:'var(--text-1)', border:'1px solid var(--border)', fontFamily:"'JetBrains Mono',monospace", fontSize:'12px' },
        success:{ iconTheme:{ primary:'var(--accent)', secondary:'#000' } },
        error:{ iconTheme:{ primary:'var(--red)', secondary:'#000' } },
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="events"     element={<Events />} />
          <Route path="orchestrator" element={<Orchestrator />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="data" element={<EventData />} />
          <Route path="content"    element={<ContentAgent />} />
          <Route path="email"      element={<EmailAgent />} />
          <Route path="scheduler"  element={<SchedulerAgent />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
