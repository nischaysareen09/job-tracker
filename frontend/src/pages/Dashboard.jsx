import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api'

const STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected']

const STATUS_CONFIG = {
  Saved:        { 
    gradient: 'linear-gradient(135deg, #1e293b, #334155)',
    accent: '#94a3b8', glow: '0 0 20px rgba(148,163,184,0.15)',
    badge: 'rgba(148,163,184,0.2)', badgeText: '#cbd5e1',
    border: 'rgba(148,163,184,0.2)', header: 'rgba(148,163,184,0.08)',
  },
  Applied:      { 
    gradient: 'linear-gradient(135deg, #1e1b4b, #2e1065)',
    accent: '#818cf8', glow: '0 0 20px rgba(129,140,248,0.2)',
    badge: 'rgba(129,140,248,0.2)', badgeText: '#a5b4fc',
    border: 'rgba(129,140,248,0.25)', header: 'rgba(129,140,248,0.08)',
  },
  Interviewing: { 
    gradient: 'linear-gradient(135deg, #1c1400, #2d1f00)',
    accent: '#fbbf24', glow: '0 0 20px rgba(251,191,36,0.2)',
    badge: 'rgba(251,191,36,0.2)', badgeText: '#fcd34d',
    border: 'rgba(251,191,36,0.25)', header: 'rgba(251,191,36,0.08)',
  },
  Offer:        { 
    gradient: 'linear-gradient(135deg, #022c1e, #064e3b)',
    accent: '#34d399', glow: '0 0 20px rgba(52,211,153,0.2)',
    badge: 'rgba(52,211,153,0.2)', badgeText: '#6ee7b7',
    border: 'rgba(52,211,153,0.25)', header: 'rgba(52,211,153,0.08)',
  },
  Rejected:     { 
    gradient: 'linear-gradient(135deg, #1f0000, #3b0000)',
    accent: '#f87171', glow: '0 0 20px rgba(248,113,113,0.2)',
    badge: 'rgba(248,113,113,0.2)', badgeText: '#fca5a5',
    border: 'rgba(248,113,113,0.25)', header: 'rgba(248,113,113,0.08)',
  },
}

