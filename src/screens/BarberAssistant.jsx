import { useState } from 'react'
import { CameraView, Icon, useToast, Empty } from '../components/ui.jsx'
import { useCamera } from '../lib/camera.js'
import { barberSessions, customers, customerHistory, haircutHistory, queue, activeQueue, beginBarberSession, today } from '../lib/storage.js'
import { nextSession } from '../lib/recommend.js'

const STEPS = [
  ['confirm', 'Confirm style with customer'],
  ['before', 'Before photo'],
  ['cutting', 'Cut in progress'],
  ['after', 'After photo'],
  ['notes', 'Add notes'],
]

export default function BarberAssistant({ nav, params }) {
  const [sessionId, setSessionId] = useState(params.sessionId || null)
  const session = sessionId ? barberSessions.find(sessionId) : null

  if (!session) return <Picker nav={nav} onPick={setSessionId} />
  return <Session key={sessionId} nav={nav} session={session} repeatStyle={params.repeatStyle} />
}

function Picker({ nav, onPick }) {
  const waiting = activeQueue()
  return (
    <main className="screen">
      <div className="screen-head"><h1>Barber Assistant</h1><p>Magic Mirror session — pick a customer or pull the next from the queue.</p></div>
      {waiting.length === 0 ? <div className="card"><Empty title="No one in the queue" sub="Check a customer in to start a session." /></div> : (
        <div className="grid auto">
          {waiting.map((q) => (
            <button key={q.id} className="card" style={{ textAlign: 'left' }} onClick={() => onPick(beginBarberSession(q))}>
              <div className="row between">
                <h3 className="card-title">{q.name}</h3>
                <span className={`pill ${q.status === 'In Chair' ? 'chair' : 'wait'}`}><span className="dot" />{q.status}</span>
              </div>
              <span className="meta">{q.service} · {q.barber}</span>
              <div className="btn brass" style={{ marginTop: 14 }}>{Icon.scissors(18)} Open Session</div>
            </button>
          ))}
        </div>
      )}
    </main>
  )
}

