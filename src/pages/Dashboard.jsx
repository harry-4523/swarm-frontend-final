import { useEffect, useState, useRef, useCallback } from 'react'
import { api } from '../services/api'
import { useNavigate } from 'react-router-dom'
import Loader from '../components/Loader'
import AgentTaskMonitor from '../components/AgentTaskMonitor'
import AgentPerformance from '../components/AgentPerformance'

/* ── Animated number ── */
function AnimNum({ value }) {
  const [display, setDisplay] = useState(0)
  const prev = useRef(0)
  useEffect(() => {
    const from = prev.current, to = typeof value === 'number' ? value : 0
    prev.current = to
    if (from === to) { setDisplay(to); return }
    const dur = 900, start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (to - from) * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value])
  return <span>{typeof value === 'string' ? value : display.toLocaleString()}</span>
}

/* ── Stat card with hover 3D tilt ── */
function StatCard({ label, value, change, index }) {
  const ref = useRef()
  const glowRef = useRef()

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 14
    const y = ((e.clientY - r.top) / r.height - 0.5) * -14
    ref.current.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) translateZ(4px)`
    // Glow follows mouse
    const gx = e.clientX - r.left
    const gy = e.clientY - r.top
    glowRef.current.style.background = `radial-gradient(200px at ${gx}px ${gy}px, rgba(232,255,71,0.07), transparent 80%)`
  }
  const onLeave = () => {
    ref.current.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0)'
    glowRef.current.style.background = 'transparent'
  }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={SC.card}
      className="stat-card-enter"
      data-index={index}>
      {/* Mouse glow */}
      <div ref={glowRef} style={SC.glow} />
      {/* Top accent line — grows on mount */}
      <div style={SC.topLine} className={`stat-line-${index}`} />
      <div style={SC.label}>{label}</div>
      <div style={SC.value}><AnimNum value={value} /></div>
      {change && <div style={SC.change}>{change}</div>}
    </div>
  )
}

const SC = {
  card: { background:'#0F0F11', border:'1px solid rgba(255,255,255,0.06)', padding:'28px 32px', position:'relative', overflow:'hidden', transition:'transform 0.4s cubic-bezier(0.16,1,0.3,1), border-color 0.2s', transformStyle:'preserve-3d', willChange:'transform', cursor:'none' },
  glow: { position:'absolute', inset:0, pointerEvents:'none', transition:'background 0.15s', zIndex:0 },
  topLine: { position:'absolute', top:0, left:0, height:'2px', background:'var(--accent)', width:'0%', transition:'width 0.8s cubic-bezier(0.16,1,0.3,1)' },
  label: { fontFamily:'var(--font-m)', fontSize:10, color:'rgba(255,255,255,0.3)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:12, position:'relative', zIndex:1 },
  value: { fontFamily:'var(--font-d)', fontSize:52, letterSpacing:'0.02em', lineHeight:1, color:'var(--accent)', position:'relative', zIndex:1 },
  change: { fontFamily:'var(--font-m)', fontSize:11, color:'rgba(255,255,255,0.35)', marginTop:8, position:'relative', zIndex:1 },
}

/* ── Agent row ── */
function AgentRow({ agent, onClick, index }) {
  const [hov, setHov] = useState(false)
  const ref = useRef()
  const glowRef = useRef()

  const onMove = (e) => {
    if (!glowRef.current) return
    const r = ref.current.getBoundingClientRect()
    glowRef.current.style.background = `radial-gradient(300px at ${e.clientX - r.left}px ${e.clientY - r.top}px, rgba(232,255,71,0.04), transparent 70%)`
  }
  const onLeave = () => {
    if (glowRef.current) glowRef.current.style.background = 'transparent'
    setHov(false)
  }

  const STATUS = {
    running:   { label:'Running',   color:'#E8FF47' },
    complete:  { label:'Complete',  color:'#3DCC78' },
    resolving: { label:'Resolving', color:'#F5A623' },
    idle:      { label:'Idle',      color:'rgba(255,255,255,0.2)' },
    error:     { label:'Error',     color:'#EF5050' },
  }
  const st = STATUS[agent.status] || STATUS.idle

  return (
    <div ref={ref}
      style={{ ...AR.row, borderColor: hov ? 'rgba(232,255,71,0.18)' : 'rgba(255,255,255,0.055)', background: hov ? '#131315' : '#0F0F11' }}
      onMouseEnter={() => setHov(true)}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      className="agent-row-enter"
      data-delay={index * 0.1}>
      <div ref={glowRef} style={AR.glow} />

      {/* Left: name + task */}
      <div style={AR.left}>
        <div style={AR.name}>{agent.name}</div>
        <div style={AR.task}>{agent.task}</div>
      </div>

      {/* Center: progress bar */}
      <div style={AR.barSection}>
        <div style={AR.barBg}>
          <div style={{ ...AR.barFg, width: agent.progress + '%',
            background: agent.status === 'complete' ? '#3DCC78' : agent.status === 'resolving' ? '#F5A623' : '#E8FF47'
          }} />
        </div>
        <span style={{ ...AR.pct, color: agent.status === 'complete' ? '#3DCC78' : agent.status === 'resolving' ? '#F5A623' : '#E8FF47' }}>
          {agent.progress}%
        </span>
      </div>

      {/* Right: status badge */}
      <div style={{ ...AR.badge, borderColor: st.color + '44', color: st.color }}>
        <span style={{ width:5, height:5, borderRadius:'50%', background:st.color, display:'inline-block', marginRight:6,
          ...(agent.status === 'running' ? { animation:'pulse 1.5s infinite' } : {}) }} />
        {st.label}
      </div>
    </div>
  )
}

const AR = {
  row: { padding:'22px 28px', border:'1px solid', transition:'all 0.2s', cursor:'none', display:'grid', gridTemplateColumns:'1fr 320px auto', gap:32, alignItems:'center', position:'relative', overflow:'hidden' },
  glow: { position:'absolute', inset:0, pointerEvents:'none', zIndex:0, transition:'background 0.15s' },
  left: { position:'relative', zIndex:1 },
  name: { fontSize:15, fontWeight:600, letterSpacing:'-0.02em', marginBottom:4 },
  task: { fontFamily:'var(--font-m)', fontSize:11, color:'rgba(255,255,255,0.3)', lineHeight:1.5 },
  barSection: { display:'flex', alignItems:'center', gap:14, position:'relative', zIndex:1 },
  barBg: { flex:1, height:2, background:'rgba(255,255,255,0.06)', borderRadius:1 },
  barFg: { height:'100%', borderRadius:1, transition:'width 0.8s cubic-bezier(0.16,1,0.3,1)' },
  pct: { fontFamily:'var(--font-m)', fontSize:11, letterSpacing:'0.04em', width:36, textAlign:'right', flexShrink:0 },
  badge: { fontFamily:'var(--font-m)', fontSize:10, letterSpacing:'0.06em', border:'1px solid', padding:'5px 14px', display:'flex', alignItems:'center', flexShrink:0, position:'relative', zIndex:1 },
}

/* ── Feed item ── */
function FeedItem({ item, index }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { const t = setTimeout(() => setVis(true), index * 80); return () => clearTimeout(t) }, [index])
  return (
    <div style={{ ...FD.item, opacity: vis ? 1 : 0, transform: vis ? 'translateX(0)' : 'translateX(12px)', transition:'all 0.4s cubic-bezier(0.16,1,0.3,1)' }}>
      <span style={FD.time}>{item.time}</span>
      <div style={{ ...FD.dot, background: item.color }} />
      <span style={FD.text}>{item.text}</span>
    </div>
  )
}
const FD = {
  item: { display:'flex', gap:10, alignItems:'flex-start' },
  time: { fontFamily:'var(--font-m)', fontSize:10, color:'rgba(255,255,255,0.18)', width:26, flexShrink:0, paddingTop:4, letterSpacing:'0.04em' },
  dot: { width:5, height:5, borderRadius:'50%', flexShrink:0, marginTop:6 },
  text: { fontSize:12, color:'rgba(255,255,255,0.45)', lineHeight:1.65 },
}

/* ── DASHBOARD ── */
export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [agents, setAgents] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()
  const ROUTES = { content:'/content', email:'/email', scheduler:'/scheduler', orchestrator:'/dashboard' }

  useEffect(() => {
    Promise.all([api.getStats(), api.getAgents(), api.getActivity()])
      .then(([s,a,ac]) => { setStats(s); setAgents(a.agents); setActivity(ac.feed) })
      .finally(() => { setLoading(false); setTimeout(() => setMounted(true), 50) })
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      api.getAgents().then(a => setAgents(a.agents))
      api.getActivity().then(a => setActivity(a.feed))
    }, 5000)
    return () => clearInterval(t)
  }, [])

  // Animate top lines after mount
  useEffect(() => {
    if (!mounted) return
    document.querySelectorAll('[class^="stat-line-"]').forEach((el, i) => {
      setTimeout(() => { el.style.width = '100%' }, i * 120 + 200)
    })
  }, [mounted])

  return (
    <div>
      {/* Page header */}
      <div style={D.header}>
        <div>
          <div style={D.eyeRow}>
            <span style={D.eyeN}>01</span>
            <span style={D.eyeT}>Control Room</span>
          </div>
          <h1 style={D.h1}>Swarm Overview</h1>
          <p style={D.sub}>Real-time status across all agents. Click any row to manage tasks.</p>
        </div>
        <div style={D.liveChip}>
          <span style={D.liveDot} />
          Live
        </div>
      </div>

      {loading ? <Loader label="Waking agents..." /> : (
        <>
          {/* Stats grid */}
          <div style={D.statsGrid}>
            {[
              { label:'Participants',        value: stats.participants,    change:'↑ +142 today' },
              { label:'Emails Sent',         value: stats.emails_sent,     change:'98.4% delivered' },
              { label:'Conflicts Resolved',  value: stats.conflicts_resolved, change:'All auto-resolved' },
              { label:'Posts Queued',        value: stats.posts_queued,    change:'3 new today' },
            ].map((s, i) => (
              <StatCard key={i} index={i} label={s.label} value={s.value} change={s.change} />
            ))}
          </div>

          {/* Main content */}
          <div style={D.mainGrid}>
            {/* Agents */}
            <div>
              <div style={D.colLabel}>Active Agents</div>
              <div style={D.agentList}>
                {agents.map((a, i) => (
                  <AgentRow key={a.id} agent={a} index={i} onClick={() => navigate(ROUTES[a.id] || '/dashboard')} />
                ))}
              </div>
            </div>

            {/* Feed */}
            <div>
              <div style={D.colLabel}>Activity Feed</div>
              <div style={D.feedCard}>
                <div style={D.feedHeader}>
                  <span style={D.feedTitle}>Recent Activity</span>
                  <div style={D.feedLive}><span style={D.feedDot} />Live</div>
                </div>
                <div style={D.feedList}>
                  {activity.map((item, i) => <FeedItem key={item.id || i} item={item} index={i} />)}
                </div>
              </div>
            </div>
          </div>

          {/* Management Sections */}
          <div style={{ marginTop: 40 }}>
            <AgentTaskMonitor />
          </div>

          <div style={{ marginTop: 32 }}>
            <AgentPerformance />
          </div>
        </>
      )}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.3} }
        .stat-card-enter { animation: card-in 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        .stat-card-enter[data-index="0"] { animation-delay: 0.05s; }
        .stat-card-enter[data-index="1"] { animation-delay: 0.12s; }
        .stat-card-enter[data-index="2"] { animation-delay: 0.19s; }
        .stat-card-enter[data-index="3"] { animation-delay: 0.26s; }
        @keyframes card-in { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .agent-row-enter { animation: row-in 0.5s cubic-bezier(0.16,1,0.3,1) both; }
        .agent-row-enter[data-delay="0"]   { animation-delay:0.3s; }
        .agent-row-enter[data-delay="0.1"] { animation-delay:0.4s; }
        .agent-row-enter[data-delay="0.2"] { animation-delay:0.5s; }
        .agent-row-enter[data-delay="0.3"] { animation-delay:0.6s; }
        @keyframes row-in { from{opacity:0;transform:translateX(-16px)} to{opacity:1;transform:translateX(0)} }
        .stat-card-enter:hover { border-color: rgba(232,255,71,0.2) !important; }
      `}</style>
    </div>
  )
}

