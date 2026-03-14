export default function Loader({ label='Processing...' }) {
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'64px', gap:14 }}>
      <div style={{ width:24, height:24, border:'2px solid var(--bg-3)', borderTopColor:'var(--accent)', borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
      <span style={{ fontFamily:'var(--font-m)', fontSize:10, color:'var(--text-3)', letterSpacing:'0.15em', textTransform:'uppercase' }}>{label}</span>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
