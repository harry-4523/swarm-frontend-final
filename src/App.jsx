import { Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import ContentAgent from './pages/ContentAgent'
import EmailAgent from './pages/EmailAgent'
import SchedulerAgent from './pages/SchedulerAgent'
import Events from './pages/Events'
import Orchestrator from './pages/Orchestrator'
import Analysis from './pages/Analysis'

export default function App() {
  return (
    <>
      <Toaster position="bottom-right" toastOptions={{
        style:{ background:'var(--bg-2)', color:'var(--text-1)', border:'1px solid var(--border)', fontFamily:"'JetBrains Mono',monospace", fontSize:'12px' },
        success:{ iconTheme:{ primary:'var(--accent)', secondary:'#000' } },
        error:{ iconTheme:{ primary:'var(--red)', secondary:'#000' } },
      }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="events"     element={<Events />} />
          <Route path="orchestrator" element={<Orchestrator />} />
          <Route path="analysis" element={<Analysis />} />
          <Route path="content"    element={<ContentAgent />} />
          <Route path="email"      element={<EmailAgent />} />
          <Route path="scheduler"  element={<SchedulerAgent />} />
        </Route>
      </Routes>
    </>
  )
}