const D = {
  header: { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:40, paddingBottom:32, borderBottom:'1px solid rgba(255,255,255,0.055)' },
  eyeRow: { display:'flex', alignItems:'center', gap:10, marginBottom:12 },
  eyeN:   { fontFamily:'var(--font-m)', fontSize:11, color:'var(--accent)', letterSpacing:'0.1em' },
  eyeT:   { fontFamily:'var(--font-m)', fontSize:10, color:'rgba(255,255,255,0.2)', letterSpacing:'0.18em', textTransform:'uppercase' },
  h1:     { fontFamily:'var(--font-d)', fontSize:48, letterSpacing:'0.02em', lineHeight:0.95, marginBottom:10 },
  sub:    { fontSize:13, color:'rgba(255,255,255,0.35)', fontWeight:300 },
  liveChip: { display:'flex', alignItems:'center', gap:7, padding:'8px 16px', border:'1px solid rgba(61,204,120,0.2)', background:'rgba(61,204,120,0.05)', fontFamily:'var(--font-m)', fontSize:11, color:'#3DCC78', letterSpacing:'0.08em' },
  liveDot: { width:6, height:6, borderRadius:'50%', background:'#3DCC78', animation:'pulse 1.8s infinite', display:'inline-block' },

  statsGrid: { display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:24 },
  mainGrid:  { display:'grid', gridTemplateColumns:'1fr 300px', gap:20 },
  colLabel:  { fontFamily:'var(--font-m)', fontSize:9, color:'rgba(255,255,255,0.2)', letterSpacing:'0.2em', textTransform:'uppercase', marginBottom:12, display:'block' },
  agentList: { display:'flex', flexDirection:'column', gap:10 },

  feedCard: { background:'#0F0F11', border:'1px solid rgba(255,255,255,0.055)', padding:'20px', height:'100%' },
  feedHeader: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, paddingBottom:14, borderBottom:'1px solid rgba(255,255,255,0.055)' },
  feedTitle: { fontSize:13, fontWeight:500 },
  feedLive: { display:'flex', alignItems:'center', gap:5, fontFamily:'var(--font-m)', fontSize:10, color:'#3DCC78' },
  feedDot: { width:5, height:5, borderRadius:'50%', background:'#3DCC78', display:'inline-block', animation:'pulse 2s infinite' },
  feedList: { display:'flex', flexDirection:'column', gap:14 },
}
