const delay = (ms = 600) => new Promise(r => setTimeout(r, ms))

export const fetchAgents = async () => {
  await delay()
  return [
    { id: 'content', name: 'Content Strategist', subtitle: 'Social Media Agent', color: '#c8ff00', icon: '✦', status: 'running', progress: 82, tasksCompleted: 14, tasksTotal: 17, lastAction: 'Queued 3 posts for 7:30 PM peak window', capabilities: ['Copywriting','Engagement Analytics','Post Scheduling','Hype Campaigns'] },
    { id: 'comms', name: 'Communications', subtitle: 'Targeted Mailing Agent', color: '#ff3cac', icon: '◈', status: 'complete', progress: 100, tasksCompleted: 8, tasksTotal: 8, lastAction: '1,203 personalized emails dispatched', capabilities: ['CSV/Excel Parsing','Email Personalization','Bulk Dispatch','Segmentation'] },
    { id: 'scheduler', name: 'Dynamic Scheduler', subtitle: 'Conflict Resolver Agent', color: '#3cffd0', icon: '◎', status: 'resolving', progress: 55, tasksCompleted: 5, tasksTotal: 9, lastAction: 'Resolving Hall B & Hall C overlap...', capabilities: ['Timeline Management','Clash Detection','Auto-Reschedule','Participant Notify'] },
    { id: 'orchestrator', name: 'Orchestrator', subtitle: 'State Manager', color: '#ffaa00', icon: '⬡', status: 'idle', progress: 100, tasksCompleted: 3, tasksTotal: 3, lastAction: 'All tasks routed. Monitoring for new constraints.', capabilities: ['Task Routing','Memory Management','Agent Coordination','State Sync'] },
  ]
}

export const fetchStats = async () => {
  await delay(400)
  return { participants: 2847, participantsDelta: '+142 today', emailsSent: 1203, emailsDelivery: '98.4%', conflictsResolved: 7, postsQueued: 9, activeAgents: 3, scheduleSessions: 2 }
}

export const fetchActivity = async () => {
  await delay(300)
  return [
    { id: 1, time: 'now', color: '#3cffd0', text: 'Hall B clash detected — recalculating master timeline' },
    { id: 2, time: '2m',  color: '#ff3cac', text: '342 personalized emails dispatched to Track B attendees' },
    { id: 3, time: '5m',  color: '#c8ff00', text: '3 social posts queued — peak engagement window: 7:30 PM' },
    { id: 4, time: '9m',  color: '#ffaa00', text: 'New constraint routed to Scheduler Agent' },
    { id: 5, time: '12m', color: '#ff3cac', text: 'CSV parsed — 2,847 valid participant emails extracted' },
    { id: 6, time: '18m', color: '#c8ff00', text: 'Promotional copy generated for TechSummit 2026 opening' },
    { id: 7, time: '24m', color: '#ffaa00', text: 'Swarm initialized — 4 agents activated for TechSummit 2026' },
  ]
}

export const fetchSchedule = async () => {
  await delay(500)
  return [
    { id: 1, title: 'Opening Keynote',     speaker: 'Dr. Ananya Sharma', room: 'Main Hall', start: '09:00', end: '09:45', track: 'Keynote',  conflict: false },
    { id: 2, title: 'AI in Production',    speaker: 'Rahul Mehta',       room: 'Hall A',    start: '10:00', end: '11:00', track: 'AI/ML',    conflict: false },
    { id: 3, title: 'LLM Fine-Tuning',     speaker: 'Priya Nair',        room: 'Hall B',    start: '10:00', end: '11:30', track: 'AI/ML',    conflict: true  },
    { id: 4, title: 'DevOps at Scale',     speaker: 'Vikram Singh',       room: 'Hall C',    start: '11:00', end: '12:00', track: 'DevOps',   conflict: true  },
    { id: 5, title: 'Lunch Break',         speaker: '',                  room: 'Cafeteria', start: '12:00', end: '13:00', track: 'Break',    conflict: false },
    { id: 6, title: 'Multi-Agent Systems', speaker: 'Sneha Kapoor',      room: 'Hall A',    start: '13:00', end: '14:00', track: 'AI/ML',    conflict: false },
    { id: 7, title: 'React Performance',   speaker: 'Arjun Patel',       room: 'Hall B',    start: '14:00', end: '15:00', track: 'Frontend', conflict: false },
    { id: 8, title: 'Cloud Native Apps',   speaker: 'Deepika Rao',       room: 'Hall C',    start: '14:00', end: '15:30', track: 'DevOps',   conflict: false },
    { id: 9, title: 'Closing Panel',       speaker: 'All Speakers',      room: 'Main Hall', start: '16:00', end: '17:00', track: 'Keynote',  conflict: false },
  ]
}

export const postEventConfig = async (data) => {
  await delay(1200)
  return { success: true, eventId: 'EVT-' + Date.now(), message: 'Swarm deployed successfully!' }
}

export const uploadCSV = async (file) => {
  await delay(1000)
  return { success: true, count: Math.floor(Math.random() * 500) + 500, message: file.name + ' processed successfully' }
}

export const generateContent = async (prompt, type) => {
  await delay(1500)
  if (type === 'social') return {
    success: true,
    posts: [
      '🚀 TechSummit 2026 is HERE! 500+ developers. 40+ talks. 1 unforgettable weekend. Ready to build the future? #TechSummit2026',
      'The wait is over. Registration is LIVE for TechSummit 2026 🎯 Keynotes | Workshops | Hackathon | Networking → link in bio',
      '💡 What happens when 500 devs enter one building for 48 hours? Magic. TechSummit 2026 — register now! ⚡',
    ]
  }
  if (type === 'email') return {
    success: true,
    draft: `Subject: You're invited — TechSummit 2026 🚀\n\nHi {{name}},\n\nWe're thrilled to invite you to TechSummit 2026 — Delhi's premier technical summit.\n\n📅 Date: April 12–13, 2026\n📍 Venue: {{venue}}\n\nYour track: {{track}}\nSession time: {{time}}\n\nSee you there,\nThe TechSummit Team`
  }
  return { success: true, content: 'Generated: ' + prompt }
}
