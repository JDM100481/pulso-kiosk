import { useState } from 'react'
import { Icon, Empty, useToast, Modal } from '../components/ui.jsx'
import { customers, customerHistory, haircutHistory, queue, beginBarberSession } from '../lib/storage.js'
import { nextSession } from '../lib/recommend.js'

export default function HaircutHistory({ nav, params }) {
  const list = customers.all()
  const [customerId, setCustomerId] = useState(params.customerId || list[0]?.id || null)
  const [, force] = useState(0)
  const [noteFor, setNoteFor] = useState(null)
  const [toast, setToast] = useToast()
  const reload = () => force((n) => n + 1)

  const customer = customers.find(customerId)
  const history = customerId ? customerHistory(customerId) : []
  const next = customer ? nextSession(customer, history) : null

  function repeat(record) {
    // "Yung dati?" — queue the customer for the same style with their preferred barber.
    const q = queue.add({ customerId: customer.id, name: customer.name, service: record.service, barber: record.barber, status: 'In Chair', addedAt: new Date().toISOString() })
    nav.go('barber', { sessionId: beginBarberSession(q), repeatStyle: record.style })
  }

  return (
    <main className="screen">
      <div className="screen-head"><h1>Haircut History</h1><p>Past cuts, notes, and what to do next visit.</p></div>

      {list.length > 1 && (
        <div className="row" style={{ marginBottom: 18, gap: 10 }}>
          {list.map((c) => (
            <button key={c.id} className={`chip ${c.id === customerId ? 'on' : ''}`} onClick={() => { setCustomerId(c.id); reload() }}>{c.name}</button>
          ))}
        </div>
      )}

      {!customer ? (
        <Empty title="No customers yet" sub="Check someone in to start a history." />
      ) : (
        <div className="grid cols-2">
          <div className="stack">
            {history.length === 0 && <div className="card"><Empty title="No cuts on record" sub="First visit — capture a photo and notes today." /></div>}
            {history.map((h) => (
              <div className="card" key={h.id}>
                <div className="row between">
                  <div>
                    <div className="tag">{h.date}</div>
                    <h3 className="card-title" style={{ margin: '2px 0' }}>{h.style}</h3>
                    <span className="meta">{h.service} · {h.barber}</span>
                  </div>
                  <div className="photo-slot" style={{ width: 76, height: 76 }}>{h.photo ? <img src={h.photo} alt="cut" /> : Icon.camera(22)}</div>
                </div>
                {h.notes && <p style={{ margin: '12px 0 0', color: 'var(--ink-soft)' }}>{h.notes}</p>}
                <div className="row" style={{ marginTop: 14 }}>
                  <button className="btn brass" onClick={() => repeat(h)}>{Icon.repeat(20)} Yung dati?</button>
                  <button className="btn ghost" onClick={() => setNoteFor(h)}>Add note</button>
                </div>
              </div>
            ))}
          </div>

          <div className="stack">
            <div className="card pad-lg" style={{ background: 'linear-gradient(150deg,#1d2024,#0f1113)', color: '#f3efe7', border: 'none' }}>
              <div className="row" style={{ color: 'var(--brass)' }}>{Icon.sparkle(22)}<span className="tag" style={{ color: 'var(--brass)' }}>Next Session Recommendation</span></div>
              <p style={{ margin: '12px 0 0', fontWeight: 600 }}>{next.schedule}</p>
              <ul style={{ margin: '12px 0 0', paddingLeft: 18, lineHeight: 1.7, color: 'rgba(243,239,231,.85)' }}>
                {next.refinements.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
              {next.note && <div className="note" style={{ marginTop: 14, background: 'rgba(255,255,255,.06)', borderColor: 'rgba(255,255,255,.12)', color: '#f3efe7' }}>Barber’s saved note: {next.note}</div>}
            </div>
            <div className="card">
              <h3 className="card-title">Quick actions</h3>
              <div className="row" style={{ marginTop: 8 }}>
                <button className="btn primary" onClick={() => nav.go('recommend', { customerId })}>{Icon.sparkle(18)} Style Assistant</button>
                <button className="btn soft" onClick={() => nav.go('booking', { name: customer.name, mobile: customer.mobile })}>{Icon.calendar(18)} Re-book</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {noteFor && <NoteModal record={noteFor} onClose={() => setNoteFor(null)} onSave={(text) => { haircutHistory.update(noteFor.id, { notes: text }); setNoteFor(null); reload(); setToast('Note saved.') }} />}
      {toast}
    </main>
  )
}

function NoteModal({ record, onClose, onSave }) {
  const [text, setText] = useState(record.notes || '')
  return (
    <Modal title="Add / edit note" onClose={onClose}>
      <p className="meta" style={{ marginTop: -4 }}>{record.style} · {record.date}</p>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Guard lengths, product, preferences…" style={{ width: '100%', minHeight: 120, padding: 14, borderRadius: 12, border: '1px solid var(--line-2)', background: 'var(--surface-2)', fontFamily: 'inherit', fontSize: '1rem' }} />
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn brass block" onClick={() => onSave(text)}>Save note</button>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  )
}
