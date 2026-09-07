import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import api from '../api'

const STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected']

const STATUS_CONFIG = {
  Saved:        { gradient: 'linear-gradient(160deg, #1e293b, #0f172a)', accent: '#94a3b8', glow: 'rgba(148,163,184,0.12)', badge: 'rgba(148,163,184,0.12)', badgeText: '#cbd5e1', border: 'rgba(148,163,184,0.18)', dot: '#94a3b8' },
  Applied:      { gradient: 'linear-gradient(160deg, #1e1b4b, #0d0b2e)', accent: '#00f5ff', glow: 'rgba(0,245,255,0.15)', badge: 'rgba(0,245,255,0.1)', badgeText: '#00f5ff', border: 'rgba(0,245,255,0.2)', dot: '#00f5ff' },
  Interviewing: { gradient: 'linear-gradient(160deg, #1c1400, #0d0a00)', accent: '#ffb800', glow: 'rgba(255,184,0,0.15)', badge: 'rgba(255,184,0,0.1)', badgeText: '#ffb800', border: 'rgba(255,184,0,0.2)', dot: '#ffb800' },
  Offer:        { gradient: 'linear-gradient(160deg, #022c1e, #011a12)', accent: '#00ff88', glow: 'rgba(0,255,136,0.15)', badge: 'rgba(0,255,136,0.1)', badgeText: '#00ff88', border: 'rgba(0,255,136,0.2)', dot: '#00ff88' },
  Rejected:     { gradient: 'linear-gradient(160deg, #2d0000, #1a0000)', accent: '#ff3d5a', glow: 'rgba(255,61,90,0.15)', badge: 'rgba(255,61,90,0.1)', badgeText: '#ff3d5a', border: 'rgba(255,61,90,0.2)', dot: '#ff3d5a' },
}

// Animated counter
function Counter({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  useEffect(() => {
    let start = 0
    const end = parseInt(value) || 0
    if (end === 0) { setDisplay(0); return }
    const step = Math.ceil(end / 30)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setDisplay(end); clearInterval(timer) }
      else setDisplay(start)
    }, 30)
    return () => clearInterval(timer)
  }, [value])
  return <span>{display}{suffix}</span>
}

// Floating grid background
function GridBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(0,245,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.02) 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(0,245,255,0.04) 0%, transparent 50%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%, rgba(255,184,0,0.03) 0%, transparent 50%)' }} />
    </div>
  )
}

function Avatar({ name }) {
  const colors = ['#00f5ff', '#ffb800', '#00ff88', '#ff3d5a', '#a78bfa', '#38bdf8']
  const color = colors[name.charCodeAt(0) % colors.length]
  return (
    <div style={{
      width: 32, height: 32, borderRadius: 10,
      background: color + '18', color, border: `1px solid ${color}44`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 12, fontWeight: 900, flexShrink: 0,
      boxShadow: `0 0 12px ${color}22`,
    }}>
      {name[0].toUpperCase()}
    </div>
  )
}

