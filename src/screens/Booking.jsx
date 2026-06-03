import { useState } from 'react'
import { Field, Select, Choices, Icon } from '../components/ui.jsx'
import { BARBERS, SERVICES, bookings, today } from '../lib/storage.js'

const TIMES = ['10:00', '10:45', '11:30', '13:00', '13:45', '14:30', '15:30', '16:15', '17:00', '18:00']

export default function Booking({ nav, params }) {
  const [f, setF] = useState({ date: today(), time: TIMES[0], barber: BARBERS[0], service: SERVICES[0].name, name: params.name || '', mobile: params.mobile || '' })
  const [done, setDone] = useState(false)
  const set = (k) => (e) => setF((s) => ({ ...s, [k]: e?.target ? e.target.value : e }))

  function confirm() { bookings.add({ ...f }); setDone(true) }

  if (done) {
    return (
      <main className="screen">
        <div className="card pad-lg" style={{ maxWidth: 540, margin: '6vh auto 0', textAlign: 'center' }}>
          <div className="ic" style={{ width: 72, height: 72, borderRadius: 20, background: 'var(--brass-soft)', color: 'var(--brass-dk)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>{Icon.calendar(34)}</div>
          <h2 style={{ fontFamily: 'var(--display)', margin: '0 0 6px' }}>Booking confirmed</h2>
          <p className="meta">{f.name || 'Guest'} · {f.date} at {f.time}<br />{f.service} with {f.barber}</p>
          <div className="note" style={{ marginTop: 16, textAlign: 'left' }}>myCHAT will send an automatic booking reminder and confirmation.</div>
          <div className="row" style={{ justifyContent: 'center', marginTop: 20 }}>
            <button className="btn primary lg" onClick={nav.home}>Done</button>
            <button className="btn ghost lg" onClick={() => setDone(false)}>Book another</button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="screen">
      <div className="screen-head"><h1>Book Appointment</h1><p>Reserve a chair. We’ll hold the slot for the customer.</p></div>
      <div className="card pad-lg" style={{ maxWidth: 760, margin: '0 auto' }}>
        <div className="grid cols-2">
          <Field label="Date"><input type="date" value={f.date} onChange={set('date')} /></Field>
          <Field label="Barber"><Select options={BARBERS} value={f.barber} onChange={set('barber')} /></Field>
        </div>
        <Field label="Time"><Choices options={TIMES} value={f.time} onChange={set('time')} /></Field>
        <Field label="Service"><Choices options={SERVICES.map((s) => s.name)} value={f.service} onChange={set('service')} /></Field>
        <div className="grid cols-2">
          <Field label="Customer name"><input value={f.name} onChange={set('name')} placeholder="Full name" /></Field>
          <Field label="Mobile"><input value={f.mobile} onChange={set('mobile')} placeholder="09xx xxx xxxx" inputMode="tel" /></Field>
        </div>
        <button className="btn primary block lg" disabled={!f.name.trim()} onClick={confirm}>{Icon.calendar(22)} Confirm Booking</button>
      </div>
    </main>
  )
}
