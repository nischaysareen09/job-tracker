import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../api'

const STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected']

const STATUS_STYLES = {
  Saved:        'bg-gray-100 text-gray-600',
  Applied:      'bg-brand-50 text-brand-700',
  Interviewing: 'bg-amber-50 text-amber-700',
  Offer:        'bg-green-50 text-green-700',
  Rejected:     'bg-red-50 text-red-600',
}

export default function JobDetail() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tab, setTab] = useState('details') // 'details' | 'ai'

  // AI states
  const [resumeText, setResumeText] = useState('')
  const [aiLoading, setAiLoading] = useState('')
  const [coverLetter, setCoverLetter] = useState('')
  const [matchResult, setMatchResult] = useState(null)

  useEffect(() => {
    api.get(`/applications/${id}`)
      .then(({ data }) => { setJob(data); setCoverLetter(data.cover_letter || '') })
      .finally(() => setLoading(false))
  }, [id])

  const updateField = (field, value) => setJob({ ...job, [field]: value })

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await api.patch(`/applications/${id}`, job)
      setJob(data)
    } finally {
      setSaving(false)
    }
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
      const { data } = await api.post('/ai/cover-letter', {
        job_description: job.job_description,
        resume_text: resumeText,
        company: job.company,
        role: job.role,
      })
      setCoverLetter(data.cover_letter)
      await api.patch(`/applications/${id}`, { cover_letter: data.cover_letter })
    } catch (err) {
      alert('AI generation failed — check your Groq API key')
    } finally {
      setAiLoading('')
    }
  }

  const scoreResume = async () => {
    if (!resumeText) { alert('Paste your resume text first'); return }
    if (!job.job_description) { alert('Add a job description first'); return }
    setAiLoading('score')
    try {
      const { data } = await api.post('/ai/match-score', {
        job_description: job.job_description,
        resume_text: resumeText,
      })
      setMatchResult(data)
      await api.patch(`/applications/${id}`, { match_score: data.score, match_analysis: data.analysis })
      setJob({ ...job, match_score: data.score, match_analysis: data.analysis })
    } catch (err) {
      alert('AI scoring failed — check your Groq API key')
    } finally {
      setAiLoading('')
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-surface flex items-center justify-center">
      <p className="text-gray-400 text-sm">Loading…</p>
    </div>
  )
  if (!job) return <div className="p-6 text-red-500">Job not found</div>

  return (
    <div className="min-h-screen bg-surface">
      {/* Navbar */}
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600">← Back</button>
          <span className="text-gray-300">|</span>
          <div>
            <span className="font-semibold text-gray-900">{job.company}</span>
            <span className="text-gray-400 mx-2">·</span>
            <span className="text-gray-600 text-sm">{job.role}</span>
          </div>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[job.status]}`}>{job.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={save} disabled={saving} className="btn-primary text-sm py-1.5">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
          <button onClick={deleteJob} className="text-sm text-red-400 hover:text-red-600 px-2">Delete</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit mb-6">
          {['details', 'ai'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
              {t === 'details' ? '📋 Details' : '✨ AI Features'}
            </button>
          ))}
        </div>

        {/* Details Tab */}
        {tab === 'details' && (
          <div className="grid grid-cols-3 gap-6">
            <div className="col-span-2 space-y-5">
              <div className="card p-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Company</label>
                    <input className="input" value={job.company} onChange={(e) => updateField('company', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Role</label>
                    <input className="input" value={job.role} onChange={(e) => updateField('role', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Status</label>
                    <select className="input" value={job.status} onChange={(e) => updateField('status', e.target.value)}>
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Location</label>
                    <input className="input" value={job.location || ''} onChange={(e) => updateField('location', e.target.value)} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Salary Range</label>
                    <input className="input" value={job.salary_range || ''} onChange={(e) => updateField('salary_range', e.target.value)} />
                  </div>
                  <div>
                    <label className="label">Job URL</label>
                    <input className="input" value={job.job_url || ''} onChange={(e) => updateField('job_url', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="label">Job Description</label>
                  <textarea className="input min-h-32 resize-none" value={job.job_description || ''}
                    onChange={(e) => updateField('job_description', e.target.value)} />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea className="input min-h-20 resize-none" value={job.notes || ''}
                    onChange={(e) => updateField('notes', e.target.value)} />
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {job.match_score && (
                <div className="card p-4">
                  <p className="label">Match Score</p>
                  <p className="text-3xl font-bold text-brand-600">{job.match_score}%</p>
                  <div className="w-full bg-gray-100 rounded-full h-2 mt-2">
                    <div className="bg-brand-500 h-2 rounded-full transition-all" style={{ width: `${job.match_score}%` }} />
                  </div>
                  {job.match_analysis && <p className="text-xs text-gray-500 mt-2">{job.match_analysis}</p>}
                </div>
              )}
              {job.cover_letter && (
                <div className="card p-4">
                  <p className="label mb-2">Cover Letter</p>
                  <p className="text-xs text-green-600 font-medium">✓ Generated</p>
                  <button onClick={() => setTab('ai')} className="text-xs text-brand-600 mt-1 hover:underline">View →</button>
                </div>
              )}
              {job.job_url && (
                <a href={job.job_url} target="_blank" rel="noreferrer"
                  className="card p-4 flex items-center gap-2 hover:border-brand-500 border border-transparent transition-colors block">
                  <span className="text-sm text-brand-600 font-medium">View Job Posting ↗</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* AI Tab */}
        {tab === 'ai' && (
          <div className="space-y-6">
            {/* Resume input */}
            <div className="card p-5">
              <label className="label">Your Resume Text</label>
              <p className="text-xs text-gray-400 mb-2">Paste your resume as plain text — used for both AI features below</p>
              <textarea className="input min-h-40 resize-none font-mono text-xs"
                placeholder="Paste your resume here…"
                value={resumeText} onChange={(e) => setResumeText(e.target.value)} />
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* Cover Letter */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Cover Letter Generator</h3>
                    <p className="text-xs text-gray-400 mt-0.5">AI-tailored to this specific JD</p>
                  </div>
                  <button onClick={generateCoverLetter} disabled={aiLoading === 'cover'} className="btn-primary text-sm py-1.5">
                    {aiLoading === 'cover' ? 'Generating…' : '✨ Generate'}
                  </button>
                </div>
                {coverLetter ? (
                  <div className="mt-3">
                    <textarea className="input min-h-64 resize-none text-xs font-mono"
                      value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} />
                    <button onClick={() => navigator.clipboard.writeText(coverLetter)}
                      className="btn-secondary text-xs mt-2 py-1">Copy to clipboard</button>
                  </div>
                ) : (
                  <div className="mt-3 min-h-32 flex items-center justify-center text-gray-300 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                    Cover letter appears here
                  </div>
                )}
              </div>

              {/* Match Score */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">Resume Match Scorer</h3>
                    <p className="text-xs text-gray-400 mt-0.5">See how well you fit this role</p>
                  </div>
                  <button onClick={scoreResume} disabled={aiLoading === 'score'} className="btn-primary text-sm py-1.5">
                    {aiLoading === 'score' ? 'Scoring…' : '✨ Score'}
                  </button>
                </div>
                {matchResult ? (
                  <div className="space-y-4 mt-3">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-brand-600">{matchResult.score}%</p>
                      <div className="w-full bg-gray-100 rounded-full h-2.5 mt-2">
                        <div className="bg-brand-500 h-2.5 rounded-full" style={{ width: `${matchResult.score}%` }} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-600">{matchResult.analysis}</p>
                    <div>
                      <p className="text-xs font-semibold text-green-600 mb-1">✓ Strengths</p>
                      {matchResult.strengths.map((s, i) => (
                        <p key={i} className="text-xs text-gray-600 mb-0.5">• {s}</p>
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-red-500 mb-1">✗ Gaps</p>
                      {matchResult.gaps.map((g, i) => (
                        <p key={i} className="text-xs text-gray-600 mb-0.5">• {g}</p>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 min-h-32 flex items-center justify-center text-gray-300 text-sm border-2 border-dashed border-gray-100 rounded-lg">
                    Match results appear here
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}