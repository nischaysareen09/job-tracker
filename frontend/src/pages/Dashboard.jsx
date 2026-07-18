import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api'

const STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected']

const STATUS_CONFIG = {
  Saved:        { gradient: 'linear-gradient(160deg, #1e293b 0%, #0f172a 100%)', accent: '#94a3b8', glow: 'rgba(148,163,184,0.15)', badge: 'rgba(148,163,184,0.15)', badgeText: '#cbd5e1', border: 'rgba(148,163,184,0.2)', header: 'rgba(148,163,184,0.07)' },
  Applied:      { gradient: 'linear-gradient(160deg, #1e1b4b 0%, #0d0b2e 100%)', accent: '#818cf8', glow: 'rgba(129,140,248,0.2)',  badge: 'rgba(129,140,248,0.15)', badgeText: '#a5b4fc', border: 'rgba(129,140,248,0.25)', header: 'rgba(129,140,248,0.07)' },
  Interviewing: { gradient: 'linear-gradient(160deg, #1c1400 0%, #0d0a00 100%)', accent: '#fbbf24', glow: 'rgba(251,191,36,0.2)',   badge: 'rgba(251,191,36,0.15)',  badgeText: '#fcd34d', border: 'rgba(251,191,36,0.25)',  header: 'rgba(251,191,36,0.07)'  },
  Offer:        { gradient: 'linear-gradient(160deg, #022c1e 0%, #011a12 100%)', accent: '#34d399', glow: 'rgba(52,211,153,0.2)',   badge: 'rgba(52,211,153,0.15)',  badgeText: '#6ee7b7', border: 'rgba(52,211,153,0.25)',  header: 'rgba(52,211,153,0.07)'  },
  Rejected:     { gradient: 'linear-gradient(160deg, #2d0000 0%, #1a0000 100%)', accent: '#f87171', glow: 'rgba(248,113,113,0.2)',  badge: 'rgba(248,113,113,0.15)', badgeText: '#fca5a5', border: 'rgba(248,113,113,0.25)', header: 'rgba(248,113,113,0.07)' },
}

function Avatar({ name }) {
  const colors = ['#818cf8','#34d399','#fbbf24','#f87171','#a78bfa','#38bdf8']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{ backgroundColor: color + '22', color, border: `1px solid ${color}44` }}>
      {name[0].toUpperCase()}
    </div>
  )
}

function JobCard({ job, onDragStart, onClick }) {
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('jobId', String(job.id))
        e.dataTransfer.setData('fromStatus', job.status)
        onDragStart && onDragStart()
      }}
      onClick={() => onClick(job.id)}
      className="rounded-xl p-3.5 cursor-grab active:cursor-grabbing select-none"
      style={{
        background: 'rgba(255,255,255,0.05)',
        border: `1px solid ${cfg.border}`,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <Avatar name={job.company} />
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ backgroundColor: cfg.badge, color: cfg.badgeText }}>
          {job.status}
        </span>
      </div>
      <p className="font-semibold text-sm text-white">{job.company}</p>
      <p className="text-xs mt-0.5 truncate" style={{ color: cfg.accent + 'bb' }}>{job.role}</p>
      {job.location && <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.3)' }}>📍 {job.location}</p>}
      {job.match_score && (
        <div className="mt-3 pt-2.5" style={{ borderTop: `1px solid ${cfg.border}` }}>
          <div className="flex justify-between mb-1">
            <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>MATCH</span>
            <span className="text-[10px] font-bold" style={{ color: cfg.accent }}>{job.match_score}%</span>
          </div>
          <div className="w-full h-1 rounded-full" style={{ background: 'rgba(255,255,255,0.08)' }}>
            <div className="h-1 rounded-full" style={{ width: `${job.match_score}%`, background: cfg.accent }} />
          </div>
        </div>
      )}
      {job.applied_date && (
        <p className="text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          {new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </p>
      )}
    </div>
  )
}

