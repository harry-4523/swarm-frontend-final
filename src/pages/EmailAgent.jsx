import { useState, useRef, useEffect } from 'react'
import { api } from '../services/api'
import { useSwarm } from '../context/SwarmContext'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import Papa from 'papaparse'

export default function EmailAgent() {
  const { orchestratorTask, completeAgentTask, failAgentTask, agentState } = useSwarm()
  const executedTaskRef = useRef(null)
  
  const [activeTab, setActiveTab] = useState('send')
  const [template, setTemplate] = useState(`Dear {{name}},\n\nYou're registered for {{event_name}} on {{date}} at {{venue}}.\n\nTrack: {{track}} — Seat: {{seat}}\n\nSee you there.\n\n— The SWARM Team`)
  const [csvData, setCsvData] = useState(null)
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [orchestratorExecuting, setOrchestratorExecuting] = useState(false)
  const ref = useRef()

  // ─── LISTEN FOR ORCHESTRATOR TASKS ───
  useEffect(() => {
    if (!orchestratorTask) return
    if (executedTaskRef.current === orchestratorTask.id) return // Prevent double execution
    
    const hasEmailTask = orchestratorTask.selectedTasks?.sendEmail
    if (!hasEmailTask) return

    executedTaskRef.current = orchestratorTask.id
    setOrchestratorExecuting(true)
    const executeOrchestratorEmail = async () => {
      try {
        // Simulate email dispatch
        await new Promise(r => setTimeout(r, 1500))
        
        const result = { sent: 156, failed: 4 }
        setResult(result)
        
        // Notify orchestrator
        completeAgentTask('emailAgent', orchestratorTask.id, `${result.sent} emails sent for ${orchestratorTask.eventName}`)
      } catch (err) {
        failAgentTask('emailAgent', orchestratorTask.id, 'Failed to send emails')
      } finally {
        setOrchestratorExecuting(false)
      }
    }
    
    executeOrchestratorEmail()
  }, [orchestratorTask])

  const handleCSV = e => {
    const f = e.target.files[0]; if (!f) return
    Papa.parse(f, { header:true, complete: ({ data }) => { setCsvData(data); setPreview(data.slice(0,3)); toast.success(`${data.length} participants loaded`) }, error: () => toast.error('Parse failed') })
  }

  const handle = async () => {
    if (!csvData) { toast.error('Upload a CSV first'); return }
    setLoading(true)
    try { const d = await api.sendEmails({ event_id:'1', template, csv_data: csvData }); setResult(d); toast.success(`${d.sent} emails dispatched`) }
    catch { toast.error('Agent failed') }
    finally { setLoading(false) }
  }

  const VARS = ['{{name}}','{{event_name}}','{{date}}','{{venue}}','{{track}}','{{seat}}']

  return (
    <div>
      <PageHeader index="03" eyebrow="Email Agent" title="COMMUNICATIONS" subtitle="Upload your registration CSV, edit the template, and dispatch personalized emails." />

      {/* Tabs */}
      <div style={S.tabs}>
        <button 
          style={{ ...S.tab, ...(activeTab === 'send' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('send')}
        >
          Send Emails
        </button>
        <button 
          style={{ ...S.tab, ...(activeTab === 'history' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('history')}
        >
          Task History ({agentState.emailAgent.history.length})
        </button>
      </div>

      {/* Send Tab */}
      {activeTab === 'send' && (
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Section title="1. Upload CSV">
            <div style={S.drop} onClick={() => ref.current.click()}>
              <span style={{ fontSize:24, color:'var(--accent)' }}>⊠</span>
              <span style={{ fontSize:13, color: csvData ? 'var(--green)' : 'var(--text-3)', marginTop:8 }}>
                {csvData ? `${csvData.length} participants loaded` : 'Click to upload CSV'}
              </span>
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', marginTop:4 }}>name · email · track · seat</span>
            </div>
            <input ref={ref} type="file" accept=".csv" style={{ display:'none' }} onChange={handleCSV} />
            {preview.length > 0 && (
              <table style={S.table}>
                <thead><tr>{Object.keys(preview[0]).slice(0,4).map(k => <th key={k} style={S.th}>{k}</th>)}</tr></thead>
                <tbody>{preview.map((row,i) => <tr key={i}>{Object.values(row).slice(0,4).map((v,j) => <td key={j} style={S.td}>{v}</td>)}</tr>)}</tbody>
              </table>
            )}
          </Section>

          <Section title="Variables">
            <div style={{ display:'flex', flexWrap:'wrap', gap:6 }}>
              {VARS.map(v => (
                <button key={v} style={S.varBtn} onClick={() => { setTemplate(t => t + v); toast.success(`${v} inserted`) }}>{v}</button>
              ))}
            </div>
          </Section>
        </div>

        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <Section title="2. Email Template">
            <textarea style={{ ...S.textarea, height:220 }} value={template} onChange={e => setTemplate(e.target.value)} />
            <button style={{ ...S.btn, opacity: loading ? 0.5 : 1 }} onClick={handle} disabled={loading}>
              {loading ? 'Dispatching...' : 'Send Personalized Emails →'}
            </button>
          </Section>

          {loading && <Loader label="Personalizing & dispatching..." />}
        </div>
      </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          {agentState.emailAgent.history.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📧</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>No email history yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {agentState.emailAgent.history.map(task => (
                <div key={task.id} style={{ ...S.taskCard, borderLeft: '4px solid #3DCC78' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>To: {task.instruction}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Event: {task.event}</div>
                    </div>
                    <div style={{ fontSize: 10, background: 'rgba(61,204,120,0.1)', color: '#3DCC78', padding: '4px 8px', borderRadius: 2 }}>SENT</div>
                  </div>
                  <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 2, marginTop: 8 }}>
                    {task.result}
                  </div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginTop: 8 }}>{task.completedTime}</div>
                </div>
              ))}
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

const S = {
  tabs: { display: 'flex', gap: 2, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 12 },
  tab: { padding: '8px 16px', background: 'transparent', border: 'none', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', borderBottom: '2px solid transparent', transition: 'all 0.2s' },
  tabActive: { color: 'var(--text-1)', borderBottomColor: 'var(--accent)' },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:280, border:'1px dashed var(--border)', borderRadius:'var(--radius)' },
  taskCard: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'16px', borderRadius:'var(--radius)' },
  drop: { border:'1px dashed var(--border-2)', padding:'28px', display:'flex', flexDirection:'column', alignItems:'center', cursor:'pointer', borderRadius:'var(--radius)', transition:'border-color 0.15s' },
  table: { width:'100%', borderCollapse:'collapse', fontSize:12 },
  th: { textAlign:'left', padding:'5px 8px', fontFamily:'var(--font-mono)', fontSize:9, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', borderBottom:'1px solid var(--border)' },
  td: { padding:'5px 8px', color:'var(--text-2)', borderBottom:'1px solid var(--border)', fontSize:12 },
  varBtn: { background:'var(--bg)', border:'1px solid var(--border-2)', color:'var(--accent)', padding:'4px 10px', fontFamily:'var(--font-mono)', fontSize:10, cursor:'pointer', borderRadius:'var(--radius)', transition:'border-color 0.15s' },
  textarea: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'12px', color:'var(--text-1)', fontSize:12, width:'100%', fontFamily:'var(--font-mono)', lineHeight:1.7, resize:'vertical', borderRadius:'var(--radius)' },
  btn: { background:'var(--accent)', color:'#000', padding:'12px', fontSize:13, fontWeight:600, letterSpacing:'0.03em', width:'100%', borderRadius:'var(--radius)' },
  resultBox: { border:'1px solid', padding:'20px', display:'flex', flexDirection:'column', alignItems:'center', borderRadius:'var(--radius)' },
}
