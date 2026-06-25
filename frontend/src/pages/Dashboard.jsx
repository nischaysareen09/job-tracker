import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api'

const STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected']

const STATUS_CONFIG = {
  Saved:        { color: '#64748b', light: '#f8fafc', dot: '#94a3b8', border: '#e2e8f0', label: 'bg-slate-100 text-slate-600' },
  Applied:      { color: '#2563eb', light: '#eff6ff', dot: '#3b82f6', border: '#bfdbfe', label: 'bg-blue-50 text-blue-700' },
  Interviewing: { color: '#d97706', light: '#fffbeb', dot: '#f59e0b', border: '#fde68a', label: 'bg-amber-50 text-amber-700' },
  Offer:        { color: '#059669', light: '#ecfdf5', dot: '#10b981', border: '#a7f3d0', label: 'bg-emerald-50 text-emerald-700' },
  Rejected:     { color: '#dc2626', light: '#fff1f2', dot: '#f43f5e', border: '#fecdd3', label: 'bg-rose-50 text-rose-600' },
}

const STAT_ICONS = {
  'Total': '📋',
  'Interviews': '🎯',
  'Offers': '🏆',
  'Match': '⚡',
}

function Avatar({ name, status, size = 'md' }) {
  const colors = ['#2563eb', '#7c3aed', '#db2777', '#059669', '#d97706', '#dc2626']
  const color = colors[name.charCodeAt(0) % colors.length]
  const sz = size === 'sm' ? 'w-7 h-7 text-xs' : 'w-9 h-9 text-sm'
  return (
    <div className={`${sz} rounded-xl flex items-center justify-center text-white font-bold flex-shrink-0 shadow-sm`}
      style={{ backgroundColor: color }}>
      {name[0].toUpperCase()}
    </div>
  )
}

