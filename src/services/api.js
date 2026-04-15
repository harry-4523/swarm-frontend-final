/**
 * SWARM — API Service Layer
 * ─────────────────────────────────────────────────────────────────────
 * All API calls go through here. Backend teammate just needs to match
 * these endpoints exactly. Mocks return realistic data when USE_MOCK=true.
 * ─────────────────────────────────────────────────────────────────────
 * BASE URL: http://localhost:8000  (proxied via vite to /api)
 *
 * ENDPOINTS EXPECTED FROM BACKEND:
 *
 * GET  /api/agents/status              → { agents: Agent[] }
 * GET  /api/events                     → { events: Event[] }
 * POST /api/events                     → { event: Event }
 * GET  /api/events/:id                 → { event: Event }
 * POST /api/agents/content/generate    → { posts: Post[], copy: string }
 * POST /api/agents/email/send          → { sent: number, failed: number }
 * POST /api/agents/schedule/build      → { schedule: Session[] }
 * POST /api/agents/schedule/resolve    → { schedule: Session[], changes: string[] }
 * GET  /api/activity                   → { feed: ActivityItem[] }
 * GET  /api/stats                      → { participants, emails_sent, conflicts_resolved, posts_queued }
 */

import axios from 'axios'

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

const resolveLatestEventId = async () => {
  try {
    const { data } = await client.get('/events')
    const events = Array.isArray(data) ? data : data.events || []
    return events[0]?.id || null
  } catch {
    return null
  }
}

const toFeedItem = (label, createdAt, color) => ({
  id: `${label}-${createdAt}`,
  time: new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  color,
  text: label
})

client.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('swarm_token');
    }
    return Promise.reject(error);
  }
)

// ─── MOCK DATA ────────────────────────────────────────────────────────

const MOCK_STATS = {
  participants: 2847,
  emails_sent: 1203,
  conflicts_resolved: 7,
  posts_queued: 14
}

const MOCK_AGENTS = [
  { id: 'content', name: 'Content Strategist Agent', status: 'running', progress: 82, color: '#c8ff00', icon: '✦', task: 'Generating post series for TechSummit 2026' },
  { id: 'email',   name: 'Communications Agent',    status: 'complete', progress: 100, color: '#ff3cac', icon: '◈', task: 'Dispatched 1,203 emails to segmented groups' },
  { id: 'scheduler', name: 'Dynamic Scheduler Agent', status: 'resolving', progress: 55, color: '#3cffd0', icon: '◎', task: 'Resolving Hall B time conflict — Session 4' },
  { id: 'orchestrator', name: 'Orchestrator', status: 'idle', progress: 100, color: '#ffaa00', icon: '⬡', task: 'Monitoring agent states — all systems nominal' }
]

const MOCK_ACTIVITY = [
  { id: 1, time: 'now',  agent: 'scheduler', color: '#3cffd0', text: 'Scheduler recalculated — Hall B clash auto-resolved' },
  { id: 2, time: '2m',   agent: 'email',    color: '#ff3cac', text: '342 personalized emails dispatched to Track B attendees' },
  { id: 3, time: '5m',   agent: 'content',  color: '#c8ff00', text: '3 social posts queued — peak window 7:30 PM detected' },
  { id: 4, time: '9m',   agent: 'orchestrator', color: '#ffaa00', text: 'Orchestrator routed new constraint to Scheduler' },
  { id: 5, time: '12m',  agent: 'content',  color: '#c8ff00', text: 'Swarm initialized for TechSummit 2026' },
  { id: 6, time: '18m',  agent: 'email',    color: '#ff3cac', text: 'Registration CSV parsed — 2,847 participants validated' },
]

