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

const USE_MOCK = true  // ← SET TO false WHEN BACKEND IS READY

const client = axios.create({
  baseURL: '/api',
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

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
  // Dashboard stats
  getStats: async () => {
    if (USE_MOCK) { await delay(400); return MOCK_STATS }
    const { data } = await client.get('/stats')
    return data
  },

  // Agent statuses
  getAgents: async () => {
    if (USE_MOCK) { await delay(300); return { agents: MOCK_AGENTS } }
    const { data } = await client.get('/agents/status')
    return data
  },

  // Activity feed
  getActivity: async () => {
    if (USE_MOCK) { await delay(300); return { feed: MOCK_ACTIVITY } }
    const { data } = await client.get('/activity')
    return data
  },

  // Events list
  getEvents: async () => {
    if (USE_MOCK) { await delay(300); return { events: MOCK_EVENTS } }
    const { data } = await client.get('/events')
    return data
  },

  createEvent: async (payload) => {
    if (USE_MOCK) { await delay(800); return { event: { id: Date.now().toString(), ...payload, status: 'planning', participants: 0 } } }
    const { data } = await client.post('/events', payload)
    return data
  },

  // Content agent
  generateContent: async ({ brief, event_name, audience }) => {
    if (USE_MOCK) { await delay(2000); return { posts: MOCK_POSTS, copy: `Promotional copy generated for ${event_name}. Ready to queue.` } }
    const { data } = await client.post('/agents/content/generate', { brief, event_name, audience })
    return data
  },

  // Email agent
  sendEmails: async ({ event_id, template, csv_data }) => {
    if (USE_MOCK) { await delay(2500); return { sent: 342, failed: 3 } }
    const { data } = await client.post('/agents/email/send', { event_id, template, csv_data })
    return data
  },

  // Scheduler agent
  buildSchedule: async ({ event_id, constraints, sessions }) => {
    if (USE_MOCK) { await delay(1800); return { schedule: MOCK_SCHEDULE } }
    const { data } = await client.post('/agents/schedule/build', { event_id, constraints, sessions })
    return data
  },

  resolveConflicts: async ({ event_id, new_constraint }) => {
    if (USE_MOCK) {
      await delay(1500)
      return { schedule: MOCK_SCHEDULE.map(s => ({ ...s, conflict: false })), changes: ['Hall B slot moved from 10:15 to 11:45', 'Participants notified via Email Agent'] }
    }
    const { data } = await client.post('/agents/schedule/resolve', { event_id, new_constraint })
    return data
  },

  // Orchestrator agent
  executeOrchestrator: async ({ instruction, event_name, tasks }) => {
    if (USE_MOCK) {
      await delay(3000)
      return {
        success: true,
        emails_sent: 342,
        events_created: 1,
        content_pieces: 5,
        posters_generated: 5,
        conflicts_resolved: 2,
        message: `Orchestrator completed all tasks for ${event_name}`
      }
    }
    const { data } = await client.post('/agents/orchestrator/execute', { instruction, event_name, tasks })
    return data
  },
}

export default api
