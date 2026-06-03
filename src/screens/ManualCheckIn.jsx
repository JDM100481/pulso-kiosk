import { useState } from 'react'
import { Field, Select, Icon } from '../components/ui.jsx'
import { BARBERS, SERVICES, checkInCustomer, customers, uid } from '../lib/storage.js'

export default function ManualCheckIn({ nav }) {
  const [f, setF] = useState({ name: '', mobile: '', code: '', barber: BARBERS[0], service: SERVICES[0].name })
  const [done, setDone] = useState(null)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e.target.value }))

  function submit() {
    // Link to an existing customer by mobile if we have one; otherwise create a light record.
    let cust = customers.all().find((c) => c.mobile && c.mobile.replace(/\D/g, '') === f.mobile.replace(/\D/g, ''))
    if (!cust && f.name.trim()) {
      cust = customers.add({ name: f.name.trim(), mobile: f.mobile, customerId: 'PULSO-' + uid('').slice(-4).toUpperCase(), preferredBarber: f.barber, preferredStyle: '' })
    }
    const q = checkInCustomer({ customerId: cust?.id || null, name: f.name.trim(), mobile: f.mobile, barber: f.barber, service: f.service, method: 'manual' })
    setDone({ q, cust })
  }

  if (done) {
    return (
      <main className="screen">
        <div className="card pad-lg" style={{ maxWidth: 560, margin: '6vh auto 0', textAlign: 'center' }}>
          <div className="ic" style={{ width: 72, height: 72, borderRadius: 20, background: '#e3f4ec', color: 'var(--green)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>{Icon.check(36)}</div>
          <h2 style={{ fontFamily: 'var(--display)', margin: '0 0 6px' }}>You’re checked in, {done.q.name.split(' ')[0]}!</h2>
          <p className="meta">Added to today’s queue · {done.q.service} · {done.q.barber}</p>
          <div className="row" style={{ justifyContent: 'center', marginTop: 22 }}>
            <button className="btn primary lg" onClick={() => nav.go('queue')}>View Queue</button>
            <button className="btn ghost lg" onClick={nav.home}>Done</button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="screen">
      <div className="screen-head"><h1>Manual Check-In</h1><p>For walk-ins or customers without a DigizenID. We’ll add them to today’s queue.</p></div>
      <div className="card pad-lg" style={{ maxWidth: 720, margin: '0 auto' }}>
        <div className="grid cols-2">
          <Field label="Customer name"><input value={f.name} onChange={set('name')} placeholder="Full name" /></Field>
          <Field label="Mobile number"><input value={f.mobile} onChange={set('mobile')} placeholder="09xx xxx xxxx" inputMode="tel" /></Field>
          <Field label="Appointment code (optional)"><input value={f.code} onChange={set('code')} placeholder="e.g. BK-2208" /></Field>
          <Field label="Preferred barber"><Select options={BARBERS} value={f.barber} onChange={set('barber')} /></Field>
          <Field label="Service type"><Select options={SERVICES.map((s) => s.name)} value={f.service} onChange={set('service')} /></Field>
        </div>
        <button className="btn primary block lg" style={{ marginTop: 8 }} disabled={!f.name.trim()} onClick={submit}>{Icon.check(22)} Check In &amp; Join Queue</button>
      </div>
    </main>
  )
}
