# PULSO — Digital Reception + Barber Assistant

A mobile-first, kiosk-first React app for **PULSO Barbers Club**. It runs on a large Android 12 kiosk display (via **Fully Kiosk Browser**) and adapts to the **PULSO On-The-Go** portable barber setup (tablet/phone) for home service, events, and pop-ups.

It plays three roles around a haircut:

1. **Digital Reception** — before the cut (check-in, booking, queue).
2. **Barber Assistant** — during the cut (preferences, checklist, photos, notes).
3. **Next-Session Recommendation** — after the cut (maintenance schedule, refinements, saved notes).

> **MVP build.** No backend. Everything is stored in the browser via `localStorage`. Camera, QR, and face recognition use real browser APIs where available, with clearly-labeled demo/placeholder logic for biometrics and AI. Designed to drop a real backend (Supabase/Firebase) and real AI in later without rewriting the screens.

---

## Modules

| Module | What it does |
| --- | --- |
| **Welcome** | Big touch tiles → every flow. Live "in queue" count. |
| **QR Check-In** | Camera preview + manual code fallback + "Simulate Digizen Scan" → mock profile → Start Barber Session. |
| **Manual Check-In** | Walk-in form → confirmation → adds to today's queue. |
| **Face Check-In** | Camera capture, demo matching against enrolled faces, confidence placeholder, enrollment flow. |
| **Haircut History** | Past cuts, notes, **"Yung dati?"** repeat button, add-notes, next-session panel. |
| **Style Assistant** | Rule-based hairstyle recommendation + camera face-analysis placeholder. |
| **Barber Assistant** | Active customer, history, AI recommendation, checklist (confirm → before photo → cutting → after photo → notes → complete). Writes the cut to history. |
| **Booking** | Date / time / barber / service / customer → confirm. |
| **Queue** | Today's queue with Waiting / In Chair / Done, open in Barber Assistant. |
| **Freedom Wall** | Anonymous or named messages; moderation noted as future. |
| **Admin** | PIN-gated (**demo PIN `1234`**), views of all data, clear / reseed demo data. |

---

## Tech

- **React 19 + Vite 6**, plain CSS design system (no UI framework, no icon dependency — offline-safe).
- State-based navigation (no router) so it deploys to any subpath with zero config.
- `localStorage` data layer with a uniform collection API, ready to swap for a backend.
- Browser **camera** (`getUserMedia`) for QR/photo/face flows, degrading gracefully when no camera or permission.

---

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173  (also on your LAN IP for tablet testing)
```

Build / preview a production bundle:

```bash
npm run build
npm run preview  # serves dist/ on your LAN
```

Demo data is seeded automatically on first load. Reset it anytime in **Admin → Clear demo data → Reseed demo**.

---

## Deploy

`vite.config.js` sets `base: './'`, so the same `dist/` works on all three:

### Vercel
- Framework preset: **Vite** · Build: `npm run build` · Output: `dist`
- Or CLI: `npm i -g vercel && vercel` (this account already has the Vercel connector).

### Cloudflare Pages
- Build command: `npm run build` · Build output directory: `dist`

### GitHub Pages
- Build, then publish `dist/` (e.g. via the `peaceiris/actions-gh-pages` action, or push `dist` to a `gh-pages` branch).
- Relative `base` already handles the `/<repo-name>/` subpath.

---

## Fully Kiosk Browser setup (Android 12 kiosk)

1. Install **Fully Kiosk Browser** from the Play Store on the kiosk device.
2. **Settings → Web Content → Start URL** → paste your deployed URL (e.g. `https://pulso-kiosk.vercel.app`).
3. **Web Auto Reload** off; **Keep Screen On** on.
4. **Settings → Device Management → Enable Kiosk Mode** (locks to the app).
5. **Settings → Web Content → Advanced Web Settings**:
   - Enable **Camera Access** / grant camera permission (required for QR, photo capture, face check-in).
   - Enable **Autoplay Videos** (camera preview).
6. **Settings → User Interface**: hide the address bar; set orientation to **Landscape** for the wall kiosk.
7. For **On-The-Go** portable use: same URL on a tablet/phone in portrait — the layout switches to "On-The-Go Mode" automatically below 900px width.

> Camera APIs require a **secure context**. Vercel/Cloudflare/Pages serve HTTPS, so the camera works. On a plain `http://` LAN address the camera may be blocked.

---

## Data model (localStorage keys, namespaced `pulso_v1_`)

`customers`, `checkIns`, `bookings`, `queue`, `haircutHistory`, `barberSessions`, `freedomWallMessages`, `faceProfiles`.

Every collection (`src/lib/storage.js`) exposes the same API:

```js
collection.all()              // -> array
collection.find(id)           // -> object | null
collection.add(obj)           // -> created object (gets id + createdAt)
collection.update(id, patch)  // -> updated object
collection.remove(id)
collection.set(array)
```

---

## Connecting a real backend later

The screens never touch `localStorage` directly — they call the collection API. To go live:

1. Reimplement `collection()` in `src/lib/storage.js` to call Supabase/Firebase (keep the same method names). The UI is unchanged.
2. Replace `recommendStyle()` in `src/lib/recommend.js` with an OpenAI/Claude/Gemini call (keep the return shape `{ style, explanation, barberNotes, reference, confidence }`).
3. Replace the demo face matching in `FaceCheckIn.jsx` with `face-api.js` or a biometric SDK (return a descriptor + distance, set a real `confidence`).
4. Add a QR decoder (e.g. `jsQR`) on the camera frame in `QRCheckIn.jsx`.

---

## Roadmap placeholders (intentionally stubbed)

Real Digizen ID integration · real QR identity verification · production biometric face recognition · camera-based AI face analysis · real AI hairstyle recommendation · payments · myCHAT booking reminders · Bella Essentials product promos · DMX Gym / Lemon Bar / Dream Forest kiosk variants · multi-branch admin dashboard.

---

## Project structure

```
src/
  main.jsx            entry (seeds demo data)
  App.jsx             shell + navigation stack + device-mode
  styles.css          design system
  lib/
    storage.js        localStorage collections + actions + seed
    recommend.js      rule-based recommendation + next-session logic
    camera.js         useCamera() getUserMedia hook
  components/
    ui.jsx            icons, fields, camera view, toast, modal, pin pad
  screens/
    Welcome / QRCheckIn / ManualCheckIn / FaceCheckIn /
    HaircutHistory / Recommend / BarberAssistant /
    Booking / Queue / FreedomWall / Admin
```
