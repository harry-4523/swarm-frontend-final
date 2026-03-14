export default function ActivityFeed({ items }) {
  return (
    <div style={S.wrap}>
      <div style={S.head}><span style={S.title}>Activity</span><span style={S.live}><span style={S.ld} />Live</span></div>
      <div style={S.list}>
        {items.map((item,i) => (
          <div key={item.id||i} style={S.item}>
            <span style={S.time}>{item.time}</span>
            <div style={{ ...S.dot, background:item.color }} />
            <span style={S.text}>{item.text}</span>
          </div>
        ))}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  )
}
const S = {
  wrap: { background:'var(--bg-1)', border:'1px solid var(--border)', padding:'20px', height:'100%' },
  head: { display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16, paddingBottom:14, borderBottom:'1px solid var(--border)' },
  title: { fontSize:13, fontWeight:500 },
  live: { fontFamily:'var(--font-m)', fontSize:10, color:'var(--green)', display:'flex', alignItems:'center', gap:5 },
  ld: { width:5, height:5, borderRadius:'50%', background:'var(--green)', display:'inline-block', animation:'pulse 2s infinite' },
  list: { display:'flex', flexDirection:'column', gap:12 },
  item: { display:'flex', gap:10, alignItems:'flex-start' },
  time: { fontFamily:'var(--font-m)', fontSize:10, color:'var(--text-3)', width:26, flexShrink:0, paddingTop:3 },
  dot: { width:5, height:5, borderRadius:'50%', flexShrink:0, marginTop:5 },
  text: { fontSize:12, color:'var(--text-2)', lineHeight:1.6 },
}
