import { useState, useEffect, useRef } from 'react'
import { useSwarm } from '../context/SwarmContext'
import { api } from '../services/api'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

export default function SchedulerAgent() {
  const { orchestratorTask, completeAgentTask, failAgentTask, agentState, activeEvent } = useSwarm()
  const executedTaskRef = useRef(null)
  
  const [activeTab, setActiveTab] = useState('schedule')
  const [startTime, setStartTime] = useState(activeEvent?.time?.split(' ')[0] || '09:00')
  const [venue, setVenue] = useState(activeEvent?.venue || 'Convention Center')
  const [sessions, setSessions] = useState('Opening Keynote - Dr. Arjun Mehta - 60min - Main Hall\nAI in Production - Priya Sharma - 60min - Hall A\nMulti-Agent Systems - Rohan Das - 60min - Hall B\nLunch Break - 90min - Cafeteria\nDevOps at Scale - Sneha Patel - 60min - Hall A\nClosing Panel - All Speakers - 60min - Main Hall')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [orchestratorExecuting, setOrchestratorExecuting] = useState(false)

  // Parse sessions into schedule format
  const parseSchedule = (sessionsText, startTimeStr) => {
    const lines = sessionsText.trim().split('\n').filter(l => l.trim())
    let currentTime = startTimeStr
    const schedule = []

    lines.forEach((line, idx) => {
      const parts = line.split(' - ')
      if (parts.length >= 3) {
        const title = parts[0].trim()
        const duration = parseInt(parts[parts.length - 2]) || 60
        const place = parts[parts.length - 1].trim()
        
        schedule.push({
          id: idx,
          time: currentTime,
          title,
          duration,
          place,
          fullText: `${currentTime} - ${title} - ${place}`
        })

        // Calculate next time
        const [hours, mins] = currentTime.split(':').map(Number)
        const totalMins = hours * 60 + mins + duration
        const nextHours = Math.floor(totalMins / 60)
        const nextMins = totalMins % 60
        currentTime = `${String(nextHours).padStart(2, '0')}:${String(nextMins).padStart(2, '0')}`
      }
    })

    return schedule
  }

  const builtSchedule = result ? parseSchedule(sessions, startTime) : []

  // Auto-execute when orchestrator sends scheduling task
  useEffect(() => {
    if (!orchestratorTask) return
    if (executedTaskRef.current === orchestratorTask.id) return
    const hasSchedulerTask = orchestratorTask.selectedTasks?.scheduleTimeline
    if (!hasSchedulerTask) return

    executedTaskRef.current = orchestratorTask.id
    setOrchestratorExecuting(true)
    
    setTimeout(() => {
      try {
        setResult({ sessions: 6, conflicts: 0, notified: 156 })
        completeAgentTask(
          'schedulerAgent',
          orchestratorTask.id,
          `Built schedule for "${orchestratorTask.eventName}" - 6 sessions, 0 conflicts, 156 notified`
        )
      } catch (error) {
        failAgentTask('schedulerAgent', orchestratorTask.id, 'Failed to create schedule')
      } finally {
        setOrchestratorExecuting(false)
      }
    }, 1500)
  }, [orchestratorTask])

  const handleBuildSchedule = async () => {
    if (!sessions.trim()) { toast.error('Enter sessions'); return }
    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1500))
      setResult({ sessions: sessions.split('\n').length, conflicts: 0, notified: 156 })
      toast.success('Schedule built successfully')
    }
    catch { toast.error('Failed to build schedule') }
    finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader index="04" eyebrow="Schedule Agent" title="TIMELINE BUILDER" subtitle={activeEvent ? `Building schedule for ${activeEvent.name}` : "Build and manage event timeline"} />

      <div style={S.tabs}>
        <button 
          style={{ ...S.tab, ...(activeTab === 'schedule' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('schedule')}
        >
          Build Schedule
        </button>
        <button 
          style={{ ...S.tab, ...(activeTab === 'view' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('view')}
        >
          View Schedule
        </button>
        <button 
          style={{ ...S.tab, ...(activeTab === 'history' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('history')}
        >
          Task History ({agentState.schedulerAgent?.history?.length || 0})
        </button>
      </div>

      {/* Build Schedule Tab */}
      {activeTab === 'schedule' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {activeEvent && <div style={{ ...S.eventCard }}>
              <div style={{ fontSize:11, color:'var(--accent)', fontWeight:600 }}>EVENT DETAILS</div>
              <div style={{ fontSize:12, fontWeight:600, marginTop:8 }}>{activeEvent.name}</div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:4 }}>{activeEvent.date}</div>
            </div>}
            
            <Section title="Start Time">
              <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} style={S.input} disabled={orchestratorExecuting} />
            </Section>

            <Section title="Venue">
              <Input value={venue} onChange={e => setVenue(e.target.value)} placeholder="Convention Center" disabled={orchestratorExecuting} />
            </Section>

            <Section title="Sessions (Title - Speaker - Duration - Place)">
              <textarea style={{ ...S.textarea, height:200 }} value={sessions} onChange={e => setSessions(e.target.value)} disabled={orchestratorExecuting} placeholder="Opening Keynote - Dr. Name - 60min - Main Hall" />
              <button style={{ ...S.btn, opacity: loading || orchestratorExecuting ? 0.5 : 1 }} onClick={handleBuildSchedule} disabled={loading || orchestratorExecuting}>
                {loading ? 'Building...' : orchestratorExecuting ? 'Orchestrator Building...' : 'Build Schedule →'}
              </button>
            </Section>
          </div>

          <div>
            {loading && <Loader label="Building schedule..." />}
            {!loading && result && (
              <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                <div style={S.resultCard}>
                  <div style={S.resultLabel}>Total Sessions</div>
                  <div style={S.resultValue}>{result.sessions}</div>
                </div>
                <div style={S.resultCard}>
                  <div style={S.resultLabel}>Conflicts Resolved</div>
                  <div style={S.resultValue}>{result.conflicts}</div>
                </div>
                <div style={S.resultCard}>
                  <div style={S.resultLabel}>Participants Notified</div>
                  <div style={S.resultValue}>{result.notified}</div>
                </div>
              </div>
            )}
            {!loading && !result && (
              <div style={S.empty}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:48, color:'var(--bg-3)', letterSpacing:'0.05em' }}>◐</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.12em', marginTop:12 }}>SCHEDULE APPEARS AFTER BUILD</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* View Schedule Tab */}
      {activeTab === 'view' && (
        <div>
          {builtSchedule.length > 0 ? (
            <div style={{ background:'var(--bg-1)', border:'1px solid var(--border)', borderRadius:'var(--radius)', overflow:'hidden' }}>
              {builtSchedule.map((slot, idx) => (
                <div key={slot.id} style={{ ...S.scheduleSlot, borderBottom: idx < builtSchedule.length - 1 ? '1px solid var(--border-2)' : 'none' }}>
                  <div style={S.slotTime}>{slot.time}</div>
                  <div style={{ flex: 1 }}>
                    <div style={S.slotTitle}>{slot.title}</div>
                    <div style={S.slotMeta}>{slot.duration}min • {slot.place}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={S.empty}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📅</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Build schedule to view timeline</div>
            </div>
          )}
        </div>
      )}

      {/* Task History Tab */}
      {activeTab === 'history' && (
        <div>
          {agentState.schedulerAgent?.history && agentState.schedulerAgent.history.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {agentState.schedulerAgent.history.map(task => (
                <div key={task.id} style={{ ...S.taskCard, borderLeft: '4px solid #3DCC78' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{task.instruction}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Event: {task.event}</div>
                    </div>
                    <div style={{ fontSize: 10, background: 'rgba(61,204,120,0.1)', color: '#3DCC78', padding: '4px 8px', borderRadius: 2 }}>COMPLETED</div>
                  </div>
                  <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 2, marginTop: 8 }}>
                    {task.result}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{task.completedTime}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={S.empty}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>No task history yet</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const Section = ({ title, children }) => (
  <div style={{ background:'var(--bg-1)', border:'1px solid var(--border)', padding:'20px', display:'flex', flexDirection:'column', gap:12 }}>
    <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase' }}>{title}</span>
    {children}
  </div>
)

const Input = (props) => <input style={S.input} {...props} />

const S = {
  tabs: { display: 'flex', gap: 2, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 12 },
  tab: { padding: '8px 16px', background: 'transparent', border: 'none', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', borderBottom: '2px solid transparent', transition: 'all 0.2s' },
  tabActive: { color: 'var(--text-1)', borderBottomColor: 'var(--accent)' },
  eventCard: { background:'var(--bg-1)', border:'1px solid var(--accent)', padding:'16px', borderRadius:'var(--radius)', borderLeft:'3px solid var(--accent)' },
  textarea: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'12px', color:'var(--text-1)', fontSize:12, width:'100%', fontFamily:'var(--font-mono)', lineHeight:1.7, resize:'vertical', borderRadius:'var(--radius)' },
  input: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'10px 12px', color:'var(--text-1)', fontSize:13, width:'100%', fontFamily:'var(--font-mono)', borderRadius:'var(--radius)' },
  btn: { background:'var(--accent)', color:'#000', padding:'12px', fontSize:13, fontWeight:600, letterSpacing:'0.03em', width:'100%', borderRadius:'var(--radius)', cursor:'pointer', border:'none' },
  resultCard: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'20px', borderRadius:'var(--radius)', textAlign:'center' },
  resultLabel: { fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 },
  resultValue: { fontFamily:'var(--font-display)', fontSize:32, fontWeight:600, color:'var(--accent)' },
  scheduleSlot: { display:'flex', alignItems:'center', gap:16, padding:'16px 20px', background:'var(--bg)' },
  slotTime: { fontSize:13, fontWeight:600, color:'var(--accent)', minWidth:'60px', fontFamily:'var(--font-mono)' },
  slotTitle: { fontSize:12, fontWeight:600, marginBottom:4 },
  slotMeta: { fontSize:11, color:'rgba(255,255,255,0.5)' },
  taskCard: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'16px', borderRadius:'var(--radius)' },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:280, border:'1px dashed var(--border)', borderRadius:'var(--radius)' },
}
