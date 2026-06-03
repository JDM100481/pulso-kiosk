import { Icon } from '../components/ui.jsx'
import Logo from '../components/Logo.jsx'
import { activeQueue, customers } from '../lib/storage.js'

const TILES = [
  { key: 'register', icon: Icon.sim, label: 'Register DigizenID', sub: 'Get your digital passport · dSIM', accent: true },
  { key: 'qr', icon: Icon.qr, label: 'DigizenID Check-In', sub: 'Scan your DigizenID QR code' },
  { key: 'manual', icon: Icon.user, label: 'Walk-In Check-In', sub: 'No DigizenID? Register here' },
  { key: 'face', icon: Icon.face, label: 'Face Check-In', sub: 'Magic Mirror recognition · demo' },
  { key: 'booking', icon: Icon.calendar, label: 'Book via myCHAT', sub: 'Reserve a chair, pick your barber' },
  { key: 'queue', icon: Icon.list, label: "Today's Queue", sub: 'See who\u2019s next' },
  { key: 'recommend', icon: Icon.sparkle, label: 'Style Assistant', sub: 'Magic Mirror recommendation' },
  { key: 'wall', icon: Icon.chat, label: 'Community Pulse', sub: "Share what's on your mind" },
  { key: 'barber', icon: Icon.scissors, label: 'Barber Assistant', sub: 'Run a Magic Mirror session', accent: true },
]

export default function Welcome({ nav }) {
  const waiting = activeQueue().length
  const registered = customers.all().length
  return (
    <main className="screen">
      <div className="screen-head" style={{ textAlign: 'center', marginTop: 'clamp(8px,2vh,28px)' }}>
        <Logo variant="stacked" />
        <p style={{ margin: '20px auto 0' }}>
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
        <span className="meta">Powered by the PULSO Magic Mirror System · {registered} DigizenIDs registered</span>
        <button className="btn ghost" onClick={() => nav.go('admin')}>{Icon.shield(20)} Admin</button>
      </div>
    </main>
  )
}
