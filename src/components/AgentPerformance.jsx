import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

export default function AgentPerformance() {
  // Performance data for each agent
  const agentPerformanceData = [
    { agent: 'Email Agent', tasksCompleted: 156, avgTime: '3.2m', successRate: 98 },
    { agent: 'Content Agent', tasksCompleted: 42, avgTime: '2.1m', successRate: 100 },
    { agent: 'Scheduler Agent', tasksCompleted: 28, avgTime: '1.5m', successRate: 96 },
    { agent: 'Event Agent', tasksCompleted: 8, avgTime: '4.3m', successRate: 95 }
  ]

  // Timeline data
  const timelineData = [
    { time: '9:00', tasks: 12 },
    { time: '10:00', tasks: 28 },
    { time: '11:00', tasks: 35 },
    { time: '12:00', tasks: 42 },
    { time: '1:00', tasks: 38 },
    { time: '2:00', tasks: 45 },
    { time: '3:00', tasks: 52 }
  ]

  // Task types distribution
  const taskDistribution = [
    { name: 'Emails', value: 156, fill: '#E8FF47' },
    { name: 'Posts', value: 42, fill: '#3DCC78' },
    { name: 'Events', value: 28, fill: '#3cffd0' },
    { name: 'Scheduling', value: 8, fill: '#ff3cac' }
  ]

  // Success rate by agent
  const successData = [
    { agent: 'Email', rate: 98 },
    { agent: 'Content', rate: 100 },
    { agent: 'Scheduler', rate: 96 },
    { agent: 'Event', rate: 95 }
  ]

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>Agent Performance Dashboard</div>
        <div style={S.subtitle}>Real-time metrics and analytics</div>
      </div>

      {/* Stats Summary */}
      <div style={S.statsGrid}>
        <div style={S.statCard}>
          <div style={S.statLabel}>Total Tasks Processed</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#E8FF47', marginBottom: 4 }}>234</div>
          <div style={S.statSubtext}>Last 8 hours</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Average Success Rate</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#3DCC78', marginBottom: 4 }}>97.3%</div>
          <div style={S.statSubtext}>Across all agents</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Average Task Duration</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#3cffd0', marginBottom: 4 }}>2.8m</div>
          <div style={S.statSubtext}>Per task</div>
        </div>
        <div style={S.statCard}>
          <div style={S.statLabel}>Active Agents</div>
          <div style={{ fontSize: 32, fontWeight: 600, color: '#ff3cac', marginBottom: 4 }}>3/4</div>
          <div style={S.statSubtext}>Running now</div>
        </div>
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 24 }}>
        {/* Tasks Over Time */}
        <div style={S.chartBox}>
          <div style={S.chartTitle}>Task Activity Timeline</div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="time" stroke="rgba(255,255,255,0.3)" />
              <YAxis stroke="rgba(255,255,255,0.3)" />
              <Tooltip contentStyle={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }} />
              <Line type="monotone" dataKey="tasks" stroke="#E8FF47" strokeWidth={2} dot={{ fill: '#E8FF47' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Task Distribution */}
        <div style={S.chartBox}>
          <div style={S.chartTitle}>Task Type Distribution</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name} ${value}`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {taskDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Success Rate */}
        <div style={S.chartBox}>
          <div style={S.chartTitle}>Success Rate by Agent</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={successData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="agent" stroke="rgba(255,255,255,0.3)" />
              <YAxis stroke="rgba(255,255,255,0.3)" domain={[90, 100]} />
              <Tooltip contentStyle={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }} />
              <Bar dataKey="rate" fill="#3DCC78" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Agent Workload */}
        <div style={S.chartBox}>
          <div style={S.chartTitle}>Tasks Completed by Agent</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={agentPerformanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis dataKey="agent" angle={-45} textAnchor="end" height={100} stroke="rgba(255,255,255,0.3)" />
              <YAxis stroke="rgba(255,255,255,0.3)" />
              <Tooltip contentStyle={{ background: '#1a1a1e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 4 }} />
              <Bar dataKey="tasksCompleted" fill="#E8FF47" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Agent Stats */}
      <div style={{ padding: 24 }}>
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Agent Performance Details</div>
        <div style={S.agentTable}>
          <div style={S.tableHeader}>
            <div style={{ flex: 1 }}>Agent</div>
            <div style={{ flex: 0.8, textAlign: 'right' }}>Tasks</div>
            <div style={{ flex: 0.8, textAlign: 'right' }}>Avg Time</div>
            <div style={{ flex: 0.8, textAlign: 'right' }}>Success</div>
          </div>
          {agentPerformanceData.map((item, idx) => (
            <div key={idx} style={{ ...S.tableRow, background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
              <div style={{ flex: 1, fontSize: 12, fontWeight: 500 }}>{item.agent}</div>
              <div style={{ flex: 0.8, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#E8FF47' }}>{item.tasksCompleted}</div>
              <div style={{ flex: 0.8, textAlign: 'right', fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>{item.avgTime}</div>
              <div style={{ flex: 0.8, textAlign: 'right', fontSize: 12, fontWeight: 600, color: '#3DCC78' }}>{item.successRate}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const S = {
  container: { background: 'var(--bg-1)', border: '1px solid var(--border)', borderRadius: 4 },
  header: { padding: 20, borderBottom: '1px solid var(--border)' },
  title: { fontSize: 14, fontWeight: 600, marginBottom: 4 },
  subtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, padding: 24, borderBottom: '1px solid var(--border)' },
  statCard: { background: 'var(--bg)', border: '1px solid var(--border-2)', padding: 16, borderRadius: 4 },
  statLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 },
  statSubtext: { fontSize: 10, color: 'rgba(255,255,255,0.3)' },
  chartBox: { background: 'var(--bg)', border: '1px solid var(--border-2)', padding: 16, borderRadius: 4 },
  chartTitle: { fontSize: 12, fontWeight: 600, marginBottom: 12, color: 'var(--text-1)' },
  agentTable: { background: 'var(--bg)', border: '1px solid var(--border-2)', borderRadius: 4, overflow: 'hidden' },
  tableHeader: { display: 'flex', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border-2)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)' },
  tableRow: { display: 'flex', padding: '12px 16px', alignItems: 'center', fontSize: 12, borderBottom: '1px solid rgba(255,255,255,0.03)' }
}
