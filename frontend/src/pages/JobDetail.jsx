import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

const STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected']

const STATUS_CONFIG = {
  Saved:        { badge: 'rgba(148,163,184,0.15)', badgeText: '#cbd5e1', accent: '#94a3b8' },
  Applied:      { badge: 'rgba(129,140,248,0.15)', badgeText: '#a5b4fc', accent: '#818cf8' },
  Interviewing: { badge: 'rgba(251,191,36,0.15)',  badgeText: '#fcd34d', accent: '#fbbf24' },
  Offer:        { badge: 'rgba(52,211,153,0.15)',  badgeText: '#6ee7b7', accent: '#34d399' },
  Rejected:     { badge: 'rgba(248,113,113,0.15)', badgeText: '#fca5a5', accent: '#f87171' },
}

const DIFFICULTY_CONFIG = {
  easy:   { bg: 'rgba(52,211,153,0.15)',  text: '#6ee7b7',  label: 'Easy'   },
  medium: { bg: 'rgba(251,191,36,0.15)',  text: '#fcd34d',  label: 'Medium' },
  hard:   { bg: 'rgba(248,113,113,0.15)', text: '#fca5a5',  label: 'Hard'   },
}

function QuestionCard({ q, type, index }) {
  const [open, setOpen] = useState(false)
  const diff = DIFFICULTY_CONFIG[q.difficulty] || DIFFICULTY_CONFIG.medium

  return (
    <div className="rounded-xl overflow-hidden transition-all"
      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
      <div className="px-4 py-3 flex items-start justify-between gap-3 cursor-pointer"
        onClick={() => setOpen(!open)}>
        <div className="flex items-start gap-3">
          <span className="text-xs font-bold mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Q{index + 1}</span>
          <p className="text-sm text-white font-medium">{q.question}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          {q.difficulty && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: diff.bg, color: diff.text }}>{diff.label}</span>
          )}
          <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{open ? '▲' : '▼'}</span>
        </div>
      </div>
      {open && (
        <div className="px-4 pb-4 space-y-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div className="pt-3">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: '#818cf8' }}>Ideal Answer</p>
            <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{q.ideal_answer}</p>
          </div>
          {q.tip && (
            <div className="rounded-lg px-3 py-2" style={{ background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: '#fbbf24' }}>💡 Tip</p>
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{q.tip}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('details')
  const [resumeText, setResumeText] = useState('')
  const [aiLoading, setAiLoading] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [matchResult, setMatchResult] = useState(null)
  const [interviewPrep, setInterviewPrep] = useState(null)
  const [followupEmail, setFollowupEmail] = useState(null)
  const [activeInterviewTab, setActiveInterviewTab] = useState('technical')

  useEffect(() => {
    api.get(`/applications/${id}`)
      .then(({ data }) => { setJob(data); setCoverLetter(data.cover_letter || '') })
      .finally(() => setLoading(false))
  }, [id])

  const updateField = (field, value) => setJob({ ...job, [field]: value })

  const save = async () => {
    setSaving(true)
    try { const { data } = await api.patch(`/applications/${id}`, job); setJob(data) }
    finally { setSaving(false) }
  }

  const deleteJob = async () => {
    if (!confirm('Delete this application?')) return
    await api.delete(`/applications/${id}`)
    navigate('/')
  }

  const generateCoverLetter = async () => {
    if (!resumeText) { alert('Paste your resume text first'); return }
    if (!job.job_description) { alert('Add a job description first'); return }
    setAiLoading('cover')
    try {
      const { data } = await api.post('/ai/cover-letter', { job_description: job.job_description, resume_text: resumeText, company: job.company, role: job.role })
      setCoverLetter(data.cover_letter)
      await api.patch(`/applications/${id}`, { cover_letter: data.cover_letter })
    } catch { alert('AI generation failed') }
    finally { setAiLoading('') }
  }

  const scoreResume = async () => {
    if (!resumeText) { alert('Paste your resume text first'); return }
    if (!job.job_description) { alert('Add a job description first'); return }
    setAiLoading('score')
    try {
      const { data } = await api.post('/ai/match-score', { job_description: job.job_description, resume_text: resumeText })
      setMatchResult(data)
      await api.patch(`/applications/${id}`, { match_score: data.score, match_analysis: data.analysis })
      setJob({ ...job, match_score: data.score, match_analysis: data.analysis })
    } catch { alert('AI scoring failed') }
    finally { setAiLoading('') }
  }

  const generateInterviewPrep = async () => {
    if (!job.job_description) { alert('Add a job description first'); return }
    setAiLoading('interview')
    try {
      const { data } = await api.post('/ai/interview-prep', {
        job_description: job.job_description,
        resume_text: resumeText,
        role: job.role,
        company: job.company
      })
      setInterviewPrep(data)
    } catch { alert('Interview prep generation failed') }
    finally { setAiLoading('') }
  }

  const generateFollowup = async () => {
    setAiLoading('followup')
    try {
      const appliedDate = job.applied_date ? new Date(job.applied_date) : new Date()
      const daysSince = Math.floor((new Date() - appliedDate) / (1000 * 60 * 60 * 24))
      const { data } = await api.post('/ai/followup-email', {
        company: job.company,
        role: job.role,
        days_since_applied: daysSince,
        recruiter_name: ''
      })
      setFollowupEmail(data)
    } catch { alert('Follow-up email generation failed') }
    finally { setAiLoading('') }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
      <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
  if (!job) return <div className="p-6" style={{ color: '#f87171' }}>Job not found</div>

  const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.Applied
  const daysSinceApplied = job.applied_date ? Math.floor((new Date() - new Date(job.applied_date)) / (1000 * 60 * 60 * 24)) : null
  const needsFollowup = daysSinceApplied >= 7 && job.status === 'Applied'

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <nav className="px-6 py-4 flex items-center justify-between sticky top-0 z-10"
        style={{ background: 'rgba(10,10,10,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate('/')} className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>← Back</button>
          <span style={{ color: 'rgba(255,255,255,0.12)' }}>|</span>
          <span className="font-bold text-white">{job.company}</span>
          <span style={{ color: 'rgba(255,255,255,0.2)' }}>·</span>
          <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{job.role}</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: cfg.badge, color: cfg.badgeText }}>{job.status}</span>
          {needsFollowup && (
            <span className="text-xs font-bold px-2.5 py-1 rounded-full animate-pulse"
              style={{ backgroundColor: 'rgba(251,191,36,0.2)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.3)' }}>
              ⚠️ Follow up needed ({daysSinceApplied}d)
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving}
            className="text-sm font-bold text-white px-4 py-1.5 rounded-lg disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button onClick={deleteJob} className="text-sm px-3 py-1.5 rounded-lg"
            style={{ color: '#f87171', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)' }}>
            Delete
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 rounded-xl p-1 w-fit mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
          {[
            { key: 'details', label: '📋 Details' },
            { key: 'ai', label: '✨ AI Tools' },
            { key: 'interview', label: '🎯 Interview Prep' },
            { key: 'followup', label: '📧 Follow-up' },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className="px-4 py-1.5 text-sm font-semibold rounded-lg transition-all whitespace-nowrap"
              style={{ background: tab === t.key ? 'rgba(255,255,255,0.1)' : 'transparent', color: tab === t.key ? 'white' : 'rgba(255,255,255,0.4)' }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {tab === 'details' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2">
              <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Company</label><input className="input" value={job.company} onChange={e => updateField('company', e.target.value)} /></div>
                  <div><label className="label">Role</label><input className="input" value={job.role} onChange={e => updateField('role', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Status</label>
                    <select className="input" value={job.status} onChange={e => updateField('status', e.target.value)}>
                      {STATUSES.map(s => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div><label className="label">Location</label><input className="input" value={job.location || ''} onChange={e => updateField('location', e.target.value)} /></div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="label">Salary Range</label><input className="input" value={job.salary_range || ''} onChange={e => updateField('salary_range', e.target.value)} /></div>
                  <div><label className="label">Job URL</label><input className="input" value={job.job_url || ''} onChange={e => updateField('job_url', e.target.value)} /></div>
                </div>
                <div><label className="label">Job Description</label><textarea className="input resize-none" style={{ minHeight: '120px' }} value={job.job_description || ''} onChange={e => updateField('job_description', e.target.value)} /></div>
                <div><label className="label">Notes</label><textarea className="input resize-none" style={{ minHeight: '80px' }} value={job.notes || ''} onChange={e => updateField('notes', e.target.value)} /></div>
              </div>
            </div>

            <div className="space-y-4">
              {daysSinceApplied !== null && (
                <div className="rounded-2xl p-4" style={{ background: needsFollowup ? 'rgba(251,191,36,0.08)' : 'rgba(255,255,255,0.04)', border: `1px solid ${needsFollowup ? 'rgba(251,191,36,0.2)' : 'rgba(255,255,255,0.08)'}` }}>
                  <label className="label">Days Since Applied</label>
                  <p className="text-3xl font-bold mt-1" style={{ color: needsFollowup ? '#fbbf24' : 'white' }}>{daysSinceApplied}d</p>
                  {needsFollowup && <p className="text-xs mt-1" style={{ color: '#fbbf24' }}>⚠️ Consider following up</p>}
                </div>
              )}
              {job.match_score && (
                <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <label className="label">Match Score</label>
                  <p className="text-4xl font-bold mt-1" style={{ color: cfg.accent }}>{job.match_score}%</p>
                  <div className="w-full rounded-full h-2 mt-2" style={{ background: 'rgba(255,255,255,0.08)' }}>
                    <div className="h-2 rounded-full" style={{ width: `${job.match_score}%`, background: cfg.accent }} />
                  </div>
                  {job.match_analysis && <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>{job.match_analysis}</p>}
                </div>
              )}
              {job.job_url && (
                <a href={job.job_url} target="_blank" rel="noreferrer"
                  className="rounded-2xl p-4 flex items-center gap-2 block"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <span className="text-sm font-semibold" style={{ color: '#818cf8' }}>View Job Posting ↗</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* AI Tools Tab */}
        {tab === 'ai' && (
          <div className="space-y-5">
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <label className="label">Your Resume Text</label>
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Paste your resume — used for cover letter and match scoring</p>
              <textarea className="input resize-none font-mono text-xs" style={{ minHeight: '140px' }}
                placeholder="Paste your resume here…" value={resumeText} onChange={e => setResumeText(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="rounded-2xl p-5" style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.15)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">Cover Letter Generator</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>AI-tailored to this specific JD</p>
                  </div>
                  <button onClick={generateCoverLetter} disabled={aiLoading === 'cover'}
                    className="text-sm font-bold text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                    {aiLoading === 'cover' ? 'Generating…' : '✨ Generate'}
                  </button>
                </div>
                {coverLetter ? (
                  <div>
                    <textarea className="input resize-none text-xs font-mono" style={{ minHeight: '220px' }}
                      value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
                    <button onClick={() => navigator.clipboard.writeText(coverLetter)}
                      className="btn-secondary text-xs mt-2 py-1.5 px-3">Copy</button>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-xl" style={{ minHeight: '100px', border: '2px dashed rgba(129,140,248,0.2)' }}>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Cover letter appears here</p>
                  </div>
                )}
              </div>

              <div className="rounded-2xl p-5" style={{ background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.15)' }}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-white text-sm">Resume Match Scorer</h3>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>See how well you fit this role</p>
                  </div>
                  <button onClick={scoreResume} disabled={aiLoading === 'score'}
                    className="text-sm font-bold text-white px-3 py-1.5 rounded-lg disabled:opacity-50"
                    style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
                    {aiLoading === 'score' ? 'Scoring…' : '✨ Score'}
                  </button>
                </div>
                {matchResult ? (
                  <div className="space-y-4">
                    <div className="text-center py-2">
                      <p className="text-5xl font-bold" style={{ color: '#34d399' }}>{matchResult.score}%</p>
                      <div className="w-full rounded-full h-2 mt-3" style={{ background: 'rgba(255,255,255,0.08)' }}>
                        <div className="h-2 rounded-full" style={{ width: `${matchResult.score}%`, background: 'linear-gradient(90deg, #059669, #34d399)' }} />
                      </div>
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{matchResult.analysis}</p>
                    <div>
                      <p className="text-xs font-bold mb-1.5" style={{ color: '#34d399' }}>✓ Strengths</p>
                      {matchResult.strengths.map((s, i) => <p key={i} className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>• {s}</p>)}
                    </div>
                    <div>
                      <p className="text-xs font-bold mb-1.5" style={{ color: '#f87171' }}>✗ Gaps</p>
                      {matchResult.gaps.map((g, i) => <p key={i} className="text-xs mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>• {g}</p>)}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center rounded-xl" style={{ minHeight: '100px', border: '2px dashed rgba(52,211,153,0.2)' }}>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>Match results appear here</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Interview Prep Tab */}
        {tab === 'interview' && (
          <div className="space-y-5">
            <div className="rounded-2xl p-5 flex items-start justify-between gap-4"
              style={{ background: 'rgba(129,140,248,0.05)', border: '1px solid rgba(129,140,248,0.15)' }}>
              <div>
                <h3 className="font-bold text-white">AI Interview Prep</h3>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  Get role-specific technical, behavioral, and situational questions with ideal answers — tailored to this exact JD.
                </p>
                <div className="mt-3">
                  <label className="label">Your Resume (optional, improves personalization)</label>
                  <textarea className="input resize-none text-xs font-mono mt-1" style={{ minHeight: '80px' }}
                    placeholder="Paste resume for personalized questions…"
                    value={resumeText} onChange={e => setResumeText(e.target.value)} />
                </div>
              </div>
              <button onClick={generateInterviewPrep} disabled={aiLoading === 'interview'}
                className="flex-shrink-0 text-sm font-bold text-white px-4 py-2 rounded-lg disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {aiLoading === 'interview' ? 'Generating…' : '🎯 Generate Questions'}
              </button>
            </div>

            {interviewPrep && (
              <div className="space-y-5">
                {/* Interview tabs */}
                <div className="flex gap-1 rounded-xl p-1 w-fit" style={{ background: 'rgba(255,255,255,0.05)' }}>
                  {[
                    { key: 'technical', label: `⚙️ Technical (${interviewPrep.technical?.length || 0})` },
                    { key: 'behavioral', label: `🧠 Behavioral (${interviewPrep.behavioral?.length || 0})` },
                    { key: 'role_specific', label: `🎯 Role Specific (${interviewPrep.role_specific?.length || 0})` },
                  ].map(t => (
                    <button key={t.key} onClick={() => setActiveInterviewTab(t.key)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
                      style={{ background: activeInterviewTab === t.key ? 'rgba(255,255,255,0.1)' : 'transparent', color: activeInterviewTab === t.key ? 'white' : 'rgba(255,255,255,0.4)' }}>
                      {t.label}
                    </button>
                  ))}
                </div>

                <div className="space-y-3">
                  {(interviewPrep[activeInterviewTab] || []).map((q, i) => (
                    <QuestionCard key={i} q={q} type={activeInterviewTab} index={i} />
                  ))}
                </div>
              </div>
            )}

            {!interviewPrep && aiLoading !== 'interview' && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-4xl">🎯</p>
                <p className="font-semibold" style={{ color: 'rgba(255,255,255,0.3)' }}>No questions generated yet</p>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.2)' }}>Click "Generate Questions" to get started</p>
              </div>
            )}

            {aiLoading === 'interview' && (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>Generating personalized questions…</p>
              </div>
            )}
          </div>
        )}

        {/* Follow-up Tab */}
        {tab === 'followup' && (
          <div className="space-y-5">
            {/* Status card */}
            <div className="rounded-2xl p-5 grid grid-cols-3 gap-4"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div>
                <label className="label">Current Status</label>
                <p className="text-lg font-bold mt-1" style={{ color: cfg.accent }}>{job.status}</p>
              </div>
              <div>
                <label className="label">Days Since Applied</label>
                <p className="text-lg font-bold mt-1" style={{ color: needsFollowup ? '#fbbf24' : 'white' }}>
                  {daysSinceApplied !== null ? `${daysSinceApplied} days` : '—'}
                </p>
              </div>
              <div>
                <label className="label">Follow-up Status</label>
                <p className="text-sm font-bold mt-1" style={{ color: needsFollowup ? '#fbbf24' : '#34d399' }}>
                  {needsFollowup ? '⚠️ Recommended' : '✓ Not needed yet'}
                </p>
              </div>
            </div>

            {/* Follow-up email generator */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(251,191,36,0.04)', border: '1px solid rgba(251,191,36,0.15)' }}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white">Follow-up Email Generator</h3>
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    AI-crafted professional follow-up email for {job.company}
                  </p>
                </div>
                <button onClick={generateFollowup} disabled={aiLoading === 'followup'}
                  className="text-sm font-bold text-white px-4 py-2 rounded-lg disabled:opacity-50 flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #d97706, #fbbf24)' }}>
                  {aiLoading === 'followup' ? 'Generating…' : '📧 Generate Email'}
                </button>
              </div>

              {followupEmail ? (
                <div className="space-y-3">
                  <div>
                    <label className="label">Subject</label>
                    <div className="input mt-1 text-sm" style={{ color: 'white' }}>{followupEmail.subject}</div>
                  </div>
                  <div>
                    <label className="label">Email Body</label>
                    <textarea className="input resize-none text-sm mt-1" style={{ minHeight: '180px' }}
                      value={followupEmail.body} onChange={e => setFollowupEmail({ ...followupEmail, body: e.target.value })} />
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => navigator.clipboard.writeText(`Subject: ${followupEmail.subject}\n\n${followupEmail.body}`)}
                      className="btn-secondary text-xs py-1.5 px-3">Copy Email</button>
                    <button onClick={() => window.open(`mailto:?subject=${encodeURIComponent(followupEmail.subject)}&body=${encodeURIComponent(followupEmail.body)}`)}
                      className="text-xs font-semibold px-3 py-1.5 rounded-lg"
                      style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24', border: '1px solid rgba(251,191,36,0.25)' }}>
                      Open in Mail ↗
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-2"
                  style={{ border: '2px dashed rgba(251,191,36,0.2)', borderRadius: '12px' }}>
                  <p className="text-2xl">📧</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>Follow-up email appears here</p>
                </div>
              )}
            </div>

            {/* Tips */}
            <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 className="font-bold text-white text-sm mb-3">📌 Follow-up Best Practices</h3>
              <div className="space-y-2">
                {[
                  { tip: 'Wait 7-10 business days after applying before following up', color: '#818cf8' },
                  { tip: 'Keep it short — 3-4 sentences max', color: '#34d399' },
                  { tip: 'Reference the specific role and your application date', color: '#fbbf24' },
                  { tip: 'Add a new value proposition — mention a recent project or skill', color: '#f87171' },
                  { tip: "Don't follow up more than twice — respect their time", color: '#94a3b8' },
                ].map(({ tip, color }, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0" style={{ backgroundColor: color }} />
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}