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
    <div className="min-h-screen bg-surface">
      <nav className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-3">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-gray-600 transition-colors">
          ← Back
        </button>
        <span className="text-gray-300">|</span>
        <h1 className="font-semibold text-gray-900">Add Job Application</h1>
      </nav>

      <div className="max-w-2xl mx-auto p-6">
        <div className="card p-6 space-y-5">
          {/* Required fields */}
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
            <textarea className="input min-h-28 resize-none" name="job_description"
              placeholder="Paste the full job description here — used for AI cover letter and match scoring"
              value={form.job_description} onChange={handle} />
          </div>

          <div>
            <label className="label">Notes</label>
            <textarea className="input min-h-20 resize-none" name="notes"
              placeholder="Recruiter name, interview notes, referral info…"
              value={form.notes} onChange={handle} />
          </div>

          {error && <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>}

          <div className="flex gap-3 pt-2">
            <button onClick={submit} disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving…' : 'Save Application'}
            </button>
            <button onClick={() => navigate('/')} className="btn-secondary">Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}