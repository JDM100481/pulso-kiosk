import { useState } from 'react'
import { CameraView, Icon, useToast, Modal, Field, Select } from '../components/ui.jsx'
import { useCamera } from '../lib/camera.js'
import { customers, faceProfiles, checkInCustomer, beginBarberSession, uid, nowISO } from '../lib/storage.js'
import { ProfileCard } from './QRCheckIn.jsx'

export default function FaceCheckIn({ nav }) {
  const cam = useCamera({ facingMode: 'user' })
  const [result, setResult] = useState(null) // { match, confidence }
  const [enroll, setEnroll] = useState(null)  // captured dataURL pending enrollment
  const [toast, setToast] = useToast()

  // DEMO matching: capture a frame, then "match" against enrolled profiles.
  // Production: replace with face-api.js / a biometric SDK returning a real descriptor + distance.
  function scan() {
    const frame = cam.capture()
    const enrolled = faceProfiles.all()
    if (enrolled.length === 0) { setToast('No faces enrolled yet — enroll one below.'); return }
    const profile = enrolled[0]
    const cust = customers.find(profile.customerId)
    const confidence = 0.9 + Math.random() * 0.08 // placeholder score
    setResult({ match: cust, confidence, frame })
  }

  function startSession() {
    const c = result.match
    const q = checkInCustomer({ customerId: c.id, name: c.name, mobile: c.mobile, barber: c.preferredBarber, method: 'face' })
    nav.go('barber', { sessionId: beginBarberSession(q) })
  }

  function capForEnroll() {
    const frame = cam.capture()
    setEnroll(frame || 'demo')
  }

  return (
    <main className="screen">
      <div className="screen-head">
        <h1>Face Recognition Check-In</h1>
        <p>Look at the camera for instant check-in. <b className="tag">MVP / Demo</b> — uses local demo matching, not real biometrics.</p>
      </div>

      {!result ? (
        <div className="grid cols-2">
          <div className="card pad-lg">
            <CameraView cam={cam} mode="face" />
            <div className="row" style={{ marginTop: 16 }}>
              {!cam.active
                ? <button className="btn primary" onClick={cam.start}>{Icon.camera(20)} Start Camera</button>
                : <>
                    <button className="btn brass" onClick={scan}>{Icon.face(20)} Scan &amp; Match</button>
                    <button className="btn soft" onClick={capForEnroll}>Enroll New Face</button>
                    <button className="btn ghost" onClick={cam.stop}>Stop</button>
                  </>}
            </div>
            <p className="note" style={{ marginTop: 16 }}>
              <b>Production placeholder:</b> swap the demo match for face-api.js or a biometric SDK
              that returns a descriptor + distance. Face images stay in localStorage only in this build.
            </p>
          </div>

          <div className="card pad-lg">
            <h3 className="card-title">How the demo works</h3>
            <p className="card-sub">For MVP testing without real biometrics.</p>
            <ol style={{ lineHeight: 1.9, paddingLeft: 18, margin: 0 }}>
              <li>Start the camera and tap <b>Scan &amp; Match</b>.</li>
              <li>The app matches against enrolled demo profiles and shows a confidence score.</li>
              <li>On a match: view profile &amp; history, then start the barber session.</li>
              <li>Tap <b>Enroll New Face</b> to capture a face for a customer.</li>
            </ol>
            <div className="note" style={{ marginTop: 16 }}>Enrolled demo faces: <b>{faceProfiles.all().length}</b></div>
          </div>
        </div>
      ) : (
        <>
          <div className="card" style={{ maxWidth: 640, margin: '0 auto 16px', textAlign: 'center', background: 'var(--surface-2)' }}>
            <span className="pill done"><span className="dot" /> Match found · {Math.round(result.confidence * 100)}% confidence</span>
            <span className="tag" style={{ display: 'block', marginTop: 6 }}>Confidence is a demo placeholder</span>
          </div>
          <ProfileCard c={result.match} nav={nav} onStart={startSession} onReset={() => setResult(null)} />
        </>
      )}

      {enroll && <EnrollModal frame={enroll} onClose={() => setEnroll(null)} onDone={(name) => { setEnroll(null); setToast(`Enrolled ${name} for face check-in.`) }} />}
      {toast}
    </main>
  )
}

function EnrollModal({ frame, onClose, onDone }) {
  const list = customers.all()
  const [target, setTarget] = useState(list[0]?.id || '')
  function save() {
    const id = uid('face')
    faceProfiles.add({ id, customerId: target, image: typeof frame === 'string' && frame.startsWith('data:') ? frame : null, descriptor: 'demo-descriptor-' + id, enrolledAt: nowISO() })
    customers.update(target, { faceProfileId: id })
    onDone(list.find((c) => c.id === target)?.name || 'customer')
  }
  return (
    <Modal title="Enroll face (demo)" onClose={onClose}>
      <div className="photo-slot" style={{ maxWidth: 200, margin: '0 auto 16px' }}>
        {typeof frame === 'string' && frame.startsWith('data:') ? <img src={frame} alt="capture" /> : 'Demo capture'}
      </div>
      <Field label="Link to customer">
        <Select options={list.map((c) => c.name)} value={list.find((c) => c.id === target)?.name || ''} onChange={(e) => setTarget(list.find((c) => c.name === e.target.value)?.id)} />
      </Field>
      <div className="row" style={{ marginTop: 12 }}>
        <button className="btn brass block" onClick={save} disabled={!target}>Save enrollment</button>
        <button className="btn ghost" onClick={onClose}>Cancel</button>
      </div>
    </Modal>
  )
}
