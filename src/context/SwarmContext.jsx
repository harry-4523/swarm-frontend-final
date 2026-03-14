import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { fetchAgents, fetchStats, fetchActivity, fetchSchedule } from '../services/mockApi'

const SwarmContext = createContext(null)

export function SwarmProvider({ children }) {
  const [agents, setAgents] = useState([])
  const [stats, setStats] = useState(null)
  const [activity, setActivity] = useState([])
  const [schedule, setSchedule] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeEvent, setActiveEvent] = useState({ name: 'TechSummit 2026', date: 'Apr 12–13, 2026', venue: 'Delhi Tech Park', time: '09:00 AM' })

  // ORCHESTRATOR EVENT STATE: Track changes from orchestrator
  const [orchestratorEventState, setOrchestratorEventState] = useState({ name: 'TechSummit 2026', date: 'Apr 12–13, 2026', venue: 'Delhi Tech Park', time: '09:00 AM', capacity: 500 })

  // ORCHESTRATOR STATE: Central coordination hub
  const [orchestratorTask, setOrchestratorTask] = useState(null) // Current task from orchestrator
  const [executingAgents, setExecutingAgents] = useState({}) // { agentId: 'executing' | 'completed' | 'failed' }

  // AGENT-SPECIFIC STATE: Each agent tracks their own history and drafts
  const [agentState, setAgentState] = useState({
    emailAgent: { history: [], drafts: [] },
    contentAgent: { history: [], drafts: [] },
    schedulerAgent: { history: [], drafts: [] },
    eventAgent: { history: [], drafts: [] },
  })

  // ORCHESTRATOR EVENTS: Track events created by orchestrator
  const [orchestratorEvents, setOrchestratorEvents] = useState([])

  const loadAll = useCallback(async () => {
    setLoading(true)
    const [a, s, ac, sc] = await Promise.all([fetchAgents(), fetchStats(), fetchActivity(), fetchSchedule()])
    setAgents(a)
    setStats(s)
    setActivity(ac)
    setSchedule(sc)
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  // ─── ORCHESTRATOR METHODS ───
  const sendTaskToAllAgents = useCallback((instruction, eventName, selectedTasks) => {
    const task = {
      id: Date.now(),
      instruction,
      eventName,
      selectedTasks, // { sendEmail, generateContent, scheduleTimeline, etc }
      status: 'executing',
      startTime: new Date(),
      results: {}
    }
    setOrchestratorTask(task)
    
    // Register event in orchestrator events list for Events page
    if (selectedTasks.createEvent || selectedTasks.scheduleTimeline) {
      setOrchestratorEvents(prev => [{
        id: task.id,
        name: eventName,
        instruction,
        date: new Date().toLocaleDateString(),
        status: 'scheduled',
        createdAt: new Date().toLocaleString(),
        description: instruction
      }, ...prev])
    }
    
    // Initialize executing status for each agent
    const executing = {}
    if (selectedTasks.sendEmail) executing.emailAgent = 'executing'
    if (selectedTasks.generateContent) executing.contentAgent = 'executing'
    if (selectedTasks.scheduleTimeline) executing.schedulerAgent = 'executing'
    if (selectedTasks.createEvent) executing.eventAgent = 'executing'
    setExecutingAgents(executing)

    setActivity(prev => [{ 
      id: Date.now(), 
      time: 'now', 
      color: '#E8FF47', 
      text: `Orchestrator: Delegating tasks - "${instruction}"` 
    }, ...prev.slice(0, 9)])
  }, [])

  // ─── AGENT EXECUTION METHODS ───
  // Call this when agent completes a task successfully
  const completeAgentTask = useCallback((agentId, taskId, result) => {
    // Add to agent history
    setAgentState(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        history: [{
          id: taskId,
          orchestratorTaskId: orchestratorTask?.id,
          instruction: orchestratorTask?.instruction,
          event: orchestratorTask?.eventName,
          completedTime: new Date().toLocaleString(),
          result,
          status: 'completed'
        }, ...prev[agentId].history]
      }
    }))

    // Mark agent as completed
    setExecutingAgents(prev => ({ ...prev, [agentId]: 'completed' }))
    
    setActivity(prev => [{ 
      id: Date.now(), 
      time: 'now', 
      color: '#3DCC78', 
      text: `${agentId}: Task completed - ${result}` 
    }, ...prev.slice(0, 9)])
  }, [orchestratorTask])

  // Call this when agent fails a task
  const failAgentTask = useCallback((agentId, taskId, reason) => {
    // Add to agent drafts
    setAgentState(prev => ({
      ...prev,
      [agentId]: {
        ...prev[agentId],
        drafts: [{
          id: taskId,
          orchestratorTaskId: orchestratorTask?.id,
          instruction: orchestratorTask?.instruction,
          event: orchestratorTask?.eventName,
          failedTime: new Date().toLocaleString(),
          reason,
          scheduleRetry: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleString()
        }, ...prev[agentId].drafts]
      }
    }))

    setExecutingAgents(prev => ({ ...prev, [agentId]: 'failed' }))
    
    setActivity(prev => [{ 
      id: Date.now(), 
      time: 'now', 
      color: '#EF5050', 
      text: `${agentId}: Task failed - ${reason} (saved as draft)` 
    }, ...prev.slice(0, 9)])
  }, [orchestratorTask])

  // Simulate live agent progress updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAgents(prev => prev.map(a => {
        if (a.status === 'running') return { ...a, progress: Math.min(100, a.progress + Math.random() * 2) }
        if (a.status === 'resolving') return { ...a, progress: Math.min(95, a.progress + Math.random() * 3) }
        return a
      }))
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const resolveConflict = (sessionId) => {
    setSchedule(prev => prev.map(s => s.id === sessionId ? { ...s, conflict: false } : s))
    setActivity(prev => [{ id: Date.now(), time: 'now', color: '#3cffd0', text: 'Scheduler resolved conflict for session ID ' + sessionId }, ...prev])
  }

  const updateOrchestratorEventState = useCallback((updates) => {
    setOrchestratorEventState(prev => ({ ...prev, ...updates }))
    setActiveEvent(prev => ({ ...prev, ...updates }))
  }, [])

  return (
    <SwarmContext.Provider value={{
      // Existing
      agents, stats, activity, schedule, loading, activeEvent, setActiveEvent, orchestratorEventState, updateOrchestratorEventState, resolveConflict, reload: loadAll,
      // New orchestrator coordination
      orchestratorTask, sendTaskToAllAgents,
      executingAgents,
      agentState,
      completeAgentTask,
      failAgentTask
    }}>
      {children}
    </SwarmContext.Provider>
  )
}

export const useSwarm = () => useContext(SwarmContext)