const MOCK_SCHEDULE = [
  { id: 1, title: 'Opening Keynote', speaker: 'Dr. Arjun Mehta', room: 'Main Hall', start: '09:00', end: '10:00', track: 'Keynote', conflict: false },
  { id: 2, title: 'AI in Production', speaker: 'Priya Sharma', room: 'Hall A', start: '10:15', end: '11:15', track: 'AI/ML', conflict: false },
  { id: 3, title: 'Multi-Agent Systems', speaker: 'Rohan Das', room: 'Hall B', start: '10:15', end: '11:15', track: 'AI/ML', conflict: true },
  { id: 4, title: 'DevOps at Scale', speaker: 'Sneha Patel', room: 'Hall C', start: '11:30', end: '12:30', track: 'DevOps', conflict: false },
  { id: 5, title: 'LangChain Workshop', speaker: 'Aditya Kumar', room: 'Hall B', start: '13:00', end: '15:00', track: 'Workshop', conflict: false },
  { id: 6, title: 'Closing Panel', speaker: 'All Speakers', room: 'Main Hall', start: '16:00', end: '17:00', track: 'Keynote', conflict: false },
]

const MOCK_EVENTS = [
  { id: '1', name: 'TechSummit 2026', date: '2026-04-15', participants: 2847, status: 'active' },
  { id: '2', name: 'HackFest Delhi', date: '2026-05-02', participants: 600, status: 'planning' },
]

const MOCK_POSTS = [
  { id: 1, platform: 'Twitter/X', content: '🚀 TechSummit 2026 is 2 weeks away! 2,847 innovators. 40+ speakers. 1 unforgettable event. Are you ready? #TechSummit2026', best_time: '7:30 PM', engagement_score: 94 },
  { id: 2, platform: 'LinkedIn', content: 'We\'re thrilled to announce our speaker lineup for TechSummit 2026. Join 2,847+ tech leaders as we explore the future of AI, DevOps, and scalable systems.', best_time: '8:00 AM', engagement_score: 87 },
  { id: 3, platform: 'Instagram', content: '⚡ The countdown begins. TechSummit 2026 — April 15. Link in bio for early registration. 🔥', best_time: '6:00 PM', engagement_score: 91 },
]

// ─── MOCK DELAY HELPER ───────────────────────────────────────────────

const delay = (ms = 800) => new Promise(r => setTimeout(r, ms))

// ─── API FUNCTIONS ────────────────────────────────────────────────────

