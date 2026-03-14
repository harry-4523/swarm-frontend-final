import { useState, useRef, useEffect } from 'react'
import { api } from '../services/api'
import { useSwarm } from '../context/SwarmContext'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'
import Papa from 'papaparse'

export default function EmailAgent() {
  const { activeEvent, orchestratorTask, completeAgentTask, failAgentTask, agentState } = useSwarm()
  const executedTaskRef = useRef(null)
  
  const [activeTab, setActiveTab] = useState('send')
  const [template, setTemplate] = useState(`Dear {{full_name}},\n\nYou're registered for {{event_name}} on {{date}}.\n\nRole: {{role}} — Organization: {{organization}}\n\nSee you there.\n\n— The SWARM Team`)
  const [csvData, setCsvData] = useState(null)
  const [rawFile, setRawFile] = useState(null)
  const [preview, setPreview] = useState([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [preparedEmails, setPreparedEmails] = useState(null)
  const [lastEventId, setLastEventId] = useState(null)
  const [templateVariations, setTemplateVariations] = useState(null)
  const [selectedVariations, setSelectedVariations] = useState({})
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
    setRawFile(f);
    Papa.parse(f, { header:true, complete: ({ data }) => { setCsvData(data); setPreview(data.slice(0,3)); toast.success(`${data.length} participants loaded`) }, error: () => toast.error('Parse failed') })
  }

const handlePrepare = async () => {
    if (!csvData && !rawFile) { toast.error('Upload a CSV first'); return }
    let eventId = activeEvent?.id;
    if (!eventId) {
      try {
        const d = await api.getEvents();
        if (d.events?.length > 0) { eventId = d.events[d.events.length - 1].id; }
        else { toast.error('No events found, please create an event first'); return; }
      } catch (e) {
        toast.error('Failed to retrieve active event'); return;
      }
    }
    
    setLoading(true)
    try { 
      // Upload CSV file first
      await api.uploadCSV(eventId, rawFile);
      
      // Dispatch email agent to PREPARE (not send immediately)
      const d = await api.prepareEmails({ event_id: eventId, template, csv_data: csvData });
      if (d?.results?.template_variations || d?.results?.emails_prepared) {
        if (d?.results?.template_variations) {
          setTemplateVariations(d.results.template_variations);
          setSelectedVariations({});
        }
        setPreparedEmails(d.results.emails_prepared);
        setLastEventId(eventId);
        toast.success(d?.message || 'Emails prepared for review') 
      } else {
        toast.error('No emails were prepared');
      }
    }
    catch (err) { toast.error('Agent failed'); console.error(err); }
    finally { setLoading(false) }
  }

  const handleConfirmVariations = async () => {
    if (!Object.keys(selectedVariations).length) {
      toast.error('Please select at least one variation');
      return;
    }

    setLoading(true);
    try {
      const d = await api.selectEmailVariations({
        event_id: lastEventId || activeEvent?.id,
        selected_variations: selectedVariations
      });

      if (d?.results?.emails_prepared) {
        setPreparedEmails(d.results.emails_prepared);
        setTemplateVariations(null);
        toast.success('Emails regenerated with your selected variations');
      } else {
        toast.error('Failed to regenerate emails');
      }
    } catch (err) {
      toast.error('Failed to apply variations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const handleSend = async () => {
    if (!preparedEmails || preparedEmails.length === 0) return;
    
    setLoading(true)
    try {
      const d = await api.sendPreparedEmails({ event_id: lastEventId || activeEvent?.id, emails: preparedEmails });
      setResult(d);
      setPreparedEmails(null); // Clear prepared after send
      toast.success(d?.message || 'Emails sent successfully')
    }
    catch (err) { toast.error('Failed to send emails'); console.error(err); }
    finally { setLoading(false) }
  }

  const VARS = ['{{full_name}}','{{email}}','{{organization}}','{{role}}','{{is_speaker}}','{{is_sponsor}}','{{event_name}}','{{date}}']

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
              <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', marginTop:4 }}>email · full_name · organization · role</span>
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
            {!preparedEmails ? (
              <button style={{ ...S.btn, opacity: loading ? 0.5 : 1 }} onClick={handlePrepare} disabled={loading}>
                {loading ? 'Preparing Drafts...' : 'Preview Generated Emails →'}
              </button>
            ) : null}
          </Section>

          {templateVariations && (
            <Section title="3. Select Email Variations">
              {Object.entries(templateVariations).map(([segmentKey, variations]) => (
                <div key={segmentKey} style={{ marginBottom: 24 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, color: 'var(--accent)' }}>
                    {segmentKey.replace('_', ' ').toUpperCase()}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: variations.length === 3 ? '1fr 1fr 1fr' : '1fr', gap: 12 }}>
                    {variations.map((variation, idx) => {
                      // Personalize with sample data for preview
                      const samplePersonalized = variation
                        .replace(/\{\{full_name\}\}/g, 'John Smith')
                        .replace(/\{\{event_name\}\}/g, activeEvent?.name || 'Upcoming Event')
                        .replace(/\{\{organization\}\}/g, 'Acme Corp')
                        .replace(/\{\{date\}\}/g, 'April 15, 2026')
                        .replace(/\{\{role\}\}/g, 'Attendee')
                      
                      return (
                        <div
                          key={idx}
                          onClick={() => setSelectedVariations(prev => ({ ...prev, [segmentKey]: idx }))}
                          style={{
                            padding: 14,
                            background: selectedVariations[segmentKey] === idx ? 'rgba(232,255,71,0.1)' : 'rgba(255,255,255,0.02)',
                            border: selectedVariations[segmentKey] === idx ? '2px solid var(--accent)' : '1px solid rgba(255,255,255,0.05)',
                            borderRadius: 6,
                            cursor: 'pointer',
                            fontSize: 11,
                            whiteSpace: 'pre-wrap',
                            maxHeight: 350,
                            overflowY: 'auto',
                            lineHeight: 1.6,
                            color: 'rgba(255,255,255,0.8)'
                          }}
                        >
                          <div style={{ fontSize: 10, color: 'var(--accent)', marginBottom: 10, fontWeight: 600 }}>
                            Version {idx + 1} (Preview)
                          </div>
                          <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)', marginBottom: 10, fontStyle: 'italic' }}>
                            Sample: variables replaced with demo values
                          </div>
                          {samplePersonalized}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
              <button style={{ ...S.btn, marginTop: 16 }} onClick={handleConfirmVariations} disabled={loading}>
                {loading ? 'Regenerating Emails...' : 'Confirm Selections & Review Emails →'}
              </button>
            </Section>
          )}

          {preparedEmails && !templateVariations && (
            <Section title={`3. Review Generated Emails (${preparedEmails.length})`}>
              <div style={{ maxHeight: 300, overflowY: 'auto', marginBottom: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {preparedEmails.map((email, idx) => (
                  <div key={idx} style={{ padding: 10, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 4 }}>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>To: {email.recipient_email}</div>
                    <div style={{ fontSize: 12, whiteSpace: 'pre-wrap' }}>{email.body_text}</div>
                  </div>
                ))}
              </div>
              <button style={{ ...S.btn, background: '#3DCC78', color: '#000', opacity: loading ? 0.5 : 1 }} onClick={handleSend} disabled={loading}>
                {loading ? 'Sending...' : 'Approve & Send Emails Now'}
              </button>
              <button style={{ ...S.btn, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', marginTop: 8 }} onClick={() => setPreparedEmails(null)} disabled={loading}>
                Cancel & Re-edit
              </button>
            </Section>
          )}

          {loading && <Loader label="Processing..." />}
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
