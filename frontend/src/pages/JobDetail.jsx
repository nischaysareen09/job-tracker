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
    <div className="min-h-screen flex" style={{ background: '#0a0a0a' }}>
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' }}>
        {/* Glow orbs */}
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #818cf8, transparent)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-20 right-10 w-48 h-48 rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #34d399, transparent)', filter: 'blur(40px)' }} />

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(129,140,248,0.2)', border: '1px solid rgba(129,140,248,0.3)' }}>
            <svg className="w-5 h-5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="text-white font-bold text-lg">JobTracker</span>
        </div>

        <div className="relative z-10">
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            Land your dream role, faster.
          </h2>
          <p className="text-indigo-300 text-base leading-relaxed mb-10">
            Track every application, generate AI cover letters, and score your resume against any job description.
          </p>
          {[
            { icon: '⚡', text: 'AI-powered cover letter generator', color: '#fbbf24' },
            { icon: '🎯', text: 'Resume-JD match scoring with gap analysis', color: '#818cf8' },
            { icon: '📊', text: 'Visual Kanban board with drag & drop', color: '#34d399' },
            { icon: '📈', text: 'Analytics dashboard to track your pipeline', color: '#f87171' },
          ].map(({ icon, text, color }) => (
            <div key={text} className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{ backgroundColor: color + '22', border: `1px solid ${color}33` }}>{icon}</div>
              <span className="text-indigo-200 text-sm">{text}</span>
            </div>
          ))}
        </div>

        <p className="text-indigo-400 text-xs relative z-10">Built with React · FastAPI · PostgreSQL · Groq AI</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-3"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white">JobTracker</h1>
          </div>

          <div className="rounded-3xl p-8" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <h2 className="text-2xl font-bold text-white mb-1">
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
              {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
            </p>

            <div className="flex rounded-xl p-1 mb-6" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {['login', 'register'].map((m) => (
                <button key={m} onClick={() => { setMode(m); setError('') }}
                  className="flex-1 py-2 text-sm font-semibold rounded-lg transition-all"
                  style={{
                    background: mode === m ? 'rgba(255,255,255,0.1)' : 'transparent',
                    color: mode === m ? 'white' : 'rgba(255,255,255,0.4)',
                  }}>
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
                <div className="flex items-center gap-2 text-sm px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.2)', color: '#fca5a5' }}>
                  ⚠️ {error}
                </div>
              )}

              <button onClick={submit} disabled={loading}
                className="w-full py-3 text-sm font-bold text-white rounded-xl transition-all disabled:opacity-50 mt-2 hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}