export const api = {
  // Auth
  setToken: (token) => {
    if (token) {
      client.defaults.headers.common['Authorization'] = `Bearer ${token}`
    } else {
      delete client.defaults.headers.common['Authorization']
    }
  },
  login: async ({ username, password }) => {
    if (USE_MOCK) { await delay(500); return { access_token: 'mock-token' } }
    const { data } = await client.post('/auth/login', { username, password }, {
      headers: { 'Content-Type': 'application/json' }
    });
    return data;
  },
  register: async (userData) => {
    if (USE_MOCK) { await delay(500); return { email: userData.email, username: userData.username } }
    const { data } = await client.post('/auth/register', userData)
    return data
  },
  getMe: async () => {
    if (USE_MOCK) { await delay(300); return { username: 'testuser', role: 'admin' } }
    const { data } = await client.get('/auth/me')
    return data
  },

  // Dashboard stats
  getStats: async () => {
    if (USE_MOCK) { await delay(400); return MOCK_STATS }
    const eventId = await resolveLatestEventId()
    if (!eventId) {
      return { participants: 0, emails_sent: 0, conflicts_resolved: 0, posts_queued: 0 }
    }
    const [summaryRes, participantsRes] = await Promise.all([
      client.get(`/agents/orchestrator/event/${eventId}/summary`),
      client.get(`/participants/event/${eventId}`)
    ])
    const summary = summaryRes.data
    const participants = Array.isArray(participantsRes.data) ? participantsRes.data.length : 0
    return {
      participants,
      emails_sent: summary.emails?.sent || 0,
      conflicts_resolved: 0,
      posts_queued: summary.marketing?.total_posts || 0
    }
  },

  // Agent statuses
  getAgents: async () => {
    if (USE_MOCK) { await delay(300); return { agents: MOCK_AGENTS } }
    const eventId = await resolveLatestEventId()
    if (!eventId) return { agents: [] }
    const { data } = await client.get(`/agents/orchestrator/event/${eventId}/summary`)
    const latestByAgent = new Map()
    for (const log of data.agent_logs || []) {
      if (!latestByAgent.has(log.agent_name)) {
        latestByAgent.set(log.agent_name, log)
      }
    }

    const mapStatus = (status) => {
      if (status === 'completed') return 'complete'
      if (status === 'failed') return 'error'
      return 'running'
    }

    const agents = [
      { id: 'content', name: 'Content Strategist Agent', task: 'Marketing content generation' },
      { id: 'email', name: 'Communications Agent', task: 'Email workflows' },
      { id: 'scheduler', name: 'Dynamic Scheduler Agent', task: 'Schedule optimization' },
      { id: 'analytics', name: 'Analytics Agent', task: 'Insights & reports' }
    ].map((agent) => {
      const log = latestByAgent.get(agent.name)
      const status = mapStatus(log?.status || 'idle')
      return {
        ...agent,
        status,
        progress: status === 'complete' ? 100 : status === 'error' ? 0 : 60,
        color: status === 'complete' ? '#3DCC78' : status === 'error' ? '#EF5050' : '#E8FF47',
        icon: '●'
      }
    })
    return { agents }
  },

  // Activity feed
  getActivity: async () => {
    if (USE_MOCK) { await delay(300); return { feed: MOCK_ACTIVITY } }
    const eventId = await resolveLatestEventId()
    if (!eventId) return { feed: [] }
    const { data } = await client.get(`/agents/orchestrator/event/${eventId}/summary`)
    const feed = []

    for (const log of data.agent_logs || []) {
      feed.push(toFeedItem(`${log.agent_name} ${log.status}`, log.created_at, '#E8FF47'))
    }
    for (const email of data.emails?.recent || []) {
      feed.push(toFeedItem(`Email ${email.status}: ${email.recipient_email}`, email.created_at, '#ff3cac'))
    }
    for (const post of data.marketing?.recent || []) {
      feed.push(toFeedItem(`Post (${post.platform}): ${post.content}`, post.created_at, '#c8ff00'))
    }
    for (const session of data.schedule?.recent || []) {
      feed.push(toFeedItem(`Session: ${session.session_name}`, session.start_time || new Date().toISOString(), '#3cffd0'))
    }

    return { feed: feed.slice(0, 12) }
  },

  // Events list
  getEvents: async () => {
    if (USE_MOCK) { await delay(300); return { events: MOCK_EVENTS } }
    const { data } = await client.get('/events')
    // If backend returns array directly, wrap it in an object to match the mock structure
    return Array.isArray(data) ? { events: data } : data;
  },

  createEvent: async (payload) => {
    if (USE_MOCK) { await delay(800); return { event: { id: Date.now().toString(), ...payload, status: 'planning', participants: 0 } } }
    
    // Construct ISO Strings from date and time fields
    const start_date = new Date(`${payload.start_date}T${payload.start_time}:00`).toISOString();
    const end_date = new Date(`${payload.end_date}T${payload.end_time}:00`).toISOString();
    
    const backendPayload = {
      name: payload.name,
      description: payload.description || undefined,
      event_type: payload.event_type || undefined,
      theme: payload.theme || undefined,
      target_audience: payload.target_audience || undefined,
      start_date,
      end_date,
      location: payload.location || undefined,
      venue: payload.venue || undefined,
      max_participants: payload.max_participants ? parseInt(payload.max_participants, 10) : undefined,
      event_metadata: {
        speaker: payload.speaker || undefined
      }
    };
    
    const { data } = await client.post('/events', backendPayload)
    return { event: data }
  },

  // Participants
  uploadCSV: async (event_id, file) => {
    if (USE_MOCK) { await delay(500); return { participants: [] } }
    const formData = new FormData()
    formData.append('file', file)
    const { data } = await client.post(`/participants/upload-csv?event_id=${event_id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    return data
  },

  // Content agent
  generateContent: async ({ event_id, platforms }) => {
    if (USE_MOCK) { await delay(2000); return { posts: MOCK_POSTS } }
    const { data } = await client.post('/agents/marketing/generate', { event_id, platforms })
    return data
  },

  // Email agent
  prepareEmails: async ({ event_id, template, subject }) => {
    if (USE_MOCK) { await delay(2500); return { sent: 342, failed: 3 } }
    const { data } = await client.post('/agents/email/prepare', {
      event_id,
      email_template: template,
      subject: subject || 'Event Update'
    })
    return data
  },

  sendPreparedEmails: async ({ event_id, emails }) => {
    if (USE_MOCK) { await delay(1500); return { sent: emails.length, failed: 0 } }
    const { data } = await client.post('/agents/email/send', { event_id, emails })
    return data
  },

  selectEmailVariations: async ({ event_id, selected_variations }) => {
    if (USE_MOCK) { await delay(1500); return { prepared: 25, emails_prepared: [] } }
    const { data } = await client.post('/agents/email/select-variations', { event_id, selected_variations })
    return data
  },

  // Orchestrator endpoints
  orchestratorExecuteAgent: async (eventId, agentType) => {
    if (USE_MOCK) { await delay(2000); return { status: 'completed', agent: agentType, message: `${agentType} executed`, results: {} } }
    const { data } = await client.post(`/agents/orchestrator/event/${eventId}/execute-agent/${agentType}`)
    return data
  },

  orchestratorEventSummary: async (eventId) => {
    if (USE_MOCK) { 
      await delay(500)
      return {
        event: { id: eventId, name: 'Event', participants_count: 50 },
        agent_logs: [],
        emails: { total: 0, sent: 0, pending: 0, failed: 0, recent: [] },
        marketing: { total_posts: 0, by_platform: {}, published: 0, recent: [] },
        schedule: { total_sessions: 0, recent: [] },
        analytics: { reports_generated: 0, recent: [] }
      }
    }
    const { data } = await client.get(`/agents/orchestrator/event/${eventId}/summary`)
    return data
  },

  // Scheduler agent
  buildSchedule: async ({ event_id, optimization_goals }) => {
    if (USE_MOCK) { await delay(1800); return { schedule: MOCK_SCHEDULE } }
    const { data } = await client.post('/agents/schedule/generate', { event_id, optimization_goals })
    return data
  },


  getEventParticipants: async (eventId) => {
    const { data } = await client.get(`/participants/event/${eventId}`)
    return data
  },

  createParticipant: async (payload) => {
    const { data } = await client.post('/participants', payload)
    return data
  },

  deleteParticipant: async (participantId) => {
    const { data } = await client.delete(`/participants/${participantId}`)
    return data
  },

  updateParticipant: async (participantId, payload) => {
    const { data } = await client.put(`/participants/${participantId}`, payload)
    return data
  },

  getEventSchedule: async (eventId) => {
    const { data } = await client.get(`/events/${eventId}/schedule`)
    return data
  },

  getEventMarketing: async (eventId) => {
    const { data } = await client.get(`/events/${eventId}/marketing`)
    return data
  },

  getEvent: async (eventId) => {
    const { data } = await client.get(`/events/${eventId}`)
    return data
  },

  updateEvent: async (eventId, payload) => {
    const { data } = await client.put(`/events/${eventId}`, payload)
    return data
  },

  deleteEvent: async (eventId) => {
    const { data } = await client.delete(`/events/${eventId}`)
    return data
  },

  generateAnalytics: async (eventId) => {
    const { data } = await client.post('/agents/analytics/generate', { event_id: eventId })
    return data
  },

  runWorkflow: async (eventId, workflowType, parameters) => {
    const { data } = await client.post('/agents/workflow/run', {
      event_id: eventId,
      workflow_type: workflowType,
      parameters: parameters || {}
    })
    return data
  }
}

export default api
