import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { X, Send, Bot, Loader2, Volume2, VolumeX, Mic, Trash2, Sparkles } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { streamAIReply, AI_MODEL } from '../lib/aiTutorClient'

const SYSTEM_PROMPT = {
  role: 'system',
  content: `You are the official IH Academy Smart AI Concierge.

STRICT LANGUAGE & SCRIPT MATCHING RULES:
1. MATCH USER'S SCRIPT EXACTLY:
   - If the user types in ROMAN URDU (using English letters like 'heelo', 'bhai', 'recipe batao', 'courses dikhao'), YOU MUST RESPOND IN ROMAN URDU ONLY (e.g., 'Bhai main IH Academy Concierge hoon! Biryani ki recipe toh nahi, lekin humare courses yeh hain:').
   - NEVER switch to Urdu script (اردو) unless the user explicitly typed in Urdu script!
   - If the user types in English, respond in English.

2. CONCISE & CASUAL TONE:
   - Keep answers short, natural, friendly, and straight to the point. Avoid overly formal or robotic paragraphs.

3. DOMAIN GUARDRAILS:
   - If user asks off-topic queries (recipes, generic scripts), politely refuse in the SAME script (Roman Urdu) and offer relevant IH Academy links like [Courses](/courses) or [Internships](/careers).`,
}

const WELCOME = { role: 'assistant', content: 'Welcome! I\'m your IH Academy concierge. Ask me about courses, internships, certificates, or anything else — I\'ll point you to the right page.\n\n• **Internship Program:** [Apply for Internships →](/careers)\n• **Learning Dashboard:** [My Courses →](/learning)\n• **Certificates:** [View Certifications →](/certifications)' }

const SUGGESTIONS = ['Show me courses', 'How do I get a certificate?', 'Internship program details']

const STORAGE_KEY = 'ai_concierge_messages'

/**
 * Session-scoped chat history. Loads persisted messages on mount and falls
 * back to the welcome message when nothing (or invalid data) is stored.
 * sessionStorage is cleared automatically when the tab/browser closes.
 */
function loadStoredMessages() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return [WELCOME]
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return [WELCOME]
    const valid = parsed.filter(
      (m) =>
        m &&
        typeof m === 'object' &&
        (m.role === 'user' || m.role === 'assistant') &&
        typeof m.content === 'string'
    )
    while (valid.length > 1 && valid[valid.length - 1].content.trim() === '') {
      valid.pop()
    }
    return valid.length > 0 ? valid : [WELCOME]
  } catch {
    return [WELCOME]
  }
}

