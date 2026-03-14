import { useState } from 'react'
import toast from 'react-hot-toast'

export default function PosterGenerator() {
  const [eventName, setEventName] = useState('TechSummit 2026')
  const [eventDate, setEventDate] = useState('April 12-13, 2026')
  const [eventLocation, setEventLocation] = useState('Delhi Tech Park')
  const [mainColor, setMainColor] = useState('#E8FF47')
  const [accentColor, setAccentColor] = useState('#3DCC78')
  const [generatingPosters, setGeneratingPosters] = useState(false)
  const [generatedPosters, setGeneratedPosters] = useState([])

  const posterPlatforms = [
    { id: 'twitter', name: 'X (Twitter)', dimensions: '1200x675', ratio: '16:9' },
    { id: 'instagram', name: 'Instagram', dimensions: '1080x1080', ratio: '1:1' },
    { id: 'facebook', name: 'Facebook', dimensions: '1200x628', ratio: '1.91:1' },
    { id: 'linkedin', name: 'LinkedIn', dimensions: '1200x627', ratio: '1.91:1' },
    { id: 'youtube', name: 'YouTube Thumbnail', dimensions: '1280x720', ratio: '16:9' }
  ]

  const generatePosters = async () => {
    if (!eventName.trim() || !eventDate.trim() || !eventLocation.trim()) {
      toast.error('Fill all event details')
      return
    }

    setGeneratingPosters(true)

    try {
      // Simulate API call
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
      setGeneratingPosters(false)
    }
  }

  const downloadPoster = (poster) => {
    toast.success(`Downloading ${poster.platform} poster`)
  }

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>Social Media Poster Generator</div>
        <div style={S.subtitle}>Create platform-optimized posters for your event</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 24 }}>
        {/* Configuration */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Event Details</div>

          <div style={S.formGroup}>
            <Label>Event Name</Label>
            <input
              style={S.input}
              value={eventName}
              onChange={e => setEventName(e.target.value)}
              placeholder="Event name"
            />
          </div>

          <div style={S.formGroup}>
            <Label>Date</Label>
            <input
              style={S.input}
              value={eventDate}
              onChange={e => setEventDate(e.target.value)}
              placeholder="e.g., April 12-13, 2026"
            />
          </div>

          <div style={S.formGroup}>
            <Label>Location</Label>
            <input
              style={S.input}
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
                  <input
                    style={S.input}
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
                  <input
                    style={S.input}
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
            onClick={generatePosters}
            disabled={generatingPosters}
            style={{ ...S.button, opacity: generatingPosters ? 0.5 : 1 }}
          >
            {generatingPosters ? 'Generating...' : 'Generate All Posters'}
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
                    <button
                      onClick={() => downloadPoster(poster)}
                      style={S.downloadBtn}
                    >
                      Download
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const Label = ({ children }) => (
  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.12em', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
    {children}
  </span>
)

const S = {
  container: { background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 4 },
  header: { padding: 20, borderBottom: '1px solid var(--border)' },
  title: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  section: { background: 'var(--bg)', border: '1px solid var(--border-2)', padding: 16, borderRadius: 4 },
  sectionTitle: { fontSize: 12, fontWeight: 600, marginBottom: 16, paddingBottom: 8, borderBottom: '1px solid var(--border-2)' },
  formGroup: { marginBottom: 12 },
  input: { background: 'var(--bg-1)', border: '1px solid var(--border-2)', padding: '8px 10px', color: 'var(--text-1)', fontSize: 12, width: '100%', fontFamily: 'var(--font-mono)', borderRadius: 3 },
  colorRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  platformList: { background: 'var(--bg-1)', border: '1px solid var(--border-2)', padding: 12, borderRadius: 3, marginTop: 12, marginBottom: 12, maxHeight: 180, overflowY: 'auto' },
  platformItem: { paddingBottom: 8, marginBottom: 8, borderBottom: '1px solid var(--border-2)' },
  button: { background: 'var(--accent)', color: '#000', padding: '10px', fontSize: 12, fontWeight: 600, width: '100%', borderRadius: 3, border: 'none', cursor: 'pointer' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 300, color: 'rgba(255,255,255,0.3)' },
  postersList: { display: 'flex', flexDirection: 'column', gap: 12 },
  posterCard: { background: 'var(--bg-1)', border: '1px solid var(--border-2)', borderRadius: 4, overflow: 'hidden' },
  posterPreview: { height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid var(--border-2)' },
  posterInfo: { padding: 12 },
  downloadBtn: { background: 'var(--accent)', color: '#000', padding: '6px 12px', fontSize: 11, fontWeight: 600, borderRadius: 3, border: 'none', cursor: 'pointer', width: '100%' }
}
