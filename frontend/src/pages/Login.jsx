import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

export default function Login() {
  const [mode, setMode] = useState('login') // 'login' | 'register'
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handle = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    setError('')
    setLoading(true)
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register'
      const payload = mode === 'login'
        ? { email: form.email, password: form.password }
        : form
      const { data } = await api.post(endpoint, payload)
      localStorage.setItem('token', data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-brand-500 rounded-xl mb-3">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">JobTracker</h1>
          <p className="text-sm text-gray-500 mt-1">Track every application, land the right role</p>
        </div>

        <div className="card p-6">
          {/* Tabs */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            {['login', 'register'].map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError('') }}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-all ${
                  mode === m ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
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
              <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
            )}

            <button onClick={submit} disabled={loading} className="btn-primary w-full mt-2">
              {loading ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}