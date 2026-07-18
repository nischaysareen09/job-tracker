import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const SUGGESTED_PROMPTS = [
  "Which applications should I focus on today?",
  "Prepare me for my Google interview",
  "Which applications need a follow-up email?",
  "Analyze my job search pipeline",
  "What are my chances at the companies I applied to?",
]

const TOOL_LABELS = {
  analyze_applications: '📊 Analyzed your applications',
  get_application_details: '🔍 Looked up application details',
  generate_cover_letter_for_job: '✍️ Generated cover letter',
  score_resume_for_job: '⚡ Scored resume match',
  prepare_for_interview: '🎯 Generated interview questions',
  generate_followup_for_job: '📧 Generated follow-up email',
  prioritize_applications: '🏆 Prioritized your applications',
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0 font-bold ${isUser ? 'bg-indigo-500' : 'bg-gradient-to-br from-purple-500 to-indigo-600'}`}>
        {isUser ? 'U' : '🤖'}
      </div>

      <div className={`max-w-[75%] space-y-2 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        {/* Tools used */}
        {msg.tools_used?.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {msg.tools_used.map((tool, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                style={{ background: 'rgba(129,140,248,0.15)', color: '#818cf8', border: '1px solid rgba(129,140,248,0.2)' }}>
                {TOOL_LABELS[tool] || tool}
              </span>
            ))}
          </div>
        )}

        {/* Message bubble */}
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'rounded-tr-sm text-white'
            : 'rounded-tl-sm'
        }`}
          style={{
            background: isUser
              ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
              : 'rgba(255,255,255,0.06)',
            border: isUser ? 'none' : '1px solid rgba(255,255,255,0.08)',
            color: isUser ? 'white' : 'rgba(255,255,255,0.85)',
          }}>
          {msg.content}
        </div>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>🤖</div>
      <div className="rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1"
        style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
        {[0,1,2].map(i => (
          <div key={i} className="w-1.5 h-1.5 rounded-full animate-bounce"
            style={{ backgroundColor: '#818cf8', animationDelay: `${i * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

export default function Agent() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hi! I'm JobBot, your AI career assistant 👋\n\nI have full access to your job applications and can help you:\n\n• 📊 Analyze your pipeline and give strategic advice\n• 🎯 Prepare for upcoming interviews\n• 📧 Draft follow-up emails\n• ⚡ Score your resume against any role\n• 🏆 Prioritize which applications to focus on\n\nWhat would you like to work on?",
      tools_used: []
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  const send = async (text) => {
    const message = text || input.trim()
    if (!message || loading) return

    setInput('')
    const userMsg = { role: 'user', content: message }
    setMessages(prev => [...prev, userMsg])
    setLoading(true)

    try {
      const history = messages.map(m => ({
        role: m.role,
        content: m.content
      }))

      const { data } = await api.post('/ai/agent', {
        message,
        history
      })

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        tools_used: data.tools_used || []
      }])
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I ran into an error. Please try again.",
        tools_used: []
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0a0a0a' }}>
      {/* Navbar */}
      <nav className="px-6 py-4 flex items-center justify-between sticky top-0 z-20 flex-shrink-0"
        style={{ background: 'rgba(10,10,10,0.9)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>← Dashboard</button>
          <span style={{ color: 'rgba(255,255,255,0.12)' }}>|</span>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #6366f1)' }}>🤖</div>
            <div>
              <p className="font-bold text-white text-sm leading-tight">JobBot</p>
              <p className="text-[10px] leading-tight" style={{ color: '#34d399' }}>● Online</p>
            </div>
          </div>
        </div>
        <button onClick={() => setMessages([{
          role: 'assistant',
          content: "Hi! I'm JobBot, your AI career assistant 👋\n\nI have full access to your job applications and can help you:\n\n• 📊 Analyze your pipeline and give strategic advice\n• 🎯 Prepare for upcoming interviews\n• 📧 Draft follow-up emails\n• ⚡ Score your resume against any role\n• 🏆 Prioritize which applications to focus on\n\nWhat would you like to work on?",
          tools_used: []
        }])}
          className="text-xs px-3 py-1.5 rounded-lg font-medium"
          style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.4)', border: '1px solid rgba(255,255,255,0.08)' }}>
          Clear chat
        </button>
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-3xl mx-auto w-full">
        {messages.map((msg, i) => <Message key={i} msg={msg} />)}
        {loading && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested prompts */}
      {messages.length === 1 && (
        <div className="px-6 pb-3 max-w-3xl mx-auto w-full">
          <p className="text-[10px] uppercase tracking-widest font-semibold mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>Suggested</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button key={i} onClick={() => send(prompt)}
                className="text-xs px-3 py-1.5 rounded-lg font-medium transition-all hover:opacity-90"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-6 pb-6 pt-3 max-w-3xl mx-auto w-full flex-shrink-0">
        <div className="flex gap-3 items-end rounded-2xl p-2"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                send()
              }
            }}
            placeholder="Ask JobBot anything about your job search…"
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none px-2 py-1.5"
            style={{ color: 'white', minHeight: '36px', maxHeight: '120px' }}
          />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
        <p className="text-center text-[10px] mt-2" style={{ color: 'rgba(255,255,255,0.2)' }}>
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}