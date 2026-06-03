import { useState } from 'react'
import { Field, Icon, useToast } from '../components/ui.jsx'
import { LogoMark } from '../components/Logo.jsx'
import { customers, uid } from '../lib/storage.js'

/* Generate a deterministic grid pattern from a string — visual QR placeholder */
function MiniQR({ value, size = 96 }) {
  const cells = 9
  const px = size / cells
  const seed = [...(value || 'PULSO')].reduce((s, c) => s + c.charCodeAt(0), 0)
  const bits = []
  for (let i = 0; i < cells * cells; i++) {
    bits.push(((seed * (i + 7) * 31) % 97) > 38)
  }
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ borderRadius: 6 }}>
      <rect width={size} height={size} fill="#fff" />
      {bits.map((on, i) => on && (
        <rect key={i} x={(i % cells) * px} y={Math.floor(i / cells) * px} width={px} height={px} fill="var(--ink, #16181b)" rx={1} />
      ))}
      {/* corner finder patterns */}
      {[[0,0],[cells-3,0],[0,cells-3]].map(([cx,cy], i) => (
        <g key={i}>
          <rect x={cx*px} y={cy*px} width={px*3} height={px*3} fill="var(--ink)" rx={2}/>
          <rect x={(cx+.5)*px} y={(cy+.5)*px} width={px*2} height={px*2} fill="#fff" rx={1}/>
          <rect x={(cx+1)*px} y={(cy+1)*px} width={px} height={px} fill="var(--ink)" rx={1}/>
        </g>
      ))}
    </svg>
  )
}

/* Mask a mobile number for display: 0917 *** 0142 */
function mask(num) {
  const d = (num || '').replace(/\D/g, '')
  if (d.length < 7) return num
  return d.slice(0, 4) + ' *** ' + d.slice(-4)
}

/* Steps */
const STEP_INPUT = 0
const STEP_OTP   = 1
const STEP_DONE  = 2

