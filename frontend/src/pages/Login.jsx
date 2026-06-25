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

  const inputStyle = {
    width: '100%',
    border: '1.5px solid #e2e8f0',
    borderRadius: '10px',
    padding: '11px 14px',
    fontSize: '14px',
    color: '#1a202c',
    background: '#f8fafc',
    outline: 'none',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
  }

  const labelStyle = {
    display: 'block',
    fontSize: '12px',
    fontWeight: '600',
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '6px',
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Left panel */}
      <div style={{
        display: 'none',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '45%',
        padding: '48px',
        background: 'linear-gradient(135deg, #1d4ed8 0%, #6d28d9 100%)',
      }}
        className="lg-panel">
        <style>{`
          @media (min-width: 1024px) { .lg-panel { display: flex !important; } }
          input::placeholder { color: #94a3b8; }
          input:focus { border-color: #6366f1 !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1); }
        `}</style>

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'rgba(255,255,255,0.2)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="18" height="18" fill="none" stroke="white" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <span style={{ color: 'white', fontWeight: '700', fontSize: '18px' }}>JobTracker</span>
        </div>

        <div>
          <h2 style={{ fontSize: '36px', fontWeight: '800', color: 'white', lineHeight: '1.2', marginBottom: '16px' }}>
            Land your dream role, faster.
          </h2>
          <p style={{ color: 'rgba(191,219,254,1)', fontSize: '16px', lineHeight: '1.6', marginBottom: '40px' }}>
            Track every application, generate AI cover letters, and score your resume against any job description.
          </p>
          {[
            { icon: '⚡', text: 'AI-powered cover letter generator' },
            { icon: '🎯', text: 'Resume-JD match scoring with gap analysis' },
            { icon: '📊', text: 'Visual Kanban board with drag & drop' },
            { icon: '📈', text: 'Analytics dashboard to track your pipeline' },
          ].map(({ icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '28px', height: '28px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px' }}>{icon}</div>
              <span style={{ color: 'rgba(219,234,254,1)', fontSize: '14px' }}>{text}</span>
            </div>
          ))}
        </div>

        <p style={{ color: 'rgba(147,197,253,1)', fontSize: '12px' }}>Built with React · FastAPI · PostgreSQL · Groq AI</p>
      </div>

      {/* Right panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', background: 'linear-gradient(135deg, #eff6ff 0%, #f5f3ff 50%, #ecfdf5 100%)' }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>

          {/* Mobile logo */}
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '52px', height: '52px', borderRadius: '16px', marginBottom: '12px', background: 'linear-gradient(135deg, #2563eb, #7c3aed)' }}>
              <svg width="24" height="24" fill="none" stroke="white" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#1a202c' }}>JobTracker</h1>
          </div>

          {/* Card */}
          <div style={{ background: 'white', borderRadius: '24px', boxShadow: '0 20px 60px rgba(0,0,0,0.08)', border: '1px solid rgba(226,232,240,0.8)', padding: '36px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#0f172a', marginBottom: '4px' }}>
              {mode === 'login' ? 'Welcome back' : 'Get started'}
            </h2>
            <p style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '24px' }}>
              {mode === 'login' ? 'Sign in to your account' : 'Create your free account'}
            </p>

            {/* Tabs */}
            <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '24px' }}>
              {['login', 'register'].map((m) => (
                <button key={m} onClick={() => { setMode(m); setError('') }}
                  style={{
                    flex: 1, padding: '8px', fontSize: '14px', fontWeight: '600', borderRadius: '9px',
                    border: 'none', cursor: 'pointer', transition: 'all 0.2s',
                    background: mode === m ? 'white' : 'transparent',
                    color: mode === m ? '#0f172a' : '#94a3b8',
                    boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                  }}>
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {mode === 'register' && (
                <div>
                  <label style={labelStyle}>Full name</label>
                  <input style={inputStyle} name="full_name" placeholder="Jane Doe" value={form.full_name} onChange={handle} />
                </div>
              )}
              <div>
                <label style={labelStyle}>Email address</label>
                <input style={inputStyle} name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handle} />
              </div>
              <div>
                <label style={labelStyle}>Password</label>
                <input style={inputStyle} name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle}
                  onKeyDown={(e) => e.key === 'Enter' && submit()} />
              </div>

              {error && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: '13px', padding: '12px 16px', borderRadius: '12px' }}>
                  <span>⚠️</span> {error}
                </div>
              )}

              <button onClick={submit} disabled={loading}
                style={{
                  width: '100%', padding: '13px', fontSize: '15px', fontWeight: '700', color: 'white',
                  border: 'none', borderRadius: '12px', cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  boxShadow: '0 4px 15px rgba(99,102,241,0.35)',
                  opacity: loading ? 0.7 : 1, marginTop: '4px', transition: 'all 0.2s',
                }}>
                {loading ? 'Please wait…' : mode === 'login' ? 'Sign in →' : 'Create account →'}
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', fontSize: '12px', color: '#94a3b8', marginTop: '20px' }}>
            Your data is stored securely and never shared.
          </p>
        </div>
      </div>
    </div>
  )
}