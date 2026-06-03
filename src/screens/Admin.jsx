import { useState } from 'react'
import { PinPad, Icon, Modal } from '../components/ui.jsx'
import { checkIns, bookings, haircutHistory, freedomWallMessages, faceProfiles, customers, clearAll, reseed } from '../lib/storage.js'

const ADMIN_PIN = '1234' // demo only

const TABS = [
  { key: 'pulse', label: 'Community Pulse' },
  { key: 'checkins', label: 'Check-ins' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'history', label: 'Haircut History' },
  { key: 'wall', label: 'All Messages' },
  { key: 'faces', label: 'Face Enrollments' },
]

/* Topic colours for the Pulse dashboard */
const TOPIC_COLORS = {
  'Employment': '#4285f4', 'Cost of Living': '#ea4335', 'Family': '#34a853',
  'Community': '#fbbc04', 'Public Services': '#9334e6', 'Personal Growth': '#ff6d01',
  'Gratitude': '#46bdc6', 'Other': '#9aa0a6',
}

export default function Admin({ nav }) {
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState(false)
  const [tab, setTab] = useState('pulse')
  const [confirm, setConfirm] = useState(false)
  const [, force] = useState(0)
  const reload = () => force((n) => n + 1)

  if (!ok) {
    return (
      <main className="screen">
        <div className="card pad-lg" style={{ maxWidth: 380, margin: '6vh auto 0', textAlign: 'center' }}>
          <div className="ic" style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--surface-2)', color: 'var(--ink)', display: 'grid', placeItems: 'center', margin: '0 auto 10px' }}>{Icon.shield(30)}</div>
          <h2 style={{ fontFamily: 'var(--display)', margin: '0 0 4px' }}>Staff Access</h2>
          <p className="meta" style={{ marginBottom: 8 }}>Enter PIN · demo PIN is <b>1234</b></p>
          {err && <p style={{ color: 'var(--danger)', fontWeight: 700 }}>Wrong PIN — try again</p>}
          <PinPad onComplete={(p) => (p === ADMIN_PIN ? setOk(true) : setErr(true))} />
        </div>
      </main>
    )
  }

  return (
    <main className="screen">
      <div className="screen-head row between">
        <div><h1 style={{ margin: 0 }}>Admin · Magic Mirror</h1><p style={{ margin: '4px 0 0' }}>Demo data overview · localStorage only</p></div>
        <button className="btn danger" onClick={() => setConfirm(true)}>Clear demo data</button>
      </div>

      <div className="row" style={{ marginBottom: 18, gap: 8, flexWrap: 'wrap' }}>
        {TABS.map((t) => <button key={t.key} className={`chip ${tab === t.key ? 'on' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>

      {tab === 'pulse' && <PulseDashboard />}

      {tab !== 'pulse' && (
        <div className="card pad-lg">
          {tab === 'checkins' && <Table rows={checkIns.all()} cols={[['name', 'Name'], ['service', 'Service'], ['barber', 'Barber'], ['method', 'Via'], ['createdAt', 'Time', (v) => new Date(v).toLocaleTimeString()]]} empty="No check-ins today." />}
          {tab === 'bookings' && <Table rows={bookings.all()} cols={[['name', 'Name'], ['date', 'Date'], ['time', 'Time'], ['barber', 'Barber'], ['service', 'Service']]} empty="No bookings." />}
          {tab === 'history' && <Table rows={haircutHistory.all()} cols={[['date', 'Date'], ['style', 'Style'], ['service', 'Service'], ['barber', 'Barber']]} empty="No haircut records." />}
          {tab === 'wall' && <Table rows={freedomWallMessages.all()} cols={[['text', 'Message'], ['topic', 'Topic', (v) => v || '—'], ['author', 'By', (v, r) => (r.anonymous ? 'Anonymous' : v)], ['approved', 'OK', (v) => (v ? '✓' : '…')]]} empty="No messages." />}
          {tab === 'faces' && <Table rows={faceProfiles.all()} cols={[['customerId', 'Customer', (v) => customers.find(v)?.name || v], ['enrolledAt', 'Enrolled'], ['descriptor', 'Descriptor', (v) => String(v).slice(0, 22) + '…']]} empty="No face enrollments." />}
        </div>
      )}

      {confirm && (
        <Modal title="Clear all demo data?" onClose={() => setConfirm(false)}>
          <p className="meta">This wipes every collection from localStorage on this device. You can reseed the demo afterwards.</p>
          <div className="row" style={{ marginTop: 14 }}>
            <button className="btn danger block" onClick={() => { clearAll(); setConfirm(false); reload() }}>Clear everything</button>
            <button className="btn soft" onClick={() => { reseed(); setConfirm(false); reload() }}>Reseed demo</button>
            <button className="btn ghost" onClick={() => setConfirm(false)}>Cancel</button>
          </div>
        </Modal>
      )}
    </main>
  )
}

/* =====================================================
   Community Pulse Index — dashboard tab
   ===================================================== */
function PulseDashboard() {
  const msgs = freedomWallMessages.all().filter((m) => m.approved)
  const total = msgs.length
  if (total === 0) return <div className="card pad-lg"><div className="empty"><div className="big">No pulse data yet</div><div>Messages from the Community Pulse screen will appear here.</div></div></div>

  /* Topic distribution */
  const topicCounts = {}
  msgs.forEach((m) => { const t = m.topic || 'Other'; topicCounts[t] = (topicCounts[t] || 0) + 1 })
  const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1])
  const maxCount = sortedTopics[0]?.[1] || 1

  /* Simple sentiment: Gratitude / Personal Growth = positive, Cost of Living / Employment = concern */
  const positive = (topicCounts['Gratitude'] || 0) + (topicCounts['Personal Growth'] || 0) + (topicCounts['Community'] || 0)
  const concern = (topicCounts['Cost of Living'] || 0) + (topicCounts['Employment'] || 0) + (topicCounts['Public Services'] || 0)
  const neutral = total - positive - concern
  const pulseIndex = total > 0 ? Math.round(((positive * 2 + neutral) / (total * 2)) * 100) : 50

  const anonPct = total > 0 ? Math.round((msgs.filter((m) => m.anonymous).length / total) * 100) : 0

  return (
    <div className="grid cols-2">
      {/* Left: metrics + topic bars */}
      <div className="stack">
        <div className="card pad-lg" style={{ background: 'linear-gradient(150deg,#1d2024,#0f1113)', color: '#f3efe7', border: 'none' }}>
          <div className="row" style={{ color: 'var(--brass)' }}>{Icon.sparkle(20)}<span className="tag" style={{ color: 'var(--brass)' }}>Community Pulse Index</span></div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 10 }}>
            <span style={{ fontSize: 'clamp(3rem,6vw,4.5rem)', fontWeight: 800, lineHeight: 1 }}>{pulseIndex}</span>
            <span style={{ fontSize: '1rem', opacity: .7 }}>/ 100</span>
          </div>
          <p style={{ margin: '10px 0 0', fontSize: '.88rem', opacity: .8 }}>
            Higher = more hopeful. Based on {total} voice{total !== 1 ? 's' : ''} · {anonPct}% anonymous.
          </p>
          <div style={{ display: 'flex', gap: 14, marginTop: 16 }}>
            <Metric label="Hopeful" value={positive} color="#34a853" />
            <Metric label="Concerned" value={concern} color="#ea4335" />
            <Metric label="Neutral" value={neutral} color="#9aa0a6" />
          </div>
        </div>

        <div className="card pad-lg">
          <h3 className="card-title">Topics mentioned</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {sortedTopics.map(([topic, count]) => (
              <div key={topic}>
                <div className="row between" style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 700, fontSize: '.88rem' }}>{topic}</span>
                  <span className="meta">{count}</span>
                </div>
                <div style={{ height: 10, borderRadius: 5, background: 'var(--surface-2)', overflow: 'hidden' }}>
                  <div style={{ width: `${(count / maxCount) * 100}%`, height: '100%', borderRadius: 5, background: TOPIC_COLORS[topic] || '#9aa0a6', transition: 'width .4s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: recent anonymous voices */}
      <div className="stack">
        <div className="card" style={{ background: 'var(--surface-2)' }}>
          <span className="tag">Recent community voices (anonymized)</span>
        </div>
        {msgs.slice(0, 8).map((m) => (
          <div className="card" key={m.id}>
            {m.promptQuestion && <div className="meta" style={{ marginBottom: 4, fontStyle: 'italic' }}>"{m.promptQuestion}"</div>}
            <p style={{ margin: 0, lineHeight: 1.5, fontWeight: 500 }}>{m.text}</p>
            <div className="row between" style={{ marginTop: 8 }}>
              {m.topic && <span className="chip" style={{ fontSize: '.66rem', padding: '2px 7px' }}>{m.topic}</span>}
              <span className="meta">{new Date(m.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
        <div className="note">
          <b>Privacy note:</b> all responses are anonymized before aggregation. No personal identifiers are stored with pulse data. The Community Pulse Index is designed for understanding, not surveillance.
        </div>
      </div>
    </div>
  )
}

function Metric({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '1.5rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '.72rem', opacity: .7, letterSpacing: '1px', textTransform: 'uppercase' }}>{label}</div>
    </div>
  )
}

function Table({ rows, cols, empty }) {
  if (!rows.length) return <div className="empty"><div className="big">Nothing here</div><div>{empty}</div></div>
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{cols.map(([, label]) => <th key={label} style={{ textAlign: 'left', padding: '10px 12px', fontSize: '.74rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--line)' }}>{label}</th>)}</tr></thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>{cols.map(([key, label, fmt]) => <td key={label} style={{ padding: '12px', borderBottom: '1px solid var(--line)', fontWeight: 600 }}>{fmt ? fmt(r[key], r) : (r[key] ?? '—')}</td>)}</tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
