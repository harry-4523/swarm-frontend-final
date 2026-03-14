import { useState, useEffect, useRef } from 'react'
import { api } from '../services/api'
import { useSwarm } from '../context/SwarmContext'
import PageHeader from '../components/PageHeader'
import Loader from '../components/Loader'
import toast from 'react-hot-toast'

export default function ContentAgent() {
  const { orchestratorTask, completeAgentTask, failAgentTask, agentState } = useSwarm()
  const executedTaskRef = useRef(null)
  
  const [activeTab, setActiveTab] = useState('content')
  const [brief, setBrief] = useState('')
  const [audience, setAudience] = useState('Tech professionals and students')
  const [eventDate, setEventDate] = useState('April 12-13, 2026')
  const [eventLocation, setEventLocation] = useState('Delhi Tech Park')
  const [mainColor, setMainColor] = useState('#E8FF47')
  const [accentColor, setAccentColor] = useState('#3DCC78')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [generatedPosts, setGeneratedPosts] = useState([])
  const [selectedPostIdx, setSelectedPostIdx] = useState(null)
  const [generatedPosters, setGeneratedPosters] = useState([])
  const [orchestratorExecuting, setOrchestratorExecuting] = useState(false)

  // ─── LISTEN FOR ORCHESTRATOR TASKS ───
  useEffect(() => {
    if (!orchestratorTask) return
    if (executedTaskRef.current === orchestratorTask.id) return // Prevent double execution
    
    const hasContentTask = orchestratorTask.selectedTasks?.generateContent || orchestratorTask.selectedTasks?.createPosters
    if (!hasContentTask) return

    executedTaskRef.current = orchestratorTask.id
    
    // Auto-execute orchestrator task
    setOrchestratorExecuting(true)
    const executeOrchestratorContent = async () => {
      try {
        // Simulate content generation from orchestrator instruction
        await new Promise(r => setTimeout(r, 1500))
        const generatedResult = {
          posts: [
            { id: 1, platform: 'X (Twitter)', best_time: 'Mon 10AM', engagement_score: '9.2', content: orchestratorTask.instruction + ' - Share now!' },
            { id: 2, platform: 'LinkedIn', best_time: 'Tue 2PM', engagement_score: '8.7', content: orchestratorTask.instruction + ' - Professional version' },
            { id: 3, platform: 'Instagram', best_time: 'Wed 6PM', engagement_score: '9.5', content: orchestratorTask.instruction + ' - Casual tone' }
          ]
        }
        
        // Show result
        setResult(generatedResult)
        
        // Notify orchestrator of completion
        completeAgentTask('contentAgent', orchestratorTask.id, `Generated ${generatedResult.posts.length} posts for ${orchestratorTask.eventName}`)
      } catch (err) {
        failAgentTask('contentAgent', orchestratorTask.id, 'Failed to generate content')
      } finally {
        setOrchestratorExecuting(false)
      }
    }
    
    executeOrchestratorContent()
  }, [orchestratorTask])

  const posterPlatforms = [
    { id: 'twitter', name: 'X (Twitter)', dimensions: '1200x675', ratio: '16:9' },
    { id: 'instagram', name: 'Instagram', dimensions: '1080x1080', ratio: '1:1' },
    { id: 'facebook', name: 'Facebook', dimensions: '1200x628', ratio: '1.91:1' },
    { id: 'linkedin', name: 'LinkedIn', dimensions: '1200x627', ratio: '1.91:1' },
    { id: 'youtube', name: 'YouTube Thumbnail', dimensions: '1280x720', ratio: '16:9' }
  ]

  const handleGenerateContent = async () => {
    if (!brief.trim() || !audience.trim()) { toast.error('Enter brief and target audience'); return }
    setLoading(true)
    try {
      // Generate multiple variations (simulate with 5 different posts)
      const platforms = ['Twitter', 'LinkedIn', 'Facebook']
      const generatedVariations = []
      
      for (let i = 0; i < 5; i++) {
        const platform = platforms[i % platforms.length]
        const tones = ['professional', 'casual', 'witty', 'motivational', 'educational']
        const tone = tones[i]
        
        // Simulate AI-generated content variations
        generatedVariations.push({
          id: `post-${Date.now()}-${i}`,
          platform: platform,
          tone: tone,
          engagement_score: (8 + Math.random() * 1.5).toFixed(1),
          best_time: ['Mon 10AM', 'Tue 2PM', 'Wed 6PM', 'Thu 11AM', 'Fri 3PM'][i],
          content: `${audience.split(' ')[0]}: ${brief.substring(0, 60)}... [${tone} version]`,
          full_content: `Hey ${audience.split(' ')[0]}!

${brief}

Join us for an amazing experience!

#Event #Community #Innovation`
        })
      }
      
      setGeneratedPosts(generatedVariations)
      setSelectedPostIdx(null)
      setResult(null)
      toast.success('Generated 5 post variations')
    }
    catch { toast.error('Agent failed') }
    finally { setLoading(false) }
  }

  const handlePublishPost = async () => {
    if (selectedPostIdx === null) return
    const selectedPost = generatedPosts[selectedPostIdx]
    setLoading(true)
    try {
      toast.success(`Posted to ${selectedPost.platform}!`)
      setGeneratedPosts([])
      setSelectedPostIdx(null)
    }
    catch { toast.error('Failed to publish') }
    finally { setLoading(false) }
  }

  const handleGeneratePosters = async () => {
    if (!eventName.trim() || !eventDate.trim() || !eventLocation.trim()) {
      toast.error('Fill all event details')
      return
    }

    setLoading(true)
    try {
      await new Promise(r => setTimeout(r, 1500))

      const posters = posterPlatforms.map(platform => ({
        id: `${platform.id}-${Date.now()}`,
        platform: platform.name,
        dimensions: platform.dimensions,
        dimensions_label: platform.ratio,
        fileSize: Math.floor(Math.random() * 500 + 200),
        generated: true
      }))

      setGeneratedPosters(posters)
      toast.success(`Generated ${posters.length} posters`)
    } catch (err) {
      toast.error('Failed to generate posters')
    } finally {
      setLoading(false)
    }
  }

  const downloadPoster = (poster) => {
    toast.success(`Downloading ${poster.platform} poster`)
  }

  const sharePost = (post) => {
    const platformName = post.platform.toLowerCase()
    const text = encodeURIComponent(post.content)
    const url = eventName ? encodeURIComponent(`https://event.com/${eventName.replace(/\s+/g, '-')}`) : ''

    let shareURL = ''

    if (platformName.includes('x') || platformName.includes('twitter')) {
      shareURL = `https://twitter.com/intent/tweet?text=${text}`
    } else if (platformName.includes('linkedin')) {
      shareURL = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    } else if (platformName.includes('instagram')) {
      toast.info('Copy the text and share manually on Instagram')
      navigator.clipboard.writeText(post.content)
      return
    } else if (platformName.includes('facebook')) {
      shareURL = `https://www.facebook.com/sharer/sharer.php?u=${url}`
    }

    if (shareURL) {
      window.open(shareURL, '_blank', 'width=600,height=400')
      toast.success(`Opening ${post.platform}...`)
    }
  }

  const sharePoster = (poster) => {
    const platformName = poster.platform.toLowerCase()
    const url = eventName ? encodeURIComponent(`https://event.com/${eventName.replace(/\s+/g, '-')}`) : ''

    let shareURL = ''

    if (platformName.includes('twitter') || platformName.includes('x')) {
      shareURL = `https://twitter.com/intent/tweet?text=Check out our event poster&url=${url}`
    } else if (platformName.includes('linkedin')) {
      shareURL = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`
    } else if (platformName.includes('instagram')) {
      toast.info('Download and share the poster manually on Instagram')
      return
    } else if (platformName.includes('facebook')) {
      shareURL = `https://www.facebook.com/sharer/sharer.php?u=${url}`
    } else if (platformName.includes('youtube')) {
      toast.info('Upload the thumbnail to YouTube Studio')
      return
    }

    if (shareURL) {
      window.open(shareURL, '_blank', 'width=600,height=400')
      toast.success(`Opening ${poster.platform}...`)
    }
  }

  return (
    <div>
      <PageHeader index="02" eyebrow="Content Agent" title="CONTENT STRATEGIST" subtitle="Generate platform-specific posts and social media posters for your event. Everything in one place." />

      {/* Tabs */}
      <div style={S.tabs}>
        <button 
          style={{ ...S.tab, ...(activeTab === 'content' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('content')}
        >
          Social Posts
        </button>
        <button 
          style={{ ...S.tab, ...(activeTab === 'posters' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('posters')}
        >
          Poster Generator
        </button>
        <button 
          style={{ ...S.tab, ...(activeTab === 'history' ? S.tabActive : {}) }}
          onClick={() => setActiveTab('history')}
        >
          Task History ({agentState.contentAgent.history.length})
        </button>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:20 }}>
          <div style={S.panel}>
            <Label>Target Audience *</Label>
            <Input value={audience} onChange={e => setAudience(e.target.value)} placeholder="Tech professionals, Students..." />
            <Label>Event Description *</Label>
            <textarea style={{ ...S.input, height:160, resize:'vertical' }} value={brief} onChange={e => setBrief(e.target.value)} placeholder="Key topics, speakers, USPs, highlights..." />
            {generatedPosts.length === 0 && (
              <button style={{ ...S.btn, opacity: loading ? 0.5 : 1 }} onClick={handleGenerateContent} disabled={loading}>
                {loading ? 'Generating...' : '✨ Generate Variations →'}
              </button>
            )}
            {generatedPosts.length > 0 && selectedPostIdx === null && (
              <button style={{ ...S.btn, opacity: loading ? 0.5 : 1 }} onClick={handleGenerateContent} disabled={loading}>
                {loading ? 'Regenerating...' : '↻ Generate More'}
              </button>
            )}
          </div>

          <div>
            {loading && <Loader label="Generating variations..." />}
            {!loading && generatedPosts.length > 0 && (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <div style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom: 4 }}>Select a post to verify and publish:</div>
                {generatedPosts.map((p, idx) => (
                  <div key={p.id} style={{ ...S.postCard, border: selectedPostIdx === idx ? '1px solid var(--accent)' : '1px solid var(--border)', background: selectedPostIdx === idx ? 'rgba(232,255,71,0.05)' : 'var(--bg)', cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => setSelectedPostIdx(idx)}>
                    <div style={S.postTop}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={S.platform}>{p.platform}</span>
                        <span style={{ fontFamily:'var(--font-mono)', fontSize: 9, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>{p.tone}</span>
                      </div>
                      <div style={{ display:'flex', gap:8 }}>
                        <Chip label={`Best: ${p.best_time}`} />
                        <Chip label={`Score: ${p.engagement_score}`} accent />
                      </div>
                    </div>
                    <p style={S.postText}>{p.full_content}</p>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button style={S.copyBtn} onClick={(e) => { e.stopPropagation(); navigator.clipboard.writeText(p.full_content); toast.success('Copied') }}>📋 Copy</button>
                      {selectedPostIdx === idx && (
                        <button style={{ ...S.copyBtn, background: 'var(--accent)', color: '#000', fontWeight: 600 }} onClick={(e) => { e.stopPropagation(); handlePublishPost() }}>✓ Publish</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!loading && generatedPosts.length === 0 && (
              <div style={S.empty}>
                <span style={{ fontFamily:'var(--font-display)', fontSize:48, color:'var(--bg-3)', letterSpacing:'0.05em' }}>✨</span>
                <span style={{ fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.12em', marginTop:12 }}>GENERATE POSTS TO SEE VARIATIONS</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Posters Tab */}
      {activeTab === 'posters' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Configuration */}
          <div style={S.section}>
            <div style={S.sectionTitle}>Event Details for Posters</div>

            <div style={S.formGroup}>
              <Label>Event Name</Label>
              <Input
                value={eventName}
                onChange={e => setEventName(e.target.value)}
                placeholder="Event name"
              />
            </div>

            <div style={S.formGroup}>
              <Label>Date</Label>
              <Input
                value={eventDate}
                onChange={e => setEventDate(e.target.value)}
                placeholder="e.g., April 12-13, 2026"
              />
            </div>

            <div style={S.formGroup}>
              <Label>Location</Label>
              <Input
                value={eventLocation}
                onChange={e => setEventLocation(e.target.value)}
                placeholder="Event venue"
              />
            </div>

            <div style={S.formGroup}>
              <Label>Theme Colors</Label>
              <div style={S.colorRow}>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>Primary</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="color"
                      value={mainColor}
                      onChange={e => setMainColor(e.target.value)}
                      style={{ width: 40, height: 40, cursor: 'pointer', borderRadius: 3 }}
                    />
                    <Input
                      value={mainColor}
                      onChange={e => setMainColor(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 4, textTransform: 'uppercase' }}>Accent</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <input
                      type="color"
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                      style={{ width: 40, height: 40, cursor: 'pointer', borderRadius: 3 }}
                    />
                    <Input
                      value={accentColor}
                      onChange={e => setAccentColor(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={S.platformList}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 12, paddingBottom: 8, borderBottom: '1px solid var(--border)' }}>Platforms</div>
              {posterPlatforms.map(platform => (
                <div key={platform.id} style={S.platformItem}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{platform.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{platform.dimensions} ({platform.ratio})</div>
                </div>
              ))}
            </div>

            <button
              onClick={handleGeneratePosters}
              disabled={loading}
              style={{ ...S.button, opacity: loading ? 0.5 : 1 }}
            >
              {loading ? 'Generating...' : 'Generate All Posters'}
            </button>
          </div>

          {/* Generated Posters */}
          <div style={S.section}>
            <div style={S.sectionTitle}>Generated Posters</div>

            {generatedPosters.length === 0 ? (
              <div style={S.empty}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>🎨</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>Configure and generate posters</div>
              </div>
            ) : (
              <div style={S.postersList}>
                {generatedPosters.map(poster => (
                  <div key={poster.id} style={S.posterCard}>
                    <div style={{ ...S.posterPreview, background: `linear-gradient(135deg, ${mainColor}22, ${accentColor}22)` }}>
                      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: 12 }}>
                        <div style={{ marginBottom: 8 }}>Preview</div>
                        <div style={{ fontSize: 10 }}>{poster.dimensions}</div>
                      </div>
                    </div>
                    <div style={S.posterInfo}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{poster.platform}</div>
                      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>
                        {poster.fileSize} KB
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button
                          onClick={() => downloadPoster(poster)}
                          style={{...S.downloadBtn, flex: 1}}
                        >
                          Download
                        </button>
                        <button
                          onClick={() => sharePoster(poster)}
                          style={{...S.downloadBtn, flex: 1, background: 'rgba(232,255,71,0.1)', color: 'var(--accent)', border: '1px solid var(--accent)'}}
                        >
                          Share
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div>
          {agentState.contentAgent.history.length === 0 ? (
            <div style={S.empty}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📋</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.4)' }}>No task history yet</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {agentState.contentAgent.history.map(task => (
                <div key={task.id} style={{ ...S.postCard, borderLeft: '4px solid #3DCC78' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{task.instruction}</div>
                      <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>Event: {task.event}</div>
                    </div>
                    <div style={{ fontSize: 10, background: 'rgba(61,204,120,0.1)', color: '#3DCC78', padding: '4px 8px', borderRadius: 2 }}>COMPLETED</div>
                  </div>
                  <div style={{ fontSize: 11, background: 'rgba(255,255,255,0.02)', padding: 8, borderRadius: 2, marginTop: 8 }}>
                    Result: {task.result}
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

const Label = ({ children }) => <span style={{ fontFamily:'var(--font-mono)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase', display:'block', marginBottom:6 }}>{children}</span>
const Input = (props) => <input style={S.input} {...props} />
const Chip = ({ label, accent }) => <span style={{ fontFamily:'var(--font-mono)', fontSize:10, padding:'3px 10px', border:'1px solid', borderColor: accent ? 'var(--accent-border)' : 'var(--border-2)', color: accent ? 'var(--accent)' : 'var(--text-3)' }}>{label}</span>

const S = {
  tabs: { display: 'flex', gap: 2, marginBottom: 32, borderBottom: '1px solid var(--border)', paddingBottom: 12 },
  tab: { padding: '8px 16px', background: 'transparent', border: 'none', fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.4)', cursor: 'pointer', borderBottom: '2px solid transparent', transition: 'all 0.2s' },
  tabActive: { color: 'var(--text-1)', borderBottomColor: 'var(--accent)' },
  panel: { display:'flex', flexDirection:'column', gap:10 },
  section: { background: 'var(--bg)', border: '1px solid var(--border-2)', padding: 16, borderRadius: 4 },
  sectionTitle: { fontSize: 12, fontWeight: 600, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-2)' },
  formGroup: { marginBottom: 12 },
  input: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'10px 12px', color:'var(--text-1)', fontSize:13, width:'100%', fontFamily:'var(--font-mono)', borderRadius:'var(--radius)', marginBottom:2 },
  btn: { background:'var(--accent)', color:'#000', padding:'12px', fontSize:13, fontWeight:600, letterSpacing:'0.03em', width:'100%', marginTop:8, borderRadius:'var(--radius)' },
  postCard: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'20px', display:'flex', flexDirection:'column', gap:12 },
  postTop: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  platform: { fontFamily:'var(--font-mono)', fontSize:11, color:'var(--text-2)', letterSpacing:'0.08em' },
  postText: { fontSize:13, color:'var(--text-2)', lineHeight:1.7, fontWeight:300 },
  copyBtn: { background:'transparent', border:'1px solid var(--border-2)', color:'var(--text-3)', padding:'6px 16px', fontSize:11, fontFamily:'var(--font-mono)', letterSpacing:'0.08em', alignSelf:'flex-start', borderRadius:'var(--radius)', cursor:'pointer' },
  empty: { display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:280, border:'1px dashed var(--border)', borderRadius:'var(--radius)' },
  colorRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  platformList: { background: 'var(--bg-1)', border: '1px solid var(--border-2)', padding: 12, borderRadius: 3, marginTop: 12, marginBottom: 12, maxHeight: 180, overflowY: 'auto' },
  platformItem: { paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--border-2)' },
  button: { background: 'var(--accent)', color: '#000', padding: '10px', fontSize: 12, fontWeight: 600, width: '100%', borderRadius: 3, border: 'none', cursor: 'pointer' },
  postersList: { display: 'flex', flexDirection: 'column', gap: 12 },
  posterCard: { background: 'var(--bg-1)', border: '1px solid var(--border-2)', borderRadius: 4, overflow: 'hidden' },
  posterPreview: { height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-2)' },
  posterInfo: { padding: 12 },
  downloadBtn: { background: 'var(--accent)', color: '#000', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 3, border: 'none', cursor: 'pointer', width: '100%' }
}
