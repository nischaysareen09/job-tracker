import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const STATUSES = ['Saved', 'Applied', 'Interviewing', 'Offer', 'Rejected']

export default function AddJob() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    company: '', role: '', status: 'Applied',
    location: '', salary_range: '', job_url: '',
    job_description: '', notes: '', applied_date: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    if (!form.company || !form.role) { setError('Company and role are required'); return }
    setLoading(true)
    setError('')
    try {
      const payload = { ...form }
      if (!payload.applied_date) delete payload.applied_date
      const { data } = await api.post('/applications', payload)
      navigate(`/jobs/${data.id}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: '#0a0a0a' }}>
      <nav className="px-6 py-4 flex items-center gap-3 sticky top-0 z-10"
        style={{ background: 'rgba(10,10,10,0.8)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <button onClick={() => navigate('/')} className="text-sm font-medium transition-colors"
          style={{ color: 'rgba(255,255,255,0.4)' }}
          onMouseEnter={e => e.target.style.color = 'white'}
          onMouseLeave={e => e.target.style.color = 'rgba(255,255,255,0.4)'}>
          ← Back
        </button>
        <span style={{ color: 'rgba(255,255,255,0.15)' }}>|</span>
        <h1 className="font-bold text-white">Add Job Application</h1>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <div className="rounded-2xl p-6 space-y-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Company *</label>
              <input className="input" name="company" placeholder="Google" value={form.company} onChange={handle} />
            </div>
            <div>
              <label className="label">Role *</label>
              <input className="input" name="role" placeholder="Software Engineer" value={form.role} onChange={handle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Status</label>
              <select className="input" name="status" value={form.status} onChange={handle}>
                {STATUSES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Location</label>
              <input className="input" name="location" placeholder="Remote / Bangalore" value={form.location} onChange={handle} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Salary Range</label>
              <input className="input" name="salary_range" placeholder="₹20-25 LPA" value={form.salary_range} onChange={handle} />
            </div>
            <div>
              <label className="label">Date Applied</label>
              <input className="input" type="date" name="applied_date" value={form.applied_date} onChange={handle} />
            </div>
          </div>

          <div>
            <label className="label">Job URL</label>
            <input className="input" name="job_url" placeholder="https://jobs.google.com/..." value={form.job_url} onChange={handle} />
          </div>

          <div>
            <label className="label">Job Description</label>
            <textarea className="input resize-none" style={{ minHeight: '120px' }} name="job_description"
              placeholder="Paste the full job description here — used for AI cover letter and match scoring"
              value={form.job_description} onChange={handle} />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input resize-none" style={{ minHeight: '80px' }} name="notes"
              placeholder="Recruiter name, interview notes, referral info…"
              value={form.notes} onChange={handle} />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>
              ⚠️ {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={submit} disabled={loading}
              className="flex-1 py-3 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              {loading ? 'Saving…' : 'Save Application'}
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary px-6">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}