function Session({ nav, session, repeatStyle }) {
  const cam = useCamera({ facingMode: 'environment' })
  const [s, setS] = useState(session)
  const [photoMode, setPhotoMode] = useState(null) // 'before' | 'after'
  const [notes, setNotes] = useState(session.notes || '')
  const [toast, setToast] = useToast()

  const customer = s.customerId ? customers.find(s.customerId) : null
  const history = s.customerId ? customerHistory(s.customerId) : []
  const next = customer ? nextSession(customer, history) : null

  function update(patch) { const u = barberSessions.update(s.id, patch); setS(u) }
  function toggle(step) { update({ checklist: { ...s.checklist, [step]: !s.checklist[step] } }) }

  function snap(which) {
    const img = cam.capture()
    if (!img) { setToast('Could not capture — camera not active.'); return }
    update({ [which === 'before' ? 'beforePhoto' : 'afterPhoto']: img, checklist: { ...s.checklist, [which]: true } })
    setPhotoMode(null); cam.stop()
    setToast(`${which === 'before' ? 'Before' : 'After'} photo saved.`)
  }

  function complete() {
    const style = s.recommendation || customer?.preferredStyle || repeatStyle || s.service
    barberSessions.update(s.id, { completedAt: new Date().toISOString(), notes })
    queue.update(s.queueId, { status: 'Done' })
    haircutHistory.add({
      customerId: s.customerId, date: today(), barber: s.barber, service: s.service,
      style, notes, photo: s.afterPhoto || s.beforePhoto || null,
      nextRecommendation: next ? next.refinements[0] : '',
    })
    if (s.customerId) customers.update(s.customerId, { lastVisit: today(), preferredStyle: style })
    setToast('Service complete — saved to history.')
    setTimeout(() => nav.go('queue'), 700)
  }

  const doneCount = STEPS.filter(([k]) => s.checklist[k]).length

  return (
    <main className="screen">
      <div className="screen-head row between">
        <div><h1 style={{ margin: 0 }}>{s.name}</h1><p style={{ margin: '4px 0 0' }}>{s.service} · {s.barber}</p></div>
        <span className="pill chair"><span className="dot" /> {doneCount}/{STEPS.length} steps</span>
      </div>

      {repeatStyle && <div className="note" style={{ marginBottom: 16 }}>↻ Repeat request — <b>{repeatStyle}</b> (from “Yung dati?”).</div>}

      <div className="grid cols-2">
        {/* Left: context */}
        <div className="stack">
          <div className="card">
            <span className="tag">Preferred</span>
            <h3 className="card-title" style={{ margin: '2px 0' }}>{customer?.preferredStyle || repeatStyle || '—'}</h3>
            <span className="meta">{customer ? `${customer.customerId} · last visit ${customer.lastVisit || '—'}` : 'Walk-in (no profile)'}</span>
          </div>

          {next && (
            <div className="card pad-lg" style={{ background: 'linear-gradient(150deg,#1d2024,#0f1113)', color: '#f3efe7', border: 'none' }}>
              <div className="row" style={{ color: 'var(--brass)' }}>{Icon.sparkle(20)}<span className="tag" style={{ color: 'var(--brass)' }}>Magic Mirror</span></div>
              <p style={{ margin: '10px 0 0', fontWeight: 600 }}>{next.schedule}</p>
              <ul style={{ margin: '10px 0 0', paddingLeft: 18, lineHeight: 1.7, color: 'rgba(243,239,231,.85)' }}>{next.refinements.slice(0, 2).map((r, i) => <li key={i}>{r}</li>)}</ul>
            </div>
          )}

          <div className="card">
            <div className="row between"><h3 className="card-title">Recent cuts</h3><button className="btn ghost" onClick={() => customer && nav.go('history', { customerId: customer.id })} disabled={!customer}>Full history</button></div>
            {history.length === 0 ? <span className="meta">No history yet.</span> : history.slice(0, 3).map((h) => (
              <div key={h.id} className="row between" style={{ padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                <div><b>{h.style}</b><div className="meta">{h.date} · {h.barber}</div></div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: checklist + photos */}
        <div className="stack">
          <div className="card pad-lg">
            <h3 className="card-title">Barber checklist</h3>
            {STEPS.map(([k, label]) => (
              <div key={k} className={`check-item ${s.checklist[k] ? 'on' : ''}`} onClick={() => (k === 'before' || k === 'after') ? (setPhotoMode(k), cam.start()) : toggle(k)}>
                <div className="box">{s.checklist[k] && Icon.check(18)}</div>
                <span className="lbl">{label}</span>
                {(k === 'before' || k === 'after') && (s[k === 'before' ? 'beforePhoto' : 'afterPhoto']) && <span className="meta" style={{ marginLeft: 'auto' }}>📷 saved</span>}
              </div>
            ))}
          </div>

          <div className="card">
            <h3 className="card-title">Session notes</h3>
            <textarea value={notes} onChange={(e) => setNotes(e.target.value)} onBlur={() => update({ notes })} placeholder="Guard lengths, product used, what to do next time…" style={{ width: '100%', minHeight: 100, padding: 14, borderRadius: 12, border: '1px solid var(--line-2)', background: 'var(--surface-2)', fontFamily: 'inherit', fontSize: '1rem' }} />
          </div>

          <button className="btn brass block lg" onClick={complete}>{Icon.check(22)} Mark Service Complete</button>
        </div>
      </div>

      {photoMode && (
        <div className="modal-back" onClick={() => { setPhotoMode(null); cam.stop() }}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <h2>{photoMode === 'before' ? 'Before' : 'After'} photo</h2>
            <CameraView cam={cam} mode="photo" />
            <div className="row" style={{ marginTop: 14 }}>
              <button className="btn brass block" onClick={() => snap(photoMode)}>{Icon.camera(20)} Capture</button>
              <button className="btn ghost" onClick={() => { setPhotoMode(null); cam.stop() }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {toast}
    </main>
  )
}
