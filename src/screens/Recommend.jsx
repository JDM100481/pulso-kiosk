import { useState } from 'react'
import { Field, Select, Choices, CameraView, Icon, useToast } from '../components/ui.jsx'
import { useCamera } from '../lib/camera.js'
import { recommendStyle, FACE_SHAPES, HAIR_LENGTHS, HAIR_TYPES, LIFESTYLES, FORMALITY } from '../lib/recommend.js'

export default function Recommend({ nav }) {
  const cam = useCamera({ facingMode: 'user' })
  const [f, setF] = useState({ faceShape: FACE_SHAPES[0], hairLength: HAIR_LENGTHS[0], hairType: HAIR_TYPES[0], lifestyle: LIFESTYLES[0], formality: FORMALITY[1] })
  const [result, setResult] = useState(null)
  const [toast, setToast] = useToast()
  const set = (k) => (v) => setF((s) => ({ ...s, [k]: v }))

  // Camera "face analysis" placeholder — pretends to detect a face shape.
  function analyze() {
    cam.capture()
    const guess = FACE_SHAPES[Math.floor(Math.random() * FACE_SHAPES.length)]
    setF((s) => ({ ...s, faceShape: guess }))
    setToast(`Face analysis (demo): looks ${guess}. Adjust if needed.`)
  }

  return (
    <main className="screen">
      <div className="screen-head">
        <h1>Magic Mirror · Style Assistant</h1>
        <p>The Magic Mirror analyzes your profile for a personalized recommendation. <b className="tag">MVP / Demo</b> — rule-based, not real AI yet.</p>
      </div>

      <div className="grid cols-2">
        <div className="card pad-lg">
          <Field label="Face shape"><Select options={FACE_SHAPES} value={f.faceShape} onChange={(e) => set('faceShape')(e.target.value)} /></Field>
          <Field label="Hair length"><Choices options={HAIR_LENGTHS} value={f.hairLength} onChange={set('hairLength')} /></Field>
          <Field label="Hair type"><Choices options={HAIR_TYPES} value={f.hairType} onChange={set('hairType')} /></Field>
          <Field label="Lifestyle"><Select options={LIFESTYLES} value={f.lifestyle} onChange={(e) => set('lifestyle')(e.target.value)} /></Field>
          <Field label="Style preference"><Choices options={FORMALITY} value={f.formality} onChange={set('formality')} /></Field>
          <button className="btn primary block lg" onClick={() => setResult(recommendStyle(f))}>{Icon.sparkle(22)} Get Recommendation</button>
        </div>

        <div className="stack">
          <div className="card pad-lg">
            <h3 className="card-title">Camera face analysis</h3>
            <p className="card-sub">Optional · auto-fills face shape (demo).</p>
            <CameraView cam={cam} mode="face" />
            <div className="row" style={{ marginTop: 14 }}>
              {!cam.active
                ? <button className="btn soft" onClick={cam.start}>{Icon.camera(20)} Start Camera</button>
                : <><button className="btn brass" onClick={analyze}>{Icon.face(20)} Analyze Face</button><button className="btn ghost" onClick={cam.stop}>Stop</button></>}
            </div>
            <p className="note" style={{ marginTop: 14 }}><b>Future:</b> Magic Mirror AI-assisted face analysis for personalized recommendations.</p>
          </div>

          {result && (
            <div className="card pad-lg" style={{ background: 'var(--surface-2)' }}>
              <span className="tag">Recommended</span>
              <h2 style={{ fontFamily: 'var(--display)', margin: '4px 0 10px', fontSize: '1.8rem' }}>{result.style}</h2>
              <div className="grid cols-2" style={{ gap: 14 }}>
                <div className="photo-slot" style={{ aspectRatio: '4/3' }}>{Icon.scissors(28)}<span style={{ marginTop: 6 }}>Reference: {result.reference}</span></div>
                <div>
                  <p style={{ margin: '0 0 10px' }}>{result.explanation}</p>
                  <div className="note"><b>Barber notes:</b> {result.barberNotes}</div>
                </div>
              </div>
              <div className="row" style={{ marginTop: 16 }}>
                <span className="pill chair"><span className="dot" /> {Math.round(result.confidence * 100)}% fit · demo</span>
                <button className="btn primary" onClick={() => { setToast('Saved to session note.'); }}>Use this style</button>
              </div>
            </div>
          )}
        </div>
      </div>
      {toast}
    </main>
  )
}