function KanbanColumn({ status, jobs, onDrop, onCardClick }) {
  const [isDragOver, setIsDragOver] = useState(false)
  const cfg = STATUS_CONFIG[status]

  return (
    <div className="flex-shrink-0 w-[260px]">
      <div className="rounded-2xl overflow-hidden"
        style={{ background: cfg.gradient, border: `1px solid ${cfg.border}`, boxShadow: `0 0 30px ${cfg.glow}` }}>
        <div className="px-4 py-3 flex items-center justify-between"
          style={{ background: cfg.header, borderBottom: `1px solid ${cfg.border}` }}>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.accent, boxShadow: `0 0 8px ${cfg.accent}` }} />
            <span className="text-sm font-bold" style={{ color: cfg.accent }}>{status}</span>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: cfg.badge, color: cfg.badgeText }}>{jobs.length}</span>
        </div>

        <div
          className="p-2 space-y-2 min-h-36 transition-all duration-150"
          style={{ background: isDragOver ? 'rgba(255,255,255,0.05)' : 'transparent' }}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setIsDragOver(false)
            const jobId = e.dataTransfer.getData('jobId')
            const fromStatus = e.dataTransfer.getData('fromStatus')
            if (fromStatus !== status) onDrop(jobId, status)
          }}
        >
          {jobs.map(job => (
            <JobCard key={job.id} job={job} onClick={onCardClick} />
          ))}
          {jobs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-2"
              style={{ opacity: isDragOver ? 1 : 0.4 }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ border: `2px dashed ${cfg.border}`, color: cfg.accent }}>+</div>
              <p className="text-[10px] font-medium" style={{ color: cfg.accent }}>
                {isDragOver ? 'Drop here!' : 'Drag here'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, accent }) {
  return (
    <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accent }} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      <p className="text-[11px] mt-1 uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
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

  const handleDrop = async (jobId, newStatus) => {
    const prevJobs = [...jobs]
    setJobs(prev => prev.map(j => String(j.id) === String(jobId) ? { ...j, status: newStatus } : j))
    try { await api.patch(`/applications/${jobId}`, { status: newStatus }) }
    catch { setJobs(prevJobs) }
  }

  const byStatus = (s) => jobs.filter(j => j.status === s)

  const chartData = STATUSES.map(s => ({ name: s, count: byStatus(s).length, color: STATUS_CONFIG[s].accent }))

  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="text-center">
        <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Loading your dashboard…</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <nav className="px-6 py-4 flex items-center justify-between sticky top-0 z-20"
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <p className="font-bold text-white text-sm">JobTracker</p>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{jobs.length} applications</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setShowChart(!showChart)}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
            style={{
              background: showChart ? 'rgba(99,102,241,0.2)' : 'rgba(255,255,255,0.05)',
              color: showChart ? '#818cf8' : 'rgba(255,255,255,0.45)',
              border: `1px solid ${showChart ? 'rgba(99,102,241,0.4)' : 'rgba(255,255,255,0.08)'}`,
         }}>
            📊 Analytics
          </button>
            <div className="flex rounded-lg p-0.5" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {['kanban','list'].map(v => (
                <button key={v} onClick={() => setView(v)}
                  className="px-3 py-1.5 text-xs font-semibold rounded-md transition-all"
                  style={{ background: view === v ? 'rgba(255,255,255,0.1)' : 'transparent', color: view === v ? 'white' : 'rgba(255,255,255,0.4)' }}>
                  {v === 'kanban' ? '⊞ Board' : '☰ List'}
                </button>
             ))}
          </div>
          <button onClick={() => navigate('/add')}
            className="text-sm font-bold text-white px-4 py-1.5 rounded-lg"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            + Add Job
          </button>
          <button onClick={() => navigate('/agent')}
            className="text-xs px-3 py-1.5 rounded-lg font-semibold transition-all"
            style={{ background: 'rgba(139,92,246,0.2)', color: '#a78bfa', border: '1px solid rgba(139,92,246,0.3)' }}>
            🐝 BunnyBee
          </button>
  <button onClick={logout} className="text-xs px-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Sign out</button>
</div>

      </nav><div className="p-6 max-w-[1500px] mx-auto">
        {analytics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <StatCard icon="📋" label="Total Applied" value={analytics.total} accent="#818cf8" />
            <StatCard icon="🎯" label="Interviews" value={analytics.by_status?.Interviewing || 0} accent="#fbbf24" />
            <StatCard icon="🏆" label="Offers" value={analytics.by_status?.Offer || 0} accent="#34d399" />
            <StatCard icon="⚡" label="Avg Match" value={analytics.avg_match_score ? `${analytics.avg_match_score}%` : '—'} accent="#f87171" />
          </div>
        )}

        {showChart && (
          <div className="rounded-2xl p-6 mb-6" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="font-bold text-white text-sm mb-4">Application Pipeline</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} barSize={44}>
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: 'white', fontSize: '12px' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="count" radius={[8,8,0,0]}>{chartData.map((e,i) => <Cell key={i} fill={e.color} />)}</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {view === 'kanban' && (
          <div className="flex gap-4 overflow-x-auto pb-6">
            {STATUSES.map(status => (
              <KanbanColumn
                key={status}
                status={status}
                jobs={byStatus(status)}
                onDrop={handleDrop}
                onCardClick={(id) => navigate(`/jobs/${id}`)}
              />
            ))}
          </div>
        )}

        {view === 'list' && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Company','Role','Status','Location','Match','Date'].map(h => (
                    <th key={h} className="text-left px-5 py-4 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => {
                  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied
                  return (
                    <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                      className="cursor-pointer transition-colors"
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td className="px-5 py-4"><div className="flex items-center gap-3"><Avatar name={job.company} /><span className="font-semibold text-white">{job.company}</span></div></td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>{job.role}</td>
                      <td className="px-5 py-4"><span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: cfg.badge, color: cfg.badgeText }}>{job.status}</span></td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{job.location || '—'}</td>
                      <td className="px-5 py-4">{job.match_score ? <span className="font-bold" style={{ color: cfg.accent }}>{job.match_score}%</span> : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}</td>
                      <td className="px-5 py-4 text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{job.applied_date ? new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</td>
                    </tr>
                  )
                })}
                {jobs.length === 0 && (
                  <tr><td colSpan={6} className="py-20 text-center">
                    <p className="text-4xl mb-3">📭</p>
                    <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>No applications yet</p>
                    <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>Click "+ Add Job" to get started</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}