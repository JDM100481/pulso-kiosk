import { useState } from 'react'
import { CameraView, Icon, useToast } from '../components/ui.jsx'
import { useCamera } from '../lib/camera.js'
import { customers, checkInCustomer, beginBarberSession, customerHistory } from '../lib/storage.js'

export default function QRCheckIn({ nav }) {
  const cam = useCamera({ facingMode: 'environment' })
  const [code, setCode] = useState('')
  const [match, setMatch] = useState(null)
  const [toast, setToast] = useToast()

  function resolve(value) {
    const all = customers.all()
    // Try to match by customer ID; otherwise fall back to the first demo customer.
    const found = all.find((c) => (c.customerId || '').toLowerCase() === value.trim().toLowerCase()) || all[0]
    if (found) { setMatch(found); cam.stop() }
    else setToast('No matching member found.')
  }

  function startSession() {
    const q = checkInCustomer({ customerId: match.id, name: match.name, mobile: match.mobile, barber: match.preferredBarber, service: 'Classic Haircut', method: 'qr' })
    const sid = beginBarberSession(q)
    nav.go('barber', { sessionId: sid })
  }

  return (
    <main className="screen">
      <div className="screen-head">
        <h1>DigizenID QR Check-In</h1>
        <p>Point the member’s Digizen ID or PULSO QR at the camera. No camera? Enter the code manually.</p>
      </div>

      {!match ? (
        <div className="grid cols-2">
          <div className="card pad-lg">
            <CameraView cam={cam} mode="qr" />
            <div className="row" style={{ marginTop: 16 }}>
              {!cam.active
                ? <button className="btn primary" onClick={cam.start}>{Icon.camera(20)} Start Camera</button>
                : <button className="btn ghost" onClick={cam.stop}>Stop Camera</button>}
              <button className="btn brass" onClick={() => resolve('PULSO-0001')}>{Icon.qr(20)} Simulate Digizen Scan</button>
            </div>
            <p className="note" style={{ marginTop: 16 }}>
              <b>MVP note:</b> live QR decoding is stubbed. “Simulate Digizen Scan” loads a demo DigizenID profile.
              Add a decoder (e.g. <code>jsQR</code>) on the camera frame for production.
            </p>
          </div>

          <div className="card pad-lg">
            <h3 className="card-title">Manual code entry</h3>
            <p className="card-sub">Type a DigizenID code such as <b>PULSO-0001</b>.</p>
            <div className="field">
              <label>DigizenID / QR code</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="PULSO-0001" />
            </div>
            <button className="btn primary block lg" disabled={!code.trim()} onClick={() => resolve(code)}>Look up DigizenID</button>
          </div>
        </div>
      ) : (
        <ProfileCard c={match} nav={nav} onStart={startSession} onReset={() => setMatch(null)} />
      )}
      {toast}
    </main>
  )
}

export function ProfileCard({ c, nav, onStart, onReset }) {
  const last = customerHistory(c.id)[0]
  return (
    <div className="card pad-lg" style={{ maxWidth: 640, margin: '0 auto' }}>
      <div className="row between">
        <div className="row">
          <div className="ic" style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--surface-2)', border: '1px solid var(--line)', display: 'grid', placeItems: 'center', color: 'var(--brass-dk)' }}>{Icon.user(30)}</div>
          <div>
            <h2 style={{ fontFamily: 'var(--display)', margin: 0, fontSize: '1.6rem' }}>{c.name}</h2>
            <span className="tag">{c.customerId}</span>
          </div>
        </div>
        <span className="pill done"><span className="dot" /> Verified</span>
      </div>
      <hr className="divider" />
      <dl className="kv">
        <dt>Mobile</dt><dd>{c.mobile || '—'}</dd>
        <dt>Last visit</dt><dd>{c.lastVisit || 'First time'}</dd>
        <dt>Preferred barber</dt><dd>{c.preferredBarber || '—'}</dd>
        <dt>Preferred style</dt><dd>{c.preferredStyle || '—'}</dd>
        {last && (<><dt>Most recent</dt><dd>{last.style} · {last.date}</dd></>)}
      </dl>
      <div className="row" style={{ marginTop: 22 }}>
        <button className="btn brass lg" style={{ flex: 1 }} onClick={onStart}>{Icon.scissors(22)} Start Barber Session</button>
        <button className="btn soft lg" onClick={() => nav.go('history', { customerId: c.id })}>{Icon.history(20)} History</button>
        {onReset && <button className="btn ghost lg" onClick={onReset}>Cancel</button>}
      </div>
    </div>
  )
}
