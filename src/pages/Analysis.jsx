import { useEffect, useState, useRef } from 'react'
import { useSwarm } from '../context/SwarmContext'
import PageHeader from '../components/PageHeader'

/* ── Animated Counter ── */
function AnimCounter({ value, duration = 1200 }) {
  const [display, setDisplay] = useState(0)
  const prevRef = useRef(0)

  useEffect(() => {
    const from = prevRef.current
    const to = typeof value === 'number' ? value : 0
    prevRef.current = to

    if (from === to) {
      setDisplay(to)
      return
    }

    const start = performance.now()
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(from + (to - from) * ease))
      if (p < 1) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  }, [value, duration])

  return <span>{typeof value === 'string' ? value : display.toLocaleString()}</span>
}

/* ── Stat Card with 3D Tilt ── */
function StatCard({ label, value, change, index }) {
  const ref = useRef()
  const glowRef = useRef()

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 14
    const y = ((e.clientY - r.top) / r.height - 0.5) * -14
    ref.current.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) translateZ(4px)`
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
      <div ref={glowRef} style={SC.glow} />
      <div style={SC.topLine} className={`stat-line-${index}`} />
      <div style={SC.label}>{label}</div>
      <div style={SC.value}><AnimCounter value={value} /></div>
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

/* ── Metric Card ── */
function MetricCard({ label, value, description }) {
  const ref = useRef()
  const glowRef = useRef()

  const onMove = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 12
    const y = ((e.clientY - r.top) / r.height - 0.5) * -12
    ref.current.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) translateZ(2px)`
    const gx = e.clientX - r.left
    const gy = e.clientY - r.top
    glowRef.current.style.background = `radial-gradient(150px at ${gx}px ${gy}px, rgba(232,255,71,0.08), transparent 80%)`
  }
  const onLeave = () => {
    ref.current.style.transform = 'perspective(600px) rotateX(0) rotateY(0) translateZ(0)'
    glowRef.current.style.background = 'transparent'
  }

  return (
    <div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={S.metricCard}
      className="metric-card-enter"
    >
      <div ref={glowRef} style={S.metricGlow} />
      <div style={S.metricValue}>
        <AnimCounter value={value} />
      </div>
      <div style={S.metricLabel}>{label}</div>
      {description && <div style={S.metricDesc}>{description}</div>}
    </div>
  )
}

