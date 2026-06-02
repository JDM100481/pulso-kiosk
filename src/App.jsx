import { useCallback, useMemo, useState, useEffect } from 'react'
import { Icon } from './components/ui.jsx'

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

const SCREENS = {
  welcome:   { c: Welcome,        title: 'PULSO Barbers Club', crumb: 'Reception' },
  qr:        { c: QRCheckIn,      title: 'QR Check-In',        crumb: 'Digital ID' },
  manual:    { c: ManualCheckIn,  title: 'Manual Check-In',    crumb: 'Reception' },
  face:      { c: FaceCheckIn,    title: 'Face Recognition',   crumb: 'Check-In · Demo' },
  history:   { c: HaircutHistory, title: 'Haircut History',    crumb: 'Customer' },
  recommend: { c: Recommend,      title: 'Hairstyle Assistant',crumb: 'AI · Demo' },
  barber:    { c: BarberAssistant,title: 'Barber Assistant',   crumb: 'Session' },
  booking:   { c: Booking,        title: 'Book Appointment',   crumb: 'Reception' },
  queue:     { c: Queue,          title: "Today's Queue",      crumb: 'Front desk' },
  wall:      { c: FreedomWall,    title: 'Freedom Wall',       crumb: 'Community' },
  admin:     { c: Admin,          title: 'Admin',              crumb: 'Staff only' },
}

export default function App() {
  const [stack, setStack] = useState([{ name: 'welcome', params: {} }])
  const current = stack[stack.length - 1]
  const def = SCREENS[current.name] || SCREENS.welcome

  const go = useCallback((name, params = {}) => {
    setStack((s) => [...s, { name, params }])
    window.scrollTo(0, 0)
  }, [])
  const back = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), [])
  const home = useCallback(() => setStack([{ name: 'welcome', params: {} }]), [])

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
    <div className="app">
      <header className="topbar">
        {current.name === 'welcome' ? (
          <div className="wordmark">
            <div className="mark">P</div>
            <div className="name">PULSO<small>Barbers Club</small></div>
          </div>
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
  )
}
