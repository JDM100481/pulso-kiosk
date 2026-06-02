import { useState } from 'react'
import { PinPad, Icon, Modal } from '../components/ui.jsx'
import { checkIns, bookings, haircutHistory, freedomWallMessages, faceProfiles, customers, clearAll, reseed } from '../lib/storage.js'

const ADMIN_PIN = '1234' // demo only

const TABS = [
  { key: 'checkins', label: 'Check-ins' },
  { key: 'bookings', label: 'Bookings' },
  { key: 'history', label: 'Haircut History' },
  { key: 'wall', label: 'Freedom Wall' },
  { key: 'faces', label: 'Face Enrollments' },
]

export default function Admin({ nav }) {
  const [ok, setOk] = useState(false)
  const [err, setErr] = useState(false)
  const [tab, setTab] = useState('checkins')
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
        <div><h1 style={{ margin: 0 }}>Admin</h1><p style={{ margin: '4px 0 0' }}>Demo data overview · localStorage only</p></div>
        <button className="btn danger" onClick={() => setConfirm(true)}>Clear demo data</button>
      </div>

      <div className="row" style={{ marginBottom: 18, gap: 8 }}>
        {TABS.map((t) => <button key={t.key} className={`chip ${tab === t.key ? 'on' : ''}`} onClick={() => setTab(t.key)}>{t.label}</button>)}
      </div>

      <div className="card pad-lg">
        {tab === 'checkins' && <Table rows={checkIns.all()} cols={[['name', 'Name'], ['service', 'Service'], ['barber', 'Barber'], ['method', 'Via'], ['createdAt', 'Time', (v) => new Date(v).toLocaleTimeString()]]} empty="No check-ins today." />}
        {tab === 'bookings' && <Table rows={bookings.all()} cols={[['name', 'Name'], ['date', 'Date'], ['time', 'Time'], ['barber', 'Barber'], ['service', 'Service']]} empty="No bookings." />}
        {tab === 'history' && <Table rows={haircutHistory.all()} cols={[['date', 'Date'], ['style', 'Style'], ['service', 'Service'], ['barber', 'Barber']]} empty="No haircut records." />}
        {tab === 'wall' && <Table rows={freedomWallMessages.all()} cols={[['text', 'Message'], ['author', 'By', (v, r) => (r.anonymous ? 'Anonymous' : v)], ['approved', 'Approved', (v) => (v ? 'Yes' : 'Pending')]]} empty="No messages." />}
        {tab === 'faces' && <Table rows={faceProfiles.all()} cols={[['customerId', 'Customer', (v) => customers.find(v)?.name || v], ['enrolledAt', 'Enrolled'], ['descriptor', 'Descriptor', (v) => String(v).slice(0, 22) + '…']]} empty="No face enrollments." />}
      </div>

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
