/* ------------------------------------------------------------------ *
 *  PULSO Barbers Club — logo, recreated as inline SVG.
 *  Original art is white/red/blue on black; this version is themed for
 *  the app's light "paper" background: the heartbeat blades keep their
 *  red + blue brand identity, while the scissor handles and the PULSO
 *  wordmark switch from white to charcoal ink so they read on light.
 *  No image asset / network needed — crisp at any kiosk resolution.
 * ------------------------------------------------------------------ */

export function LogoMark({ size = 56, className = '' }) {
  // viewBox 260 x 180 — heartbeat baseline at y=92, scissor pivot at (130,110)
  const h = Math.round((size * 180) / 260)
  return (
    <svg
      className={`logo-mark ${className}`}
      width={size}
      height={h}
      viewBox="0 0 260 180"
      role="img"
      aria-label="PULSO scissors heartbeat mark"
      fill="none"
    >
      {/* heartbeat baseline — red enters from the left, rises into the left blade */}
      <path
        d="M6 92 H56 l6 0 l5 -16 l6 32 l6 -16 H96 L116 20"
        stroke="var(--logo-red, #d6342a)" strokeWidth="6"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* heartbeat baseline — blue enters from the right, rises into the right blade */}
      <path
        d="M254 92 H204 l-6 0 l-5 -16 l-6 32 l-6 -16 H164 L150 30"
        stroke="var(--logo-blue, #2563c9)" strokeWidth="6"
        strokeLinecap="round" strokeLinejoin="round"
      />
      {/* scissor blades (open, pointing up) */}
      <path d="M116 20 L132 108 L122 116 Z" fill="var(--logo-red, #d6342a)" />
      <path d="M150 30 L128 108 L138 116 Z" fill="var(--logo-blue, #2563c9)" />
      {/* pivot screw */}
      <circle cx="130" cy="110" r="9" stroke="var(--logo-red, #d6342a)" strokeWidth="4" />
      <circle cx="130" cy="110" r="3.4" fill="var(--ink, #16181b)" />
      {/* handles (charcoal on light bg) — arms from the pivot down to finger rings */}
      <g stroke="var(--ink, #16181b)" strokeWidth="9" strokeLinecap="round">
        <path d="M129 113 C116 124 108 132 106 140" />
        <path d="M133 115 C145 126 151 134 153 142" />
        <circle cx="100" cy="152" r="16" />
        <circle cx="156" cy="154" r="14" />
        <path d="M168 160 q8 4 6 12" strokeWidth="7" />
      </g>
    </svg>
  )
}

export default function Logo({ variant = 'stacked', size, className = '' }) {
  if (variant === 'row') {
    return (
      <div className={`logo logo-row ${className}`}>
        <LogoMark size={size || 46} />
        <div className="logo-text">
          <span className="logo-word sm">PULSO</span>
          <span className="logo-sub sm">
            <i className="logo-dash red" />Barbers Club<i className="logo-dash blue" />
          </span>
        </div>
      </div>
    )
  }
  // stacked lockup (hero)
  return (
    <div className={`logo logo-stacked ${className}`}>
      <LogoMark size={size || 132} />
      <span className="logo-word">PULSO</span>
      <span className="logo-sub">
        <i className="logo-dash red" />Barbers Club<i className="logo-dash blue" />
      </span>
    </div>
  )
}
