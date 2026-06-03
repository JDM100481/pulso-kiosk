# PULSO Magic Mirror — Kiosk App

## What this is
The PULSO Magic Mirror System, built as a React 19 + Vite kiosk app for PULSO Barbers Club. It runs on an Android 12 tablet in Fully Kiosk Browser (landscape) and also works in portable "On-The-Go" mode (auto-detects below 900px width).

## The PULSO Ecosystem (context for every edit)
PULSO has five integrated components. This app IS the Magic Mirror:
- **PULSO Barbers Club** — physical community barber shop
- **PULSO On The Go** — mobile barber service (same Magic Mirror, portable mode)
- **DigizenID** — unified customer identity (replaces loyalty cards, member numbers). Currently simulated with localStorage IDs; will connect to the real DigizenID backend.
- **myCHAT** — booking & communication platform. Currently the Booking screen is a placeholder; will integrate with the real myCHAT API.
- **PULSO Magic Mirror** — THIS APP. The intelligence & experience layer that connects everything.

### Key problems the Magic Mirror solves
1. **"Yung dati na lang"** — customer says "same as last time" but the barber doesn't remember. Magic Mirror retrieves haircut history, photos, barber notes automatically via DigizenID.
2. **Community Pulse** — barber shops hear real community stories. The Community Pulse (formerly Freedom Wall) captures anonymized sentiment from prompted questions, aggregated into a Community Pulse Index.
3. **Access to grooming** — On The Go mode makes the same personalized service available at home/office/events.

## Tech stack
- React 19 + Vite 6, plain CSS design system (no UI framework)
- Inline SVG icons — offline-safe, no icon library
- localStorage data layer (namespace `pulso_v1_`). Every collection uses the same `collection()` API: `all()`, `find()`, `add()`, `update()`, `remove()`, `set()`.
- No router — state-based navigation via `stack` in App.jsx. `nav.go(screenKey, params)` / `nav.back()` / `nav.home()`.
- `base: './'` in vite.config.js — deploys to any subpath.

## Design system
- **Background:** warm paper `#f4f1ec` → `#efe9e0` gradient
- **Ink:** charcoal `#16181b`
- **Accent:** brass/gold `#b88a3e` (UI controls), logo red `#d6342a` + logo blue `#2563c9` (brand mark only)
- **Fonts:** Fraunces (display serif, `--display`), Manrope (body, `--body`) via Google Fonts with system fallbacks
- **Touch targets:** `--tap: 64px` minimum. Large buttons, fat chips.
- **Logo:** inline SVG in `src/components/Logo.jsx` — heartbeat + scissors mark, recreated for light bg. Two variants: `stacked` (welcome hero) and `row` (topbar).

## File structure
```
src/
  main.jsx              — entry, calls seed()
  App.jsx               — shell, nav stack, idle detection → standby
  styles.css            — full design system + standby CSS
  components/
    ui.jsx              — Icon set, Field, Choices, useToast, Modal, CameraView, PinPad, Empty
    Logo.jsx            — SVG logo mark + lockup
  lib/
    storage.js          — localStorage layer, 8 collections, seed data, helpers
    recommend.js        — rule-based recommendStyle() + nextSession()
    camera.js           — useCamera() getUserMedia hook
  screens/
    Welcome.jsx         — hub with nav tiles
    DigizenRegister.jsx — DigizenID registration (mobile # anchor, OTP, digital ID card, dSIM status)
    QRCheckIn.jsx       — DigizenID QR scan (camera + manual + simulate)
    ManualCheckIn.jsx   — walk-in registration
    FaceCheckIn.jsx     — face recognition demo + enrollment
    HaircutHistory.jsx  — "Yung dati?" repeat, notes, next-session panel
    Recommend.jsx       — style intake + camera face analysis placeholder
    BarberAssistant.jsx — CORE: session checklist, before/after photo, notes, mark-complete
    Booking.jsx         — appointment reservation (myCHAT placeholder)
    Queue.jsx           — today's waiting/in-chair/done list
    FreedomWall.jsx     — Community Pulse: prompted questions + topic tagging + sentiment
    Admin.jsx           — PIN gate (1234), data tables, Community Pulse Index dashboard, clear/reseed
    Standby.jsx         — screensaver: Ken Burns slideshow, clock, brand overlay
public/
  slides/               — Kwentong Barbero social media images for standby
```

## Data model (localStorage collections)
- `customers` — name, mobile, customerId (DigizenID), preferredBarber, preferredStyle, faceProfileId
- `checkIns` — name, service, barber, method (qr/manual/face)
- `bookings` — name, date, time, barber, service
- `queue` — name, service, barber, status (Waiting/In Chair/Done)
- `haircutHistory` — customerId, date, style, service, barber, notes, photo, nextRecommendation
- `barberSessions` — queueId, customerId, checklist, beforePhoto, afterPhoto, notes
- `freedomWallMessages` — text, author, anonymous, approved, topic, promptQuestion
- `faceProfiles` — customerId, image, descriptor

## Ecosystem terminology (use these consistently)
- "DigizenID" not "member ID" or "customer ID" when referring to the identity system
- "Magic Mirror" when referring to the intelligence/recommendation features
- "myCHAT" when referring to booking/communication
- "Community Pulse" for the sentiment/engagement feature (was "Freedom Wall")
- "PULSO On The Go" for portable/mobile mode
- "PULSO Barbers Club" for the physical location

## Deploy
- `npm run build` → `dist/`
- Currently on Vercel (Git-connected, auto-deploys on push)
- Also deployable to Cloudflare Pages, GitHub Pages
- For kiosk: set the Vercel URL as start URL in Fully Kiosk Browser

## Common edits
- **Add a slide:** drop PNG in `public/slides/`, add path to `SLIDES` array in `Standby.jsx`
- **Change idle timeout:** `IDLE_TIMEOUT` in `App.jsx` (default 120000ms = 2 min)
- **Add a barber:** `BARBERS` array in `storage.js`
- **Add a service:** `SERVICES` array in `storage.js`
- **Change admin PIN:** `ADMIN_PIN` in `Admin.jsx`
- **Swap to real backend:** reimplement `collection()` in `storage.js` to call your API. Screens don't change.
