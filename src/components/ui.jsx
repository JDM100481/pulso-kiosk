import { useEffect, useState } from 'react'

/* ---------- Inline SVG icons (no icon dependency, offline-safe) ---------- */
const P = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }
export const Icon = {
  qr: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3M21 14v.01M14 21h.01M17 21h.01M21 17v4"/></svg>),
  user: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><circle cx="12" cy="8" r="4"/><path d="M5 21c0-3.9 3.1-7 7-7s7 3.1 7 7"/></svg>),
  face: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M5 8V6a2 2 0 0 1 2-2h2M19 8V6a2 2 0 0 0-2-2h-2M5 16v2a2 2 0 0 0 2 2h2M19 16v2a2 2 0 0 1-2 2h-2"/><circle cx="9.5" cy="11" r=".6" fill="currentColor"/><circle cx="14.5" cy="11" r=".6" fill="currentColor"/><path d="M9.5 15c1.5 1.2 3.5 1.2 5 0"/></svg>),
  calendar: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>),
  chat: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M21 12a8 8 0 0 1-8 8H4l2-3a8 8 0 1 1 15-5z"/></svg>),
  scissors: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M8.1 8.1 20 18M8.1 15.9 20 6"/></svg>),
  list: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>),
  shield: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z"/></svg>),
  history: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 4v4h4M12 8v4l3 2"/></svg>),
  camera: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L19 6h0a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><circle cx="12" cy="12.5" r="3.5"/></svg>),
  check: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M20 6 9 17l-5-5"/></svg>),
  back: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M15 18l-6-6 6-6"/></svg>),
  repeat: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M17 2l4 4-4 4M3 11V9a4 4 0 0 1 4-4h14M7 22l-4-4 4-4M21 13v2a4 4 0 0 1-4 4H3"/></svg>),
  sparkle: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M12 3l1.8 4.7L18.5 9l-4.7 1.8L12 15l-1.8-4.7L5.5 9l4.7-1.3z"/><path d="M19 14l.7 1.8L21.5 16l-1.8.7L19 18l-.7-1.8L16.5 16l1.8-.5z"/></svg>),
  sim: (s = 24) => (<svg width={s} height={s} viewBox="0 0 24 24" {...P}><path d="M5 4a2 2 0 0 1 2-2h6l6 6v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2z"/><path d="M9 13h6v6H9z"/><path d="M12 13v6M9 16h6"/></svg>),
}

/* ---------- Field ---------- */
export function Field({ label, children }) {
  return (<div className="field"><label>{label}</label>{children}</div>)
}
export function Input(props) { return <input {...props} /> }
export function Select({ options, ...props }) {
  return (<select {...props}>{options.map((o) => <option key={o} value={o}>{o}</option>)}</select>)
}

/* ---------- Choice chips ---------- */
export function Choices({ options, value, onChange }) {
  return (
    <div className="choice-row">
      {options.map((o) => (
        <button key={o} type="button" className={`chip ${value === o ? 'on' : ''}`} onClick={() => onChange(o)}>{o}</button>
      ))}
    </div>
  )
}

/* ---------- Toast ---------- */
export function useToast() {
  const [msg, setMsg] = useState(null)
  useEffect(() => { if (!msg) return; const t = setTimeout(() => setMsg(null), 2400); return () => clearTimeout(t) }, [msg])
  const node = msg ? <div className="toast">{msg}</div> : null
  return [node, setMsg]
}

/* ---------- Modal ---------- */
export function Modal({ title, children, onClose }) {
  return (
    <div className="modal-back" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {title && <h2>{title}</h2>}
        {children}
      </div>
    </div>
  )
}

/* ---------- CameraView: live preview + capture, with manual fallback slot ---------- */
export function CameraView({ cam, mode = 'photo', fallback = null }) {
  return (
    <div className="camera-frame">
      <video ref={cam.videoRef} playsInline muted style={{ display: cam.active ? 'block' : 'none' }} />
      {cam.active && mode === 'qr' && (<><div className="reticle" /><div className="scan-line" /></>)}
      {cam.active && mode === 'face' && <div className="reticle" />}
      {!cam.active && (
        <div className="placeholder">
          {Icon.camera(40)}
          <div style={{ marginTop: 10 }}>{cam.error || 'Camera preview'}</div>
          {fallback}
        </div>
      )}
    </div>
  )
}

/* ---------- PinPad ---------- */
export function PinPad({ length = 4, onComplete }) {
  const [pin, setPin] = useState('')
  function push(d) {
    const next = (pin + d).slice(0, length)
    setPin(next)
    if (next.length === length) { onComplete(next); setTimeout(() => setPin(''), 150) }
  }
  return (
    <>
      <div className="pin-dots">{Array.from({ length }).map((_, i) => <i key={i} className={i < pin.length ? 'on' : ''} />)}</div>
      <div className="pinpad">
        {['1','2','3','4','5','6','7','8','9'].map((d) => <button key={d} onClick={() => push(d)}>{d}</button>)}
        <button onClick={() => setPin('')}>C</button>
        <button onClick={() => push('0')}>0</button>
        <button onClick={() => setPin((p) => p.slice(0, -1))}>⌫</button>
      </div>
    </>
  )
}

/* ---------- Empty state ---------- */
export function Empty({ title, sub }) {
  return (<div className="empty"><div className="big">{title}</div><div>{sub}</div></div>)
}
