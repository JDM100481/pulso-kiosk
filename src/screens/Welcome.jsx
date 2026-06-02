import { Icon } from '../components/ui.jsx'
import { activeQueue } from '../lib/storage.js'

const TILES = [
  { key: 'qr', icon: Icon.qr, label: 'QR Check-In', sub: 'Scan Digizen / member ID' },
  { key: 'manual', icon: Icon.user, label: 'Manual Check-In', sub: 'Walk-in registration' },
  { key: 'face', icon: Icon.face, label: 'Face Check-In', sub: 'Recognition login · demo', accent: false },
  { key: 'booking', icon: Icon.calendar, label: 'Book Appointment', sub: 'Pick date, barber, service' },
  { key: 'queue', icon: Icon.list, label: "Today's Queue", sub: 'See who’s next' },
  { key: 'recommend', icon: Icon.sparkle, label: 'Style Assistant', sub: 'Hairstyle recommendation' },
  { key: 'wall', icon: Icon.chat, label: 'Freedom Wall', sub: 'Leave a message' },
  { key: 'barber', icon: Icon.scissors, label: 'Barber Assistant', sub: 'Run a live session', accent: true },
]

export default function Welcome({ nav }) {
  const waiting = activeQueue().length
  return (
    <main className="screen">
      <div className="screen-head" style={{ textAlign: 'center', marginTop: 'clamp(8px,2vh,28px)' }}>
        <h1 style={{ fontSize: 'clamp(2rem,5vw,3.4rem)' }}>Welcome to PULSO Barbers Club</h1>
        <p style={{ margin: '8px auto 0' }}>
          Tap to check in, book a chair, or let your barber pull up your style.
          {waiting > 0 && <> · <b style={{ color: 'var(--brass-dk)' }}>{waiting} in queue now</b></>}
        </p>
      </div>

      <div className="tiles">
        {TILES.map((t) => (
          <button key={t.key} className={`tile ${t.accent ? 'accent' : ''}`} onClick={() => nav.go(t.key)}>
            <div className="ic">{t.icon(28)}</div>
            <div className="tile-label"><b>{t.label}</b><small>{t.sub}</small></div>
          </button>
        ))}
      </div>

      <div className="row between" style={{ marginTop: 28 }}>
        <span className="meta">Premium reception &amp; barber assistant · MVP demo build</span>
        <button className="btn ghost" onClick={() => nav.go('admin')}>{Icon.shield(20)} Admin</button>
      </div>
    </main>
  )
}
