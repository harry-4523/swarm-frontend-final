import { useEffect, useState } from 'react'
import PageHeader from '../components/PageHeader'
import { api } from '../services/api'
import toast from 'react-hot-toast'

export default function EventData() {
  const [events, setEvents] = useState([])
  const [selectedEventId, setSelectedEventId] = useState('')
  const [participants, setParticipants] = useState([])
  const [schedule, setSchedule] = useState([])
  const [marketing, setMarketing] = useState([])
  const [loading, setLoading] = useState(false)
  const [eventDetails, setEventDetails] = useState(null)
  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    event_type: '',
    theme: '',
    location: '',
    venue: ''
  })
  const [participantForm, setParticipantForm] = useState({
    email: '',
    full_name: '',
    organization: '',
    role: '',
    is_speaker: false,
    is_sponsor: false
  })
  const [selectedParticipantId, setSelectedParticipantId] = useState('')
  const [participantEditForm, setParticipantEditForm] = useState({
    email: '',
    full_name: '',
    organization: '',
    role: '',
    is_speaker: false,
    is_sponsor: false
  })

  useEffect(() => {
    api.getEvents()
      .then((data) => {
        const list = Array.isArray(data) ? data : data.events || []
        setEvents(list)
        if (list.length > 0) setSelectedEventId(list[0].id)
      })
      .catch(() => setEvents([]))
  }, [])

  useEffect(() => {
    if (!selectedEventId) return
    const load = async () => {
      setLoading(true)
      try {
        const [eventData, participantsData, scheduleData, marketingData] = await Promise.all([
          api.getEvent(selectedEventId),
          api.getEventParticipants(selectedEventId),
          api.getEventSchedule(selectedEventId),
          api.getEventMarketing(selectedEventId)
        ])
        setEventDetails(eventData)
        setEventForm({
          name: eventData?.name || '',
          description: eventData?.description || '',
          event_type: eventData?.event_type || '',
          theme: eventData?.theme || '',
          location: eventData?.location || '',
          venue: eventData?.venue || ''
        })
        setParticipants(participantsData || [])
        if (participantsData?.length) {
          setSelectedParticipantId(participantsData[0].id)
          setParticipantEditForm({
            email: participantsData[0].email || '',
            full_name: participantsData[0].full_name || '',
            organization: participantsData[0].organization || '',
            role: participantsData[0].role || '',
            is_speaker: !!participantsData[0].is_speaker,
            is_sponsor: !!participantsData[0].is_sponsor
          })
        }
        setSchedule(scheduleData || [])
        setMarketing(marketingData || [])
      } catch (err) {
        toast.error('Failed to load event data')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [selectedEventId])

  const handleCreateParticipant = async () => {
    if (!participantForm.email || !participantForm.full_name) {
      toast.error('Email and full name are required')
      return
    }
    try {
      const payload = { ...participantForm, event_id: selectedEventId }
      await api.createParticipant(payload)
      const refreshed = await api.getEventParticipants(selectedEventId)
      setParticipants(refreshed || [])
      setParticipantForm({
        email: '',
        full_name: '',
        organization: '',
        role: '',
        is_speaker: false,
        is_sponsor: false
      })
      toast.success('Participant added')
    } catch (err) {
      toast.error('Failed to add participant')
    }
  }

  const handleDeleteParticipant = async (participantId) => {
    try {
      await api.deleteParticipant(participantId)
      setParticipants((prev) => prev.filter((p) => p.id !== participantId))
      toast.success('Participant removed')
    } catch {
      toast.error('Failed to remove participant')
    }
  }

  const handleSelectParticipant = (id) => {
    setSelectedParticipantId(id)
    const match = participants.find((p) => p.id === id)
    if (!match) return
    setParticipantEditForm({
      email: match.email || '',
      full_name: match.full_name || '',
      organization: match.organization || '',
      role: match.role || '',
      is_speaker: !!match.is_speaker,
      is_sponsor: !!match.is_sponsor
    })
  }

  const handleUpdateParticipant = async () => {
    if (!selectedParticipantId) return
    try {
      await api.updateParticipant(selectedParticipantId, participantEditForm)
      const refreshed = await api.getEventParticipants(selectedEventId)
      setParticipants(refreshed || [])
      toast.success('Participant updated')
    } catch {
      toast.error('Failed to update participant')
    }
  }

  const handleUpdateEvent = async () => {
    if (!selectedEventId) return
    try {
      const updated = await api.updateEvent(selectedEventId, eventForm)
      setEventDetails(updated)
      toast.success('Event updated')
    } catch {
      toast.error('Failed to update event')
    }
  }

  const handleDeleteEvent = async () => {
    if (!selectedEventId) return
    try {
      await api.deleteEvent(selectedEventId)
      const remaining = events.filter((ev) => ev.id !== selectedEventId)
      setEvents(remaining)
      setSelectedEventId(remaining[0]?.id || '')
      toast.success('Event deleted')
    } catch {
      toast.error('Failed to delete event')
    }
  }

  return (
    <div>
      <PageHeader
        index="07"
        eyebrow="Event Data"
        title="EVENT OPERATIONS"
        subtitle="Participants, schedule, and marketing content connected to the backend."
      />

      <div style={S.headerCard}>
        <div>
          <div style={S.headerLabel}>Event Selection</div>
          <select
            style={S.input}
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            {events.length === 0 && <option value="">No events found</option>}
            {events.map((ev) => (
              <option key={ev.id} value={ev.id}>{ev.name}</option>
            ))}
          </select>
        </div>
        <div style={S.headerMeta}>
          <div style={S.headerMetaRow}>
            <span style={S.headerMetaKey}>Start</span>
            <span>{eventDetails?.start_date ? new Date(eventDetails.start_date).toLocaleString() : 'TBD'}</span>
          </div>
          <div style={S.headerMetaRow}>
            <span style={S.headerMetaKey}>End</span>
            <span>{eventDetails?.end_date ? new Date(eventDetails.end_date).toLocaleString() : 'TBD'}</span>
          </div>
          <div style={S.headerMetaRow}>
            <span style={S.headerMetaKey}>Venue</span>
            <span>{eventDetails?.venue || 'TBD'}</span>
          </div>
        </div>
        <div style={S.headerStats}>
          <div style={S.statBox}>
            <div style={S.statLabel}>Participants</div>
            <div style={S.statValue}>{participants.length}</div>
          </div>
          <div style={S.statBox}>
            <div style={S.statLabel}>Sessions</div>
            <div style={S.statValue}>{schedule.length}</div>
          </div>
          <div style={S.statBox}>
            <div style={S.statLabel}>Posts</div>
            <div style={S.statValue}>{marketing.length}</div>
          </div>
        </div>
      </div>

      <section style={{ ...S.card, marginBottom: 20 }}>
        <div style={S.cardTitle}>Event Details</div>
        <div style={S.formGrid}>
          <input
            style={S.input}
            placeholder="Event name"
            value={eventForm.name}
            onChange={(e) => setEventForm((prev) => ({ ...prev, name: e.target.value }))}
          />
          <input
            style={S.input}
            placeholder="Event type"
            value={eventForm.event_type}
            onChange={(e) => setEventForm((prev) => ({ ...prev, event_type: e.target.value }))}
          />
          <input
            style={S.input}
            placeholder="Theme"
            value={eventForm.theme}
            onChange={(e) => setEventForm((prev) => ({ ...prev, theme: e.target.value }))}
          />
          <input
            style={S.input}
            placeholder="Location"
            value={eventForm.location}
            onChange={(e) => setEventForm((prev) => ({ ...prev, location: e.target.value }))}
          />
          <input
            style={S.input}
            placeholder="Venue"
            value={eventForm.venue}
            onChange={(e) => setEventForm((prev) => ({ ...prev, venue: e.target.value }))}
          />
          <textarea
            style={{ ...S.input, gridColumn: '1 / -1', minHeight: 80 }}
            placeholder="Description"
            value={eventForm.description}
            onChange={(e) => setEventForm((prev) => ({ ...prev, description: e.target.value }))}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
          <button style={S.primaryBtn} onClick={handleUpdateEvent} disabled={!selectedEventId}>Update Event</button>
          <button style={S.deleteBtn} onClick={handleDeleteEvent} disabled={!selectedEventId}>Delete Event</button>
        </div>
      </section>

      <div style={S.grid}>
        <section style={S.card}>
          <div style={S.cardTitle}>Participants</div>
          <div style={S.formGrid}>
            <input
              style={S.input}
              placeholder="Email"
              value={participantForm.email}
              onChange={(e) => setParticipantForm((p) => ({ ...p, email: e.target.value }))}
            />
            <input
              style={S.input}
              placeholder="Full name"
              value={participantForm.full_name}
              onChange={(e) => setParticipantForm((p) => ({ ...p, full_name: e.target.value }))}
            />
            <input
              style={S.input}
              placeholder="Organization"
              value={participantForm.organization}
              onChange={(e) => setParticipantForm((p) => ({ ...p, organization: e.target.value }))}
            />
            <input
              style={S.input}
              placeholder="Role"
              value={participantForm.role}
              onChange={(e) => setParticipantForm((p) => ({ ...p, role: e.target.value }))}
            />
            <label style={S.checkboxRow}>
              <input
                type="checkbox"
                checked={participantForm.is_speaker}
                onChange={(e) => setParticipantForm((p) => ({ ...p, is_speaker: e.target.checked }))}
              />
              Speaker
            </label>
            <label style={S.checkboxRow}>
              <input
                type="checkbox"
                checked={participantForm.is_sponsor}
                onChange={(e) => setParticipantForm((p) => ({ ...p, is_sponsor: e.target.checked }))}
              />
              Sponsor
            </label>
          </div>
          <button style={S.primaryBtn} onClick={handleCreateParticipant} disabled={!selectedEventId}>Add Participant</button>

          <div style={{ marginTop: 16, borderTop: '1px solid var(--border-2)', paddingTop: 12 }}>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>Update Participant</div>
            <select
              style={S.input}
              value={selectedParticipantId}
              onChange={(e) => handleSelectParticipant(e.target.value)}
            >
              {participants.length === 0 && <option value="">No participants</option>}
              {participants.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <input
                style={S.input}
                placeholder="Email"
                value={participantEditForm.email}
                onChange={(e) => setParticipantEditForm((prev) => ({ ...prev, email: e.target.value }))}
              />
              <input
                style={S.input}
                placeholder="Full name"
                value={participantEditForm.full_name}
                onChange={(e) => setParticipantEditForm((prev) => ({ ...prev, full_name: e.target.value }))}
              />
              <input
                style={S.input}
                placeholder="Organization"
                value={participantEditForm.organization}
                onChange={(e) => setParticipantEditForm((prev) => ({ ...prev, organization: e.target.value }))}
              />
              <input
                style={S.input}
                placeholder="Role"
                value={participantEditForm.role}
                onChange={(e) => setParticipantEditForm((prev) => ({ ...prev, role: e.target.value }))}
              />
              <label style={S.checkboxRow}>
                <input
                  type="checkbox"
                  checked={participantEditForm.is_speaker}
                  onChange={(e) => setParticipantEditForm((prev) => ({ ...prev, is_speaker: e.target.checked }))}
                />
                Speaker
              </label>
              <label style={S.checkboxRow}>
                <input
                  type="checkbox"
                  checked={participantEditForm.is_sponsor}
                  onChange={(e) => setParticipantEditForm((prev) => ({ ...prev, is_sponsor: e.target.checked }))}
                />
                Sponsor
              </label>
            </div>
            <button style={S.primaryBtn} onClick={handleUpdateParticipant} disabled={!selectedParticipantId}>Update Participant</button>
          </div>

          <div style={{ marginTop: 16 }}>
            {loading ? (
              <div style={S.empty}>Loading participants...</div>
            ) : participants.length === 0 ? (
              <div style={S.empty}>No participants yet</div>
            ) : (
              <div style={S.table}>
                <div style={S.tableHeader}>
                  <div style={{ ...S.tableCell, flex: 2 }}>Name</div>
                  <div style={{ ...S.tableCell, flex: 2 }}>Email</div>
                  <div style={{ ...S.tableCell, flex: 1 }}>Role</div>
                  <div style={{ ...S.tableCell, flex: 1 }}>Org</div>
                  <div style={{ ...S.tableCell, flex: 0.6, textAlign: 'right' }}>Action</div>
                </div>
                {participants.map((p) => (
                  <div key={p.id} style={S.tableRow}>
                    <div style={{ ...S.tableCell, flex: 2 }}>{p.full_name}</div>
                    <div style={{ ...S.tableCell, flex: 2 }}>{p.email}</div>
                    <div style={{ ...S.tableCell, flex: 1 }}>{p.role || '-'}</div>
                    <div style={{ ...S.tableCell, flex: 1 }}>{p.organization || '-'}</div>
                    <div style={{ ...S.tableCell, flex: 0.6, textAlign: 'right' }}>
                      <button style={S.deleteBtn} onClick={() => handleDeleteParticipant(p.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section style={S.card}>
          <div style={S.cardTitle}>Schedule</div>
          {loading ? (
            <div style={S.empty}>Loading schedule...</div>
          ) : schedule.length === 0 ? (
            <div style={S.empty}>No schedule found</div>
          ) : (
            <div style={S.table}>
              <div style={S.tableHeader}>
                <div style={{ ...S.tableCell, flex: 2 }}>Session</div>
                <div style={{ ...S.tableCell, flex: 1 }}>Room</div>
                <div style={{ ...S.tableCell, flex: 1.4 }}>Start</div>
                <div style={{ ...S.tableCell, flex: 1.4 }}>End</div>
              </div>
              {schedule.map((s) => (
                <div key={s.id} style={S.tableRow}>
                  <div style={{ ...S.tableCell, flex: 2 }}>{s.session_name}</div>
                  <div style={{ ...S.tableCell, flex: 1 }}>{s.room || 'TBD'}</div>
                  <div style={{ ...S.tableCell, flex: 1.4 }}>{s.start_time ? new Date(s.start_time).toLocaleString() : 'TBD'}</div>
                  <div style={{ ...S.tableCell, flex: 1.4 }}>{s.end_time ? new Date(s.end_time).toLocaleString() : 'TBD'}</div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section style={S.card}>
          <div style={S.cardTitle}>Marketing Posts</div>
          {loading ? (
            <div style={S.empty}>Loading marketing posts...</div>
          ) : marketing.length === 0 ? (
            <div style={S.empty}>No marketing posts found</div>
          ) : (
            <div style={S.table}>
              <div style={S.tableHeader}>
                <div style={{ ...S.tableCell, flex: 1 }}>Platform</div>
                <div style={{ ...S.tableCell, flex: 3 }}>Content</div>
              </div>
              {marketing.map((m) => (
                <div key={m.id} style={S.tableRow}>
                  <div style={{ ...S.tableCell, flex: 1 }}>{m.platform || 'General'}</div>
                  <div style={{ ...S.tableCell, flex: 3 }}>{m.content}</div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

const S = {
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 },
  headerCard: { display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: 16, marginBottom: 20, background: 'var(--bg-1)', border: '1px solid var(--border)', padding: 16 },
  headerLabel: { fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 },
  headerMeta: { display: 'grid', gap: 6, fontSize: 12, color: 'var(--text-2)' },
  headerMetaRow: { display: 'flex', justifyContent: 'space-between', gap: 12 },
  headerMetaKey: { fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)' },
  headerStats: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 },
  statBox: { border: '1px solid var(--border-2)', padding: 10, textAlign: 'center' },
  statLabel: { fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-3)' },
  statValue: { fontSize: 18, fontWeight: 600, marginTop: 6 },
  card: { background: 'var(--bg-1)', border: '1px solid var(--border)', padding: 16 },
  cardTitle: { fontSize: 12, fontWeight: 600, marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.08em' },
  formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 },
  input: { background:'var(--bg)', border:'1px solid var(--border-2)', padding:'10px 12px', color:'var(--text-1)', fontSize:13, width:'100%', fontFamily:'var(--font-mono)', borderRadius:'var(--radius)' },
  checkboxRow: { display: 'flex', gap: 8, alignItems: 'center', fontSize: 12, color: 'var(--text-2)' },
  primaryBtn: { marginTop: 12, background:'var(--accent)', color:'#000', padding:'10px 12px', fontSize:12, fontWeight:600, borderRadius:4, border:'none', cursor:'pointer' },
  table: { display: 'flex', flexDirection: 'column', gap: 0, border: '1px solid var(--border-2)' },
  tableHeader: { display: 'flex', padding: '10px 12px', borderBottom: '1px solid var(--border-2)', background: 'rgba(255,255,255,0.02)', fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-3)' },
  tableRow: { display: 'flex', padding: '10px 12px', borderBottom: '1px solid rgba(255,255,255,0.03)' },
  tableCell: { fontSize: 12, color: 'var(--text-1)' },
  deleteBtn: { background: 'transparent', border: '1px solid var(--red)', color: 'var(--red)', padding: '4px 8px', fontSize: 10, borderRadius: 4, cursor: 'pointer' },
  empty: { fontSize: 12, color: 'var(--text-3)', padding: 12, border: '1px dashed var(--border-2)' }
}