function MarkdownMessage({ content }) {
  const navigate = useNavigate()

  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        a: ({ href, children }) => {
          const isInternal = href?.startsWith('/')
          const cls = "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm my-1 mr-1 cursor-pointer transition-all bg-sky-500/15 text-sky-300 border border-sky-500/30 hover:bg-sky-500/25 hover:text-sky-200"
          if (isInternal) {
            return (
              <button onClick={() => { if (href) navigate(href) }} className={cls}>
                {children} →
              </button>
            )
          }
          return (
            <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>
              {children}
            </a>
          )
        },
        strong: ({ children }) => <strong className="font-bold text-slate-100">{children}</strong>,
        ul: ({ children }) => <ul className="space-y-1.5 pl-4">{children}</ul>,
        li: ({ children }) => <li className="list-disc text-slate-100">{children}</li>,
        p: ({ children }) => <p className="mb-2 last:mb-0 text-slate-100">{children}</p>,
        code: ({ children }) => <code className="inline-block bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono text-sky-300">{children}</code>,
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default function AIChatModal({ onClose }) {
  const [messages, setMessages] = useState(loadStoredMessages)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [speakingIndex, setSpeakingIndex] = useState(null)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const [isListening, setIsListening] = useState(false)
  const listRef = useRef(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages])

  // Persist chat history for the current session so page refreshes and route
  // changes keep context. Cleared automatically when the tab closes.
  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages))
    } catch {
      // storage unavailable (e.g. private mode) — chat just won't persist
    }
  }, [messages])

  const sendMessage = async (override) => {
    const text = (override ?? input).trim()
    if (!text || loading) return
    setInput('')
    const userMsg = { role: 'user', content: text }
    const updated = [...messages, userMsg]
    setMessages(updated)
    setLoading(true)

    const assistantMsg = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMsg])

    try {
      // Resilient queue: primary model first, then the unified fallback chain
      // with a 10s watchdog per attempt. Zero-downtime auto-switching happens
      // inside streamAIReply — only a total queue failure lands here.
      const res = await streamAIReply({
        messages: [SYSTEM_PROMPT, ...updated],
        onDelta: (delta) => {
          setMessages(prev => {
            const copy = [...prev]
            const last = { ...copy[copy.length - 1] }
            last.content += delta
            copy[copy.length - 1] = last
            return copy
          })
        },
      })

      if (!res.ok) {
        setMessages(prev => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: 'assistant', content: '❌ All AI models are busy right now. Please try again in a moment.' }
          return copy
        })
      }
    } catch {
      setMessages(prev => {
        const copy = [...prev]
        copy[copy.length - 1] = { role: 'assistant', content: `❌ Connection error. Please check your network and try again.` }
        return copy
      })
    }
    setLoading(false)
  }

  const clearChat = () => {
    window.speechSynthesis.cancel()
    setSpeakingIndex(null)
    setMessages([WELCOME])
    try {
      sessionStorage.removeItem(STORAGE_KEY)
    } catch {
      // storage unavailable — nothing to remove
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const stripMarkdown = useCallback((text) => {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/#/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/>/g, '')
      .replace(/[_~]/g, '')
      .trim()
  }, [])

  const toggleSpeech = useCallback((index, text) => {
    if (!voiceEnabled) return
    if (speakingIndex === index) {
      window.speechSynthesis.cancel()
      setSpeakingIndex(null)
      return
    }
    window.speechSynthesis.cancel()
    const clean = stripMarkdown(text)
    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.onend = () => setSpeakingIndex(null)
    utterance.onerror = () => setSpeakingIndex(null)
    window.speechSynthesis.speak(utterance)
    setSpeakingIndex(index)
  }, [speakingIndex, stripMarkdown, voiceEnabled])

  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel()
      recognitionRef.current?.stop()
    }
  }, [])

  const toggleListening = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) return
    const recognition = new SpeechRecognition()
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'ur-PK'

    recognition.onresult = (e) => {
      const transcript = Array.from(e.results).map(r => r[0].transcript).join('')
      setInput(transcript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognitionRef.current = recognition
    recognition.start()
    setIsListening(true)
  }, [isListening])

  const showSuggestions = messages.length === 1 && !loading

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-full w-full sm:w-[420px] bg-[#0F172A] border-l border-slate-800 shadow-2xl flex flex-col z-50 transition-all duration-300 animate-[slideIn_0.25s_ease-out]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#151D2A] border-b border-slate-800/80 px-4 py-3.5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-slate-100 font-bold text-sm flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  AI Concierge
                </h3>
                <span className="bg-emerald-500/15 text-emerald-400 text-[11px] px-2 py-0.5 rounded-full font-semibold border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5 truncate max-w-[180px]">{AI_MODEL}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVoiceEnabled(v => !v)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                voiceEnabled
                  ? 'text-sky-400 hover:text-white hover:bg-slate-800'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              title={voiceEnabled ? 'Voice on' : 'Voice off'}
            >
              {voiceEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0B0F17] custom-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="max-w-[82%] ml-auto bg-sky-600 text-white px-4 py-3 rounded-2xl rounded-tr-none text-xs md:text-sm leading-relaxed shadow-md shadow-sky-600/10">
                  <MarkdownMessage content={msg.content} />
                </div>
              ) : (
                <div className="max-w-[88%] mr-auto bg-[#1E293B] border border-slate-800 text-slate-100 px-4 py-3.5 rounded-2xl rounded-tl-none text-xs md:text-sm leading-relaxed shadow-sm relative">
                  {i === messages.length - 1 && loading && msg.content === '' ? (
                    <div className="flex items-center gap-2 py-1">
                      <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
                      <span className="text-xs text-slate-400">Thinking...</span>
                    </div>
                  ) : (
                    <MarkdownMessage content={msg.content} />
                  )}
                  {msg.content && !(i === messages.length - 1 && loading && msg.content === '') && (
                    <button
                      onClick={() => toggleSpeech(i, msg.content)}
                      className={`absolute top-2.5 right-2.5 p-1.5 rounded-lg transition-all cursor-pointer ${
                        speakingIndex === i
                          ? 'bg-sky-500/20 text-sky-400'
                          : 'text-slate-500 hover:text-sky-400 hover:bg-slate-800'
                      }`}
                      title={speakingIndex === i ? 'Stop' : 'Read aloud'}
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}

          {showSuggestions && (
            <div className="flex flex-wrap gap-2 mt-3 pl-1">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3.5 py-1.5 bg-slate-800/90 hover:bg-slate-700 text-sky-400 hover:text-sky-300 border border-slate-700/70 rounded-xl transition-all cursor-pointer font-medium shadow-sm active:scale-95"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Input Footer */}
        <div className="p-3.5 bg-[#151D2A] border-t border-slate-800/80 flex flex-col gap-2 shrink-0">
          <div className="relative flex items-center w-full">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask me anything..."
              className="w-full bg-[#0B0F17] border border-slate-700/80 focus:border-sky-500 text-slate-100 placeholder-slate-500 text-xs md:text-sm rounded-xl pl-4 pr-20 py-3 focus:outline-none transition-all shadow-inner"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <button
                onClick={toggleListening}
                className={`p-2 rounded-lg transition-all cursor-pointer ${
                  isListening
                    ? 'bg-red-500/20 text-red-400 animate-pulse'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                title={isListening ? 'Stop recording' : 'Voice input'}
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={() => sendMessage()}
                disabled={!input.trim() || loading}
                className="p-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg transition-all shadow-md shadow-sky-500/20 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                title="Send"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 text-center">
            Powered by OpenRouter · {AI_MODEL}
          </p>
        </div>
      </div>

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  )
}
