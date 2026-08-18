import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

// Animated radar canvas
function RadarCanvas() {
  const canvasRef = useRef(null)
  const angleRef = useRef(0)
  const dotsRef = useRef([])
  const frameRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight
    const cx = W / 2, cy = H / 2
    const R = Math.min(W, H) * 0.42

    // Generate random blips
    dotsRef.current = Array.from({ length: 12 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: (0.2 + Math.random() * 0.75) * R,
      opacity: 0,
      size: 1.5 + Math.random() * 2.5,
    }))

    const draw = () => {
      ctx.clearRect(0, 0, W, H)

      // Grid circles
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath()
        ctx.arc(cx, cy, R * i / 4, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,245,255,${0.06 + i * 0.02})`
        ctx.lineWidth = 1
        ctx.stroke()
      }

      // Cross lines
      ctx.strokeStyle = 'rgba(0,245,255,0.08)'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(cx - R, cy); ctx.lineTo(cx + R, cy); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx, cy - R); ctx.lineTo(cx, cy + R); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx - R * 0.707, cy - R * 0.707); ctx.lineTo(cx + R * 0.707, cy + R * 0.707); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx + R * 0.707, cy - R * 0.707); ctx.lineTo(cx - R * 0.707, cy + R * 0.707); ctx.stroke()

      // Sweep gradient
      const sweepAngle = angleRef.current
      const grad = ctx.createConicalGradient
        ? ctx.createConicalGradient(cx, cy, sweepAngle)
        : null

      // Draw sweep as multiple arcs
      for (let i = 0; i < 40; i++) {
        const a = sweepAngle - (i * Math.PI / 60)
        const opacity = (40 - i) / 40 * 0.35
        ctx.beginPath()
        ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, R, a, a + Math.PI / 60)
        ctx.closePath()
        ctx.fillStyle = `rgba(0,245,255,${opacity})`
        ctx.fill()
      }

      // Sweep line
      ctx.beginPath()
      ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(sweepAngle) * R, cy + Math.sin(sweepAngle) * R)
      ctx.strokeStyle = 'rgba(0,245,255,0.9)'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Blips
      dotsRef.current.forEach(dot => {
        const dx = sweepAngle - dot.angle
        const norm = ((dx % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
        if (norm < 0.15) dot.opacity = 1
        else dot.opacity = Math.max(0, dot.opacity - 0.012)

        if (dot.opacity > 0) {
          const x = cx + Math.cos(dot.angle) * dot.dist
          const y = cy + Math.sin(dot.angle) * dot.dist
          ctx.beginPath()
          ctx.arc(x, y, dot.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,245,255,${dot.opacity})`
          ctx.fill()
          // Glow
          ctx.beginPath()
          ctx.arc(x, y, dot.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(0,245,255,${dot.opacity * 0.15})`
          ctx.fill()
        }
      })

      // Center dot
      ctx.beginPath()
      ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#00f5ff'
      ctx.fill()
      ctx.beginPath()
      ctx.arc(cx, cy, 8, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,245,255,0.15)'
      ctx.fill()

      angleRef.current = (sweepAngle + 0.008) % (Math.PI * 2)
      frameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => cancelAnimationFrame(frameRef.current)
  }, [])

  return <canvas ref={canvasRef} className="w-full h-full" />
}

// Animated grid background
function GridBg() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div style={{
        backgroundImage: `
          linear-gradient(rgba(0,245,255,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,245,255,0.04) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
        width: '100%',
        height: '100%',
      }} />
      {/* Gradient overlay */}
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(ellipse at 30% 50%, rgba(0,245,255,0.06) 0%, transparent 60%)'
      }} />
    </div>
  )
}

