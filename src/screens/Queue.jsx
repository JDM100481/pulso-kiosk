import { useState } from 'react'
import { Icon, Empty } from '../components/ui.jsx'
import { queue, beginBarberSession } from '../lib/storage.js'

const STATUS = { Waiting: 'wait', 'In Chair': 'chair', Done: 'done' }

export default function Queue({ nav }) {
  const [, force] = useState(0)
  const reload = () => force((n) => n + 1)
  const list = queue.all().sort((a, b) => (a.addedAt < b.addedAt ? -1 : 1))

  function setStatus(q, status) { queue.update(q.id, { status }); reload() }

  return (
    <main className="screen">
      <div className="screen-head row between">
        <div><h1 style={{ margin: 0 }}>Today’s Queue</h1><p style={{ margin: '4px 0 0' }}>{list.filter((q) => q.status !== 'Done').length} active · {list.length} total</p></div>
        <button className="btn ghost" onClick={() => nav.go('manual')}>{Icon.user(18)} Add walk-in</button>
      </div>

      {list.length === 0 ? <div className="card"><Empty title="Queue is empty" sub="Check in a customer to get started." /></div> : (
        <div className="stack">
          {list.map((q) => (
            <div className="card" key={q.id}>
              <div className="row between">
                <div className="row">
                  <div className="ic" style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--brass-dk)' }}>{Icon.user(24)}</div>
                  <div><h3 className="card-title" style={{ margin: 0 }}>{q.name}</h3><span className="meta">{q.service} · {q.barber}</span></div>
                </div>
                <span className={`pill ${STATUS[q.status]}`}><span className="dot" />{q.status}</span>
              </div>
              <div className="row" style={{ marginTop: 14 }}>
                {q.status !== 'Done' && <button className="btn brass" onClick={() => nav.go('barber', { sessionId: beginBarberSession(q) })}>{Icon.scissors(18)} Barber Assistant</button>}
                {q.status === 'Waiting' && <button className="btn soft" onClick={() => setStatus(q, 'In Chair')}>Seat in chair</button>}
                {q.status === 'In Chair' && <button className="btn soft" onClick={() => setStatus(q, 'Done')}>Mark done</button>}
                {q.status === 'Done' && <span className="meta">Completed</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
