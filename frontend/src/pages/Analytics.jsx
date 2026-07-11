import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LineChart, Line, PieChart, Pie, Legend } from 'recharts'
import api from '../api'

const STATUS_COLORS = {
  Saved: '#94a3b8', Applied: '#818cf8', Interviewing: '#fbbf24', Offer: '#34d399', Rejected: '#f87171'
}

export default function Analytics() {
  const [basic, setBasic] = useState(null)
  const [detailed, setDetailed] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/analytics')
      .then(b => setBasic(b.data))
      .catch(console.error)

    api.get('/analytics/detailed')
      .then(d => setDetailed(d.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const statusData = basic ? Object.entries(basic.by_status || {}).map(([name, count]) => ({ name, count, color: STATUS_COLORS[name] || '#818cf8' })) : []
  const heatmapData = detailed ? Object.entries(detailed.heatmap || {}).slice(-30).map(([date, count]) => ({ date: date.slice(5), count })) : []
  const pieData = statusData.filter(d => d.count > 0)

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <nav className="px-6 py-4 flex items-center justify-between sticky top-0 z-20"
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>← Dashboard</button>
          <span style={{ color: 'rgba(255,255,255,0.12)' }}>|</span>
          <h1 className="font-bold text-white">Analytics</h1>
        </div>
      </nav>

      <div className="p-6 max-w-6xl mx-auto space-y-6">
        {/* Key metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total Applied', value: basic?.total || 0, accent: '#818cf8', icon: '📋' },
            { label: 'Response Rate', value: `${detailed?.response_rate ?? basic?.offer_rate ?? 0}%`, accent: '#34d399', icon: '📬' },
            { label: 'Avg Days to Response', value: detailed?.avg_days_to_response ? `${detailed.avg_days_to_response}d` : '—', accent: '#fbbf24', icon: '⏱️' },
            { label: 'Follow-ups Needed', value: detailed?.followup_needed?.length || 0, accent: '#f87171', icon: '⚠️' },
          ].map(({ label, value, accent, icon }) => (
            <div key={label} className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{icon}</span>
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: accent }} />
              </div>
              <p className="text-3xl font-bold text-white">{value}</p>
              <p className="text-[11px] mt-1 uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-6">
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="font-bold text-white text-sm mb-4">Applications by Stage</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={statusData} barSize={36}>
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.4)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} allowDecimals={false} width={24} />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: 'white', fontSize: '12px' }} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Bar dataKey="count" radius={[8,8,0,0]}>{statusData.map((e,i) => <Cell key={i} fill={e.color} />)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No data yet</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="font-bold text-white text-sm mb-4">Pipeline Distribution</h3>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={75} strokeWidth={0}>
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: 'white', fontSize: '12px' }} />
                  <Legend formatter={(value) => <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>{value}</span>} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-48">
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>No data yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Offer & Interview rates */}
        {basic && (
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Interview Rate', value: `${basic.interview_rate || 0}%`, accent: '#fbbf24' },
              { label: 'Offer Rate', value: `${basic.offer_rate || 0}%`, accent: '#34d399' },
              { label: 'Avg Match Score', value: basic.avg_match_score ? `${basic.avg_match_score}%` : '—', accent: '#818cf8' },
            ].map(({ label, value, accent }) => (
              <div key={label} className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-2xl font-bold" style={{ color: accent }}>{value}</p>
                <p className="text-[11px] mt-1 uppercase tracking-widest font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Activity timeline */}
        {heatmapData.length > 0 && (
          <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
            <h3 className="font-bold text-white text-sm mb-4">Application Activity (Last 30 Days)</h3>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={heatmapData}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.3)' }} axisLine={false} tickLine={false} />
                <YAxis hide allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: '#1a1a1a', color: 'white', fontSize: '12px' }} />
                <Line type="monotone" dataKey="count" stroke="#818cf8" strokeWidth={2} dot={{ fill: '#818cf8', r: 3 }} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Follow-up needed */}
        {detailed?.followup_needed?.length > 0 && (
          <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.15)' }}>
            <div className="px-5 py-4" style={{ borderBottom: '1px solid rgba(251,191,36,0.1)' }}>
              <h3 className="font-bold text-white text-sm">⚠️ Follow-up Needed</h3>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>These applications need your attention</p>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  {['Company', 'Role', 'Days Since Applied', 'Urgency', 'Action'].map(h => (
                    <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.3)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {detailed.followup_needed.map(f => (
                  <tr key={f.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td className="px-5 py-3 font-semibold text-white">{f.company}</td>
                    <td className="px-5 py-3 text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{f.role}</td>
                    <td className="px-5 py-3 font-bold" style={{ color: '#fbbf24' }}>{f.days_since_applied}d</td>
                    <td className="px-5 py-3">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: f.urgency === 'high' ? 'rgba(248,113,113,0.15)' : 'rgba(251,191,36,0.15)', color: f.urgency === 'high' ? '#fca5a5' : '#fcd34d' }}>
                        {f.urgency === 'high' ? '🔴 High' : '🟡 Medium'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <button onClick={() => navigate(`/jobs/${f.id}`)}
                        className="text-xs font-semibold px-3 py-1 rounded-lg"
                        style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                        Follow up →
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!basic && !detailed && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <p className="text-4xl">📊</p>
            <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>No analytics data yet</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Add some job applications to see your stats</p>
            <button onClick={() => navigate('/')} className="mt-2 text-sm font-semibold px-4 py-2 rounded-lg"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  )
}