// Typing animation for tagline
function TypeWriter({ text }) {
  const [displayed, setDisplayed] = useState('')
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (idx < text.length) {
      const t = setTimeout(() => {
        setDisplayed(prev => prev + text[idx])
        setIdx(i => i + 1)
      }, 40)
      return () => clearTimeout(t)
    }
  }, [idx, text])

  return (
    <span>
      {displayed}
      {idx < text.length && (
        <span className="inline-block w-0.5 h-4 ml-0.5 animate-pulse" style={{ backgroundColor: '#00f5ff', verticalAlign: 'middle' }} />
      )}
    </span>
  )
}

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
  }, [])

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
      setError(err.response?.data?.detail || 'Connection failed')
    } finally {
      setLoading(false)
    }
  }

  const stats = [
    { label: 'Applications Tracked', value: '2,847' },
    { label: 'Cover Letters Generated', value: '1,203' },
    { label: 'Interview Preps Done', value: '891' },
    { label: 'Offers Landed', value: '342' },
  ]

  return (
    <div className="min-h-screen flex" style={{ background: '#050508', fontFamily: "'Inter', sans-serif" }}>

      {/* LEFT PANEL — Mission Control */}
      <div className="hidden lg:flex flex-col w-[52%] relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #050508 0%, #080c14 100%)' }}>
        <GridBg />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,245,255,0.1)', border: '1px solid rgba(0,245,255,0.3)' }}>
              <span className="text-sm">🐝</span>
            </div>
            <span className="font-bold text-white tracking-wider text-sm" style={{ letterSpacing: '0.15em' }}>
              JOBTRACKER
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#00f5ff' }} />
            <span className="text-xs font-mono" style={{ color: '#00f5ff' }}>SYSTEM ONLINE</span>
          </div>
        </div>

        {/* Radar */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-8">
          <div className="w-72 h-72 mb-8" style={{
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.8s ease',
            filter: 'drop-shadow(0 0 20px rgba(0,245,255,0.3))'
          }}>
            <RadarCanvas />
          </div>

          {/* Headline */}
          <div className="text-center mb-8" style={{ opacity: mounted ? 1 : 0, transition: 'opacity 1s ease 0.3s' }}>
            <h1 className="text-4xl font-black text-white mb-3" style={{ letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Find your next<br />
              <span style={{
                background: 'linear-gradient(90deg, #00f5ff, #ffb800)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>mission.</span>
            </h1>
            <p className="text-sm font-mono" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <TypeWriter text="Scanning opportunities · BunnyBee AI active" />
            </p>
          </div>

          {/* Stats grid */}
          <div className="grid grid-cols-2 gap-3 w-full max-w-sm"
            style={{ opacity: mounted ? 1 : 0, transition: 'opacity 1s ease 0.6s' }}>
            {stats.map(({ label, value }, i) => (
              <div key={i} className="rounded-xl p-3" style={{
                background: 'rgba(0,245,255,0.04)',
                border: '1px solid rgba(0,245,255,0.1)',
              }}>
                <p className="text-lg font-black" style={{
                  background: 'linear-gradient(90deg, #00f5ff, #ffb800)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>{value}</p>
                <p className="text-[10px] font-mono mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>{label.toUpperCase()}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom features */}
        <div className="relative z-10 px-8 pb-8">
          <div className="flex flex-col gap-2">
            {[
              { icon: '🐝', text: 'BunnyBee AI Agent — tool calling, agentic decisions' },
              { icon: '⚡', text: 'Resume match scoring with gap analysis' },
              { icon: '🎯', text: 'AI interview prep — technical + behavioral' },
            ].map(({ icon, text }, i) => (
              <div key={i} className="flex items-center gap-3"
                style={{ opacity: mounted ? 1 : 0, transition: `opacity 0.8s ease ${0.8 + i * 0.15}s` }}>
                <div className="w-6 h-6 rounded-md flex items-center justify-center text-xs flex-shrink-0"
                  style={{ background: 'rgba(0,245,255,0.08)', border: '1px solid rgba(0,245,255,0.15)' }}>
                  {icon}
                </div>
                <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.45)' }}>{text}</span>
              </div>
            ))}
          </div>
          <p className="text-[10px] font-mono mt-6" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.1em' }}>
            BUILT WITH REACT · FASTAPI · POSTGRESQL · GROQ LLAMA 3.3 70B
          </p>
        </div>
      </div>

      {/* RIGHT PANEL — Auth form */}
      <div className="flex-1 flex items-center justify-center p-8 relative"
        style={{ background: '#09090f' }}>

        {/* Subtle top-right glow */}
        <div className="absolute top-0 right-0 w-64 h-64 pointer-events-none" style={{
          background: 'radial-gradient(circle at top right, rgba(255,184,0,0.06), transparent 60%)'
        }} />

        <div className="w-full max-w-sm" style={{
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(16px)',
          transition: 'all 0.7s ease 0.2s'
        }}>

          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="text-2xl">🐝</span>
              <span className="font-black text-white text-xl tracking-wider">JOBTRACKER</span>
            </div>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-6 rounded-full" style={{ background: 'linear-gradient(180deg, #00f5ff, #ffb800)' }} />
              <span className="text-xs font-mono tracking-widest" style={{ color: '#00f5ff', letterSpacing: '0.15em' }}>
                {mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT'}
              </span>
            </div>
            <h2 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>
              {mode === 'login' ? 'Welcome back.' : 'Get started.'}
            </h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
              {mode === 'login' ? 'Your mission control awaits.' : 'Launch your job search.'}
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex gap-1 mb-6 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
            {['login', 'register'].map(m => (
              <button key={m} onClick={() => { setMode(m); setError('') }}
                className="flex-1 py-2 text-xs font-bold rounded-lg transition-all duration-200"
                style={{
                  background: mode === m ? 'linear-gradient(135deg, rgba(0,245,255,0.15), rgba(255,184,0,0.1))' : 'transparent',
                  color: mode === m ? '#00f5ff' : 'rgba(255,255,255,0.35)',
                  border: mode === m ? '1px solid rgba(0,245,255,0.25)' : '1px solid transparent',
                  letterSpacing: '0.08em',
                }}>
                {m === 'login' ? 'SIGN IN' : 'REGISTER'}
              </button>
            ))}
          </div>

          {/* Form fields */}
          <div className="space-y-4">
            {mode === 'register' && (
              <div>
                <label className="block text-[10px] font-bold mb-1.5 tracking-widest" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>FULL NAME</label>
                <input
                  className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-200"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    fontFamily: 'Inter, sans-serif',
                  }}
                  name="full_name" placeholder="Nischay Sareen"
                  value={form.full_name} onChange={handle}
                  onFocus={e => { e.target.style.border = '1px solid rgba(0,245,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08)' }}
                  onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                />
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>EMAIL ADDRESS</label>
              <input
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Inter, sans-serif' }}
                name="email" type="email" placeholder="you@email.com"
                value={form.email} onChange={handle}
                onFocus={e => { e.target.style.border = '1px solid rgba(0,245,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08)' }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.12em' }}>PASSWORD</label>
              <input
                className="w-full rounded-xl px-4 py-3 text-sm text-white outline-none transition-all duration-200"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', fontFamily: 'Inter, sans-serif' }}
                name="password" type="password" placeholder="••••••••"
                value={form.password} onChange={handle}
                onFocus={e => { e.target.style.border = '1px solid rgba(0,245,255,0.4)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08)' }}
                onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                onKeyDown={e => e.key === 'Enter' && submit()}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl px-4 py-3"
                style={{ background: 'rgba(255,61,90,0.08)', border: '1px solid rgba(255,61,90,0.2)' }}>
                <span style={{ color: '#ff3d5a' }}>⚠</span>
                <p className="text-xs font-mono" style={{ color: '#ff3d5a' }}>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button onClick={submit} disabled={loading}
              className="w-full py-3.5 rounded-xl font-black text-sm tracking-wider transition-all duration-200 relative overflow-hidden group"
              style={{
                background: loading ? 'rgba(255,255,255,0.05)' : 'linear-gradient(135deg, #00f5ff, #ffb800)',
                color: loading ? 'rgba(255,255,255,0.3)' : '#050508',
                letterSpacing: '0.12em',
                boxShadow: loading ? 'none' : '0 0 30px rgba(0,245,255,0.25)',
              }}>
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  CONNECTING...
                </span>
              ) : (
                mode === 'login' ? 'LAUNCH →' : 'CREATE ACCOUNT →'
              )}
            </button>
          </div>

          {/* Footer */}
          <p className="text-center text-[10px] font-mono mt-6" style={{ color: 'rgba(255,255,255,0.2)', letterSpacing: '0.08em' }}>
            YOUR DATA IS ENCRYPTED AND NEVER SHARED
          </p>
        </div>
      </div>
    </div>
  )
}