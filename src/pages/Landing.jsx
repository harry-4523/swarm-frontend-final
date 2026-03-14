import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCursor } from '../hooks/useCursor'
import { useReveal } from '../hooks/useReveal'
import { useMagnetic } from '../hooks/useMagnetic'

/* ─── TILT CARD ─────────────────────────────────── */
function TiltCard({ children, style }) {
  const ref = useRef()
  const move = (e) => {
    const r = ref.current.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width - 0.5) * 16
    const y = ((e.clientY - r.top) / r.height - 0.5) * -16
    ref.current.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.02,1.02,1.02)`
  }
  const leave = () => { ref.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale3d(1,1,1)' }
  return (
    <div ref={ref} onMouseMove={move} onMouseLeave={leave}
      style={{ ...style, transition:'transform 0.5s cubic-bezier(0.16,1,0.3,1)', transformStyle:'preserve-3d', willChange:'transform' }}>
      {children}
    </div>
  )
}

/* ─── COUNTER ─────────────────────────────────── */
function Counter({ to, duration = 1800 }) {
  const [val, setVal] = useState(0)
  const ref = useRef()
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      obs.disconnect()
      const start = performance.now()
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1)
        const ease = 1 - Math.pow(1 - p, 4)
        setVal(Math.round(ease * to))
        if (p < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, { threshold: 0.5 })
    if (ref.current) obs.observe(ref.current)
    return () => obs.disconnect()
  }, [to, duration])
  return <span ref={ref}>{val}</span>
}

/* ─── SPLIT TEXT ──────────────────────────────── */
function SplitText({ text, tag: Tag = 'span', className = '', baseDelay = 0 }) {
  return (
    <Tag className={className}>
      {text.split('').map((ch, i) => (
        <span key={i} className="char-wrap">
          <span className="char reveal" data-delay={baseDelay + i * 0.03} style={{ display: ch === ' ' ? 'inline' : 'inline-block' }}>
            {ch === ' ' ? '\u00A0' : ch}
          </span>
        </span>
      ))}
    </Tag>
  )
}

/* ─── MAIN LANDING ─────────────────────────────── */
export default function Landing() {
  const navigate = useNavigate()
  useCursor()
  useReveal()
  const ctaRef = useMagnetic(0.3)
  const [activeAgent, setActiveAgent] = useState(0)
  const canvasRef = useRef()

  // Particle canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W, H, particles = [], mouse = { x: -999, y: -999 }, raf

    const resize = () => {
      W = canvas.width = window.innerWidth
      H = canvas.height = window.innerHeight
    }
    resize()
    window.addEventListener('resize', resize)

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * W
        this.y = Math.random() * H
        this.vx = (Math.random() - 0.5) * 0.3
        this.vy = (Math.random() - 0.5) * 0.3
        this.size = Math.random() * 1.2 + 0.3
        this.alpha = Math.random() * 0.4 + 0.05
      }
      update() {
        this.x += this.vx; this.y += this.vy
        const dx = this.x - mouse.x, dy = this.y - mouse.y
        const d = Math.sqrt(dx*dx + dy*dy)
        if (d < 120) { this.x += dx/d * 1.2; this.y += dy/d * 1.2 }
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset()
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI*2)
        ctx.fillStyle = `rgba(232,255,71,${this.alpha})`
        ctx.fill()
      }
    }

    for (let i = 0; i < 120; i++) particles.push(new Particle())

    const onMouse = e => { mouse.x = e.clientX; mouse.y = e.clientY }
    window.addEventListener('mousemove', onMouse)

    // Draw connections
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => p.update())
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const d = Math.sqrt(dx*dx + dy*dy)
          if (d < 80) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(232,255,71,${0.06 * (1 - d/80)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
      particles.forEach(p => p.draw())
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); window.removeEventListener('mousemove', onMouse) }
  }, [])

  // Horizontal scroll for agent cards
  const sliderRef = useRef()
  const isDragging = useRef(false)
  const startX = useRef(0)
  const scrollLeft = useRef(0)

  const onMouseDown = e => { isDragging.current = true; startX.current = e.pageX - sliderRef.current.offsetLeft; scrollLeft.current = sliderRef.current.scrollLeft; sliderRef.current.style.cursor = 'grabbing' }
  const onMouseUp = () => { isDragging.current = false; if(sliderRef.current) sliderRef.current.style.cursor = 'grab' }
  const onMouseMove = e => { if (!isDragging.current) return; e.preventDefault(); const x = e.pageX - sliderRef.current.offsetLeft; sliderRef.current.scrollLeft = scrollLeft.current - (x - startX.current) * 1.5 }

  const scrollTo = id => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  return (
    <div style={{ background:'var(--bg)', color:'var(--text-1)', fontFamily:'var(--font-b)', overflowX:'hidden' }}>

      {/* ─── NAV ─── */}
      <header style={N.nav}>
        <div style={N.logo} onClick={() => window.scrollTo({top:0,behavior:'smooth'})}>
          <div style={N.logoPulse} />
          <span style={{ fontFamily:'var(--font-d)', fontSize:20, letterSpacing:'0.06em' }}>SWARM</span>
        </div>
        <nav style={N.links}>
          {['Agents','Architecture','Features'].map(n => (
            <button key={n} style={N.link} onClick={() => scrollTo(n.toLowerCase())}>{n}</button>
          ))}
        </nav>
        <button ref={ctaRef} style={N.cta} onClick={() => navigate('/events')}>
          Enter Platform <span style={{ marginLeft:6 }}>→</span>
        </button>
      </header>

      {/* ─── HERO ─── */}
      <section style={H.section}>
        <canvas ref={canvasRef} style={H.canvas} />
        
        {/* Full width horizontal rule */}
        <div style={H.topRule} />

        <div style={H.inner}>
          {/* Left column */}
          <div style={H.left}>
            <div style={H.badge} className="reveal">
              <div style={H.badgeLine} />
              <span style={H.badgeText}>Multi-Agent Orchestration</span>
            </div>

            <h1 style={H.h1}>
              <div style={H.h1Row} className="reveal stagger-1">
                <span style={H.h1Muted}>The Event</span>
              </div>
              <div style={H.h1Row} className="reveal stagger-2">
                <span style={H.h1White}>Intelligence</span>
              </div>
              <div style={{ ...H.h1Row, overflow:'visible' }} className="reveal stagger-3">
                <span style={H.h1Accent}>Swarm.</span>
              </div>
            </h1>

            <p style={H.p} className="reveal stagger-4">
              Four AI agents. One autonomous organizing committee.<br />
              Content, communications, scheduling — handled.
            </p>

            <div style={H.actions} className="reveal stagger-5">
              <button style={H.primary} onClick={() => navigate('/events')}>
                Open Control Room
              </button>
              <button style={H.secondary} onClick={() => scrollTo('agents')}>
                Explore
              </button>
            </div>
          </div>

          {/* Right column — 3D rotating display */}
          <div style={H.right} className="reveal-right stagger-2">
            <div style={H.terminalWrap}>
              <div style={H.terminalBar}>
                <div style={H.termDots}>
                  <span style={{ ...H.termDot, background:'#FF5F57' }} />
                  <span style={{ ...H.termDot, background:'#FFBD2E' }} />
                  <span style={{ ...H.termDot, background:'#28C840' }} />
                </div>
                <span style={H.termTitle}>swarm — orchestrator</span>
              </div>
              <div style={H.termBody}>
                {TERM_LINES.map((line, i) => (
                  <div key={i} style={{ ...H.termLine, animationDelay: `${i * 0.4}s` }}>
                    <span style={{ color: line.type === 'prompt' ? 'var(--accent)' : line.type === 'ok' ? 'var(--green)' : line.type === 'dim' ? 'var(--text-3)' : 'var(--text-2)' }}>
                      {line.text}
                    </span>
                  </div>
                ))}
                <div style={H.termCursor} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats bar — full width */}
        <div style={H.statsBar}>
          {[['4','Specialized Agents'],['2,847','Participants Managed'],['0','Manual Tasks'],['100%','Autonomous']].map(([n,l],i) => (
            <div key={i} style={H.statItem}>
              <div style={H.statN}>{n.includes('%') || n.includes(',') ? n : <Counter to={parseInt(n)} />}</div>
              <div style={H.statL}>{l}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── TICKER ─── */}
      <div style={T.wrap}>
        <div style={T.inner}>
          {[...Array(3)].flatMap(() => TICKER_ITEMS).map((t,i) => (
            <span key={i} style={{ ...T.item, opacity: t === '/' ? 0.15 : 0.45 }}>{t}</span>
          ))}
        </div>
      </div>

      {/* ─── AGENTS ─── */}
      <section id="agents" style={S.section}>
        <div style={S.row}>
          <div style={S.stickyHead} className="reveal-left">
            <div style={S.eyeRow}><span style={S.eyeN}>01</span><span style={S.eyeT}>Agent Roster</span></div>
            <h2 style={S.h2}>Meet the<br /><em style={{ fontStyle:'italic', color:'var(--accent)' }}>Swarm.</em></h2>
            <p style={S.p}>Four specialized agents. Each owns a domain. Together they handle your entire event end-to-end.</p>
            <div style={S.agentNav}>
              {AGENTS.map((a,i) => (
                <button key={i} style={{ ...S.agentNavBtn, ...(activeAgent===i?S.agentNavActive:{}) }} onClick={() => setActiveAgent(i)}>
                  {String(i+1).padStart(2,'0')} {a.name}
                </button>
              ))}
            </div>
          </div>

          <div style={S.agentRight}>
            {AGENTS.map((a, i) => (
              <TiltCard key={i} style={{ ...S.agentCard, display: activeAgent===i ? 'flex' : 'none' }}>
                <div style={S.acTop}>
                  <span style={S.acIdx}>{String(i+1).padStart(2,'0')}</span>
                  <div style={S.acStatus}><span style={S.acDot} /><span style={S.acStatusText}>Active</span></div>
                </div>
                <div style={S.acName}>{a.name}</div>
                <p style={S.acDesc}>{a.desc}</p>
                <div style={S.acDivider} />
                <div style={S.acCaps}>
                  {a.caps.map((c,j) => (
                    <div key={j} style={S.acCap}>
                      <span style={S.acCapDot} />
                      <span style={S.acCapText}>{c}</span>
                    </div>
                  ))}
                </div>
                <div style={S.acTagsRow}>
                  {a.tags.map(t => <span key={t} style={S.acTag}>{t}</span>)}
                </div>
              </TiltCard>
            ))}
          </div>
        </div>

        {/* Drag-scroll card slider for all 4 */}
        <div style={S.sliderWrap}>
          <div style={S.sliderLabel}>Drag to explore</div>
          <div ref={sliderRef} style={S.slider}
            onMouseDown={onMouseDown} onMouseUp={onMouseUp}
            onMouseMove={onMouseMove} onMouseLeave={onMouseUp}>
            {AGENTS.map((a,i) => (
              <TiltCard key={i} style={{ ...S.slideCard, borderColor: activeAgent===i ? 'rgba(232,255,71,0.3)' : 'var(--border)' }}
               >
                <div style={S.slideCardInner} onClick={() => setActiveAgent(i)}>
                  <div style={S.scNum}>{String(i+1).padStart(2,'0')}</div>
                  <div style={S.scName}>{a.name}</div>
                  <div style={S.scDesc}>{a.shortDesc}</div>
                </div>
              </TiltCard>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ARCHITECTURE ─── */}
      <section id="architecture" style={{ ...AR.section }}>
        <div style={AR.inner}>
          <div style={AR.head} className="reveal">
            <div style={S.eyeRow}><span style={S.eyeN}>02</span><span style={S.eyeT}>Orchestration Flow</span></div>
            <h2 style={S.h2}>How the swarm<br /><em style={{ fontStyle:'italic', color:'var(--accent)' }}>coordinates.</em></h2>
          </div>

          <div style={AR.grid}>
            {FLOW.map((f,i) => (
              <div key={i} style={AR.step} className="reveal" data-delay={i * 0.12}>
                <div style={AR.stepNum}>{String(i+1).padStart(2,'0')}</div>
                <div style={AR.stepContent}>
                  <div style={AR.stepTitle}>{f.title}</div>
                  <div style={AR.stepDesc}>{f.desc}</div>
                  <div style={AR.stepAgent}>{f.agent}</div>
                </div>
                {i < FLOW.length-1 && <div style={AR.stepArrow}>↓</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" style={F.section}>
        <div style={F.inner}>
          <div style={F.head} className="reveal">
            <div style={S.eyeRow}><span style={S.eyeN}>03</span><span style={S.eyeT}>Capabilities</span></div>
            <h2 style={S.h2}>Everything<br /><em style={{ fontStyle:'italic', color:'var(--accent)' }}>automated.</em></h2>
          </div>
          <div style={F.grid}>
            {FEATURES.map((ft,i) => (
              <FeatureCard key={i} feature={ft} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section style={C.section}>
        <div style={C.inner}>
          <div style={C.eyeRow}><span style={{ ...S.eyeN, color:'rgba(0,0,0,0.4)' }}>04</span><span style={{ ...S.eyeT, color:'rgba(0,0,0,0.35)' }}>Deploy Now</span></div>
          <h2 style={C.h2} className="reveal">
            Ready to<br />
            <em style={{ fontStyle:'italic' }}>unleash it.</em>
          </h2>
          <p style={C.p} className="reveal stagger-1">Deploy the full swarm to your event in minutes.</p>
          <div style={C.btns} className="reveal stagger-2">
            <button style={C.primary} onClick={() => navigate('/events')}>Open Control Room →</button>
            <button style={C.secondary} onClick={() => navigate('/events')}>Create Event</button>
          </div>
        </div>
        <div style={C.bgText}>SWARM</div>
      </section>

      <footer style={FO.footer}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <div style={N.logoPulse} />
          <span style={{ fontFamily:'var(--font-d)', fontSize:16, letterSpacing:'0.06em' }}>SWARM</span>
          <span style={{ color:'var(--text-3)', fontFamily:'var(--font-m)', fontSize:11, marginLeft:16 }}>Event Intelligence Platform</span>
        </div>
        <span style={{ fontFamily:'var(--font-m)', fontSize:11, color:'var(--text-3)' }}>LangGraph · AutoGen · CrewAI</span>
      </footer>

      <style>{`
        @keyframes ticker-l{from{transform:translateX(0)}to{transform:translateX(-50%)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes scanline{0%{top:-5%}100%{top:105%}}
        @keyframes blink{0%,49%{opacity:1}50%,100%{opacity:0}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .term-line{animation:fadeIn 0.3s both;}
        header button:hover{color:var(--text-1)!important;}
        .feat-card:hover .feat-num{color:var(--accent)!important;}
      `}</style>
    </div>
  )
}

/* ─── FEATURE CARD ──────────────────────────── */
function FeatureCard({ feature, index }) {
  const [hov, setHov] = useState(false)
  return (
    <div className="feat-card reveal" data-delay={index * 0.08}
      style={{ ...F.card, background: hov ? 'var(--bg-2)' : 'var(--bg-1)', borderColor: hov ? 'rgba(232,255,71,0.15)' : 'var(--border)' }}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={F.cardTop}>
        <span className="feat-num" style={{ fontFamily:'var(--font-m)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.1em', transition:'color 0.2s' }}>{String(index+1).padStart(2,'0')}</span>
        <div style={{ ...F.bar, width: hov ? '100%' : '0%' }} />
      </div>
      <h3 style={F.title}>{feature.title}</h3>
      <p style={F.desc}>{feature.desc}</p>
    </div>
  )
}

/* ─── DATA ──────────────────────────────────── */
const TERM_LINES = [
  { type:'prompt', text:'> swarm init --event TechSummit2026' },
  { type:'ok',     text:'Orchestrator online' },
  { type:'ok',     text:'Content agent ready' },
  { type:'ok',     text:'Email agent ready' },
  { type:'ok',     text:'Scheduler ready' },
  { type:'dim',    text:'━━━━━━━━━━━━━━━━━━━━━━━━━━' },
  { type:'text',   text:'Routing tasks to agents...' },
  { type:'ok',     text:'3 posts queued · peak at 19:30' },
  { type:'ok',     text:'2,847 emails personalized' },
  { type:'ok',     text:'Schedule built · 0 conflicts' },
  { type:'dim',    text:'━━━━━━━━━━━━━━━━━━━━━━━━━━' },
  { type:'prompt', text:'> Status: All agents nominal' },
]

const TICKER_ITEMS = ['CONTENT STRATEGIST','/', 'EMAIL AGENT', '/', 'DYNAMIC SCHEDULER', '/', 'ORCHESTRATOR', '/', 'CONFLICT RESOLVER', '/','MULTI-AGENT SYSTEM','/']

const AGENTS = [
  { name:'Content Strategist', shortDesc:'Brief in → posts out', desc:'Drop a raw promotional brief and the agent generates platform-specific posts, analyzes historical engagement data to recommend optimal publish windows, and queues all content for execution.', caps:['Generates promotional copy from raw brief','Recommends peak engagement windows per platform','Queues posts for scheduled publishing','Adapts tone based on audience segment'], tags:['Copywriting','Social Media','Analytics'] },
  { name:'Communications Agent', shortDesc:'CSV in → emails out', desc:'Upload your registration spreadsheet. The agent validates every email address, dynamically personalizes each message using participant data, and dispatches bulk emails to segmented groups automatically.', caps:['Parses CSV / Excel registration files','Validates and deduplicates email addresses','Personalizes each email with participant data','Dispatches to segmented groups in bulk'], tags:['CSV Parsing','Personalization','Bulk Mail'] },
  { name:'Dynamic Scheduler', shortDesc:'Constraints in → timeline out', desc:'Input rough time constraints and a session list. The agent assembles the full master timeline. Introduce a new constraint mid-event and it instantly recalculates, resolves every clash, and fires the Email Agent to notify affected participants.', caps:['Builds master timeline from constraints','Detects and resolves scheduling conflicts','Recalculates in real-time on new constraints','Triggers Email Agent to notify participants'], tags:['Timeline','Conflict Resolution','Auto-Notify'] },
  { name:'Orchestrator', shortDesc:'The coordination brain', desc:'The central coordination layer. Built on LangGraph / AutoGen / CrewAI — manages shared memory, routes tasks to the right agents, and ensures every handoff between agents is clean, ordered, and fully recoverable.', caps:['Routes tasks across all specialist agents','Maintains shared memory and event state','Manages agent-to-agent handoffs','Monitors all agent health and progress'], tags:['LangGraph','State Management','Task Routing'] },
]

const FLOW = [
  { title:'Parameters uploaded', desc:'Organizer inputs constraints, uploads registration CSV, and defines the event brief.', agent:'Organizer → Orchestrator' },
  { title:'Tasks routed in parallel', desc:'Orchestrator initializes shared state and dispatches tasks simultaneously to all agents.', agent:'Orchestrator' },
  { title:'Agents execute', desc:'Content crafts posts. Email personalizes outreach. Scheduler builds the timeline. All in parallel.', agent:'All Agents' },
  { title:'Conflict detected', desc:'A new constraint is introduced mid-event. Scheduler detects the clash and recalculates.', agent:'Scheduler Agent' },
  { title:'Participants notified', desc:'Scheduler triggers Email Agent. Personalized update emails dispatched to affected attendees.', agent:'Email Agent' },
  { title:'Event managed', desc:'Zero manual work. Schedule live, emails sent, content queued. The swarm handles the rest.', agent:'Full Swarm' },
]

const FEATURES = [
  { title:'Fully Autonomous Execution', desc:'Agents complete tasks from start to finish without any human intervention once the swarm is initialized.' },
  { title:'Agent-to-Agent Communication', desc:'Scheduler triggers the Email Agent. Content feeds into the social queue. Every handoff is orchestrated through shared memory.' },
  { title:'Persistent Shared Memory', desc:'State is maintained across the entire event lifecycle. No context is ever lost between agent runs or sessions.' },
  { title:'CSV & Excel Import', desc:'Drop in any registration spreadsheet. The agent handles extraction, validation, deduplication, and segmentation automatically.' },
  { title:'Real-time Conflict Detection', desc:'Mid-event constraint changes are caught instantly. Clashes are resolved and participants notified — all without stopping the show.' },
  { title:'Engagement Optimization', desc:'Posts are scheduled at peak windows calculated from historical platform data, maximizing reach for every announcement.' },
]

/* ─── STYLE OBJECTS ─────────────────────────── */
const N = {
  nav: { position:'fixed', top:0, left:0, right:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 60px', height:60, borderBottom:'1px solid var(--border)', backdropFilter:'blur(16px)', background:'rgba(8,8,9,0.88)' },
  logo: { display:'flex', alignItems:'center', gap:10, cursor:'none' },
  logoPulse: { width:7, height:7, borderRadius:'50%', background:'var(--accent)', animation:'pulse 2.5s infinite', flexShrink:0 },
  links: { display:'flex', gap:40 },
  link: { background:'none', border:'none', color:'var(--text-2)', fontSize:13, letterSpacing:'0.02em', fontFamily:'var(--font-b)', transition:'color 0.15s' },
  cta: { background:'var(--accent)', color:'#000', padding:'9px 22px', fontSize:13, fontWeight:600, letterSpacing:'0.02em', borderRadius:0, display:'flex', alignItems:'center' },
}

const H = {
  section: { minHeight:'100vh', padding:'60px 0 0', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' },
  canvas: { position:'absolute', inset:0, pointerEvents:'none', zIndex:0 },
  topRule: { position:'absolute', top:60, left:0, right:0, height:'1px', background:'var(--border)' },
  inner: { flex:1, display:'grid', gridTemplateColumns:'1fr 1fr', gap:0, padding:'80px 60px 0', position:'relative', zIndex:1, alignItems:'center' },
  left: { paddingRight:60 },
  right: { paddingLeft:20 },
  badge: { display:'inline-flex', alignItems:'center', gap:12, marginBottom:36 },
  badgeLine: { width:32, height:1, background:'var(--accent)' },
  badgeText: { fontFamily:'var(--font-m)', fontSize:10, color:'var(--accent)', letterSpacing:'0.16em', textTransform:'uppercase' },
  h1: { marginBottom:28, lineHeight:1 },
  h1Row: { display:'block', overflow:'hidden' },
  h1Muted: { fontFamily:'var(--font-d)', fontSize:'clamp(52px,6.5vw,104px)', letterSpacing:'0.02em', color:'var(--text-3)', display:'block', lineHeight:1 },
  h1White: { fontFamily:'var(--font-d)', fontSize:'clamp(52px,6.5vw,104px)', letterSpacing:'0.02em', color:'var(--text-1)', display:'block', lineHeight:1 },
  h1Accent: { fontFamily:'var(--font-d)', fontSize:'clamp(72px,9vw,140px)', letterSpacing:'0.02em', color:'var(--accent)', display:'block', lineHeight:0.9 },
  p: { fontSize:16, color:'var(--text-2)', lineHeight:1.75, maxWidth:460, marginBottom:44, fontWeight:300 },
  actions: { display:'flex', gap:12, alignItems:'center' },
  primary: { background:'var(--accent)', color:'#000', padding:'13px 28px', fontSize:14, fontWeight:600, letterSpacing:'0.01em', borderRadius:0 },
  secondary: { background:'transparent', border:'1px solid var(--border-2)', color:'var(--text-2)', padding:'13px 28px', fontSize:14, borderRadius:0 },
  // Terminal
  terminalWrap: { background:'var(--bg-2)', border:'1px solid var(--border-2)', overflow:'hidden', boxShadow:'0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(232,255,71,0.06)' },
  terminalBar: { background:'var(--bg-3)', padding:'12px 16px', display:'flex', alignItems:'center', gap:12, borderBottom:'1px solid var(--border)' },
  termDots: { display:'flex', gap:6 },
  termDot: { width:10, height:10, borderRadius:'50%' },
  termTitle: { fontFamily:'var(--font-m)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.06em' },
  termBody: { padding:'20px', display:'flex', flexDirection:'column', gap:4, minHeight:260 },
  termLine: { fontFamily:'var(--font-m)', fontSize:12, lineHeight:1.8 },
  termCursor: { width:8, height:14, background:'var(--accent)', marginTop:4, animation:'blink 1s infinite' },
  // Stats
  statsBar: { borderTop:'1px solid var(--border)', display:'grid', gridTemplateColumns:'repeat(4,1fr)', position:'relative', zIndex:1 },
  statItem: { padding:'28px 60px', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', gap:4 },
  statN: { fontFamily:'var(--font-d)', fontSize:52, letterSpacing:'0.03em', color:'var(--accent)', lineHeight:1 },
  statL: { fontFamily:'var(--font-m)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase' },
}

const T = {
  wrap: { borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)', overflow:'hidden', padding:'12px 0', background:'var(--bg-1)' },
  inner: { display:'flex', whiteSpace:'nowrap', animation:'ticker-l 40s linear infinite' },
  item: { fontFamily:'var(--font-m)', fontSize:10, letterSpacing:'0.2em', padding:'0 28px', color:'var(--text-1)' },
}

const S = {
  section: { padding:'120px 0' },
  row: { display:'grid', gridTemplateColumns:'400px 1fr', gap:0, padding:'0 60px', marginBottom:80 },
  stickyHead: { paddingRight:60, position:'sticky', top:100, alignSelf:'start' },
  eyeRow: { display:'flex', alignItems:'center', gap:12, marginBottom:20 },
  eyeN: { fontFamily:'var(--font-m)', fontSize:11, color:'var(--accent)', letterSpacing:'0.1em' },
  eyeT: { fontFamily:'var(--font-m)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.18em', textTransform:'uppercase' },
  h2: { fontFamily:'var(--font-d)', fontSize:'clamp(40px,5vw,72px)', letterSpacing:'0.02em', lineHeight:0.95, marginBottom:20 },
  p: { fontSize:14, color:'var(--text-2)', lineHeight:1.75, fontWeight:300, marginBottom:40 },
  agentNav: { display:'flex', flexDirection:'column', gap:2, marginTop:20 },
  agentNavBtn: { background:'none', border:'none', color:'var(--text-3)', textAlign:'left', padding:'10px 0', fontFamily:'var(--font-m)', fontSize:12, letterSpacing:'0.06em', borderBottom:'1px solid var(--border)', transition:'color 0.15s' },
  agentNavActive: { color:'var(--accent)' },
  agentRight: { paddingLeft:20 },
  agentCard: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'48px', flexDirection:'column', gap:20, minHeight:480 },
  acTop: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  acIdx: { fontFamily:'var(--font-m)', fontSize:11, color:'var(--text-3)', letterSpacing:'0.08em' },
  acStatus: { display:'flex', alignItems:'center', gap:6 },
  acDot: { width:5, height:5, borderRadius:'50%', background:'var(--green)', animation:'pulse 2s infinite', display:'inline-block' },
  acStatusText: { fontFamily:'var(--font-m)', fontSize:11, color:'var(--green)' },
  acName: { fontFamily:'var(--font-d)', fontSize:44, letterSpacing:'0.02em', lineHeight:1 },
  acDesc: { fontSize:14, color:'var(--text-2)', lineHeight:1.75, fontWeight:300 },
  acDivider: { height:1, background:'var(--border)' },
  acCaps: { display:'flex', flexDirection:'column', gap:10 },
  acCap: { display:'flex', alignItems:'flex-start', gap:10 },
  acCapDot: { width:4, height:4, borderRadius:'50%', background:'var(--accent)', marginTop:7, flexShrink:0 },
  acCapText: { fontSize:13, color:'var(--text-2)', lineHeight:1.6 },
  acTagsRow: { display:'flex', flexWrap:'wrap', gap:6, marginTop:8 },
  acTag: { fontFamily:'var(--font-m)', fontSize:10, padding:'3px 10px', border:'1px solid var(--border-2)', color:'var(--text-3)', letterSpacing:'0.06em' },
  // Slider
  sliderWrap: { padding:'0 60px' },
  sliderLabel: { fontFamily:'var(--font-m)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase', marginBottom:16 },
  slider: { display:'flex', gap:12, overflowX:'auto', paddingBottom:16, cursor:'grab', scrollbarWidth:'none', msOverflowStyle:'none' },
  slideCard: { flexShrink:0, width:260, background:'var(--bg-1)', border:'1px solid var(--border)', transition:'border-color 0.2s' },
  slideCardInner: { padding:'28px', display:'flex', flexDirection:'column', gap:10 },
  scNum: { fontFamily:'var(--font-m)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.08em' },
  scName: { fontFamily:'var(--font-d)', fontSize:28, letterSpacing:'0.03em', lineHeight:1 },
  scDesc: { fontSize:12, color:'var(--text-2)', fontFamily:'var(--font-m)' },
}

const AR = {
  section: { padding:'120px 0', background:'var(--bg-1)', borderTop:'1px solid var(--border)', borderBottom:'1px solid var(--border)' },
  inner: { padding:'0 60px' },
  head: { marginBottom:64 },
  grid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0, border:'1px solid var(--border)' },
  step: { padding:'40px', borderRight:'1px solid var(--border)', borderBottom:'1px solid var(--border)', position:'relative', display:'flex', flexDirection:'column', gap:12 },
  stepNum: { fontFamily:'var(--font-d)', fontSize:64, color:'var(--bg-3)', lineHeight:1, marginBottom:8 },
  stepContent: { flex:1 },
  stepTitle: { fontSize:16, fontWeight:600, letterSpacing:'-0.02em', marginBottom:10 },
  stepDesc: { fontSize:13, color:'var(--text-2)', lineHeight:1.75, fontWeight:300 },
  stepAgent: { fontFamily:'var(--font-m)', fontSize:10, color:'var(--accent)', letterSpacing:'0.1em', marginTop:12 },
  stepArrow: { position:'absolute', bottom:16, right:20, color:'var(--text-3)', fontSize:16 },
}

const F = {
  section: { padding:'120px 0' },
  inner: { padding:'0 60px' },
  head: { marginBottom:64 },
  grid: { display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:1, background:'var(--border)' },
  card: { padding:'40px', border:'1px solid transparent', transition:'all 0.2s', display:'flex', flexDirection:'column', gap:16 },
  cardTop: { display:'flex', justifyContent:'space-between', alignItems:'center' },
  bar: { height:1, background:'var(--accent)', transition:'width 0.4s cubic-bezier(0.16,1,0.3,1)' },
  title: { fontSize:17, fontWeight:600, letterSpacing:'-0.02em' },
  desc: { fontSize:13, color:'var(--text-2)', lineHeight:1.75, fontWeight:300 },
}

const C = {
  section: { background:'var(--accent)', padding:'120px 60px', position:'relative', overflow:'hidden' },
  inner: { position:'relative', zIndex:1, maxWidth:700 },
  eyeRow: { display:'flex', alignItems:'center', gap:12, marginBottom:20 },
  h2: { fontFamily:'var(--font-d)', fontSize:'clamp(56px,7vw,100px)', letterSpacing:'0.02em', lineHeight:0.92, color:'#0A0A0B', marginBottom:20 },
  p: { fontSize:15, color:'rgba(0,0,0,0.5)', lineHeight:1.7, marginBottom:40, fontWeight:400 },
  btns: { display:'flex', gap:12 },
  primary: { background:'#0A0A0B', color:'var(--accent)', padding:'13px 28px', fontSize:14, fontWeight:600, letterSpacing:'0.01em' },
  secondary: { background:'transparent', border:'2px solid rgba(0,0,0,0.2)', color:'#0A0A0B', padding:'13px 28px', fontSize:14, fontWeight:500 },
  bgText: { position:'absolute', right:-40, top:'50%', transform:'translateY(-50%)', fontFamily:'var(--font-d)', fontSize:'clamp(120px,18vw,280px)', color:'rgba(0,0,0,0.06)', letterSpacing:'-8px', lineHeight:1, pointerEvents:'none', userSelect:'none', whiteSpace:'nowrap' },
}

const FO = {
  footer: { borderTop:'1px solid var(--border)', padding:'24px 60px', display:'flex', justifyContent:'space-between', alignItems:'center' },
}
