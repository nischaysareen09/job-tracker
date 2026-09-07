import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

function ParticleField() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let W = canvas.width = window.innerWidth
    let H = canvas.height = window.innerHeight
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
    }))
    let mouse = { x: W / 2, y: H / 2 }
    const onMove = e => { mouse.x = e.clientX; mouse.y = e.clientY }
    window.addEventListener('mousemove', onMove)
    const onResize = () => { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight }
    window.addEventListener('resize', onResize)
    let frame
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      particles.forEach(p => {
        const dx = mouse.x - p.x, dy = mouse.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 120) { p.vx += dx / dist * 0.02; p.vy += dy / dist * 0.02 }
        p.vx *= 0.99; p.vy *= 0.99
        p.x += p.vx; p.y += p.vy
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(0,245,255,${p.opacity})`
        ctx.fill()
      })
      particles.forEach((a, i) => {
        particles.slice(i + 1).forEach(b => {
          const d = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
          if (d < 100) {
            ctx.beginPath()
            ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(0,245,255,${0.15 * (1 - d / 100)})`
            ctx.lineWidth = 0.5; ctx.stroke()
          }
        })
      })
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => { cancelAnimationFrame(frame); window.removeEventListener('mousemove', onMove); window.removeEventListener('resize', onResize) }
  }, [])
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}

