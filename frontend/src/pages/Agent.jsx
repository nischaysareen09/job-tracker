import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const SUGGESTED_PROMPTS = [
  { text: "Which applications should I focus on today?", icon: "🎯" },
  { text: "Prepare me for my Google interview", icon: "🧠" },
  { text: "Which applications need a follow-up email?", icon: "📧" },
  { text: "Analyze my entire job search pipeline", icon: "📊" },
  { text: "What are my biggest resume gaps?", icon: "⚡" },
]

const TOOL_LABELS = {
  analyze_applications: '📊 Pipeline analyzed',
  get_application_details: '🔍 Application found',
  generate_cover_letter_for_job: '✍️ Cover letter ready',
  score_resume_for_job: '⚡ Resume scored',
  prepare_for_interview: '🎯 Questions generated',
  generate_followup_for_job: '📧 Email drafted',
  prioritize_applications: '🏆 Priorities set',
}

// Flying bee animation when logo clicked
function FlyingBees({ count }) {
  const [bees, setBees] = useState([])
  useEffect(() => {
    if (!count) return
    const newBees = Array.from({ length: 3 }, (_, i) => ({
      id: Date.now() + i,
      x: 40 + Math.random() * 20,
      y: 3 + Math.random() * 4,
      delay: i * 0.15,
    }))
    setBees(prev => [...prev, ...newBees])
    setTimeout(() => setBees(prev => prev.filter(b => !newBees.find(n => n.id === b.id))), 3000)
  }, [count])

  return (
    <>
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 100 }}>
        {bees.map(bee => (
          <div key={bee.id} style={{
            position: 'absolute', left: `${bee.x}%`, top: `${bee.y}%`,
            fontSize: 20, animation: `beefly 3s ${bee.delay}s ease-in-out forwards`,
            filter: 'drop-shadow(0 0 8px rgba(255,184,0,0.9))',
          }}>🐝</div>
        ))}
      </div>
      <style>{`
        @keyframes beefly {
          0%   { transform: translate(0,0) scale(0) rotate(0deg); opacity:0; }
          10%  { transform: translate(-20px,-40px) scale(1.3) rotate(-20deg); opacity:1; }
          30%  { transform: translate(40px,-100px) scale(1) rotate(15deg); opacity:1; }
          50%  { transform: translate(-30px,-180px) scale(1.1) rotate(-10deg); opacity:1; }
          70%  { transform: translate(20px,-260px) scale(0.9) rotate(5deg); opacity:0.7; }
          100% { transform: translate(0,-340px) scale(0.3) rotate(0deg); opacity:0; }
        }
        @keyframes beewiggle {
          0%,100% { transform: rotate(-12deg) translateY(0); }
          50% { transform: rotate(12deg) translateY(-2px); }
        }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes typingPulse {
          0%,100% { transform: scaleY(1); opacity:0.6; }
          50% { transform: scaleY(1.4); opacity:1; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </>
  )
}

function GridBg() {
  return (
    <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: `linear-gradient(rgba(0,245,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(0,245,255,0.025) 1px, transparent 1px)`,
        backgroundSize: '44px 44px',
      }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 80% 20%, rgba(255,184,0,0.04) 0%, transparent 50%)' }} />
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 80%, rgba(0,245,255,0.03) 0%, transparent 50%)' }} />
    </div>
  )
}

function BeeAvatar({ onClick, animate }) {
  return (
    <div onClick={onClick} style={{
      width: 38, height: 38, borderRadius: 12, cursor: 'pointer',
      background: 'rgba(255,184,0,0.12)', border: '1px solid rgba(255,184,0,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 18, flexShrink: 0,
      animation: animate ? 'beewiggle 0.4s ease-in-out' : 'none',
      boxShadow: '0 0 16px rgba(255,184,0,0.2)',
      transition: 'all 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 28px rgba(255,184,0,0.4)'; e.currentTarget.style.transform = 'scale(1.1)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 16px rgba(255,184,0,0.2)'; e.currentTarget.style.transform = 'scale(1)' }}>
      🐝
    </div>
  )
}

function Message({ msg, onBeeClick, animKey }) {
  const isUser = msg.role === 'user'
  return (
    <div style={{
      display: 'flex', gap: 12, flexDirection: isUser ? 'row-reverse' : 'row',
      animation: 'fadeUp 0.3s ease-out',
    }}>
      {isUser ? (
        <div style={{
          width: 38, height: 38, borderRadius: 12, flexShrink: 0,
          background: 'linear-gradient(135deg, rgba(0,245,255,0.2), rgba(255,184,0,0.15))',
          border: '1px solid rgba(0,245,255,0.3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 900, color: '#00f5ff',
        }}>U</div>
      ) : (
        <BeeAvatar onClick={onBeeClick} animate={animKey} />
      )}

      <div style={{ maxWidth: '74%', display: 'flex', flexDirection: 'column', gap: 6, alignItems: isUser ? 'flex-end' : 'flex-start' }}>
        {/* Tool badges */}
        {msg.tools_used?.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {msg.tools_used.map((tool, i) => (
              <span key={i} style={{
                fontSize: 9, padding: '2px 8px', borderRadius: 20, fontFamily: 'monospace', fontWeight: 700,
                background: 'rgba(0,245,255,0.07)', color: '#00f5ff',
                border: '1px solid rgba(0,245,255,0.18)', letterSpacing: '0.06em',
              }}>{TOOL_LABELS[tool] || tool}</span>
            ))}
          </div>
        )}

        {/* Bubble */}
        <div style={{
          padding: '12px 16px', borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
          background: isUser
            ? 'linear-gradient(135deg, rgba(0,245,255,0.13), rgba(255,184,0,0.08))'
            : 'rgba(255,255,255,0.05)',
          border: isUser ? '1px solid rgba(0,245,255,0.22)' : '1px solid rgba(255,255,255,0.08)',
          color: isUser ? '#d0fffe' : 'rgba(255,255,255,0.82)',
          fontSize: 13, lineHeight: 1.65, whiteSpace: 'pre-wrap',
          boxShadow: isUser ? '0 4px 20px rgba(0,245,255,0.08)' : '0 4px 20px rgba(0,0,0,0.2)',
        }}>
          {msg.content}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', gap: 12, animation: 'fadeUp 0.3s ease-out' }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12, flexShrink: 0,
        background: 'rgba(255,184,0,0.12)', border: '1px solid rgba(255,184,0,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
        animation: 'beewiggle 0.5s infinite',
      }}>🐝</div>
      <div style={{
        padding: '14px 18px', borderRadius: '4px 18px 18px 18px',
        background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
        display: 'flex', alignItems: 'center', gap: 5,
      }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: 6, height: 6, borderRadius: '50%', background: '#ffb800',
            animation: `typingPulse 1.2s ${i * 0.2}s infinite`,
          }} />
        ))}
      </div>
    </div>
  )
}

export default function Agent() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi! I'm BunnyBee 🐝 — your AI career co-pilot.\n\nI have live access to ALL your job applications and I think strategically about your job search.\n\nUnlike regular chatbots, I actually USE tools — I can read your real data, generate cover letters, score resumes, prep you for interviews, and draft follow-up emails — all in one conversation.\n\n💡 Try asking me something specific like:\n"Prepare me for my Apple interview" or\n"Which of my applications are most urgent?"\n\nI'll ask follow-up questions to give you the best possible help. What's on your mind?`,
    tools_used: [],
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [beeCount, setBeeCount] = useState(0)
  const [beeAnim, setBeeAnim] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const triggerBee = () => {
    setBeeCount(c => c + 1)
    setBeeAnim(true)
    setTimeout(() => setBeeAnim(false), 500)
  }

  const send = async (text) => {
    const message = text || input.trim()
    if (!message || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: message }])
    setLoading(true)
    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const { data } = await api.post('/ai/agent', { message, history })
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        tools_used: data.tools_used || [],
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Buzz... something went wrong on my end 🐝 Please try again!",
        tools_used: [],
      }])
    } finally {
      setLoading(false)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#02020a', fontFamily: "'Inter', sans-serif" }}>
      <FlyingBees count={beeCount} />
      <GridBg />

      {/* Navbar */}
      <nav style={{
        padding: '12px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 20, flexShrink: 0,
        background: 'rgba(2,2,10,0.9)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,184,0,0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', fontSize: 12,
            cursor: 'pointer', fontFamily: 'monospace', letterSpacing: '0.08em', transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#00f5ff'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.3)'}>
            ← DASHBOARD
          </button>
          <span style={{ color: 'rgba(255,255,255,0.1)' }}>|</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <BeeAvatar onClick={triggerBee} animate={beeAnim} />
            <div>
              <p style={{ color: 'white', fontWeight: 900, fontSize: 14, margin: 0, letterSpacing: '0.05em' }}>BunnyBee</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#00f5ff', animation: 'pulse 2s infinite' }} />
                <span style={{ color: '#00f5ff', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.12em' }}>ONLINE · AI AGENT ACTIVE</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: 10, fontFamily: 'monospace' }}>
            (click 🐝 for surprise)
          </span>
          <button onClick={() => setMessages([{
            role: 'assistant',
            content: `Hi! I'm BunnyBee 🐝 — your AI career co-pilot.\n\nI have live access to ALL your job applications and I think strategically about your job search.\n\nWhat would you like to work on?`,
            tools_used: [],
          }])} style={{
            padding: '5px 12px', borderRadius: 8, fontSize: 10, cursor: 'pointer', fontFamily: 'monospace',
            background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)',
            border: '1px solid rgba(255,255,255,0.07)', letterSpacing: '0.08em', transition: 'all 0.15s',
          }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ff3d5a'; e.currentTarget.style.borderColor = 'rgba(255,61,90,0.3)' }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)' }}>
            CLEAR
          </button>
        </div>
      </nav>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px', maxWidth: 760, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {messages.map((msg, i) => <Message key={i} msg={msg} onBeeClick={triggerBee} animKey={beeAnim} />)}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggested prompts */}
      {messages.length === 1 && !loading && (
        <div style={{ padding: '0 24px 12px', maxWidth: 760, margin: '0 auto', width: '100%', position: 'relative', zIndex: 1 }}>
          <p style={{ color: 'rgba(255,255,255,0.2)', fontSize: 9, fontFamily: 'monospace', letterSpacing: '0.15em', marginBottom: 10 }}>SUGGESTED</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {SUGGESTED_PROMPTS.map(({ text, icon }, i) => (
              <button key={i} onClick={() => send(text)} style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 12, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
                background: 'rgba(0,245,255,0.05)', color: 'rgba(255,255,255,0.55)',
                border: '1px solid rgba(0,245,255,0.12)', transition: 'all 0.2s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.1)'; e.currentTarget.style.color = '#00f5ff'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.3)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,245,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(0,245,255,0.12)'; e.currentTarget.style.transform = 'none' }}>
                <span>{icon}</span> {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 24px 24px', maxWidth: 760, margin: '0 auto', width: '100%', flexShrink: 0, position: 'relative', zIndex: 1 }}>
        <div style={{
          display: 'flex', gap: 10, alignItems: 'flex-end', borderRadius: 18, padding: '10px 12px',
          background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.09)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
        }}
          onFocus={() => {}} // handled inline
        >
          <span style={{ fontSize: 18, flexShrink: 0, marginBottom: 6, filter: 'drop-shadow(0 0 4px rgba(255,184,0,0.5))' }}>🐝</span>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            onFocus={e => { e.currentTarget.parentElement.style.borderColor = 'rgba(255,184,0,0.35)'; e.currentTarget.parentElement.style.boxShadow = '0 0 0 3px rgba(255,184,0,0.06), 0 4px 24px rgba(0,0,0,0.3)' }}
            onBlur={e => { e.currentTarget.parentElement.style.borderColor = 'rgba(255,255,255,0.09)'; e.currentTarget.parentElement.style.boxShadow = '0 4px 24px rgba(0,0,0,0.3)' }}
            placeholder="Ask BunnyBee anything… she'll ask follow-up questions to help you better"
            rows={1}
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'white', fontSize: 13, resize: 'none', fontFamily: 'Inter, sans-serif',
              minHeight: 36, maxHeight: 120, padding: '6px 0', lineHeight: 1.5,
            }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()} style={{
            width: 36, height: 36, borderRadius: 10, border: 'none', cursor: loading || !input.trim() ? 'not-allowed' : 'pointer',
            background: loading || !input.trim() ? 'rgba(255,255,255,0.06)' : 'linear-gradient(135deg, #ffb800, #ff8c00)',
            opacity: loading || !input.trim() ? 0.4 : 1,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: !loading && input.trim() ? '0 0 16px rgba(255,184,0,0.3)' : 'none',
            transition: 'all 0.2s',
          }}>
            <svg width="16" height="16" fill="none" stroke={loading || !input.trim() ? '#666' : '#02020a'} strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.12)', fontSize: 9, fontFamily: 'monospace', marginTop: 8, letterSpacing: '0.1em' }}>
          ENTER TO SEND · SHIFT+ENTER FOR NEW LINE · CLICK 🐝 FOR A SURPRISE
        </p>
      </div>
      <style>{`@keyframes pulse { 0%,100%{opacity:1;} 50%{opacity:0.3;} }`}</style>
    </div>
  )
}