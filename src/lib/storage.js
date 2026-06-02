/* ============================================================
   PULSO — Local data layer (localStorage)
   ------------------------------------------------------------
   Every collection exposes the same small API:
     all(), find(id), add(obj), update(id, patch), remove(id), set(arr)
   To move to Supabase/Firebase later, reimplement collection()
   to call your backend — the screens won't need to change.
   ============================================================ */

const NS = 'pulso_v1_'

function read(key, fallback = []) {
  try {
    const raw = localStorage.getItem(NS + key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function write(key, value) {
  try { localStorage.setItem(NS + key, JSON.stringify(value)) } catch (e) { console.warn('storage write failed', e) }
  return value
}

export function uid(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`
}
export function nowISO() { return new Date().toISOString() }
export function today() { return new Date().toISOString().slice(0, 10) }

function collection(key) {
  return {
    key,
    all: () => read(key),
    set: (arr) => write(key, arr),
    find: (id) => read(key).find((x) => x.id === id) || null,
    add: (obj) => {
      const arr = read(key)
      const item = { id: uid(key), createdAt: nowISO(), ...obj }
      arr.unshift(item)
      write(key, arr)
      return item
    },
    update: (id, patch) => {
      const arr = read(key)
      const i = arr.findIndex((x) => x.id === id)
      if (i === -1) return null
      arr[i] = { ...arr[i], ...patch }
      write(key, arr)
      return arr[i]
    },
    remove: (id) => write(key, read(key).filter((x) => x.id !== id)),
  }
}

/* ---- The eight collections from the data model ---- */
export const customers           = collection('customers')
export const checkIns            = collection('checkIns')
export const bookings            = collection('bookings')
export const queue               = collection('queue')
export const haircutHistory      = collection('haircutHistory')
export const barberSessions      = collection('barberSessions')
export const freedomWallMessages = collection('freedomWallMessages')
export const faceProfiles        = collection('faceProfiles')

export const COLLECTIONS = {
  customers, checkIns, bookings, queue, haircutHistory,
  barberSessions, freedomWallMessages, faceProfiles,
}

/* Shared reference data used across screens */
export const BARBERS = ['Kuya Ron', 'JP', 'Marco', 'Bryan', 'Next Available']
export const SERVICES = [
  { name: 'Classic Haircut', mins: 30 },
  { name: 'Haircut + Beard', mins: 45 },
  { name: 'Skin Fade', mins: 40 },
  { name: 'Kids Cut', mins: 25 },
  { name: 'Hair + Hot Towel', mins: 50 },
  { name: 'Beard Trim', mins: 20 },
]

/* ---- Convenience queries used by several screens ---- */
export function customerHistory(customerId) {
  return haircutHistory.all()
    .filter((h) => h.customerId === customerId)
    .sort((a, b) => (a.date < b.date ? 1 : -1))
}
export function activeQueue() {
  return queue.all().filter((q) => q.status !== 'Done')
}

/* ---- Actions shared across check-in flows & queue ---- */
// Record a check-in and add the person to today's queue (status Waiting).
export function checkInCustomer({ customerId = null, name, mobile = '', barber = 'Next Available', service = 'Classic Haircut', method = 'manual' }) {
  checkIns.add({ customerId, name, mobile, barber, service, method })
  if (customerId) customers.update(customerId, { lastVisit: today() })
  return queue.add({ customerId, name, service, barber, status: 'Waiting', addedAt: nowISO() })
}

// Put a queue entry In Chair and open/create its barber session. Returns sessionId.
export function beginBarberSession(queueEntry) {
  queue.update(queueEntry.id, { status: 'In Chair' })
  const existing = barberSessions.all().find((s) => s.queueId === queueEntry.id && !s.completedAt)
  if (existing) return existing.id
  const s = barberSessions.add({
    queueId: queueEntry.id,
    customerId: queueEntry.customerId || null,
    name: queueEntry.name,
    service: queueEntry.service,
    barber: queueEntry.barber,
    startedAt: nowISO(),
    completedAt: null,
    checklist: {},
    beforePhoto: null,
    afterPhoto: null,
    notes: '',
    recommendation: '',
  })
  return s.id
}

/* ---- Reset (Admin → Clear demo data) ---- */
export function clearAll() {
  Object.values(COLLECTIONS).forEach((c) => localStorage.removeItem(NS + c.key))
}
export function reseed() { clearAll(); localStorage.removeItem(NS + 'seeded'); seed() }

/* ============================================================
   Demo seed — runs once on first load.
   ============================================================ */
export function seed() {
  if (localStorage.getItem(NS + 'seeded')) return
  localStorage.setItem(NS + 'seeded', '1')

  const c1 = { id: 'cust_juan', createdAt: nowISO(), name: 'Juan Dela Cruz', mobile: '0917 555 0142', customerId: 'PULSO-0001', lastVisit: '2026-05-04', preferredBarber: 'Kuya Ron', preferredStyle: 'Mid Skin Fade + Textured Top', faceProfileId: 'face_juan' }
  const c2 = { id: 'cust_marielle', createdAt: nowISO(), name: 'Marielle Santos', mobile: '0918 222 7781', customerId: 'PULSO-0002', lastVisit: '2026-05-18', preferredBarber: 'JP', preferredStyle: 'Soft Layered Crop', faceProfileId: null }
  const c3 = { id: 'cust_dexter', createdAt: nowISO(), name: 'Dexter Lim', customerId: 'PULSO-0003', mobile: '0905 660 3310', lastVisit: '2026-04-22', preferredBarber: 'Marco', preferredStyle: 'Classic Side Part', faceProfileId: null }
  customers.set([c1, c2, c3])

  haircutHistory.set([
    { id: uid('hx'), createdAt: nowISO(), customerId: 'cust_juan', date: '2026-05-04', barber: 'Kuya Ron', service: 'Skin Fade', style: 'Mid Skin Fade + Textured Top', notes: 'Leave a bit more length on top. No product, prefers matte.', photo: null, nextRecommendation: 'Book a touch-up in ~3 weeks to keep the fade sharp.' },
    { id: uid('hx'), createdAt: nowISO(), customerId: 'cust_juan', date: '2026-04-10', barber: 'Kuya Ron', service: 'Skin Fade', style: 'Mid Skin Fade', notes: 'Slightly tighter on the sides last time — he liked it.', photo: null, nextRecommendation: '' },
    { id: uid('hx'), createdAt: nowISO(), customerId: 'cust_marielle', date: '2026-05-18', barber: 'JP', service: 'Classic Haircut', style: 'Soft Layered Crop', notes: 'Wants low-maintenance, air-dry friendly.', photo: null, nextRecommendation: '6-week trim to keep layers light.' },
    { id: uid('hx'), createdAt: nowISO(), customerId: 'cust_dexter', date: '2026-04-22', barber: 'Marco', service: 'Haircut + Beard', style: 'Classic Side Part', notes: 'Office look. Beard lined up clean.', photo: null, nextRecommendation: '' },
  ])

  queue.set([
    { id: uid('q'), createdAt: nowISO(), customerId: 'cust_marielle', name: 'Marielle Santos', service: 'Classic Haircut', barber: 'JP', status: 'In Chair', addedAt: nowISO() },
    { id: uid('q'), createdAt: nowISO(), customerId: null, name: 'Walk-in — Paolo R.', service: 'Skin Fade', barber: 'Next Available', status: 'Waiting', addedAt: nowISO() },
  ])

  bookings.set([
    { id: uid('bk'), createdAt: nowISO(), name: 'Dexter Lim', mobile: '0905 660 3310', date: today(), time: '15:30', barber: 'Marco', service: 'Haircut + Beard' },
  ])

  freedomWallMessages.set([
    { id: uid('fw'), createdAt: nowISO(), text: 'Best fade in the city. Salamat Kuya Ron! 💈', author: 'Juan', anonymous: false, approved: true },
    { id: uid('fw'), createdAt: nowISO(), text: 'Sobrang relax ng tambayan dito. Solid service.', author: null, anonymous: true, approved: true },
    { id: uid('fw'), createdAt: nowISO(), text: 'First time mag-pa-gupit, balik ako for sure.', author: 'Marielle', anonymous: false, approved: true },
  ])

  faceProfiles.set([
    { id: 'face_juan', createdAt: nowISO(), customerId: 'cust_juan', image: null, descriptor: 'demo-descriptor-juan', enrolledAt: '2026-03-01' },
  ])

  checkIns.set([])
  barberSessions.set([])
}
