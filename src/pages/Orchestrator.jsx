import { useState, useEffect } from 'react'
import { useSwarm } from '../context/SwarmContext'
import PageHeader from '../components/PageHeader'
import toast from 'react-hot-toast'

export default function Orchestrator() {
  const { orchestratorTask, sendTaskToAllAgents, executingAgents, agentState, activeEvent, updateOrchestratorEventState } = useSwarm()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(false)
  
  // Event state that can be modified
  const [eventState, setEventState] = useState({
    name: activeEvent?.name || 'TechSummit 2026',
    date: activeEvent?.date || 'Apr 12–13, 2026',
    time: '09:00 AM',
    venue: activeEvent?.venue || 'Delhi Tech Park',
    capacity: 500
  })

  const [changes, setChanges] = useState([])
  const [changedField, setChangedField] = useState(null)

  // Track which agents have responded
  const agentResponses = {
    contentAgent: agentState.contentAgent?.history?.length > 0 ? 'Content & Posters Generated' : 'Pending',
    emailAgent: agentState.emailAgent?.history?.length > 0 ? 'Refresh Email Sent' : 'Pending',
    schedulerAgent: agentState.schedulerAgent?.history?.length > 0 ? 'Schedule Updated' : 'Pending'
  }

  const handleFieldChange = (field, value) => {
    const oldValue = eventState[field]
    setEventState(prev => ({ ...prev, [field]: value }))
    updateOrchestratorEventState({ [field]: value })
    setChangedField(field)
  }

  const triggerOrchestrateChange = async () => {
    if (!changedField) {
      toast.error('Make a change first')
      return
    }

    setLoading(true)
    const changeType = changedField === 'time' ? 'timing' : changedField === 'venue' ? 'venue' : changedField
    const changeMessage = `Event ${changeType} changed to ${eventState[changedField]}`

    try {
      // Log the change
      setChanges(prev => [{
        type: changeType,
        message: changeMessage,
        timestamp: new Date().toLocaleTimeString(),
        id: Date.now()
      }, ...prev])

      // Send coordinated task to all agents
      await new Promise(r => setTimeout(r, 500))
      sendTaskToAllAgents(
        `Event ${changeType} change detected: ${changeMessage}. Send refresh communications, update schedule, and generate content about this change.`,
        eventState.name,
        { 
          generateContent: true, // Generate content about the CHANGE
          sendEmail: true,       // Send refresh email
          scheduleTimeline: true // Update schedule
        }
      )

      toast.success('Change detected! All agents coordinating response...')
      setChangedField(null)
    } catch (error) {
      toast.error('Failed to orchestrate change')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <PageHeader 
        index="05" 
        eyebrow="Orchestrator" 
        title="COMMAND CENTER" 
        subtitle="Master coordinator - Monitor event changes and coordinate all agents in real-time." 
      />

      <div style={S.tabs}>
        <button 
          style={{ ...S.tab, ...(activeTab === 'overview' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          style={{ ...S.tab, ...(activeTab === 'changes' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('changes')}
        >
          Changes ({changes.length})
        </button>
        <button 
          style={{ ...S.tab, ...(activeTab === 'agents' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('agents')}
        >
          Agent Status
        </button>
      </div>

      {/* Overview Tab - Event Control */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Event Details Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Section title="Event Details">
              <div style={S.fieldGroup}>
                <Label>Event Name</Label>
                <Input 
                  value={eventState.name} 
                  onChange={e => handleFieldChange('name', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div style={S.fieldGroup}>
                <Label>Date</Label>
                <Input 
                  value={eventState.date} 
                  onChange={e => handleFieldChange('date', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div style={S.fieldGroup}>
                <Label>Time *</Label>
                <Input 
                  type="time" 
                  value={eventState.time.split(' ')[0]} 
                  onChange={e => handleFieldChange('time', e.target.value + ' AM')}
                  disabled={loading}
                />
              </div>

              <div style={S.fieldGroup}>
                <Label>Venue *</Label>
                <Input 
                  value={eventState.venue} 
                  onChange={e => handleFieldChange('venue', e.target.value)}
                  disabled={loading}
                />
              </div>

              <div style={S.fieldGroup}>
                <Label>Capacity</Label>
                <Input 
                  type="number"
                  value={eventState.capacity} 
                  onChange={e => handleFieldChange('capacity', e.target.value)}
                  disabled={loading}
                />
              </div>

              <button 
                onClick={triggerOrchestrateChange}
                disabled={!changedField || loading}
                style={{ ...S.triggerBtn, opacity: !changedField || loading ? 0.5 : 1 }}
              >
                {loading ? 'Coordinating...' : changedField ? `📡 Broadcast Change: ${changedField}` : 'Make a change to trigger coordination'}
              </button>
            </Section>
          </div>

          {/* Agent Response Panel */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Section title="Agent Coordination">
              <div style={S.agentStatus}>
                <div style={S.agentStatusIcon}>📝</div>
                <div>
                  <div style={S.agentStatusTitle}>Content Agent</div>
                  <div style={S.agentStatusDesc}>{agentResponses.contentAgent}</div>
                </div>
              </div>

              <div style={S.agentStatus}>
                <div style={S.agentStatusIcon}>📧</div>
                <div>
                  <div style={S.agentStatusTitle}>Email Agent</div>
                  <div style={S.agentStatusDesc}>{agentResponses.emailAgent}</div>
                </div>
              </div>

              <div style={S.agentStatus}>
                <div style={S.agentStatusIcon}>📅</div>
                <div>
                  <div style={S.agentStatusTitle}>Scheduler Agent</div>
                  <div style={S.agentStatusDesc}>{agentResponses.schedulerAgent}</div>
                </div>
              </div>

              <div style={{ ...S.flowCard, marginTop: 16 }}>
                <div style={S.flowLabel}>COORDINATION FLOW</div>
                <div style={S.flowStep}>1 You change time/venue</div>
                <div style={S.flowStep}>2 Orchestrator detects change</div>
                <div style={S.flowStep}>3 Content Agent → Creates posts about change + new posters</div>
                <div style={S.flowStep}>4 Email Agent → Sends refresh email to all participants</div>
                <div style={S.flowStep}>5 Scheduler Agent → Updates timeline and resolves conflicts</div>
              </div>
            </Section>
          </div>
        </div>
      )}

      {/* Changes Tab */}
      {activeTab === 'changes' && (
        <div>
          {changes.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {changes.map(change => (
                <div key={change.id} style={S.changeCard}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={S.changeBadge}>{change.type === 'timing' ? '⏰' : change.type === 'venue' ? '📍' : '✏️'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={S.changeTitle}>{change.message}</div>
                      <div style={S.changeTime}>{change.timestamp}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={S.empty}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📢</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>No changes detected yet. Modify event details to trigger coordination.</div>
            </div>
          )}
        </div>
      )}

      {/* Agent Status Tab */}
      {activeTab === 'agents' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
          {/* Content Agent Status */}
          <div style={S.agentCard}>
            <div style={S.agentCardHeader}>
              <span style={{ fontSize: 20 }}>📝</span>
              <span>Content Agent</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={S.metricRow}>
                <span>Status:</span>
                <span style={{ color: agentState.contentAgent?.history?.length > 0 ? '#3DCC78' : 'rgba(255,255,255,0.4)' }}>
                  {agentState.contentAgent?.history?.length > 0 ? 'Active' : 'Idle'}
                </span>
              </div>
              <div style={S.metricRow}>
                <span>Tasks Completed:</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{agentState.contentAgent?.history?.length || 0}</span>
              </div>
              <div style={S.metricRow}>
                <span>Role:</span>
                <span><small>Generates content about changes + posters</small></span>
              </div>
            </div>
          </div>

          {/* Email Agent Status */}
          <div style={S.agentCard}>
            <div style={S.agentCardHeader}>
              <span style={{ fontSize: 20 }}>📧</span>
              <span>Email Agent</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={S.metricRow}>
                <span>Status:</span>
                <span style={{ color: agentState.emailAgent?.history?.length > 0 ? '#3DCC78' : 'rgba(255,255,255,0.4)' }}>
                  {agentState.emailAgent?.history?.length > 0 ? 'Active' : 'Idle'}
                </span>
              </div>
              <div style={S.metricRow}>
                <span>Tasks Completed:</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{agentState.emailAgent?.history?.length || 0}</span>
              </div>
              <div style={S.metricRow}>
                <span>Role:</span>
                <span><small>Sends refresh emails on changes</small></span>
              </div>
            </div>
          </div>

          {/* Scheduler Agent Status */}
          <div style={S.agentCard}>
            <div style={S.agentCardHeader}>
              <span style={{ fontSize: 20 }}>📅</span>
              <span>Scheduler Agent</span>
            </div>
            <div style={{ marginTop: 16 }}>
              <div style={S.metricRow}>
                <span>Status:</span>
                <span style={{ color: agentState.schedulerAgent?.history?.length > 0 ? '#3DCC78' : 'rgba(255,255,255,0.4)' }}>
                  {agentState.schedulerAgent?.history?.length > 0 ? 'Active' : 'Idle'}
                </span>
              </div>
              <div style={S.metricRow}>
                <span>Tasks Completed:</span>
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{agentState.schedulerAgent?.history?.length || 0}</span>
              </div>
              <div style={S.metricRow}>
                <span>Role:</span>
                <span><small>Updates schedule & resolves conflicts</small></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const Section = ({ title, children }) => (
  <div style={{ background:'var(--bg-1)', border:'1px solid var(--border)', padding:'20px', borderRadius:'var(--radius)', display:'flex', flexDirection:'column', gap:16 }}>
    <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase' }}>{title}</div>
    {children}
  </div>
)

const Label = ({ children }) => (
  <span style={{ fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', display:'block', marginBottom:6 }}>{children}</span>
)

const Input = (props) => <input style={S.input} {...props} />

const S = {
  tabs: { display: 'flex', gap: 2, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 12 },
  tab: { padding: '8px 16px', background: 'transparent', border: 'none', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', borderBottom: '2px solid transparent', transition: 'all 0.2s' },
  tabActive: { color: 'var(--text-1)', borderBottomColor: 'var(--accent)' },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 6 },
  input: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'10px 12px', color:'var(--text-1)', fontSize:13, width:'100%', fontFamily:'var(--font-mono)', borderRadius:'var(--radius)', cursor:'pointer' },
  triggerBtn: { background:'var(--accent)', color:'#000', padding:'12px 16px', fontSize:12, fontWeight:600, letterSpacing:'0.03em', width:'100%', borderRadius:'var(--radius)', border:'none', cursor:'pointer', marginTop: 8 },
  agentStatus: { display:'flex', alignItems:'start', gap:12, padding:'12px', background:'var(--bg)', borderRadius:'var(--radius)', border:'1px solid var(--border-2)' },
  agentStatusIcon: { fontSize:20 },
  agentStatusTitle: { fontSize:12, fontWeight:600, marginBottom:3 },
  agentStatusDesc: { fontSize:11, color:'rgba(255,255,255,0.5)' },
  flowCard: { background:'var(--bg)', border:'1px dashed var(--border)', padding:'12px', borderRadius:'var(--radius)' },
  flowLabel: { fontSize:9, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 },
  flowStep: { fontSize:11, color:'rgba(255,255,255,0.6)', marginBottom:6, paddingLeft:12, borderLeft:'2px solid var(--accent)' },
  changeCard: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'16px', borderRadius:'var(--radius)', borderLeft:'3px solid var(--accent)' },
  changeBadge: { fontSize:20, display:'flex', alignItems:'center', justifyContent:'center', width:40, height:40, background:'rgba(232, 255, 71, 0.1)', borderRadius:'var(--radius)' },
  changeTitle: { fontSize:12, fontWeight:600 },
  changeTime: { fontSize:10, color:'rgba(255,255,255,0.4)', marginTop:4 },
  agentCard: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'20px', borderRadius:'var(--radius)' },
  agentCardHeader: { display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:600 },
  metricRow: { display:'flex', justifyContent:'space-between', padding:'8px 0', fontSize:11, borderBottom:'1px solid var(--border-2)' },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:300, border:'1px dashed var(--border)', borderRadius:'var(--radius)' },
}
