import { useState } from 'react'
import { Icon, Choices, useToast } from '../components/ui.jsx'
import { freedomWallMessages } from '../lib/storage.js'

/* Prompted questions from the PULSO ecosystem vision — captures community pulse */
const PROMPTS = [
  'What concerns you most today?',
  'What gives you hope?',
  'How is your community doing?',
  'What is one lesson worth sharing?',
  'What would you change in your barangay?',
]

/* Topic categories — aligned with what barbers naturally hear about */
const TOPICS = [
  'Employment', 'Cost of Living', 'Family', 'Community',
  'Public Services', 'Personal Growth', 'Gratitude', 'Other',
]

export default function FreedomWall() {
  const [, force] = useState(0)
  const [text, setText] = useState('')
  const [anon, setAnon] = useState(true)
  const [name, setName] = useState('')
  const [topic, setTopic] = useState('')
  const [prompt, setPrompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
  const [toast, setToast] = useToast()
  const reload = () => force((n) => n + 1)

  const messages = freedomWallMessages.all().filter((m) => m.approved)

  function post() {
    if (!text.trim()) return
    freedomWallMessages.add({
      text: text.trim(),
      author: anon ? null : (name.trim() || 'Guest'),
      anonymous: anon,
      approved: true,
      topic: topic || 'Other',
      promptQuestion: prompt,
    })
    setText(''); setName(''); setTopic('')
    setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])
    reload(); setToast('Salamat! Your voice has been added to the Community Pulse.')
  }

  return (
    <main className="screen">
      <div className="screen-head">
        <h1>Community Pulse</h1>
        <p>The People's Pulse — share what's on your mind. Responses are anonymized and help us understand the community.</p>
      </div>

      <div className="grid cols-2">
        <div className="card pad-lg" style={{ alignSelf: 'start' }}>
          {/* Rotating prompt question */}
          <div className="note" style={{ marginBottom: 18, background: 'var(--brass-soft)', borderColor: 'var(--brass)', borderStyle: 'solid' }}>
            <b style={{ color: 'var(--brass-dk)', display: 'block', marginBottom: 4 }}>Today's question</b>
            <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>{prompt}</span>
          </div>
          <button className="btn ghost" style={{ marginBottom: 14, fontSize: '.82rem' }} onClick={() => setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)])}>↻ Different question</button>

          <div className="field">
            <label>Your response</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={300} placeholder="Sabihin mo lang…" style={{ minHeight: 100 }} />
          </div>

          <div className="field">
            <label>Topic (optional)</label>
            <Choices options={TOPICS} value={topic} onChange={setTopic} />
          </div>

          <div className="row" style={{ marginBottom: 14 }}>
            <button className={`chip ${anon ? 'on' : ''}`} onClick={() => setAnon(true)}>Anonymous</button>
            <button className={`chip ${anon ? '' : 'on'}`} onClick={() => setAnon(false)}>With name</button>
          </div>
          {!anon && <div className="field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div>}

          <button className="btn primary block lg" disabled={!text.trim()} onClick={post}>{Icon.chat(20)} Share to Community Pulse</button>
        </div>

        <div className="stack">
          <div className="card" style={{ background: 'var(--surface-2)' }}>
            <span className="tag">Recent voices · {messages.length} total</span>
          </div>
          {messages.slice(0, 12).map((m) => (
            <div className="card" key={m.id}>
              {m.promptQuestion && <div className="meta" style={{ marginBottom: 6, fontStyle: 'italic' }}>"{m.promptQuestion}"</div>}
              <p style={{ margin: 0, fontSize: '1.08rem', lineHeight: 1.5 }}>{m.text}</p>
              <div className="row between" style={{ marginTop: 12 }}>
                <span className="tag">— {m.anonymous ? 'Anonymous' : m.author}</span>
                <div className="row" style={{ gap: 8 }}>
                  {m.topic && <span className="chip" style={{ fontSize: '.68rem', padding: '3px 8px' }}>{m.topic}</span>}
                  <span className="meta">{new Date(m.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      {toast}
    </main>
  )
}
