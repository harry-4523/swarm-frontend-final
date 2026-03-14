import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useSwarm } from '../context/SwarmContext'
import PageHeader from '../components/PageHeader'
import toast from 'react-hot-toast'

export default function Orchestrator() {
  const { agentState, sendTaskToAllAgents } = useSwarm()
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState(null)
  const [activeTab, setActiveTab] = useState('events')
  const [loading, setLoading] = useState({})
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  // Load events on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        const data = await api.getEvents()
        const eventsList = Array.isArray(data) ? data : data.events || []
        setEvents(eventsList)
        if (eventsList.length > 0 && !selectedEventId) {
          setSelectedEventId(eventsList[0].id)
        }
      } catch (err) {
        console.error('Failed to load events:', err)
      }
    }
    loadEvents()
  }, [])

  // Load summary when event changes
  useEffect(() => {
    if (!selectedEventId) return
    
    const loadSummary = async () => {
      setSummaryLoading(true)
      try {
        const data = await api.orchestratorEventSummary(selectedEventId)
        setSummary(data)
      } catch (err) {
        console.error('Failed to load summary:', err)
      } finally {
        setSummaryLoading(false)
      }
    }
    
    loadSummary()
  }, [selectedEventId])

  const selectedEvent = events.find(e => e.id === selectedEventId)

  const triggerAgent = async (agentType) => {
    if (!selectedEvent) {
      toast.error('Select an event first')
      return
    }

    setLoading(prev => ({ ...prev, [agentType]: true }))
    
    try {
      const result = await api.orchestratorExecuteAgent(selectedEventId, agentType)
      
      if (result.status === 'completed') {
        toast.success(`✅ ${getAgentLabel(agentType)} executed successfully`)
        // Reload summary to show new results
        const data = await api.orchestratorEventSummary(selectedEventId)
        setSummary(data)
      } else {
        toast.error(`Failed to execute ${getAgentLabel(agentType)}`)
      }
    } catch (err) {
      toast.error(`Error: ${err.response?.data?.detail || 'Unknown error'}`)
      console.error(err)
    } finally {
      setLoading(prev => ({ ...prev, [agentType]: false }))
    }
  }

  const triggerMultiAgentWorkflow = async () => {
    if (!selectedEvent) {
      toast.error('Select an event first')
      return
    }

    setLoading(prev => ({ ...prev, workflow: true }))
    const agents = ['content', 'email', 'scheduler', 'analytics']

    try {
      for (const agent of agents) {
        await triggerAgent(agent)
        await new Promise(r => setTimeout(r, 1000))
      }
      toast.success('✅ All agents executed successfully!')
    } catch (err) {
      toast.error('Some agents failed')
    } finally {
      setLoading(prev => ({ ...prev, workflow: false }))
    }
  }

  const getAgentLabel = (type) => {
    const labels = {
      content: 'Content Agent',
      email: 'Email Agent',
      scheduler: 'Scheduler Agent',
      analytics: 'Analytics Agent'
    }
    return labels[type] || type
  }

  const getAgentIcon = (type) => {
    const icons = {
      content: '📝',
      email: '📧',
      scheduler: '📅',
      analytics: '📊'
    }
    return icons[type] || '🤖'
  }

  return (
    <div>
      <PageHeader 
        index="05" 
        eyebrow="Orchestrator" 
        title="MULTI-EVENT COMMAND CENTER" 
        subtitle="Coordinate all agents across multiple events. Agent actions are tracked and stored in the database." 
      />

      <div style={S.tabs}>
        <button 
          style={{ ...S.tab, ...(activeTab === 'events' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('events')}
        >
          Events ({events.length})
        </button>
        <button 
          style={{ ...S.tab, ...(activeTab === 'workflow' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('workflow')}
        >
          Workflow
        </button>
        <button 
          style={{ ...S.tab, ...(activeTab === 'results' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('results')}
        >
          Results & Tracking
        </button>
        <button 
          style={{ ...S.tab, ...(activeTab === 'agents' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('agents')}
        >
          Agent Status
        </button>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Section title="📋 All Events">
              {events.length === 0 ? (
                <div style={S.emptyMessage}>No events created yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {events.map(event => (
                    <div
                      key={event.id}
                      onClick={() => setSelectedEventId(event.id)}
                      style={{
                        ...S.eventCard,
                        borderColor: selectedEventId === event.id ? 'var(--accent)' : 'var(--border)',
                        background: selectedEventId === event.id ? 'rgba(232,255,71,0.05)' : 'rgba(255,255,255,0.01)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 600 }}>{event.name}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                        {event.participants || 0} participants
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Section>
          </div>

          {selectedEvent && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Section title={`🎯 ${selectedEvent.name} - Quick Actions`}>
                <div>
                  <div style={S.fieldLabel}>Event Details</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 8 }}>
                    {selectedEvent.participants || 0} participants • {new Date(selectedEvent.start_date).toLocaleDateString()}
                  </div>
                </div>

                <div style={{ marginTop: 16 }}>
                  <div style={S.fieldLabel}>Execute Individual Agents</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                    {['content', 'email', 'scheduler', 'analytics'].map(agent => (
                      <button
                        key={agent}
                        onClick={() => triggerAgent(agent)}
                        disabled={loading[agent]}
                        style={{ 
                          ...S.agentBtn,
                          opacity: loading[agent] ? 0.6 : 1
                        }}
                      >
                        {loading[agent] ? '⏳' : getAgentIcon(agent)} {agent}
                      </button>
                    ))}
                  </div>
                </div>
              </Section>
            </div>
          )}
        </div>
      )}

      {/* Workflow Tab */}
      {activeTab === 'workflow' && (
        <div>
          {selectedEvent ? (
            <Section title={`⚡ Full Orchestration - ${selectedEvent.name}`}>
              <div style={S.workflowCard}>
                <div style={S.workflowTitle}>Execute All Agents in Sequence</div>
                <div style={S.workflowDesc}>Content → Email → Schedule → Analytics (All results saved to database)</div>
                
                <div style={{ marginTop: 20, display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                  {['content', 'email', 'scheduler', 'analytics'].map((agent, idx) => (
                    <div key={agent} style={S.workflowStep}>
                      <div style={S.stepIcon}>{idx + 1}️⃣</div>
                      <div style={S.stepName}>{getAgentIcon(agent)} {agent}</div>
                      <div style={S.stepDesc}>
                        {agent === 'content' && 'Posts & Posters'}
                        {agent === 'email' && 'Email Campaigns'}
                        {agent === 'scheduler' && 'Event Timeline'}
                        {agent === 'analytics' && 'Insights'}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={triggerMultiAgentWorkflow}
                  disabled={loading.workflow}
                  style={{ ...S.orchestrateBtn, opacity: loading.workflow ? 0.6 : 1 }}
                >
                  {loading.workflow ? '⏳ Orchestrating...' : '▶️ Launch Full Workflow'}
                </button>
              </div>
            </Section>
          ) : (
            <div style={S.empty}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Select an event to execute workflow</div>
            </div>
          )}
        </div>
      )}

      {/* Results & Tracking Tab */}
      {activeTab === 'results' && (
        <div>
          {selectedEvent ? (
            summaryLoading ? (
              <div style={S.empty}>
                <div style={{ fontSize: 24, marginBottom: 12 }}>⏳</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Loading results...</div>
              </div>
            ) : summary ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                {/* Agent Logs */}
                <Section title="🔍 Agent Execution History">
                  {summary.agent_logs && summary.agent_logs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 300, overflowY: 'auto' }}>
                      {summary.agent_logs.map((log, idx) => (
                        <div key={idx} style={{ padding: 10, background: 'rgba(255,255,255,0.01)', borderRadius: 4, border: '1px solid var(--border)' }}>
                          <div style={{ fontSize: 11, fontWeight: 600, marginBottom: 4 }}>
                            {log.status === 'completed' ? '✅' : '❌'} {log.agent_name}
                          </div>
                          <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.5)' }}>
                            {new Date(log.created_at).toLocaleString()}
                          </div>
                          {log.outputs && Object.keys(log.outputs).length > 0 && (
                            <div style={{ fontSize: 9, color: 'var(--accent)', marginTop: 6 }}>
                              {Object.entries(log.outputs).map(([k, v]) => (
                                <div key={k}>{k}: {v}</div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div style={S.emptyMessage}>No executions yet</div>
                  )}
                </Section>

                {/* Email Tracking */}
                <Section title="📧 Email Tracking">
                  {summary.emails ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={S.metricRow}>
                        <span>Total Emails:</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{summary.emails.total || 0}</span>
                      </div>
                      <div style={S.metricRow}>
                        <span>✅ Sent:</span>
                        <span style={{ color: '#3DCC78' }}>{summary.emails.sent || 0}</span>
                      </div>
                      <div style={S.metricRow}>
                        <span>⏳ Pending:</span>
                        <span style={{ color: 'var(--warn)' }}>{summary.emails.pending || 0}</span>
                      </div>
                      <div style={S.metricRow}>
                        <span>❌ Failed:</span>
                        <span style={{ color: '#FF6B6B' }}>{summary.emails.failed || 0}</span>
                      </div>
                      {summary.emails.recent && summary.emails.recent.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 9 }}>
                          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-2)' }}>Recent Emails:</div>
                          {summary.emails.recent.map((email, idx) => (
                            <div key={idx} style={{ marginBottom: 6, color: 'rgba(255,255,255,0.6)', fontSize: 8 }}>
                              <div>{email.recipient_email}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={S.emptyMessage}>No email data</div>
                  )}
                </Section>

                {/* Marketing Posts */}
                <Section title="📝 Marketing Content">
                  {summary.marketing ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={S.metricRow}>
                        <span>Total Posts:</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{summary.marketing.total_posts || 0}</span>
                      </div>
                      <div style={S.metricRow}>
                        <span>Published:</span>
                        <span style={{ color: '#3DCC78' }}>{summary.marketing.published || 0}</span>
                      </div>
                      {Object.keys(summary.marketing.by_platform || {}).length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 9 }}>
                          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-2)' }}>By Platform:</div>
                          {Object.entries(summary.marketing.by_platform).map(([platform, count]) => (
                            <div key={platform} style={S.metricRow}>
                              <span>{platform}:</span>
                              <span>{count}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={S.emptyMessage}>No marketing data</div>
                  )}
                </Section>

                {/* Schedule */}
                <Section title="📅 Schedule">
                  {summary.schedule ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={S.metricRow}>
                        <span>Sessions:</span>
                        <span style={{ color: 'var(--accent)', fontWeight: 600 }}>{summary.schedule.total_sessions || 0}</span>
                      </div>
                      {summary.schedule.recent && summary.schedule.recent.length > 0 && (
                        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: 9, maxHeight: 150, overflowY: 'auto' }}>
                          <div style={{ fontWeight: 600, marginBottom: 6, color: 'var(--text-2)' }}>Recent Sessions:</div>
                          {summary.schedule.recent.map((session, idx) => (
                            <div key={idx} style={{ marginBottom: 6, color: 'rgba(255,255,255,0.6)', fontSize: 8 }}>
                              <div>{session.session_name}</div>
                              <div style={{ color: 'rgba(255,255,255,0.4)' }}>{session.room}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div style={S.emptyMessage}>No schedule data</div>
                  )}
                </Section>
              </div>
            ) : (
              <div style={S.empty}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>📊</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>No data available</div>
              </div>
            )
          ) : (
            <div style={S.empty}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🎯</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Select an event to view results</div>
            </div>
          )}
        </div>
      )}

      {/* Agent Status Tab */}
      {activeTab === 'agents' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {['content', 'email', 'scheduler', 'analytics'].map(agentType => (
              <div key={agentType} style={S.coordCard}>
                <div style={{ fontSize: 20, marginBottom: 12 }}>{getAgentIcon(agentType)}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{getAgentLabel(agentType)}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 16 }}>
                  {agentType === 'content' && 'Generates marketing content & social posts'}
                  {agentType === 'email' && 'Sends personalized email campaigns'}
                  {agentType === 'scheduler' && 'Builds event schedules & resolves conflicts'}
                  {agentType === 'analytics' && 'Analyzes engagement & provides insights'}
                </div>
                
                <button
                  onClick={() => triggerAgent(agentType)}
                  disabled={loading[agentType]}
                  style={{ ...S.agentExecuteBtn, opacity: loading[agentType] ? 0.6 : 1 }}
                >
                  {loading[agentType] ? 'Executing...' : 'Execute Now'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const Section = ({ title, children }) => (
  <div style={{ background:'var(--bg-1)', border:'1px solid var(--border)', padding:'20px', borderRadius:'var(--radius)', display:'flex', flexDirection:'column', gap:16 }}>
    <div style={{ fontSize:11, fontWeight:600, color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase', display:'flex', alignItems:'center', gap:6 }}>{title}</div>
    {children}
  </div>
)

const S = {
  tabs: { display: 'flex', gap: 2, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 12, overflowX: 'auto' },
  tab: { padding: '8px 16px', background: 'transparent', border: 'none', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', borderBottom: '2px solid transparent', transition: 'all 0.2s', whiteSpace: 'nowrap' },
  tabActive: { color: 'var(--accent)', borderBottomColor: 'var(--accent)' },
  
  eventCard: { padding: 12, border: '1px solid var(--border)', borderRadius: 'var(--radius)', cursor: 'pointer', transition: 'all 0.2s' },
  emptyMessage: { fontSize: 12, color: 'rgba(255,255,255,0.3)', textAlign: 'center', padding: '20px' },
  
  fieldLabel: { fontSize: 11, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.05em', textTransform: 'uppercase' },
  fieldValue: { fontSize: 12, fontWeight: 500, marginTop: 6, color: 'var(--accent)' },
  
  agentBtn: { padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 },
  
  workflowCard: { padding: 24, border: '1px solid var(--border)', borderRadius: 'var(--radius)', background: 'rgba(232,255,71,0.02)' },
  workflowTitle: { fontSize: 14, fontWeight: 600, marginBottom: 6 },
  workflowDesc: { fontSize: 12, color: 'rgba(255,255,255,0.5)' },
  workflowStep: { padding: 16, background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', textAlign: 'center' },
  stepIcon: { fontSize: 24, marginBottom: 8 },
  stepName: { fontSize: 12, fontWeight: 600, marginBottom: 4 },
  stepDesc: { fontSize: 10, color: 'rgba(255,255,255,0.5)' },
  
  orchestrateBtn: { width: '100%', padding: '12px 16px', marginTop: 20, background: 'linear-gradient(135deg, var(--accent) 0%, #fff47f 100%)', border: 'none', borderRadius: 'var(--radius)', fontSize: 13, fontWeight: 600, color: '#000', cursor: 'pointer', transition: 'all 0.2s' },
  
  metricRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 12, color: 'rgba(255,255,255,0.7)' },
  
  empty: { padding: '60px 20px', textAlign: 'center', background: 'rgba(255,255,255,0.01)', borderRadius: 'var(--radius)', border: '1px dashed var(--border)' },
  
  coordCard: { padding: 16, background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', display: 'flex', flexDirection: 'column' },
  agentExecuteBtn: { width: '100%', padding: '10px 16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.7)', cursor: 'pointer', transition: 'all 0.2s', marginTop: 'auto' }
}
