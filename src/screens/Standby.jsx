import { useEffect, useRef, useState } from 'react'
import { LogoMark } from '../components/Logo.jsx'

const SLIDES = [
  './slides/slide1.png',
  './slides/slide2.png',
  './slides/slide3.png',
  './slides/slide4.png',
]

/* Each slide gets a different Ken Burns direction for visual variety */
const KB_VARIANTS = [
  { from: 'scale(1)   translate(0,0)',       to: 'scale(1.18) translate(-3%,-2%)' },
  { from: 'scale(1.15) translate(-4%,2%)',   to: 'scale(1)   translate(0,0)' },
  { from: 'scale(1)   translate(2%,0)',      to: 'scale(1.2) translate(-2%,-3%)' },
  { from: 'scale(1.18) translate(0,-3%)',    to: 'scale(1)   translate(1%,1%)' },
]

const SLIDE_DURATION = 7000   // ms each slide is visible
const FADE_DURATION  = 1200   // ms crossfade

function useTime() {
  const [now, setNow] = useState(new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

export default function Standby({ onWake }) {
  const [idx, setIdx]       = useState(0)
  const [next, setNext]     = useState(1)
  const [fading, setFading] = useState(false)
  const timer               = useRef(null)
  const now                 = useTime()

  /* cycle slides */
  useEffect(() => {
    const advance = () => {
      setFading(true)
      setTimeout(() => {
        setIdx((i) => (i + 1) % SLIDES.length)
        setNext((n) => (n + 1) % SLIDES.length)
        setFading(false)
      }, FADE_DURATION)
    }
    timer.current = setInterval(advance, SLIDE_DURATION)
    return () => clearInterval(timer.current)
  }, [])

  const fmt = (d) => d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit', hour12: true })
  const fmtDate = (d) => d.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })

  /* generate inline keyframe name per variant */
  const kbStyle = (v) => ({
    backgroundImage: `url(${SLIDES[v]})`,
    animation: `kb${v} ${SLIDE_DURATION + FADE_DURATION}ms ease-in-out infinite`,
  })

  return (
    <div className="standby" onClick={onWake} onTouchStart={onWake}>
      {/* current slide (Ken Burns) */}
      <div
        className="standby-slide active"
        key={`slide-${idx}`}
        style={{
          backgroundImage: `url(${SLIDES[idx]})`,
          '--kb-from': KB_VARIANTS[idx % KB_VARIANTS.length].from,
          '--kb-to':   KB_VARIANTS[idx % KB_VARIANTS.length].to,
          animationDuration: `${SLIDE_DURATION + FADE_DURATION}ms`,
        }}
      />
      {/* next slide fading in underneath */}
      <div
        className={`standby-slide next ${fading ? 'visible' : ''}`}
        key={`next-${next}`}
        style={{
          backgroundImage: `url(${SLIDES[next]})`,
          '--kb-from': KB_VARIANTS[next % KB_VARIANTS.length].from,
          '--kb-to':   KB_VARIANTS[next % KB_VARIANTS.length].to,
          animationDuration: `${SLIDE_DURATION + FADE_DURATION}ms`,
        }}
      />

      {/* dark gradient overlay for readability */}
      <div className="standby-overlay" />

      {/* time + branding */}
      <div className="standby-ui">
        <div className="standby-time">{fmt(now)}</div>
        <div className="standby-date">{fmtDate(now)}</div>
        <div className="standby-brand">
          <LogoMark size={38} />
          <span>PULSO<small>Magic Mirror</small></span>
        </div>
        <div className="standby-cta">Touch anywhere to begin</div>
      </div>
    </div>
  )
}
