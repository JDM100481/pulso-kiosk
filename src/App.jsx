import { useCallback, useMemo, useState, useEffect, useRef } from 'react'
import { Icon } from './components/ui.jsx'
import Logo from './components/Logo.jsx'
import Standby from './screens/Standby.jsx'

import Welcome from './screens/Welcome.jsx'
import QRCheckIn from './screens/QRCheckIn.jsx'
import ManualCheckIn from './screens/ManualCheckIn.jsx'
import FaceCheckIn from './screens/FaceCheckIn.jsx'
import HaircutHistory from './screens/HaircutHistory.jsx'
import Recommend from './screens/Recommend.jsx'
import BarberAssistant from './screens/BarberAssistant.jsx'
import Booking from './screens/Booking.jsx'
import Queue from './screens/Queue.jsx'
import FreedomWall from './screens/FreedomWall.jsx'
import Admin from './screens/Admin.jsx'
import DigizenRegister from './screens/DigizenRegister.jsx'

const SCREENS = {
  welcome:   { c: Welcome,        title: 'PULSO Magic Mirror',  crumb: 'Reception' },
  register:  { c: DigizenRegister,title: 'DigizenID Registration', crumb: 'dSIM · New' },
  qr:        { c: QRCheckIn,      title: 'DigizenID Check-In',  crumb: 'QR Scan' },
  manual:    { c: ManualCheckIn,  title: 'Walk-In Check-In',    crumb: 'Reception' },
  face:      { c: FaceCheckIn,    title: 'Face Recognition',    crumb: 'Magic Mirror · Demo' },
  history:   { c: HaircutHistory, title: 'Haircut History',     crumb: 'Magic Mirror' },
  recommend: { c: Recommend,      title: 'Style Assistant',     crumb: 'Magic Mirror' },
  barber:    { c: BarberAssistant,title: 'Barber Assistant',    crumb: 'Magic Mirror Session' },
  booking:   { c: Booking,        title: 'Book via myCHAT',     crumb: 'Booking' },
  queue:     { c: Queue,          title: "Today's Queue",       crumb: 'Front desk' },
  wall:      { c: FreedomWall,    title: 'Community Pulse',     crumb: "The People's Pulse" },
  admin:     { c: Admin,          title: 'Admin',               crumb: 'Staff only' },
}

const IDLE_TIMEOUT = 120_000 // 2 minutes → standby

export default function App() {
  const [stack, setStack] = useState([{ name: 'welcome', params: {} }])
  const [standby, setStandby] = useState(false)
  const idleRef = useRef(null)
  const current = stack[stack.length - 1]
  const def = SCREENS[current.name] || SCREENS.welcome

  const go = useCallback((name, params = {}) => {
    setStack((s) => [...s, { name, params }])
    window.scrollTo(0, 0)
  }, [])
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), [])
  const home = useCallback(() => setStack([{ name: 'welcome', params: {} }]), [])

  // --- Idle detection: reset timer on any interaction ---
  const resetIdle = useCallback(() => {
    clearTimeout(idleRef.current)
    idleRef.current = setTimeout(() => setStandby(true), IDLE_TIMEOUT)
  }, [])

  useEffect(() => {
    const events = ['pointerdown', 'pointermove', 'keydown', 'scroll', 'touchstart']
    events.forEach((e) => window.addEventListener(e, resetIdle, { passive: true }))
    resetIdle() // start the clock
    return () => {
      events.forEach((e) => window.removeEventListener(e, resetIdle))
      clearTimeout(idleRef.current)
    }
  }, [resetIdle])

  const wake = useCallback(() => {
    setStandby(false)
    setStack([{ name: 'welcome', params: {} }])
    resetIdle()
  }, [resetIdle])

  // Device mode: kiosk (wide/landscape) vs portable On-The-Go (narrow/portrait)
  const [portable, setPortable] = useState(false)
  useEffect(() => {
    const check = () => setPortable(window.innerWidth < 900)
    check(); window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  const Screen = def.c
  const nav = useMemo(() => ({ go, back, home, portable }), [go, back, home, portable])

  return (
    <>
      {standby && <Standby onWake={wake} />}
      <div className="app">
        <header className="topbar">
          {current.name === 'welcome' ? (
            <Logo variant="row" />
          ) : (
            <button className="back" onClick={back} aria-label="Back">{Icon.back(26)}</button>
          )}
          {current.name !== 'welcome' && (
            <div className="crumb"><b>{def.title}</b><span>{def.crumb}</span></div>
          )}
          <div className="spacer" />
          <span className="mode-banner">{portable ? 'On-The-Go' : 'Kiosk'} Mode</span>
          {current.name !== 'welcome' && (
            <button className="back" onClick={home} aria-label="Home" title="Home">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg>
            </button>
          )}
        </header>
        <Screen nav={nav} params={current.params} />
      </div>
    </>
  )
}
