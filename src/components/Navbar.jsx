import { Link, useLocation } from 'react-router-dom'
import { useSwarm } from '../context/SwarmContext'

export default function Navbar() {
  const { pathname } = useLocation()
  const { activeEvent, agents } = useSwarm()
  const activeCount = agents.filter(a => a.status === 'running' || a.status === 'resolving').length

  const links = [
    { to: '/', label: 'Overview' },
    { to: '/agents', label: 'Agents' },
    { to: '/schedule', label: 'Schedule' },
    { to: '/content', label: 'Content' },
    { to: '/emails', label: 'Emails' },
    { to: '/deploy', label: 'Deploy' },
  ]

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
      padding: '0 32px', height: '60px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      background: 'rgba(6,6,8,0.85)', backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, letterSpacing: '-0.5px' }}>
        <span style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', display: 'inline-block', animation: 'pulse 2s infinite' }} />
        SWARM
      </Link>

      <div style={{ display: 'flex', gap: 4 }}>
        {links.map(l => (
          <Link key={l.to} to={l.to} style={{
            padding: '6px 14px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase',
            color: pathname === l.to ? 'var(--accent)' : 'var(--muted)',
            borderBottom: pathname === l.to ? '1px solid var(--accent)' : '1px solid transparent',
            transition: 'all 0.2s',
          }}>{l.label}</Link>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{activeEvent.name}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--accent)', padding: '5px 12px', border: '1px solid rgba(200,255,0,0.3)' }}>
          <span style={{ width: 6, height: 6, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
          {activeCount} active
        </div>
      </div>

      <style>{`@keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }`}</style>
    </nav>
  )
}
