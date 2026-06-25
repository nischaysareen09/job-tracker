import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post(
        mode === 'login' ? '/auth/login' : '/auth/register',
        mode === 'login' ? { email: form.email, password: form.password } : form
      )
      localStorage.setItem('token', data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #ecfdf5 100%)' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12"
        style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">JobTracker</span>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Land your dream role, faster.
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed mb-10">
            Track every application, generate AI cover letters, and score your resume against any job description.
          </p>
          {[
            { icon: '⚡', text: 'AI-powered cover letter generator' },
            { icon: '🎯', text: 'Resume-JD match scoring with gap analysis' },
            { icon: '📊', text: 'Visual Kanban board with drag & drop' },
            { icon: '📈', text: 'Analytics dashboard to track your pipeline' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-3 mb-3">
              <div className="w-7 h-7 bg-white/10 rounded-lg flex items-center justify-center text-sm">{icon}</div>
              <span className="text-blue-100 text-sm">{text}</span>
            </div>
          ))}
        </div>

        <p className="text-blue-300 text-xs">Built with React · FastAPI · PostgreSQL · Groq AI</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3 shadow-lg"
              style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">JobTracker</h1>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-1">
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
            </p>

            {/* Tabs */}
            <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
              {['login', 'register'].map((m) => (
                <button key={m} onClick={() => { setMode(m); setError('') }}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${
                    mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-400 hover:text-gray-600'
                  }`}>
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="label">Full name</label>
                  <input className="input" name="full_name" placeholder="Jane Doe" value={form.full_name} onChange={handle} />
                </div>
              )}
              <div>
                <label className="label">Email</label>
                <input className="input" name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handle} />
              </div>
              <div>
                <label className="label">Password</label>
                <input className="input" name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle}
                  onKeyDown={(e) => e.key === 'Enter' && submit()} />
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                  <span>⚠️</span>{error}
                </div>
              )}

              <button onClick={submit} disabled={loading}
                className="w-full py-3 text-sm font-bold text-white rounded-xl shadow-lg hover:shadow-xl transition-all disabled:opacity-50 mt-2"
                style={{ background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}