function RadarPing() {
  const canvasRef = useRef(null)
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const S = 240
    canvas.width = S; canvas.height = S
    const cx = S / 2, cy = S / 2, R = S * 0.42
    let angle = 0
    const blips = Array.from({ length: 8 }, () => ({
      a: Math.random() * Math.PI * 2,
      d: (0.3 + Math.random() * 0.6) * R,
      op: 0, size: 2 + Math.random() * 2
    }))
    let frame
    const draw = () => {
      ctx.clearRect(0, 0, S, S)
      for (let i = 1; i <= 4; i++) {
        ctx.beginPath(); ctx.arc(cx, cy, R * i / 4, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(0,245,255,${0.08 + i * 0.03})`; ctx.lineWidth = 1; ctx.stroke()
      }
      ;[0, Math.PI / 2, Math.PI, Math.PI * 1.5].forEach(a => {
        ctx.beginPath(); ctx.moveTo(cx, cy)
        ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R)
        ctx.strokeStyle = 'rgba(0,245,255,0.08)'; ctx.lineWidth = 1; ctx.stroke()
      })
      for (let i = 0; i < 50; i++) {
        const a = angle - i * Math.PI / 80
        ctx.beginPath(); ctx.moveTo(cx, cy)
        ctx.arc(cx, cy, R, a, a + Math.PI / 80); ctx.closePath()
        ctx.fillStyle = `rgba(0,245,255,${(50 - i) / 50 * 0.3})`; ctx.fill()
      }
      ctx.beginPath(); ctx.moveTo(cx, cy)
      ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R)
      ctx.strokeStyle = 'rgba(0,245,255,0.9)'; ctx.lineWidth = 2; ctx.stroke()
      blips.forEach(b => {
        const diff = ((angle - b.a) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2)
        if (diff < 0.12) b.op = 1; else b.op = Math.max(0, b.op - 0.015)
        if (b.op > 0) {
          const x = cx + Math.cos(b.a) * b.d, y = cy + Math.sin(b.a) * b.d
          ctx.beginPath(); ctx.arc(x, y, b.size, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,184,0,${b.op})`; ctx.fill()
          ctx.beginPath(); ctx.arc(x, y, b.size * 4, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(255,184,0,${b.op * 0.12})`; ctx.fill()
        }
      })
      ctx.beginPath(); ctx.arc(cx, cy, 3, 0, Math.PI * 2)
      ctx.fillStyle = '#00f5ff'; ctx.fill()
      angle = (angle + 0.025) % (Math.PI * 2)
      frame = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(frame)
  }, [])
  return <canvas ref={canvasRef} style={{ width: 240, height: 240, filter: 'drop-shadow(0 0 24px rgba(0,245,255,0.4))' }} />
}

export default function Login() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState({ email: '', password: '', full_name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const t1 = setTimeout(() => setStep(1), 100)
    const t2 = setTimeout(() => setStep(2), 600)
    const t3 = setTimeout(() => setStep(3), 1000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [])

  const handle = e => setForm({ ...form, [e.target.name]: e.target.value })

  const submit = async () => {
    setError(''); setLoading(true)
    try {
      const { data } = await api.post(
        mode === 'login' ? '/auth/login' : '/auth/register',
        mode === 'login' ? { email: form.email, password: form.password } : form
      )
      localStorage.setItem('token', data.access_token)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Connection failed')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen flex overflow-hidden" style={{ background: '#02020a', fontFamily: "'Inter', sans-serif" }}>
      <ParticleField />

      {/* LEFT */}
      <div className="hidden lg:flex flex-col w-[55%] relative" style={{ zIndex: 1 }}>
        <div className="absolute inset-0" style={{
          background: 'linear-gradient(135deg, rgba(0,245,255,0.03) 0%, transparent 50%, rgba(255,184,0,0.02) 100%)',
          borderRight: '1px solid rgba(0,245,255,0.08)'
        }} />

        {/* Top bar */}
        <div className="relative px-10 pt-8 flex items-center justify-between"
          style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'none' : 'translateY(-10px)', transition: 'all 0.6s ease' }}>
          <div className="flex items-center gap-3">
            <span style={{ fontSize: '22px', filter: 'drop-shadow(0 0 8px rgba(255,184,0,0.8))' }}>🐝</span>
            <span className="font-black text-white text-base" style={{ letterSpacing: '0.2em', fontSize: '13px' }}>JOBTRACKER</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(0,245,255,0.06)', border: '1px solid rgba(0,245,255,0.15)' }}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#00f5ff' }} />
            <span style={{ color: '#00f5ff', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em' }}>SYSTEM ACTIVE</span>
          </div>
        </div>

        {/* Center content */}
        <div className="flex-1 flex flex-col items-center justify-center px-10 gap-8">
          <div style={{ opacity: step >= 1 ? 1 : 0, transform: step >= 1 ? 'scale(1)' : 'scale(0.8)', transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <RadarPing />
          </div>

          <div className="text-center" style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'none' : 'translateY(20px)', transition: 'all 0.7s ease' }}>
            <h1 className="font-black text-white mb-3" style={{ fontSize: '42px', letterSpacing: '-0.03em', lineHeight: 1.05 }}>
              Your career,<br />
              <span style={{
                background: 'linear-gradient(90deg, #00f5ff 0%, #ffb800 60%, #ff3d5a 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>mission-ready.</span>
            </h1>
            <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: '13px', fontFamily: 'monospace', letterSpacing: '0.04em' }}>
              BunnyBee AI · Agentic tool calling · Real-time tracking
            </p>
          </div>

          {/* Feature pills */}
          <div className="flex flex-col gap-2.5 w-full max-w-xs"
            style={{ opacity: step >= 3 ? 1 : 0, transform: step >= 3 ? 'none' : 'translateY(16px)', transition: 'all 0.7s ease 0.1s' }}>
            {[
              { icon: '🐝', label: 'BunnyBee Agent', desc: 'Tool calling · Asks questions back' },
              { icon: '⚡', label: 'Resume Scorer', desc: 'Match % · Gap analysis' },
              { icon: '🎯', label: 'Interview Prep', desc: 'Technical · Behavioral · Role-specific' },
              { icon: '📧', label: 'Follow-up Tracker', desc: 'Urgency flags · AI email drafts' },
            ].map(({ icon, label, desc }, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.15)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '16px' }}>{icon}</span>
                <div>
                  <p className="text-white font-semibold" style={{ fontSize: '12px' }}>{label}</p>
                  <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontFamily: 'monospace' }}>{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-10 pb-8" style={{ opacity: step >= 3 ? 1 : 0, transition: 'opacity 0.6s ease 0.4s' }}>
          <p style={{ color: 'rgba(255,255,255,0.15)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.1em' }}>
            REACT · FASTAPI · POSTGRESQL · GROQ LLAMA 3.3 70B
          </p>
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex-1 flex items-center justify-center p-8 relative" style={{ zIndex: 1 }}>
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 60% 40%, rgba(255,184,0,0.04) 0%, transparent 60%)' }} />

        <div className="w-full max-w-sm relative"
          style={{ opacity: step >= 2 ? 1 : 0, transform: step >= 2 ? 'none' : 'translateY(24px)', transition: 'all 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.2s' }}>

          {/* Card */}
          <div className="rounded-3xl p-8" style={{
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 40px 80px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)'
          }}>
            {/* Header */}
            <div className="mb-7">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, rgba(0,245,255,0.5), transparent)' }} />
                <span style={{ color: 'rgba(0,245,255,0.6)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.15em' }}>
                  {mode === 'login' ? 'RETURNING PILOT' : 'NEW RECRUIT'}
                </span>
                <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(0,245,255,0.5))' }} />
              </div>
              <h2 className="font-black text-white" style={{ fontSize: '28px', letterSpacing: '-0.02em' }}>
                {mode === 'login' ? 'Welcome back.' : 'Join the mission.'}
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px', marginTop: '4px' }}>
                {mode === 'login' ? 'Your dashboard is waiting.' : 'Start tracking smarter.'}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-6" style={{ background: 'rgba(255,255,255,0.04)' }}>
              {['login', 'register'].map(m => (
                <button key={m} onClick={() => { setMode(m); setError('') }}
                  className="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
                  style={{
                    background: mode === m ? 'linear-gradient(135deg, rgba(0,245,255,0.12), rgba(255,184,0,0.08))' : 'transparent',
                    color: mode === m ? '#00f5ff' : 'rgba(255,255,255,0.3)',
                    border: mode === m ? '1px solid rgba(0,245,255,0.2)' : '1px solid transparent',
                    letterSpacing: '0.1em'
                  }}>
                  {m === 'login' ? 'SIGN IN' : 'SIGN UP'}
                </button>
              ))}
            </div>

            {/* Fields */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {mode === 'register' && (
                <div>
                  <label style={{ display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: '6px' }}>FULL NAME</label>
                  <input name="full_name" placeholder="Your name" value={form.full_name} onChange={handle}
                    style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                    onFocus={e => { e.target.style.borderColor = 'rgba(0,245,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08)' }}
                    onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }} />
                </div>
              )}
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: '6px' }}>EMAIL</label>
                <input name="email" type="email" placeholder="you@email.com" value={form.email} onChange={handle}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(0,245,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: 'rgba(255,255,255,0.35)', fontSize: '10px', fontFamily: 'monospace', letterSpacing: '0.12em', marginBottom: '6px' }}>PASSWORD</label>
                <input name="password" type="password" placeholder="••••••••" value={form.password} onChange={handle}
                  style={{ width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '12px 16px', color: 'white', fontSize: '14px', outline: 'none', fontFamily: 'Inter, sans-serif', boxSizing: 'border-box' }}
                  onFocus={e => { e.target.style.borderColor = 'rgba(0,245,255,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(0,245,255,0.08)' }}
                  onBlur={e => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none' }}
                  onKeyDown={e => e.key === 'Enter' && submit()} />
              </div>

              {error && (
                <div style={{ background: 'rgba(255,61,90,0.08)', border: '1px solid rgba(255,61,90,0.25)', borderRadius: '10px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#ff3d5a', fontSize: '12px' }}>⚠ {error}</span>
                </div>
              )}

              <button onClick={submit} disabled={loading}
                style={{
                  width: '100%', padding: '14px', borderRadius: '14px', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #00f5ff 0%, #ffb800 100%)',
                  color: loading ? 'rgba(255,255,255,0.3)' : '#02020a',
                  fontWeight: 900, fontSize: '13px', letterSpacing: '0.12em',
                  boxShadow: loading ? 'none' : '0 0 40px rgba(0,245,255,0.2), 0 8px 24px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s', fontFamily: 'Inter, sans-serif',
                }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 60px rgba(0,245,255,0.35), 0 8px 32px rgba(0,0,0,0.4)' }}
                onMouseLeave={e => { if (!loading) e.currentTarget.style.boxShadow = '0 0 40px rgba(0,245,255,0.2), 0 8px 24px rgba(0,0,0,0.3)' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span style={{ width: '14px', height: '14px', border: '2px solid currentColor', borderTopColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.7s linear infinite' }} />
                    LAUNCHING...
                  </span>
                ) : mode === 'login' ? 'LAUNCH →' : 'BEGIN MISSION →'}
              </button>
            </div>
          </div>

          <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.15)', fontSize: '10px', fontFamily: 'monospace', marginTop: '16px', letterSpacing: '0.08em' }}>
            ENCRYPTED · PRIVATE · NEVER SHARED
          </p>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}