/* ── Agent Task Monitor Table ── */
function AgentTaskMonitorTable() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      agent: 'Content Agent',
      taskName: 'Generate Social Posts',
      status: 'completed',
      progress: 100,
      startTime: '10:30 AM',
      totalCompleted: 42
    },
    {
      id: 2,
      agent: 'Email Agent',
      taskName: 'Send Batch 1 Invitations',
      status: 'running',
      progress: 65,
      startTime: '10:48 AM',
      totalCompleted: 156
    },
    {
      id: 3,
      agent: 'Scheduler Agent',
      taskName: 'Timeline Conflict Detection',
      status: 'running',
      progress: 40,
      startTime: '10:50 AM',
      totalCompleted: 8
    },
    {
      id: 4,
      agent: 'Event Agent',
      taskName: 'Create Event & Posters',
      status: 'pending',
      progress: 0,
      startTime: null,
      totalCompleted: 1
    }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.status === 'running' && task.progress < 100) {
          const newProgress = Math.min(task.progress + Math.random() * 5, 99)
          return { ...task, progress: Math.round(newProgress) }
        }
        return task
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#3DCC78'
      case 'running': return '#E8FF47'
      case 'pending': return 'rgba(255,255,255,0.2)'
      case 'failed': return '#EF5050'
      default: return 'rgba(255,255,255,0.3)'
    }
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed': return 'Done'
      case 'running': return 'Working'
      case 'pending': return 'Queued'
      case 'failed': return 'Failed'
      default: return 'Unknown'
    }
  }

  const completedCount = tasks.filter(t => t.status === 'completed').length
  const inProgressCount = tasks.filter(t => t.status === 'running').length
  const queuedCount = tasks.filter(t => t.status === 'pending').length
  const totalProcessed = tasks.reduce((sum, t) => sum + t.totalCompleted, 0)

  return (
    <div style={S.monitorBox}>
      <div style={S.monitorHeader}>
        <div style={S.monitorTitle}>Agent Task Monitor</div>
        <div style={S.monitorSubtitle}>Real-time tracking of all agent activities</div>
      </div>

      <div style={S.table}>
        <div style={S.tableHeader}>
          <div style={{ ...S.headerCol, flex: '0 0 140px' }}>Agent</div>
          <div style={{ ...S.headerCol, flex: '1' }}>Task</div>
          <div style={{ ...S.headerCol, flex: '0 0 140px' }}>Progress</div>
          <div style={{ ...S.headerCol, flex: '0 0 100px' }}>Status</div>
          <div style={{ ...S.headerCol, flex: '0 0 100px' }}>Time</div>
          <div style={{ ...S.headerCol, flex: '0 0 110px', textAlign: 'right' }}>Completed</div>
        </div>

        <div style={S.tableBody}>
          {tasks.map((task, idx) => (
            <div key={task.id} style={{ ...S.row, backgroundColor: idx % 2 === 0 ? 'rgba(232,255,71,0.01)' : 'rgba(232,255,71,0.03)' }}>
              <div style={{ ...S.tableCol, flex: '0 0 140px', fontWeight: 500, color: 'var(--text-1)' }}>
                {task.agent}
              </div>
              <div style={{ ...S.tableCol, flex: '1', fontSize: 13, color: 'var(--text-1)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {task.taskName}
              </div>
              <div style={{ ...S.tableCol, flex: '0 0 140px' }}>
                <div style={S.progressContainer}>
                  <div style={S.progressBar}>
                    <div 
                      style={{ 
                        ...S.progressFill, 
                        width: task.progress + '%',
                        background: getStatusColor(task.status)
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', minWidth: 35, marginLeft: 8 }}>
                    {task.progress}%
                  </span>
                </div>
              </div>
              <div style={{ ...S.tableCol, flex: '0 0 100px' }}>
                <div style={{ ...S.statusBadge, borderColor: getStatusColor(task.status) + '44', color: getStatusColor(task.status) }}>
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: getStatusColor(task.status), marginRight: 7, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 10 }}>{getStatusLabel(task.status)}</span>
                </div>
              </div>
              <div style={{ ...S.tableCol, flex: '0 0 100px', fontSize: 11, color: 'rgba(255,255,255,0.55)' }}>
                {task.startTime}
              </div>
              <div style={{ ...S.tableCol, flex: '0 0 110px', fontSize: 12, fontWeight: 500, color: 'rgba(232,255,71,0.8)', textAlign: 'right' }}>
                {task.totalCompleted}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.summary}>
        <div style={S.summaryItem}>
          <div style={S.summaryLabel}>Completed Tasks</div>
          <div style={{ ...S.summaryValue, color: '#3DCC78' }}>{completedCount}</div>
        </div>
        <div style={S.summaryItem}>
          <div style={S.summaryLabel}>In Progress</div>
          <div style={{ ...S.summaryValue, color: '#E8FF47' }}>{inProgressCount}</div>
        </div>
        <div style={S.summaryItem}>
          <div style={S.summaryLabel}>Queued</div>
          <div style={{ ...S.summaryValue, color: 'rgba(255,255,255,0.5)' }}>{queuedCount}</div>
        </div>
        <div style={S.summaryItem}>
          <div style={S.summaryLabel}>Total Processed</div>
          <div style={{ ...S.summaryValue, color: 'var(--accent)' }}>{totalProcessed}</div>
        </div>
      </div>
    </div>
  )
}

/* ── MAIN ANALYSIS PAGE ── */
export default function Analysis() {
  const { agentState } = useSwarm()
  const [mounted, setMounted] = useState(false)

  // Calculate metrics from dashboard
  const participants = 2847
  const emailsSent = 1203
  const conflictsResolved = 7
  const postsQueued = 14

  useEffect(() => {
    setTimeout(() => setMounted(true), 50)
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
      <PageHeader
        index="06"
        eyebrow="Analysis"
        title="SWARM OVERVIEW"
        subtitle="Real-time status across all agents. Click any row to manage tasks."
      />

      {/* Metrics Grid */}
      <div style={S.metricsGrid}>
        <StatCard
          label="Participants"
          value={participants}
          change="+162 Today"
          index={0}
        />
        <StatCard
          label="Emails Sent"
          value={emailsSent}
          change="98.4% delivered"
          index={1}
        />
        <StatCard
          label="Conflicts Resolved"
          value={conflictsResolved}
          change="All auto-resolved"
          index={2}
        />
        <StatCard
          label="Posts Queued"
          value={postsQueued}
          change="3 new today"
          index={3}
        />
      </div>

      {/* Agent Task Monitor */}
      <div style={S.monitorContainer}>
        <AgentTaskMonitorTable />
      </div>

      <style>{`
        @keyframes stat-card-enter {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .stat-card-enter {
          animation: stat-card-enter 0.6s ease-out forwards;
        }
        .stat-card-enter[data-index="0"] { animation-delay: 0s; }
        .stat-card-enter[data-index="1"] { animation-delay: 0.1s; }
        .stat-card-enter[data-index="2"] { animation-delay: 0.2s; }
        .stat-card-enter[data-index="3"] { animation-delay: 0.3s; }
      `}</style>
    </div>
  )
}

const S = {
  metricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '24px',
    marginBottom: '48px',
  },
  metricCard: {
    padding: '24px',
  },
  metricGlow: {
    position: 'absolute',
    inset: 0,
    pointerEvents: 'none',
    transition: 'background 0.4s ease',
    borderRadius: '8px',
  },
  metricValue: {
    fontSize: '32px',
    fontWeight: '700',
    fontFamily: "var(--font-d)",
    color: 'var(--accent)',
    marginBottom: '8px',
    position: 'relative',
    zIndex: 1,
  },
  metricLabel: {
    fontSize: '13px',
    color: 'var(--text-2)',
    fontFamily: "var(--font-b)",
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    position: 'relative',
    zIndex: 1,
    marginBottom: '4px',
  },
  metricDesc: {
    fontSize: '11px',
    color: 'var(--text-3)',
    fontFamily: "var(--font-m)",
    marginTop: '8px',
    position: 'relative',
    zIndex: 1,
  },

  monitorContainer: {
    marginTop: '32px',
  },
  monitorBox: {
    padding: '28px',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
  },
  monitorHeader: {
    marginBottom: '24px',
  },
  monitorTitle: {
    fontSize: '16px',
    fontFamily: "var(--font-d)",
    color: 'var(--text-1)',
    letterSpacing: '0.04em',
    marginBottom: '4px',
  },
  monitorSubtitle: {
    fontSize: '12px',
    color: 'var(--text-3)',
    fontFamily: "var(--font-m)",
    letterSpacing: '0.02em',
  },

  table: {
    marginBottom: '24px',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    overflow: 'hidden',
  },
  tableHeader: {
    display: 'flex',
    padding: '14px 16px',
    borderBottom: '2px solid var(--border)',
    background: 'rgba(232,255,71,0.04)',
    position: 'sticky',
    top: 0,
    zIndex: 2,
    alignItems: 'center',
  },
  headerCol: {
    fontSize: '11px',
    fontFamily: 'var(--font-m)',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.6)',
    fontWeight: 500,
    paddingRight: '12px',
  },
  tableBody: {
    display: 'flex',
    flexDirection: 'column',
  },
  row: {
    display: 'flex',
    padding: '13px 16px',
    borderBottom: '1px solid rgba(232,255,71,0.08)',
    alignItems: 'center',
    transition: 'background 0.25s ease, border-color 0.25s ease',
    cursor: 'pointer',
    gap: '0',
  },
  tableCol: {
    fontSize: '12px',
    color: 'var(--text-1)',
    fontFamily: 'var(--font-b)',
    paddingRight: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  progressContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    width: '100%',
  },
  progressBar: {
    flex: 1,
    height: '3px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '2px',
    overflow: 'hidden',
    marginRight: '8px',
  },
  progressFill: {
    height: '100%',
    borderRadius: '2px',
    transition: 'width 0.8s cubic-bezier(0.16,1,0.3,1)',
  },
  statusBadge: {
    fontFamily: 'var(--font-m)',
    fontSize: '10px',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
    border: '1px solid',
    padding: '6px 10px',
    display: 'inline-flex',
    alignItems: 'center',
    borderRadius: '3px',
    whiteSpace: 'nowrap',
  },

  summary: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '12px',
    marginTop: '20px',
    paddingTop: '20px',
    borderTop: '1px solid var(--border)',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    padding: '14px 16px',
    background: 'rgba(232,255,71,0.03)',
    borderRadius: '5px',
    border: '1px solid rgba(232,255,71,0.1)',
    transition: 'all 0.2s ease',
  },
  summaryLabel: {
    fontSize: '10px',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.5)',
    fontFamily: 'var(--font-m)',
    fontWeight: 500,
  },
  summaryValue: {
    fontSize: '24px',
    fontFamily: 'var(--font-d)',
    fontWeight: 600,
    letterSpacing: '0.01em',
  },
}
