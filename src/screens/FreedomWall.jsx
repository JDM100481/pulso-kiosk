import { useState } from 'react'
import { Icon, useToast } from '../components/ui.jsx'
import { freedomWallMessages } from '../lib/storage.js'

export default function FreedomWall() {
  const [, force] = useState(0)
  const [text, setText] = useState('')
  const [anon, setAnon] = useState(false)
  const [name, setName] = useState('')
  const [toast, setToast] = useToast()
  const reload = () => force((n) => n + 1)

  const messages = freedomWallMessages.all().filter((m) => m.approved)

  function post() {
    if (!text.trim()) return
    // New posts are auto-approved in the demo; production keeps a moderation queue.
    freedomWallMessages.add({ text: text.trim(), author: anon ? null : (name.trim() || 'Guest'), anonymous: anon, approved: true })
    setText(''); setName(''); reload(); setToast('Posted to the Freedom Wall!')
  }

  return (
    <main className="screen">
      <div className="screen-head"><h1>Freedom Wall</h1><p>Leave a message for the PULSO barbers and the community.</p></div>

      <div className="grid cols-2">
        <div className="card pad-lg" style={{ alignSelf: 'start' }}>
          <h3 className="card-title">Write a message</h3>
          <div className="field">
            <label>Your message</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} maxLength={240} placeholder="Salamat sa solid na gupit…" />
          </div>
          <div className="row" style={{ marginBottom: 14 }}>
            <button className={`chip ${anon ? '' : 'on'}`} onClick={() => setAnon(false)}>With name</button>
            <button className={`chip ${anon ? 'on' : ''}`} onClick={() => setAnon(true)}>Anonymous</button>
          </div>
          {!anon && <div className="field"><label>Name</label><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" /></div>}
          <button className="btn primary block lg" disabled={!text.trim()} onClick={post}>{Icon.chat(20)} Post Message</button>
          <p className="note" style={{ marginTop: 14 }}><b>Future:</b> staff moderation queue before messages go public.</p>
        </div>

        <div className="stack">
          {messages.map((m) => (
            <div className="card" key={m.id}>
              <p style={{ margin: 0, fontSize: '1.08rem', lineHeight: 1.5 }}>{m.text}</p>
              <div className="row between" style={{ marginTop: 12 }}>
                <span className="tag">— {m.anonymous ? 'Anonymous' : m.author}</span>
                <span className="meta">{new Date(m.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      {toast}
    </main>
  )
}
