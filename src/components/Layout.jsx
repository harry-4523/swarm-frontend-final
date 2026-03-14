import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useCursor } from '../hooks/useCursor'
import { useReveal } from '../hooks/useReveal'

const NAV = [
  { to:'/events',        label:'Events'       },
  { to:'/content',       label:'Content Agent', controlRoom: true },
  { to:'/email',         label:'Email Agent', controlRoom: true  },
  { to:'/scheduler',     label:'Scheduler', controlRoom: true   },
  { to:'/orchestrator',  label:'Orchestrator', controlRoom: true },
  { to:'/analysis',      label:'Analysis', controlRoom: true },
]

export default function Layout() {
  const loc = useLocation()
  const navigate = useNavigate()
  const [time, setTime] = useState(new Date())
  useCursor()
  useReveal()
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t) }, [])

  return (
    <div style={S.shell}>
      <aside style={S.sidebar}>
        <div style={S.brand} onClick={() => navigate('/')}>
          <div style={S.brandDot} />
          <span style={S.brandName}>SWARM</span>
          <span style={S.brandBack}>Home</span>
        </div>
        <div style={S.statusRow}>
          <span style={S.statusDot} />
          <span style={S.statusText}>All agents active</span>
        </div>
        <nav style={S.nav}>
          <span style={S.navLabel}>Platform</span>
          {NAV.map(({ to, label, controlRoom }) => {
            const isInControlRoom = loc.pathname.startsWith('/content') || loc.pathname.startsWith('/email') || loc.pathname.startsWith('/scheduler') || loc.pathname.startsWith('/orchestrator')
            if (controlRoom && loc.pathname === '/events') return null // Don't show agent links in Events page
            if (controlRoom && !isInControlRoom && loc.pathname !== '/events') return null // Only show if in control room flow or in events
            return (
              <NavLink key={to} to={to} style={({ isActive }) => ({ ...S.navItem, ...(isActive ? S.navActive : {}) })}>
                {label}
              </NavLink>
            )
          })}
        </nav>
        <div style={S.sideFooter}>
          <div style={S.clockLabel}>System Time</div>
          <div style={S.clock}>{time.toLocaleTimeString([], { hour:'2-digit', minute:'2-digit', second:'2-digit' })}</div>
          <div style={{ ...S.clockLabel, marginTop:10 }}>API Mode</div>
          <div style={{ fontFamily:'var(--font-m)', fontSize:11, color:'var(--green)', marginTop:3 }}>Mock</div>
        </div>
      </aside>
      <main style={S.main} key={loc.pathname} className="page-enter">
        <Outlet />
      </main>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  )
}

const S = {
  shell: { display:'flex', minHeight:'100vh' },
  sidebar: { width:210, background:'var(--bg-1)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', flexShrink:0, position:'sticky', top:0, height:'100vh' },
  brand: { display:'flex', alignItems:'center', gap:9, padding:'20px 20px', borderBottom:'1px solid var(--border)' },
  brandDot: { width:6, height:6, borderRadius:'50%', background:'var(--accent)', animation:'pulse 2.5s infinite', flexShrink:0 },
  brandName: { fontFamily:'var(--font-d)', fontSize:18, letterSpacing:'0.06em' },
  brandBack: { marginLeft:'auto', fontFamily:'var(--font-m)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.1em' },
  statusRow: { display:'flex', alignItems:'center', gap:7, padding:'10px 20px', borderBottom:'1px solid var(--border)' },
  statusDot: { width:5, height:5, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s infinite', flexShrink:0 },
  statusText: { fontFamily:'var(--font-m)', fontSize:10, color:'var(--green)', letterSpacing:'0.06em' },
  nav: { flex:1, padding:'16px 0', display:'flex', flexDirection:'column', gap:0 },
  navLabel: { fontFamily:'var(--font-m)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.2em', textTransform:'uppercase', padding:'6px 20px 10px', display:'block' },
  navItem: { display:'block', padding:'10px 20px', fontSize:13, color:'var(--text-3)', borderLeft:'2px solid transparent', transition:'all 0.15s', textDecoration:'none', fontFamily:'var(--font-b)' },
  navActive: { color:'var(--text-1)', background:'var(--bg-2)', borderLeftColor:'var(--accent)' },
  main: { flex:1, padding:'48px 56px', background:'var(--bg)', overflowY:'auto', minHeight:'100vh' },
  sideFooter: { borderTop:'1px solid var(--border)', padding:'18px 20px' },
  clockLabel: { fontFamily:'var(--font-m)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase' },
  clock: { fontFamily:'var(--font-m)', fontSize:16, color:'var(--accent)', letterSpacing:'0.04em', marginTop:4 },
}
