export default function PageHeader({ index='01', eyebrow, title, subtitle }) {
  return (
    <div style={{ marginBottom:40, paddingBottom:32, borderBottom:'1px solid var(--border)' }}>
      <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
        <span style={{ fontFamily:'var(--font-m)', fontSize:11, color:'var(--accent)', letterSpacing:'0.1em' }}>{index}</span>
        <span style={{ fontFamily:'var(--font-m)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.18em', textTransform:'uppercase' }}>{eyebrow}</span>
      </div>
      <h1 style={{ fontFamily:'var(--font-d)', fontSize:'clamp(32px,4vw,56px)', letterSpacing:'0.02em', lineHeight:0.95, marginBottom:12 }}>{title}</h1>
      {subtitle && <p style={{ fontSize:14, color:'var(--text-2)', lineHeight:1.7, maxWidth:540, fontWeight:300 }}>{subtitle}</p>}
    </div>
  )
}
