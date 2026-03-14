import { useState, useEffect } from 'react'
import { api } from '../services/api'
import { useSwarm } from '../context/SwarmContext'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function Events() {
  const { sendTaskToAllAgents, executingAgents, agentState } = useSwarm()
  const [events, setEvents] = useState([])
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [showAgentMenu, setShowAgentMenu] = useState(false)
  const initialFormState = { 
    name:'', description:'', event_type:'', theme:'', 
    target_audience:'', start_date:'', start_time:'',
    end_date:'', end_time:'', location:'', venue:'', max_participants:'', speaker:'' 
  }
  const [form, setForm] = useState(initialFormState)

  const [agentTasksAssigned, setAgentTasksAssigned] = useState(false)
  const navigate = useNavigate()

  const isAgentExecuting = Object.keys(executingAgents).length > 0

  useEffect(() => { api.getEvents().then(d => { setEvents(d.events); setSelectedEvent(d.events[0]?.id) }).finally(() => setLoading(false)) }, [])

  // Reset agent menu when all agents finish executing
  useEffect(() => {
    if (!isAgentExecuting && showAgentMenu && agentTasksAssigned) {
      setShowAgentMenu(false)
      setAgentTasksAssigned(false)
    }
  }, [isAgentExecuting, showAgentMenu, agentTasksAssigned])

  const create = async () => {
    if (!form.name || !form.start_date || !form.start_time || !form.end_date || !form.end_time) { toast.error('Name and Event Times are required'); return }
    setCreating(true)
    try { 
      const d = await api.createEvent(form)
      setEvents(e => [...e, d.event])
      setShowForm(false)
      setForm(initialFormState)
      setSelectedEvent(d.event.id)
      toast.success('Event created')
    }
    catch { toast.error('Failed') }
    finally { setCreating(false) }
  }

  const navigateToAgent = (agentPath) => {
    if (selectedEvent && events.length > 0) {
      const event = events.find(e => e.id === selectedEvent)
      if (event) {
        sendTaskToAllAgents(`Execute tasks for ${event.name}`, event.name, { generateContent: true, sendEmail: true, scheduleTimeline: true })
      }
    }
    navigate(agentPath)
  }

  const handleViewElement = () => {
    setShowAgentMenu(true)
  }

  const handleAssignTask = () => {
    if (selectedEvent && events.length > 0) {
      const event = events.find(e => e.id === selectedEvent)
      if (event) {
        sendTaskToAllAgents(`Execute tasks for ${event.name}`, event.name, { generateContent: true, sendEmail: true, scheduleTimeline: true })
      }
    }
    setAgentTasksAssigned(true)
  }

  if (loading) return <Loader />

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom: 24 }}>
        <PageHeader index="05" eyebrow="Control Room" title="EVENTS" subtitle="Create and manage events. Connect to Content, Email, Schedule agents and Orchestrator." />
        <button style={S.newBtn} onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : '+ Add Event'}</button>
      </div>

      {/* Event Creation Form */}
      {showForm && (
        <div style={S.formCard}>
          <span style={S.sectionLabel}>Create New Event</span>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div>
              <Label>Event Name *</Label>
              <Input placeholder="TechSummit 2026" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} />
            </div>
            <div>
              <Label>Event Type</Label>
              <Input placeholder="Conference, Hackathon..." value={form.event_type} onChange={e => setForm(f=>({...f,event_type:e.target.value}))} />
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <Label>Start Date *</Label>
                <Input type="date" value={form.start_date} onChange={e => setForm(f=>({...f,start_date:e.target.value}))} />
              </div>
              <div>
                <Label>Start Time *</Label>
                <Input type="time" value={form.start_time} onChange={e => setForm(f=>({...f,start_time:e.target.value}))} />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div>
                <Label>End Date *</Label>
                <Input type="date" value={form.end_date} onChange={e => setForm(f=>({...f,end_date:e.target.value}))} />
              </div>
              <div>
                <Label>End Time *</Label>
                <Input type="time" value={form.end_time} onChange={e => setForm(f=>({...f,end_time:e.target.value}))} />
              </div>
            </div>

            <div>
              <Label>Theme</Label>
              <Input placeholder="AI, Future of Tech..." value={form.theme} onChange={e => setForm(f=>({...f,theme:e.target.value}))} />
            </div>
            <div>
              <Label>Target Audience</Label>
              <Input placeholder="Developers, Students..." value={form.target_audience} onChange={e => setForm(f=>({...f,target_audience:e.target.value}))} />
            </div>

            <div>
              <Label>Location (City/Online)</Label>
              <Input placeholder="Delhi / Virtual" value={form.location} onChange={e => setForm(f=>({...f,location:e.target.value}))} />
            </div>
            <div>
              <Label>Venue / Building</Label>
              <Input placeholder="Convention Center" value={form.venue} onChange={e => setForm(f=>({...f,venue:e.target.value}))} />
            </div>

            <div>
              <Label>Max Participants</Label>
              <Input type="number" placeholder="500" value={form.max_participants} onChange={e => setForm(f=>({...f,max_participants:e.target.value}))} />
            </div>
            <div>
              <Label>Main Speaker</Label>
              <Input placeholder="Speaker name" value={form.speaker} onChange={e => setForm(f=>({...f,speaker:e.target.value}))} />
            </div>
          </div>
          
          <div style={{ marginTop: 4 }}>
            <Label>Description</Label>
            <textarea style={{ ...S.input, height:72 }} placeholder="Brief description..." value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))} />
          </div>
          
          <button style={{ ...S.newBtn, opacity: creating ? 0.5 : 1, marginTop: 16 }} onClick={create} disabled={creating}>{creating ? 'Creating...' : 'Create Event →'}</button>
        </div>
      )}

      {/* Main Events View */}
      <div style={{ display: 'flex', gap: 24 }}>
        {/* Events List */}
        <div style={{ width: '320px', flexShrink: 0 }}>
          <div style={S.columnHeader}>Events</div>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {events.length === 0 ? (
              <div style={{ ...S.empty, height: 200 }}>No events yet</div>
            ) : (
              events.map(ev => {
                const isSelected = selectedEvent === ev.id
                return (
                  <div 
                    key={ev.id} 
                    onClick={() => { setSelectedEvent(ev.id); setShowAgentMenu(false) }}
                    style={{ ...S.eventItem, ...(isSelected ? S.eventItemActive : {}) }}
                  >
                    <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>{ev.name}</h4>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>
                      {new Date(ev.start_date || ev.date || Date.now()).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: '2-digit' })}
                    </div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)' }}>
                      {new Date(ev.start_date || ev.date || Date.now()).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })} • {ev.event_type || 'Event'}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Agent Menu or Empty State */}
        {selectedEvent ? (
          <div style={{ flex: 1 }}>
            <div style={S.columnHeader}>View</div>
            {!showAgentMenu ? (
              <button 
                onClick={handleViewElement}
                style={S.activateBtn}
              >
                View Element →
              </button>
            ) : (
              <div>
                {agentTasksAssigned && (
                  <div style={{ ...S.statusCard, marginBottom: 12 }}>
                    <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--accent)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:8 }}>Status</div>
                    <div style={{ fontSize:13, fontWeight:600 }}>Agents Active - Executing Tasks</div>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.5)', marginTop:4 }}>Content, Email & Schedule agents are working...</div>
                  </div>
                )}
                {!agentTasksAssigned && (
                  <button 
                    onClick={handleAssignTask}
                    style={{...S.activateBtn, marginBottom: 12}}
                  >
                    Assign Task to Agents →
                  </button>
                )}
                {agentTasksAssigned && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {/* Active Agents Section */}
                    <div>
                      <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: 12 }}>EXECUTING AGENTS</div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        {['contentAgent', 'emailAgent', 'schedulerAgent'].map(agentId => {
                          const agentName = agentId.replace('Agent', '').charAt(0).toUpperCase() + agentId.replace('Agent', '').slice(1)
                          const status = executingAgents[agentId]
                          const isCompleting = status === 'completed'
                          const isFailed = status === 'failed'
                          
                          return (
                            <button
                              key={agentId}
                              onClick={() => {
                                const routes = { contentAgent: '/content', emailAgent: '/email', schedulerAgent: '/scheduler' }
                                navigate(routes[agentId])
                              }}
                              style={{
                                ...S.agentExecutingBtn,
                                background: isCompleting ? 'rgba(61,204,120,0.1)' : isFailed ? 'rgba(239,80,80,0.1)' : 'var(--bg-1)',
                                borderColor: isCompleting ? 'rgba(61,204,120,0.3)' : isFailed ? 'rgba(239,80,80,0.3)' : 'var(--border)',
                                opacity: isCompleting ? 0.7 : 1
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', width: '100%' }}>
                                <div style={{ textAlign: 'left' }}>
                                  <div style={{ fontSize: 12, fontWeight: 600 }}>{agentName}</div>
                                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
                                    {isCompleting ? 'Completed' : isFailed ? 'Failed' : 'Executing'}
                                  </div>
                                </div>
                                {!isCompleting && !isFailed && (
                                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>processing</div>
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>

                    {/* Completed Info */}
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', padding: '12px', background: 'rgba(61,204,120,0.05)', borderRadius: 'var(--radius)', border: '1px solid rgba(61,204,120,0.1)' }}>
                      Agents will shift to completed once their tasks finish. Click agent to view details.
                    </div>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: agentTasksAssigned ? 16 : 0, display: agentTasksAssigned ? 'none' : 'grid' }}>
                  <button 
                    onClick={() => navigateToAgent('/content')}
                    style={S.agentBtn}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Content Agent</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Generate posts & posters</div>
                  </button>
                  <button 
                    onClick={() => navigateToAgent('/email')}
                    style={S.agentBtn}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Email Agent</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Send communications</div>
                  </button>
                  <button 
                    onClick={() => navigateToAgent('/scheduler')}
                    style={S.agentBtn}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Schedule Agent</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Build timeline</div>
                  </button>
                  <button 
                    onClick={() => navigateToAgent('/orchestrator')}
                    style={S.agentBtn}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600 }}>Orchestrator</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>Coordinate all agents</div>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ flex: 1, ...S.empty }}>
            <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.12em' }}>SELECT AN EVENT TO ACTIVATE AGENTS</span>
          </div>
        )}
      </div>
    </div>
  )
}