export default function DigizenRegister({ nav }) {
  const [step, setStep] = useState(STEP_INPUT)
  const [name, setName] = useState('')
  const [mobile, setMobile] = useState('')
  const [otp, setOtp] = useState('')
  const [generated, setGenerated] = useState(null)
  const [toast, setToast] = useToast()

  const mobileClean = mobile.replace(/\D/g, '')
  const validMobile = mobileClean.length >= 10

  function sendOtp() {
    if (!name.trim() || !validMobile) return
    // Check if mobile already registered
    const existing = customers.all().find((c) => c.mobile && c.mobile.replace(/\D/g, '') === mobileClean)
    if (existing) {
      setToast(`This number is already registered as ${existing.customerId}. Proceeding to check-in.`)
      setTimeout(() => nav.go('qr'), 1200)
      return
    }
    setStep(STEP_OTP)
    setToast('Verification code sent to ' + mask(mobile) + ' (simulated)')
  }

  function verify() {
    // POC: accept any 4+ digit code
    if (otp.length < 4) { setToast('Enter the 4-digit code.'); return }
    // Generate DigizenID
    const seq = (customers.all().length + 1).toString().padStart(4, '0')
    const digizenId = 'PULSO-' + seq
    const cust = customers.add({
      name: name.trim(),
      mobile,
      customerId: digizenId,
      preferredBarber: '',
      preferredStyle: '',
      faceProfileId: null,
      lastVisit: null,
      dSimStatus: 'ready',         // telco hook
      dSimActivatedAt: null,
      registeredAt: new Date().toISOString(),
    })
    setGenerated(cust)
    setStep(STEP_DONE)
  }

  /* ============== Step 0: Input ============== */
  if (step === STEP_INPUT) {
    return (
      <main className="screen">
        <div className="screen-head">
          <h1>Register for DigizenID</h1>
          <p>Your mobile number becomes your digital passport across the PULSO ecosystem — Barbers Club, On The Go, and myCHAT.</p>
        </div>
        <div className="grid cols-2">
          <div className="card pad-lg">
            <Field label="Full name">
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Juan Dela Cruz" autoFocus />
            </Field>
            <Field label="Mobile number">
              <input value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="09xx xxx xxxx" inputMode="tel" style={{ fontSize: '1.2rem', letterSpacing: '1.5px' }} />
            </Field>
            <p className="meta" style={{ margin: '-4px 0 12px' }}>Philippine mobile number — this anchors your DigizenID.</p>
            <button className="btn brass block lg" disabled={!name.trim() || !validMobile} onClick={sendOtp}>
              {Icon.qr(22)} Send Verification Code
            </button>
          </div>

          <div className="card pad-lg" style={{ background: 'var(--surface-2)' }}>
            <h3 className="card-title">What is DigizenID?</h3>
            <p style={{ lineHeight: 1.7 }}>
              DigizenID is your single trusted identity across the entire PULSO ecosystem.
              No separate loyalty card. No separate membership. One ID — linked to your mobile number.
            </p>
            <div style={{ borderTop: '1px solid var(--line)', paddingTop: 14, marginTop: 14 }}>
              <h3 className="card-title">dSIM · Digital SIM</h3>
              <p style={{ lineHeight: 1.7 }}>
                Your DigizenID is designed for future activation as a dSIM (eSIM) — a digital SIM provisioned
                directly to your device. One tap to activate. No physical SIM swap needed.
              </p>
              <div className="note" style={{ marginTop: 12 }}>
                <b>Telco partner integration:</b> upon registration, the mobile number is verified and flagged
                as "dSIM Ready" — the eSIM provisioning API hooks in at this step.
              </div>
            </div>
          </div>
        </div>
        {toast}
      </main>
    )
  }

  /* ============== Step 1: OTP verification ============== */
  if (step === STEP_OTP) {
    return (
      <main className="screen">
        <div className="card pad-lg" style={{ maxWidth: 480, margin: '6vh auto 0', textAlign: 'center' }}>
          <div className="ic" style={{ width: 64, height: 64, borderRadius: 18, background: 'var(--brass-soft)', color: 'var(--brass-dk)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><circle cx="12" cy="18" r=".5" fill="currentColor"/></svg>
          </div>
          <h2 style={{ fontFamily: 'var(--display)', margin: '0 0 4px' }}>Verify your number</h2>
          <p className="meta">We sent a code to <b>{mask(mobile)}</b></p>
          <p className="meta" style={{ marginBottom: 14 }}>(POC demo — enter any 4 digits)</p>
          <Field label="Verification code">
            <input
              value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="• • • •" inputMode="numeric" maxLength={6}
              style={{ fontSize: '1.8rem', textAlign: 'center', letterSpacing: '12px', fontWeight: 800 }}
              autoFocus
            />
          </Field>
          <div className="row" style={{ justifyContent: 'center', marginTop: 12 }}>
            <button className="btn brass lg" style={{ flex: 1 }} disabled={otp.length < 4} onClick={verify}>{Icon.check(22)} Verify &amp; Register</button>
            <button className="btn ghost lg" onClick={() => setStep(STEP_INPUT)}>Back</button>
          </div>
          <button className="btn ghost" style={{ marginTop: 12, fontSize: '.82rem' }} onClick={() => setToast('New code sent (simulated)')}>Resend code</button>
        </div>
        {toast}
      </main>
    )
  }

  /* ============== Step 2: Registration complete — Digital ID Card ============== */
  return (
    <main className="screen">
      <div className="card pad-lg" style={{ maxWidth: 600, margin: '4vh auto 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div className="ic" style={{ width: 72, height: 72, borderRadius: 20, background: '#e3f4ec', color: 'var(--green)', display: 'grid', placeItems: 'center', margin: '0 auto 14px' }}>{Icon.check(36)}</div>
          <h2 style={{ fontFamily: 'var(--display)', margin: '0 0 4px' }}>DigizenID Registered!</h2>
          <p className="meta">Welcome to the PULSO ecosystem, {generated.name.split(' ')[0]}.</p>
        </div>

        {/* Digital ID card */}
        <div style={{
          background: 'linear-gradient(150deg, #1a1d21 0%, #0e1013 100%)',
          borderRadius: 20, padding: 'clamp(20px,4vw,32px)', color: '#f3efe7',
          boxShadow: '0 8px 32px rgba(0,0,0,.25), inset 0 1px 0 rgba(255,255,255,.06)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* subtle heartbeat watermark */}
          <div style={{ position: 'absolute', top: 12, right: 16, opacity: .08 }}>
            <LogoMark size={100} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative', zIndex: 1 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <LogoMark size={30} />
                <div>
                  <div style={{ fontWeight: 800, fontSize: '.9rem', letterSpacing: '3px' }}>PULSO</div>
                  <div style={{ fontSize: '.55rem', letterSpacing: '2px', opacity: .7 }}>DIGIZEN ID</div>
                </div>
              </div>
              <div style={{ fontSize: 'clamp(1.6rem,4vw,2.2rem)', fontWeight: 800, letterSpacing: '4px', fontFamily: 'var(--body)' }}>
                {generated.customerId}
              </div>
              <div style={{ marginTop: 16 }}>
                <div style={{ fontSize: '.65rem', letterSpacing: '2px', opacity: .5, textTransform: 'uppercase', marginBottom: 3 }}>Name</div>
                <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{generated.name}</div>
              </div>
              <div style={{ marginTop: 12 }}>
                <div style={{ fontSize: '.65rem', letterSpacing: '2px', opacity: .5, textTransform: 'uppercase', marginBottom: 3 }}>Mobile</div>
                <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '1px' }}>{mask(generated.mobile)}</div>
              </div>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ background: '#fff', padding: 6, borderRadius: 8, display: 'inline-block' }}>
                <MiniQR value={generated.customerId} size={80} />
              </div>
              <div style={{ fontSize: '.6rem', opacity: .5, marginTop: 6, letterSpacing: '1px' }}>SCAN TO VERIFY</div>
            </div>
          </div>

          {/* dSIM status */}
          <div style={{
            marginTop: 20, paddingTop: 16,
            borderTop: '1px solid rgba(255,255,255,.1)',
            display: 'flex', alignItems: 'center', gap: 10,
            position: 'relative', zIndex: 1,
          }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(52,168,83,.15)', color: '#5ff29c',
              padding: '6px 14px', borderRadius: 999, fontSize: '.78rem', fontWeight: 700,
              letterSpacing: '1px', textTransform: 'uppercase',
            }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5ff29c', boxShadow: '0 0 8px #5ff29c' }} />
              dSIM Ready
            </span>
            <span style={{ fontSize: '.75rem', opacity: .6 }}>eSIM provisioning available</span>
          </div>

          <div style={{ marginTop: 12, fontSize: '.7rem', opacity: .4 }}>
            Registered {new Date(generated.registeredAt).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Telco integration note */}
        <div className="note" style={{ marginTop: 20 }}>
          <b>Telco integration point:</b> this DigizenID is now anchored to mobile number <b>{mask(generated.mobile)}</b>.
          The dSIM Ready status indicates the number is verified and eligible for eSIM provisioning via the partner telco's API.
          Upon dSIM activation, the customer's DigizenID becomes their unified digital identity across all PULSO and DigiCom ecosystem services.
        </div>

        <div className="row" style={{ justifyContent: 'center', marginTop: 20 }}>
          <button className="btn brass lg" onClick={() => nav.go('qr')}>{Icon.qr(20)} Check In Now</button>
          <button className="btn primary lg" onClick={nav.home}>Done</button>
        </div>
      </div>
      {toast}
    </main>
  )
}