function Avatar({ name }) {
  const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#a78bfa', '#38bdf8']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: color + '22', color, border: `1px solid ${color}44` }}>
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
          className="rounded-xl p-3.5 cursor-pointer select-none transition-all duration-150"
          style={{
            background: snapshot.isDragging
              ? 'rgba(255,255,255,0.12)'
              : 'rgba(255,255,255,0.05)',
            border: `1px solid ${snapshot.isDragging ? cfg.accent + '80' : cfg.border}`,
            boxShadow: snapshot.isDragging ? cfg.glow + ', 0 20px 40px rgba(0,0,0,0.5)' : 'none',
            transform: snapshot.isDragging ? 'rotate(2deg) scale(1.03)' : 'none',
          }}
        >
          <div className="flex items-start justify-between gap-2 mb-2">
            <Avatar name={job.company} />
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: cfg.badge, color: cfg.badgeText }}>
              {job.status}
            </span>
          </div>
          <p className="font-semibold text-sm text-white leading-tight">{job.company}</p>
          <p className="text-xs mt-0.5 truncate" style={{ color: cfg.accent + 'aa' }}>{job.role}</p>

          {job.location && (
            <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>📍 {job.location}</p>
          )}

          {job.match_score && (
            <div className="mt-3 pt-2.5" style={{ borderTop: `1px solid ${cfg.border}` }}>
              <div className="flex justify-between items-center mb-1">
                <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>MATCH</span>
                <span className="text-[10px] font-bold" style={{ color: cfg.accent }}>{job.match_score}%</span>
              </div>
              <div className="w-full rounded-full h-1" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                <div className="h-1 rounded-full transition-all duration-700"
                  style={{ width: `${job.match_score}%`, backgroundColor: cfg.accent }} />
              </div>
            </div>
          )}

          {job.applied_date && (
            <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              {new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          )}
        </div>
      )}
    </Draggable>
  )
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="rounded-2xl p-5 transition-all hover:scale-[1.02]"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
      </div>
      <p className="text-3xl font-bold text-white tracking-tight">{value}</p>
      <p className="text-xs mt-1 uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</p>
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
  if (
    destination.droppableId === source.droppableId &&
    destination.index === source.index
  ) return

  const newStatus = destination.droppableId
  const prevJobs = jobs // snapshot for rollback

  // Optimistic update
  setJobs((prev) =>
    prev.map((j) =>
      String(j.id) === String(draggableId) ? { ...j, status: newStatus } : j
    )
  )

  try {
    await api.patch(`/applications/${draggableId}`, { status: newStatus })
  } catch {
    setJobs(prevJobs) // rollback to snapshot, not stale closure
  }
}

  const byStatus = (s) => jobs.filter((j) => j.status === s)

  const chartData = STATUSES.map((s) => ({
    name: s, count: byStatus(s).length, color: STATUS_CONFIG[s].accent,
  }))

  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading your dashboard…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between sticky top-0 z-20"
        style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-white text-sm leading-tight">JobTracker</p>
            <p className="text-[10px] leading-tight" style={{ color: 'rgba(255,255,255,0.35)' }}>{jobs.length} applications</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowChart(!showChart)}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
            style={{
              background: showChart ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              color: showChart ? '#818cf8' : 'rgba(255,255,255,0.5)',
              border: `1px solid ${showChart ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
            }}>
            📊 Analytics
          </button>
          <div className="flex rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            {['kanban', 'list'].map((v) => (
              <button key={v} onClick={() => setView(v)}
                className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all"
                style={{
                  background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent',
                  color: view === v ? 'white' : 'rgba(255,255,255,0.4)',
                }}>
                {v === 'kanban' ? '⊞ Board' : '☰ List'}
              </button>
            ))}
          </div>
          <button onClick={() => navigate('/add')}
            className="text-sm font-bold text-white px-4 py-1.5 rounded-lg transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            + Add Job
          </button>
          <button onClick={logout} className="text-xs px-2 transition-colors"
            style={{ color: 'rgba(255,255,255,0.3)' }}>
            Sign out
          </button>
        </div>
      </nav>

      <div className="p-6 max-w-[1500px] mx-auto">
        {/* Stats */}
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon="📋" label="Total Applied" value={analytics.total} accent="#818cf8" />
            <StatCard icon="🎯" label="Interviews" value={analytics.by_status?.Interviewing || 0} accent="#fbbf24" />
            <StatCard icon="🏆" label="Offers" value={analytics.by_status?.Offer || 0} accent="#34d399" />
            <StatCard icon="⚡" label="Avg Match" value={analytics.avg_match_score ? `${analytics.avg_match_score}%` : '—'} accent="#f87171" />
          </div>
        )}

        {/* Chart */}
        {showChart && (
          <div className="rounded-2xl p-6 mb-6"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="font-bold text-white text-sm mb-4">Application Pipeline</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={44}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)', fontWeight: 500 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: 'white', fontSize: '12px' }}
                  cursor={{ fill: 'rgba(255,255,255,0.03)' }}
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
          <DragDropContext onDragEnd={onDragEnd} onDragStart={() => {}}>
            <div className="flex gap-4 overflow-x-auto pb-6">
              {STATUSES.map((status) => {
                const cfg = STATUS_CONFIG[status]
                const count = byStatus(status).length
                return (
                  <div key={status} className="flex-shrink-0 w-[260px]">
                    {/* Column */}
                    <div className="rounded-2xl overflow-hidden" style={{ background: cfg.gradient, border: `1px solid ${cfg.border}`, boxShadow: cfg.glow }}>
                      {/* Column header */}
                      <div className="px-4 py-3 flex items-center justify-between" style={{ background: cfg.header, borderBottom: `1px solid ${cfg.border}` }}>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.accent, boxShadow: `0 0 6px ${cfg.accent}` }} />
                          <span className="text-sm font-bold" style={{ color: cfg.accent }}>{status}</span>
                        </div>
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full"
                          style={{ backgroundColor: cfg.badge, color: cfg.badgeText }}>
                          {count}
                        </span>
                      </div>

                      <Droppable droppableId={status} type="JOB">
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="p-2 space-y-2 min-h-32 transition-all duration-200"
                            style={{ background: snapshot.isDraggingOver ? 'rgba(255,255,255,0.03)' : 'transparent' }}
                          >
                            {byStatus(status).map((job, i) => <JobCard key={job.id} job={job} index={i} />)}
                            {provided.placeholder}
                            {count === 0 && !snapshot.isDraggingOver && (
                              <div className="flex flex-col items-center justify-center py-10 gap-2">
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                  style={{ border: `2px dashed ${cfg.border}`, color: cfg.accent + '44' }}>+</div>
                                <p className="text-[10px] font-medium" style={{ color: cfg.accent + '44' }}>Drag here</p>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                )
              })}
            </div>
          </DragDropContext>
        )}

        {/* List view */}
        {view === 'list' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Company', 'Role', 'Status', 'Location', 'Match', 'Date'].map((h) => (
                    <th key={h} className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-widest"
                      style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => {
                  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied
                  return (
                    <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={job.company} />
                          <span className="font-semibold text-white">{job.company}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{job.role}</td>
                      <td className="px-5 py-4">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-full"
                          style={{ backgroundColor: cfg.badge, color: cfg.badgeText }}>{job.status}</span>
                      </td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{job.location || '—'}</td>
                      <td className="px-5 py-4">
                        {job.match_score
                          ? <span className="font-bold" style={{ color: cfg.accent }}>{job.match_score}%</span>
                          : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}
                      </td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        {job.applied_date ? new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  )
                })}
                {jobs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-20 text-center">
                      <p className="text-4xl mb-3">📭</p>
                      <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>No applications yet</p>
                      <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Click "+ Add Job" to get started</p>
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