function JobCard({ job, onClick }) {
  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied
  const [hovered, setHovered] = useState(false)
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('jobId', String(job.id))
        e.dataTransfer.setData('fromStatus', job.status)
      }}
      onClick={() => onClick(job.id)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 14, padding: '14px', cursor: 'grab',
        background: hovered ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hovered ? cfg.accent + '40' : cfg.border}`,
        boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${cfg.glow}` : '0 2px 8px rgba(0,0,0,0.2)',
        transform: hovered ? 'translateY(-2px) scale(1.01)' : 'none',
        transition: 'all 0.2s cubic-bezier(0.34,1.56,0.64,1)',
        userSelect: 'none',
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
        <Avatar name={job.company} />
        <span style={{
          fontSize: 9, fontWeight: 800, padding: '2px 8px', borderRadius: 20, fontFamily: 'monospace',
          background: cfg.badge, color: cfg.badgeText, letterSpacing: '0.1em',
          boxShadow: `0 0 8px ${cfg.glow}`,
        }}>{job.status.toUpperCase()}</span>
      </div>
      <p style={{ color: 'white', fontWeight: 700, fontSize: 13, margin: 0 }}>{job.company}</p>
      <p style={{ color: cfg.accent + 'aa', fontSize: 11, margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.role}</p>
      {job.location && <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, marginTop: 6 }}>📍 {job.location}</p>}
      {job.match_score && (
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${cfg.border}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.1em' }}>MATCH</span>
            <span style={{ color: cfg.accent, fontSize: 9, fontWeight: 800 }}>{job.match_score}%</span>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 4, height: 3, overflow: 'hidden' }}>
            <div style={{ width: `${job.match_score}%`, height: '100%', background: `linear-gradient(90deg, ${cfg.accent}, ${cfg.accent}88)`, borderRadius: 4, boxShadow: `0 0 6px ${cfg.accent}` }} />
          </div>
        </div>
      )}
      {job.applied_date && (
        <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: 9, marginTop: 6, fontFamily: 'monospace' }}>
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
    <div style={{ flexShrink: 0, width: 264 }}>
      <div style={{
        borderRadius: 20, overflow: 'hidden',
        background: cfg.gradient,
        border: `1px solid ${isDragOver ? cfg.accent + '60' : cfg.border}`,
        boxShadow: isDragOver ? `0 0 40px ${cfg.glow}, 0 20px 60px rgba(0,0,0,0.4)` : `0 0 20px ${cfg.glow}, 0 8px 32px rgba(0,0,0,0.3)`,
        transition: 'all 0.2s ease',
      }}>
        {/* Column header */}
        <div style={{
          padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: `rgba(${cfg.accent === '#00f5ff' ? '0,245,255' : cfg.accent === '#ffb800' ? '255,184,0' : cfg.accent === '#00ff88' ? '0,255,136' : cfg.accent === '#ff3d5a' ? '255,61,90' : '148,163,184'},0.06)`,
          borderBottom: `1px solid ${cfg.border}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.dot, boxShadow: `0 0 8px ${cfg.dot}, 0 0 16px ${cfg.dot}55` }} />
            <span style={{ color: cfg.accent, fontWeight: 800, fontSize: 12, letterSpacing: '0.08em' }}>{status}</span>
          </div>
          <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 8px', borderRadius: 12,
            background: cfg.badge, color: cfg.badgeText, fontFamily: 'monospace',
          }}>{jobs.length}</span>
        </div>

        {/* Drop zone */}
        <div
          style={{
            padding: 8, display: 'flex', flexDirection: 'column', gap: 8,
            minHeight: 140,
            background: isDragOver ? 'rgba(255,255,255,0.03)' : 'transparent',
            transition: 'background 0.15s',
          }}
          onDragOver={e => { e.preventDefault(); setIsDragOver(true) }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={e => {
            e.preventDefault(); setIsDragOver(false)
            const jobId = e.dataTransfer.getData('jobId')
            const fromStatus = e.dataTransfer.getData('fromStatus')
            if (fromStatus !== status) onDrop(jobId, status)
          }}>
          {jobs.map(job => <JobCard key={job.id} job={job} onClick={onCardClick} />)}
          {jobs.length === 0 && (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              padding: '32px 16px', gap: 8, opacity: isDragOver ? 1 : 0.35,
              transition: 'opacity 0.2s',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, border: `2px dashed ${cfg.border}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: cfg.accent, fontSize: 18,
              }}>+</div>
              <p style={{ color: cfg.accent, fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.1em' }}>
                {isDragOver ? 'DROP HERE' : 'DRAG HERE'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, accent, sub }) {
  const [visible, setVisible] = useState(false)
  const [hovered, setHovered] = useState(false)
  useEffect(() => { setTimeout(() => setVisible(true), 100) }, [])
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: 18, padding: '20px', cursor: 'default',
        background: hovered ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.03)',
        border: `1px solid ${hovered ? accent + '30' : 'rgba(255,255,255,0.07)'}`,
        boxShadow: hovered ? `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${accent}15` : '0 2px 8px rgba(0,0,0,0.2)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        opacity: visible ? 1 : 0,
        transition: 'all 0.25s cubic-bezier(0.34,1.56,0.64,1)',
      }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 22 }}>{icon}</span>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent, boxShadow: `0 0 8px ${accent}`, animation: 'pulse 2s infinite' }} />
      </div>
      <p style={{ color: 'white', fontWeight: 900, fontSize: 32, margin: 0, letterSpacing: '-0.02em' }}>
        <Counter value={value} />
        {typeof value === 'string' && value.includes('%') ? '%' : ''}
      </p>
      <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', marginTop: 4 }}>{label}</p>
      {sub && <p style={{ color: accent, fontSize: 10, marginTop: 2, fontFamily: 'monospace' }}>{sub}</p>}
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
    const prev = [...jobs]
    setJobs(p => p.map(j => String(j.id) === String(jobId) ? { ...j, status: newStatus } : j))
    try { await api.patch(`/applications/${jobId}`, { status: newStatus }) }
    catch { setJobs(prev) }
  }

  const byStatus = s => jobs.filter(j => j.status === s)
  const chartData = STATUSES.map(s => ({ name: s, count: byStatus(s).length, color: STATUS_CONFIG[s].accent }))
  const logout = () => { localStorage.removeItem('token'); navigate('/login') }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#02020a', gap: 16 }}>
      <span style={{ fontSize: 40, animation: 'spin 1s linear infinite', display: 'inline-block', filter: 'drop-shadow(0 0 12px rgba(255,184,0,0.8))' }}>🐝</span>
      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, fontFamily: 'monospace', letterSpacing: '0.15em' }}>LOADING MISSION CONTROL...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#02020a', fontFamily: "'Inter', sans-serif" }}>
      <GridBackground />

      {/* Navbar */}
      <nav style={{
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20,
        background: 'rgba(2,2,10,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0,245,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.3)' }}>
            <span style={{ fontSize: 18, filter: 'drop-shadow(0 0 6px rgba(255,184,0,0.8))' }}>🐝</span>
          </div>
          <div>
            <p style={{ color: 'white', fontWeight: 900, fontSize: 13, margin: 0, letterSpacing: '0.08em' }}>JOBTRACKER</p>
            <p style={{ color: 'rgba(255,255,255,0.28)', fontSize: 9, margin: 0, fontFamily: 'monospace', letterSpacing: '0.1em' }}>{jobs.length} APPLICATIONS TRACKED</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Analytics */}
          <button onClick={() => navigate('/analytics')} style={{
            padding: '6px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.45)', border: '1px solid rgba(255,255,255,0.08)',
            letterSpacing: '0.08em', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.08)'; e.currentTarget.style.color = '#00f5ff'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}>
            📊 ANALYTICS
          </button>

          {/* View toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, padding: 3, gap: 2 }}>
            {['kanban', 'list'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                padding: '5px 12px', borderRadius: 7, fontSize: 10, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace',
                background: view === v ? 'rgba(0,245,255,0.12)' : 'transparent',
                color: view === v ? '#00f5ff' : 'rgba(255,255,255,0.35)',
                border: view === v ? '1px solid rgba(0,245,255,0.2)' : '1px solid transparent',
                letterSpacing: '0.08em', transition: 'all 0.15s',
              }}>
                {v === 'kanban' ? '⊞ BOARD' : '☰ LIST'}
              </button>
            ))}
          </div>

          {/* Add Job */}
          <button onClick={() => navigate('/add')} style={{
            padding: '7px 16px', borderRadius: 10, fontSize: 12, fontWeight: 900, cursor: 'pointer',
            background: 'linear-gradient(135deg, #00f5ff, #ffb800)', color: '#02020a',
            border: 'none', letterSpacing: '0.08em', fontFamily: 'monospace',
            boxShadow: '0 0 20px rgba(0,245,255,0.2)', transition: 'all 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 40px rgba(0,245,255,0.4), 0 4px 16px rgba(0,0,0,0.3)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(0,245,255,0.2)'}>
            + ADD JOB
          </button>

          {/* BunnyBee */}
          <button onClick={() => navigate('/agent')} style={{
            padding: '7px 14px', borderRadius: 10, fontSize: 11, fontWeight: 800, cursor: 'pointer', fontFamily: 'monospace',
            background: 'rgba(255,184,0,0.1)', color: '#ffb800',
            border: '1px solid rgba(255,184,0,0.25)', letterSpacing: '0.08em', transition: 'all 0.2s',
            boxShadow: '0 0 12px rgba(255,184,0,0.1)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,184,0,0.18)'; e.currentTarget.style.boxShadow = '0 0 24px rgba(255,184,0,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,184,0,0.1)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(255,184,0,0.1)' }}>
            🐝 BUNNYBEE
          </button>

          <button onClick={logout} style={{ padding: '6px 10px', background: 'none', border: 'none', color: 'rgba(255,255,255,0.25)', fontSize: 11, cursor: 'pointer', fontFamily: 'monospace', transition: 'color 0.15s' }}
            onMouseEnter={e => e.currentTarget.style.color = '#ff3d5a'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}>
            EXIT
          </button>
        </div>
      </nav>

      <div style={{ padding: '24px', maxWidth: 1500, margin: '0 auto', position: 'relative', zIndex: 1 }}>
        {/* Stats */}
        {analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
            <StatCard icon="📋" label="TOTAL APPLIED" value={analytics.total} accent="#00f5ff" />
            <StatCard icon="🎯" label="INTERVIEWS" value={analytics.by_status?.Interviewing || 0} accent="#ffb800" sub={`${analytics.interview_rate || 0}% rate`} />
            <StatCard icon="🏆" label="OFFERS" value={analytics.by_status?.Offer || 0} accent="#00ff88" sub={`${analytics.offer_rate || 0}% rate`} />
            <StatCard icon="⚡" label="AVG MATCH" value={analytics.avg_match_score ? Math.round(analytics.avg_match_score) : 0} accent="#ff3d5a" sub={analytics.avg_match_score ? `${Math.round(analytics.avg_match_score)}% avg` : 'No scores yet'} />
          </div>
        )}

        {/* Chart toggle */}
        {showChart && analytics && (
          <div style={{ borderRadius: 20, padding: '20px 24px', marginBottom: 24, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <p style={{ color: 'white', fontWeight: 800, fontSize: 13, marginBottom: 16, fontFamily: 'monospace', letterSpacing: '0.08em' }}>APPLICATION PIPELINE</p>
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={chartData} barSize={40}>
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.35)', fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.25)' }} axisLine={false} tickLine={false} allowDecimals={false} width={20} />
                <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid rgba(255,255,255,0.1)', background: '#0a0a14', color: 'white', fontSize: 12, fontFamily: 'monospace' }} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {chartData.map((e, i) => <Cell key={i} fill={e.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Kanban */}
        {view === 'kanban' && (
          <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 24 }}>
            {STATUSES.map(status => (
              <KanbanColumn key={status} status={status} jobs={byStatus(status)}
                onDrop={handleDrop} onCardClick={id => navigate(`/jobs/${id}`)} />
            ))}
          </div>
        )}

        {/* List view */}
        {view === 'list' && (
          <div style={{ borderRadius: 20, overflow: 'hidden', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  {['Company', 'Role', 'Status', 'Location', 'Match', 'Date'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '14px 20px', color: 'rgba(255,255,255,0.25)', fontSize: 10, fontFamily: 'monospace', letterSpacing: '0.12em', fontWeight: 700 }}>{h.toUpperCase()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {jobs.map(job => {
                  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied
                  return (
                    <tr key={job.id} onClick={() => navigate(`/jobs/${job.id}`)}
                      style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer', transition: 'background 0.15s' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <td style={{ padding: '12px 20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <Avatar name={job.company} />
                          <span style={{ color: 'white', fontWeight: 700 }}>{job.company}</span>
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{job.role}</td>
                      <td style={{ padding: '12px 20px' }}>
                        <span style={{ fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20, background: cfg.badge, color: cfg.badgeText, fontFamily: 'monospace', letterSpacing: '0.08em' }}>{job.status}</span>
                      </td>
                      <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>{job.location || '—'}</td>
                      <td style={{ padding: '12px 20px' }}>{job.match_score ? <span style={{ color: cfg.accent, fontWeight: 800, fontSize: 13 }}>{job.match_score}%</span> : <span style={{ color: 'rgba(255,255,255,0.2)' }}>—</span>}</td>
                      <td style={{ padding: '12px 20px', color: 'rgba(255,255,255,0.25)', fontSize: 11, fontFamily: 'monospace' }}>
                        {job.applied_date ? new Date(job.applied_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                      </td>
                    </tr>
                  )
                })}
                {jobs.length === 0 && (
                  <tr><td colSpan={6} style={{ padding: '60px 20px', textAlign: 'center' }}>
                    <p style={{ fontSize: 32, marginBottom: 8 }}>📭</p>
                    <p style={{ color: 'rgba(255,255,255,0.25)', fontFamily: 'monospace', fontSize: 12, letterSpacing: '0.1em' }}>NO APPLICATIONS YET — CLICK + ADD JOB</p>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }`}</style>
    </div>
  )
}