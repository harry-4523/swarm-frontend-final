import { useState } from 'react'
import toast from 'react-hot-toast'

export default function TaskScheduler() {
  const [scheduledTasks, setScheduledTasks] = useState([
    {
      id: 1,
      taskName: 'Send Follow-up Emails',
      agent: 'Email Agent',
      scheduledTime: '2026-03-15, 6:00 PM',
      status: 'scheduled',
      description: 'Send reminder emails to registered participants'
    },
    {
      id: 2,
      taskName: 'Create Post Schedule',
      agent: 'Content Agent',
      scheduledTime: '2026-03-16, 9:00 AM',
      status: 'scheduled',
      description: 'Schedule social media posts 2 days before event'
    }
  ])

  const [newTask, setNewTask] = useState({
    taskName: '',
    agent: 'Email Agent',
    daysLater: 2,
    time: '18:00',
    description: ''
  })

  const agents = [
    'Email Agent',
    'Content Agent',
    'Scheduler Agent',
    'Event Agent'
  ]

  const handleAddTask = () => {
    if (!newTask.taskName.trim()) {
      toast.error('Enter task name')
      return
    }

    const date = new Date()
    date.setDate(date.getDate() + newTask.daysLater)
    const [hours, minutes] = newTask.time.split(':')
    date.setHours(parseInt(hours), parseInt(minutes), 0)
    
    const scheduledTime = date.toLocaleString()

    const task = {
      id: Date.now(),
      taskName: newTask.taskName,
      agent: newTask.agent,
      scheduledTime: scheduledTime,
      status: 'scheduled',
      description: newTask.description
    }

    setScheduledTasks([...scheduledTasks, task])
    setNewTask({ taskName: '', agent: 'Email Agent', daysLater: 2, time: '18:00', description: '' })
    toast.success('Task scheduled')
  }

  const cancelTask = (id) => {
    setScheduledTasks(prev => prev.filter(t => t.id !== id))
    toast.success('Task cancelled')
  }

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={S.title}>Scheduled Tasks</div>
        <div style={S.subtitle}>Set tasks to run automatically at specific times</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, padding: 24 }}>
        {/* Schedule New Task */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Schedule New Task</div>

          <div style={S.formGroup}>
            <Label>Task Name</Label>
            <input
              style={S.input}
              value={newTask.taskName}
              onChange={e => setNewTask({ ...newTask, taskName: e.target.value })}
              placeholder="Task description"
            />
          </div>

          <div style={S.formGroup}>
            <Label>Select Agent</Label>
            <select
              style={S.select}
              value={newTask.agent}
              onChange={e => setNewTask({ ...newTask, agent: e.target.value })}
            >
              {agents.map(a => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div style={S.row}>
            <div style={S.formGroup}>
              <Label>Days Later</Label>
              <input
                style={S.numberInput}
                type="number"
                min="0"
                max="30"
                value={newTask.daysLater}
                onChange={e => setNewTask({ ...newTask, daysLater: Math.max(0, parseInt(e.target.value) || 0) })}
              />
            </div>
            <div style={S.formGroup}>
              <Label>Time</Label>
              <input
                style={S.input}
                type="time"
                value={newTask.time}
                onChange={e => setNewTask({ ...newTask, time: e.target.value })}
              />
            </div>
          </div>

          <div style={S.formGroup}>
            <Label>Details</Label>
            <textarea
              style={{ ...S.input, height: 80, resize: 'vertical' }}
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
              placeholder="Optional: Additional details for the task"
            />
          </div>

          <button style={S.button} onClick={handleAddTask}>
            Schedule Task
          </button>
        </div>

        {/* Scheduled Tasks List */}
        <div style={S.section}>
          <div style={S.sectionTitle}>Upcoming Executions</div>
          <div style={S.tasksList}>
            {scheduledTasks.length === 0 ? (
              <div style={S.empty}>No scheduled tasks</div>
            ) : (
              scheduledTasks.map(task => (
                <div key={task.id} style={S.taskItem}>
                  <div style={S.taskHeader}>
                    <div style={S.taskName}>{task.taskName}</div>
                    <button
                      onClick={() => cancelTask(task.id)}
                      style={S.cancelBtn}
                    >
                      Cancel
                    </button>
                  </div>
                  <div style={S.taskMeta}>
                    <div>Agent: {task.agent}</div>
                    <div>Execute: {task.scheduledTime}</div>
                    {task.description && <div>Details: {task.description}</div>}
                  </div>
                  <div style={{ ...S.taskStatus, background: task.status === 'scheduled' ? 'rgba(232,255,71,0.08)' : 'rgba(61,204,120,0.08)' }}>
                    <span style={{ color: task.status === 'scheduled' ? '#E8FF47' : '#3DCC78' }}>
                      {task.status === 'scheduled' ? 'Queued' : 'Completed'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
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
  select: { background: 'var(--bg-1)', border: '1px solid var(--border-2)', padding: '8px 10px', color: 'var(--text-1)', fontSize: 12, width: '100%', fontFamily: 'var(--font-mono)', borderRadius: 3 },
  numberInput: { background: 'var(--bg-1)', border: '1px solid var(--border-2)', padding: '8px 10px', color: 'var(--text-1)', fontSize: 12, width: '100%', fontFamily: 'var(--font-mono)', borderRadius: 3 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 },
  button: { background: 'var(--accent)', color: '#000', padding: '10px', fontSize: 12, fontWeight: 600, width: '100%', borderRadius: 3, border: 'none', cursor: 'pointer' },
  tasksList: { display: 'flex', flexDirection: 'column', gap: 12, maxHeight: 400, overflowY: 'auto' },
  taskItem: { background: 'var(--bg-1)', border: '1px solid var(--border-2)', padding: 12, borderRadius: 3 },
  taskHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 },
  taskName: { fontSize: 12, fontWeight: 600, color: 'var(--text-1)' },
  cancelBtn: { background: 'transparent', border: '1px solid rgba(239,80,80,0.4)', color: '#EF5050', padding: '3px 10px', fontSize: 10, borderRadius: 2, cursor: 'pointer' },
  taskMeta: { fontSize: 11, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 8 },
  taskStatus: { padding: '4px 8px', borderRadius: 2, fontSize: 11, fontWeight: 600, display: 'inline-block' },
  empty: { textAlign: 'center', color: 'rgba(255,255,255,0.3)', padding: 20, fontSize: 12 }
}