function JobCard({ job, index }) {
  const navigate = useNavigate()
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied
  return (
    <Draggable draggableId={String(job.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => navigate(`/jobs/${job.id}`)}
          className={`rounded-xl p-3.5 cursor-pointer transition-all duration-150 select-none border
            ${snapshot.isDragging
              ? 'shadow-2xl border-blue-300 rotate-2 scale-[1.03] bg-white'
              : 'bg-white border-gray-100 hover:border-blue-200 hover:shadow-md'
            }`}
        >
          <div className="flex items-start justify-between gap-2 mb-2.5">
            <Avatar name={job.company} status={job.status} size="sm" />
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${cfg.label}`}>
              {job.status}
            </span>
          </div>
          <p className="font-semibold text-sm text-gray-900 leading-tight">{job.company}</p>
          <p className="text-xs text-gray-500 mt-0.5 truncate">{job.role}</p>

          {job.location && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-[10px] text-gray-400">📍 {job.location}</span>
            </div>
          )}

          {job.match_score && (
            <div className="mt-3 pt-2.5 border-t border-gray-50">
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px] text-gray-400 font-medium">MATCH</span>
                <span className="text-[10px] font-bold" style={{ color: cfg.color }}>{job.match_score}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-1">
                <div className="h-1 rounded-full transition-all duration-700"
                  style={{ width: `${job.match_score}%`, backgroundColor: cfg.color }} />
              </div>
            </div>
          )}

          {job.applied_date && (
            <p className="text-[10px] text-gray-300 mt-2">
              {new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>
      )}
    </Draggable>
  )
}

function StatCard({ icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xl">{icon}</span>
        {sub && <span className="text-xs text-gray-400 font-medium">{sub}</span>}
      </div>
      <p className="text-3xl font-bold tracking-tight" style={{ color: accent || '#111827' }}>{value}</p>
      <p className="text-xs text-gray-400 font-medium mt-1 uppercase tracking-wide">{label}</p>
    </div>
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
      .then(([j, a]) => { setJobs(j.data); setAnalytics(a.data) })
      .finally(() => setLoading(false))
  }, [])

  const onDragEnd = async ({ destination, source, draggableId }) => {
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return
    const newStatus = destination.droppableId
    setJobs((prev) => prev.map((j) => String(j.id) === draggableId ? { ...j, status: newStatus } : j))
    try { await api.patch(`/applications/${draggableId}`, { status: newStatus }) }
    catch { setJobs((prev) => prev.map((j) => String(j.id) === draggableId ? { ...j, status: source.droppableId } : j)) }
  }

  const byStatus = (s) => jobs.filter((j) => j.status === s)

  const chartData = STATUSES.map((s) => ({
    name: s, count: byStatus(s).length, color: STATUS_CONFIG[s].color,
  }))

  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#f0f4ff' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-[3px] border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-400 font-medium">Loading your dashboard…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f0f4ff 0%, #fafafa 50%, #f0fdf4 100%)' }}>
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white shadow-sm px-6 py-3 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base leading-tight">JobTracker</p>
            <p className="text-[10px] text-gray-400 leading-tight">{jobs.length} applications</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowChart(!showChart)}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all border ${
              showChart
                ? 'bg-blue-50 text-blue-600 border-blue-200'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}>
            📊 Analytics
          </button>
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            {['kanban', 'list'].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  view === v ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}>
                {v === 'kanban' ? '⊞ Board' : '☰ List'}
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/add')}
            className="text-sm font-semibold text-white px-4 py-1.5 rounded-lg shadow-md hover:shadow-lg transition-all"
            style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
            + Add Job
          </button>
          <button onClick={logout} className="text-xs text-gray-400 hover:text-gray-600 px-2 transition-colors">
            Sign out
          </button>
        </div>
      </nav>

      <div className="p-6 max-w-[1400px] mx-auto">
        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon="📋" label="Total Applied" value={analytics.total} />
            <StatCard icon="🎯" label="Interviews" value={analytics.by_status?.Interviewing || 0}
              sub={`${analytics.interview_rate || 0}% rate`} accent="#d97706" />
            <StatCard icon="🏆" label="Offers" value={analytics.by_status?.Offer || 0}
              sub={`${analytics.offer_rate || 0}% rate`} accent="#059669" />
            <StatCard icon="⚡" label="Avg Match" value={analytics.avg_match_score ? `${analytics.avg_match_score}%` : '—'}
              accent="#2563eb" />
          </div>
        )}

        {/* Chart */}
        {showChart && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-gray-900">Application Pipeline</h3>
                <p className="text-xs text-gray-400 mt-0.5">Applications by stage</p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={44} barGap={8}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9ca3af', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', fontSize: '12px' }}
                  cursor={{ fill: '#f3f4f6', radius: 6 }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Kanban */}
        {view === 'kanban' && (
          <DragDropContext onDragEnd={onDragEnd}>
            <div className="flex gap-4 overflow-x-auto pb-6">
              {STATUSES.map((status) => {
                const cfg = STATUS_CONFIG[status]
                const count = byStatus(status).length
                return (
                  <div key={status} className="flex-shrink-0 w-[260px]">
                    {/* Column header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.dot }} />
                        <span className="text-sm font-bold text-gray-700">{status}</span>
                      </div>
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: cfg.light, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                        {count}
                      </span>
                    </div>

                    <Droppable droppableId={status}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className="min-h-32 rounded-2xl p-2 space-y-2 transition-all duration-200"
                          style={{
                            backgroundColor: snapshot.isDraggingOver ? cfg.light : 'transparent',
                            border: snapshot.isDraggingOver ? `2px dashed ${cfg.border}` : '2px dashed transparent',
                          }}
                        >
                          {byStatus(status).map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
                          {provided.placeholder}
                          {count === 0 && !snapshot.isDraggingOver && (
                            <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-40">
                              <div className="w-10 h-10 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 text-xl">+</div>
                              <p className="text-xs text-gray-400">Drag here</p>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        )}

        {/* List view */}
        {view === 'list' && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-50">
                  {['Company', 'Role', 'Status', 'Location', 'Match', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-[11px] font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied
                  return (
                    <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                      className="border-b border-gray-50 hover:bg-blue-50/40 cursor-pointer transition-colors group">
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={job.company} status={job.status} size="sm" />
                          <span className="font-semibold text-gray-900">{job.company}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-500 text-xs">{job.role}</td>
                      <td className="px-5 py-3.5">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${cfg.label}`}>{job.status}</span>
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{job.location || '—'}</td>
                      <td className="px-5 py-3.5">
                        {job.match_score
                          ? <span className="font-bold text-blue-600">{job.match_score}%</span>
                          : <span className="text-gray-300">—</span>}
                      </td>
                      <td className="px-5 py-3.5 text-gray-400 text-xs">
                        {job.applied_date ? new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  )
                })}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <p className="text-4xl mb-3">📭</p>
                      <p className="font-semibold text-gray-400">No applications yet</p>
                      <p className="text-sm text-gray-300 mt-1">Click "+ Add Job" to track your first application</p>
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