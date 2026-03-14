export default function StatCard({ label, value, change, accent='var(--accent)' }) {
  return (
    <div style={S.card}>
      <span style={S.label}>{label}</span>
      <span style={{ ...S.value, color:accent }}>{value}</span>
      {change && <span style={S.change}>{change}</span>}
    </div>
  )
}
const S = {
  card:   { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'24px 28px', display:'flex', flexDirection:'column', gap:6 },
  label:  { fontFamily:'var(--font-m)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.12em', textTransform:'uppercase' },
  value:  { fontFamily:'var(--font-d)', fontSize:48, letterSpacing:'0.03em', lineHeight:1 },
  change: { fontFamily:'var(--font-m)', fontSize:11, color:'var(--green)' },
}
