import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api'

const STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected']

const STATUS_CONFIG = {
  Saved:        { color: '#94a3b8', light: '#f1f5f9', border: 'border-t-slate-400' },
  Applied:      { color: '#6366f1', light: '#eef2ff', border: 'border-t-indigo-500' },
  Interviewing: { color: '#f59e0b', light: '#fffbeb', border: 'border-t-amber-400' },
  Offer:        { color: '#10b981', light: '#ecfdf5', border: 'border-t-emerald-400' },
  Rejected:     { color: '#f43f5e', light: '#fff1f2', border: 'border-t-rose-400' },
}

function StatCard({ label, value, sub }) {
  return (
    <div className="card p-5 flex flex-col gap-1 hover:shadow-md transition-shadow duration-200">
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      {sub && <p className="text-xs text-gray-400">{sub}</p>}
    </div>
  )
}

function JobCard({ job, index }) {
  const navigate = useNavigate()
  return (
    <Draggable draggableId={job.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => navigate(`/jobs/${job.id}`)}
          className={`bg-white border rounded-xl p-3.5 cursor-pointer transition-all duration-150 select-none
            ${snapshot.isDragging
              ? 'shadow-xl border-indigo-300 rotate-1 scale-105'
              : 'border-gray-100 hover:border-indigo-200 hover:shadow-md'
            }`}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-semibold text-sm text-gray-900 truncate">{job.company}</p>
              <p className="text-xs text-gray-500 truncate mt-0.5">{job.role}</p>
            </div>
            {/* Company initial avatar */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: STATUS_CONFIG[job.status]?.color || '#6366f1' }}>
              {job.company[0].toUpperCase()}
            </div>
          </div>

          {job.location && (
            <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
              <span>📍</span>{job.location}
            </p>
          )}
          {job.salary_range && (
            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
              <span>💰</span>{job.salary_range}
            </p>
          )}
          {job.match_score && (
            <div className="mt-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-gray-400">Match</span>
                <span className="text-xs font-semibold text-indigo-600">{job.match_score}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1.5">
                <div
                  className="h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${job.match_score}%`, backgroundColor: STATUS_CONFIG[job.status]?.color }}
                />
              </div>
            </div>
          )}
          {job.applied_date && (
            <p className="text-xs text-gray-300 mt-2">
              {new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>
      )}
    </Draggable>
  )
}

export default function Dashboard() {
  const [jobs, setJobs] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('kanban')
  const [showChart, setShowChart] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    Promise.all([api.get('/applications'), api.get('/analytics')])
      .then(([jobsRes, analyticsRes]) => {
        setJobs(jobsRes.data)
        setAnalytics(analyticsRes.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStatus = destination.droppableId
    setJobs((prev) => prev.map((j) => j.id === draggableId ? { ...j, status: newStatus } : j))
    try {
      await api.patch(`/applications/${draggableId}`, { status: newStatus })
    } catch {
      setJobs((prev) => prev.map((j) => j.id === draggableId ? { ...j, status: source.droppableId } : j))
    }
  }

  const jobsByStatus = (status) => jobs.filter((j) => j.status === status)

  const chartData = STATUSES.map((s) => ({
    name: s,
    count: jobsByStatus(s).length,
    color: STATUS_CONFIG[s].color,
  }))

  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading your applications…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-20 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-indigo-500 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-bold text-gray-900 text-lg">JobTracker</span>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={() => setShowChart(!showChart)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${showChart ? 'bg-indigo-50 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}>
            📊 Analytics
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            {['kanban', 'list'].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
                {v === 'kanban' ? '⊞ Board' : '☰ List'}
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/add')}
            className="btn-primary text-sm py-1.5 shadow-sm shadow-indigo-200">
            + Add Job
          </button>
          <button onClick={logout} className="text-sm text-gray-400 hover:text-gray-600 transition-colors">Sign out</button>
        </div>
      </nav>

      <div className="p-6">
        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard label="Total Applied" value={analytics.total} />
            <StatCard label="Interviews" value={analytics.by_status?.Interviewing || 0}
              sub={`${analytics.interview_rate}% rate`} />
            <StatCard label="Offers" value={analytics.by_status?.Offer || 0}
              sub={`${analytics.offer_rate}% rate`} />
            <StatCard label="Avg Match Score" value={analytics.avg_match_score ? `${analytics.avg_match_score}%` : '—'} />
          </div>
        )}

        {/* Chart */}
        {showChart && (
          <div className="card p-5 mb-6 animate-fade-in">
            <h3 className="font-semibold text-gray-700 mb-4 text-sm">Application Pipeline</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                  cursor={{ fill: '#f3f4f6' }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Kanban */}
        {view === 'kanban' && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-6">
              {STATUSES.map((status) => (
                <div key={status} className="flex-shrink-0 w-64">
                  <div className={`card border-t-4 ${STATUS_CONFIG[status].border} overflow-hidden`}>
                    <div className="px-4 py-3 flex items-center justify-between"
                      style={{ backgroundColor: STATUS_CONFIG[status].light }}>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_CONFIG[status].color }} />
                        <span className="text-sm font-semibold text-gray-700">{status}</span>
                      </div>
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white text-gray-500 shadow-sm">
                        {jobsByStatus(status).length}
                      </span>
                    </div>

                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`p-2 space-y-2 min-h-28 transition-colors duration-150 ${snapshot.isDraggingOver ? 'bg-indigo-50' : ''}`}
                        >
                          {jobsByStatus(status).map((job, index) => (
                            <JobCard key={job.id} job={job} index={index} />
                          ))}
                          {provided.placeholder}
                          {jobsByStatus(status).length === 0 && !snapshot.isDraggingOver && (
                            <div className="flex flex-col items-center justify-center py-8 gap-2">
                              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 text-lg">+</div>
                              <p className="text-xs text-gray-300">Drop here</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                </div>
              ))}
            </div>
          </DragDropContext>
        )}

        {/* List view */}
        {view === 'list' && (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  {['Company', 'Role', 'Status', 'Location', 'Match', 'Applied'].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-gray-400 uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {jobs.map((job) => (
                  <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                    className="hover:bg-gray-50 cursor-pointer transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                          style={{ backgroundColor: STATUS_CONFIG[job.status]?.color }}>
                          {job.company[0].toUpperCase()}
                        </div>
                        <span className="font-medium text-gray-900">{job.company}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{job.role}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full"
                        style={{ backgroundColor: STATUS_CONFIG[job.status]?.light, color: STATUS_CONFIG[job.status]?.color }}>
                        {job.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{job.location || '—'}</td>
                    <td className="px-4 py-3">
                      {job.match_score
                        ? <span className="text-indigo-600 font-semibold">{job.match_score}%</span>
                        : <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {job.applied_date ? new Date(job.applied_date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-16 text-center">
                      <p className="text-gray-300 text-lg mb-1">No applications yet</p>
                      <p className="text-gray-400 text-sm">Click "+ Add Job" to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}