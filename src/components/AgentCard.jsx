import { useState } from 'react'
const ST = { running:{l:'Running',c:'var(--accent)'}, complete:{l:'Complete',c:'var(--green)'}, resolving:{l:'Resolving',c:'var(--amber)'}, idle:{l:'Idle',c:'var(--text-3)'}, error:{l:'Error',c:'var(--red)'} }
export default function AgentCard({ agent, onClick }) {
  const [hov, setHov] = useState(false)
  const s = ST[agent.status] || ST.idle
  return (
    <div style={{ ...S.card, background: hov ? 'var(--bg-2)' : 'var(--bg-1)', borderColor: hov ? 'var(--border-2)' : 'var(--border)' }}
      onClick={onClick} onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}>
      <div style={S.top}>
        <div>
          <div style={S.name}>{agent.name}</div>
          <div style={S.task}>{agent.task}</div>
        </div>
        <div style={{ ...S.badge, borderColor:s.c+'44', color:s.c }}>
          <span style={{ width:5,height:5,borderRadius:'50%',background:s.c,display:'inline-block',marginRight:5,...(agent.status==='running'?{animation:'pulse 1.5s infinite'}:{}) }} />
          {s.l}
        </div>
      </div>
      <div style={S.barBg}><div style={{ ...S.barFg, width:agent.progress+'%' }} /></div>
      <div style={S.bot}><span style={S.pl}>Progress</span><span style={S.pv}>{agent.progress}%</span></div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  )
}
const S = {
  card: { border:'1px solid var(--border)', padding:'20px 24px', transition:'all 0.15s', cursor:'none', display:'flex', flexDirection:'column', gap:12 },
  top: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', gap:12 },
  name: { fontSize:14, fontWeight:600, letterSpacing:'-0.01em', marginBottom:3 },
  task: { fontSize:12, color:'var(--text-3)', fontFamily:'var(--font-m)', lineHeight:1.5 },
  badge: { fontFamily:'var(--font-m)', fontSize:10, letterSpacing:'0.06em', border:'1px solid', padding:'3px 10px', display:'flex', alignItems:'center', flexShrink:0 },
  barBg: { height:2, background:'var(--bg-3)' },
  barFg: { height:'100%', background:'var(--accent)', transition:'width 0.5s cubic-bezier(0.16,1,0.3,1)' },
  bot: { display:'flex', justifyContent:'space-between' },
  pl: { fontFamily:'var(--font-m)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.08em' },
  pv: { fontFamily:'var(--font-m)', fontSize:11, color:'var(--accent)' },
}