const Label = ({children}) => <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', display:'block', marginBottom:5 }}>{children}</span>
const Input = (props) => <input style={S.input} {...props} />

const S = {
  newBtn: { background:'var(--accent)', color:'#000', padding:'9px 18px', fontSize:13, fontWeight:600, letterSpacing:'0.02em', borderRadius:'var(--radius)', flexShrink:0, cursor:'pointer', border:'none' },
  formCard: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'20px', display:'flex', flexDirection:'column', gap:10, marginBottom: 32, borderRadius: 4 },
  sectionLabel: { fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase', display: 'block', marginBottom: 12 },
  input: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'10px 12px', color:'var(--text-1)', fontSize:13, width:'100%', fontFamily:'var(--font-mono)', borderRadius:'var(--radius)' },
  columnHeader: { fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase', display: 'block', marginBottom: 12, fontWeight: 600 },
  eventItem: { background: 'var(--bg)', border: '1px solid var(--border-2)', padding: 12, borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s' },
  eventItemActive: { background: 'var(--bg-2)', border: '1px solid var(--accent)', color: 'var(--accent)' },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', border:'1px dashed var(--border)', borderRadius:'var(--radius)', color: 'rgba(255,255,255,0.3)', height: 300 },
  activateBtn: { background: 'var(--accent)', color: '#000', padding: '16px 20px', fontSize: 13, fontWeight: 600, borderRadius: 4, border: 'none', cursor: 'pointer', width: '100%', letterSpacing: '0.03em' },
  statusCard: { background: 'var(--bg-1)', border: '1px solid var(--border)', padding: '16px', borderRadius: 4, borderLeft: '3px solid var(--accent)' },
  agentBtn: { background: 'var(--bg-1)', border: '1px solid var(--border)', padding: '20px', borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', color: 'var(--text-1)', fontFamily: 'var(--font-mono)' },
  agentExecutingBtn: { background: 'var(--bg-1)', border: '1px solid var(--border)', padding: '16px', borderRadius: 4, cursor: 'pointer', transition: 'all 0.2s', textAlign: 'left', color: 'var(--text-1)', fontFamily: 'var(--font-mono)', display: 'flex', alignItems: 'center' },
}
