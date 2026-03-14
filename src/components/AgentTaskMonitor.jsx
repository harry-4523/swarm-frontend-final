import { useState, useEffect } from 'react'

export default function AgentTaskMonitor() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      agent: 'Content Agent',
      taskName: 'Generate Social Posts',
      status: 'completed',
      progress: 100,
      startTime: '10:30 AM',
      endTime: '10:45 AM',
      totalCompleted: 42
    },
    {
      id: 2,
      agent: 'Email Agent',
      taskName: 'Send Batch 1 Invitations',
      status: 'running',
      progress: 65,
      startTime: '10:48 AM',
      endTime: null,
      totalCompleted: 156
    },
    {
      id: 3,
      agent: 'Scheduler Agent',
      taskName: 'Timeline Conflict Detection',
      status: 'running',
      progress: 40,
      startTime: '10:50 AM',
      endTime: null,
      totalCompleted: 8
    },
    {
      id: 4,
      agent: 'Event Agent',
      taskName: 'Create Event & Posters',
      status: 'pending',
      progress: 0,
      startTime: null,
      endTime: null,
      totalCompleted: 1
    }
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks(prev => prev.map(task => {
        if (task.status === 'running' && task.progress < 100) {
          const newProgress = Math.min(task.progress + Math.random() * 5, 99)
          return { ...task, progress: Math.round(newProgress) }
        }
        return task
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status) => {
    switch(status) {
      case 'completed': return '#3DCC78'
      case 'running': return '#E8FF47'
      case 'pending': return 'rgba(255,255,255,0.2)'
      case 'failed': return '#EF5050'
      default: return 'rgba(255,255,255,0.3)'
    }
  }

  const getStatusLabel = (status) => {
    switch(status) {
      case 'completed': return 'Done'
      case 'running': return 'Working'
      case 'pending': return 'Queued'
      case 'failed': return 'Failed'
      default: return 'Unknown'
    }
  }

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>Agent Task Monitor</div>
        <div style={S.subtitle}>Real-time tracking of all agent activities</div>
      </div>

      <div style={S.table}>
        <div style={S.tableHeader}>
          <div style={{ ...S.col, flex: '0 0 160px' }}>Agent</div>
          <div style={{ ...S.col, flex: '1' }}>Task</div>
          <div style={{ ...S.col, flex: '0 0 120px' }}>Progress</div>
          <div style={{ ...S.col, flex: '0 0 100px' }}>Status</div>
          <div style={{ ...S.col, flex: '0 0 80px' }}>Time</div>
          <div style={{ ...S.col, flex: '0 0 80px' }}>Completed</div>
        </div>

        <div style={S.tableBody}>
          {tasks.map((task, idx) => (
            <div key={task.id} style={{ ...S.row, backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
              <div style={{ ...S.col, flex: '0 0 160px', fontWeight: 500 }}>{task.agent}</div>
              
              <div style={{ ...S.col, flex: '1', fontSize: 12 }}>{task.taskName}</div>
              
              <div style={{ ...S.col, flex: '0 0 120px' }}>
                <div style={S.progressContainer}>
                  <div style={S.progressBar}>
                    <div 
                      style={{ 
                        ...S.progressFill, 
                        width: task.progress + '%',
                        background: getStatusColor(task.status)
                      }} 
                    />
                  </div>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', minWidth: 30 }}>
                    {task.progress}%
                  </span>
                </div>
              </div>
              
              <div style={{ ...S.col, flex: '0 0 100px' }}>
                <div style={{ ...S.statusBadge, borderColor: getStatusColor(task.status) + '44', color: getStatusColor(task.status) }}>
                  <span style={{ width: 4, height: 4, borderRadius: '50%', background: getStatusColor(task.status), marginRight: 6, display: 'inline-block' }} />
                  {getStatusLabel(task.status)}
                </div>
              </div>
              
              <div style={{ ...S.col, flex: '0 0 80px', fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>
                {task.startTime && (
                  <div>{task.startTime}</div>
                )}
              </div>
              
              <div style={{ ...S.col, flex: '0 0 80px', fontSize: 12, fontWeight: 500 }}>
                {task.totalCompleted} items
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={S.summary}>
        <div style={S.summaryItem}>
          <div style={S.summaryLabel}>Completed Tasks</div>
          <div style={{ ...S.summaryValue, color: '#3DCC78' }}>4</div>
        </div>
        <div style={S.summaryItem}>
          <div style={S.summaryLabel}>In Progress</div>
          <div style={{ ...S.summaryValue, color: '#E8FF47' }}>2</div>
        </div>
        <div style={S.summaryItem}>
          <div style={S.summaryLabel}>Queued</div>
          <div style={{ ...S.summaryValue, color: 'rgba(255,255,255,0.5)' }}>1</div>
        </div>
        <div style={S.summaryItem}>
          <div style={S.summaryLabel}>Total Processed</div>
          <div style={{ ...S.summaryValue, color: '#E8FF47' }}>207</div>
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
  table: { display: 'flex', flexDirection: 'column' },
  tableHeader: { display: 'flex', padding: '12px 20px', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid var(--border)', alignItems: 'center' },
  tableBody: {},
  row: { display: 'flex', padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.03)', alignItems: 'center' },
  col: { display: 'flex', alignItems: 'center', fontSize: 13, color: 'var(--text-1)' },
  progressContainer: { display: 'flex', alignItems: 'center', gap: 8, flex: 1 },
  progressBar: { flex: 1, height: 3, background: 'rgba(255,255,255,0.06)', borderRadius: 1.5 },
  progressFill: { height: '100%', borderRadius: 1.5, transition: 'width 0.8s ease-out' },
  statusBadge: { border: '1px solid', padding: '4px 10px', borderRadius: 3, fontSize: 11, fontWeight: 500, display: 'flex', alignItems: 'center' },
  summary: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', padding: 20, borderTop: '1px solid var(--border)', gap: 16 },
  summaryItem: { display: 'flex', flexDirection: 'column' },
  summaryLabel: { fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em' },
  summaryValue: { fontSize: 20, fontWeight: 600 }
}
