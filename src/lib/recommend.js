/* ============================================================
   PULSO — Recommendation logic (MVP: rule-based, NOT real AI)
   ------------------------------------------------------------
   recommendStyle()  -> from intake inputs (face/hair/lifestyle)
   nextSession()     -> from haircut history (maintenance + refinements)
   Replace recommendStyle() with an OpenAI/Claude/Gemini call later;
   keep the same return shape and the UI keeps working.
   ============================================================ */

export const FACE_SHAPES = ['Oval', 'Round', 'Square', 'Oblong', 'Heart', 'Diamond']
export const HAIR_LENGTHS = ['Short', 'Medium', 'Long']
export const HAIR_TYPES = ['Straight', 'Wavy', 'Curly', 'Coily', 'Thinning']
export const LIFESTYLES = ['Low maintenance', 'Active / sporty', 'Office / professional', 'Trend-forward']
export const FORMALITY = ['Formal', 'Smart casual', 'Casual']

const BY_FACE = {
  Oval:    ['Textured Crop', 'Classic Taper', 'Mid Fade + Quiff'],
  Round:   ['Pompadour', 'High Fade with Volume on Top', 'Faux Hawk'],
  Square:  ['Crew Cut', 'Buzz with Line-up', 'Short Side Part'],
  Oblong:  ['Side Part with Fringe', 'Textured Fringe', 'Medium Layered'],
  Heart:   ['Medium Layered Sweep', 'Textured Fringe', 'Comma Hair'],
  Diamond: ['Textured Fringe', 'Soft Quiff', 'Layered Crop'],
}

export function recommendStyle({ faceShape, hairLength, hairType, lifestyle, formality }) {
  const base = BY_FACE[faceShape] || ['Textured Crop', 'Classic Taper']
  let pick = base[0]

  // Lifestyle/formality nudges the choice within the face-shape set.
  if (lifestyle === 'Low maintenance' || formality === 'Casual') pick = base.find((s) => /crop|crew|buzz|taper|caesar/i.test(s)) || base[0]
  if (lifestyle === 'Office / professional' || formality === 'Formal') pick = base.find((s) => /part|taper|classic|quiff/i.test(s)) || base[0]
  if (lifestyle === 'Trend-forward') pick = base.find((s) => /fringe|fade|pompadour|faux|comma/i.test(s)) || base[base.length - 1]
  if (lifestyle === 'Active / sporty') pick = base.find((s) => /crew|buzz|crop|taper/i.test(s)) || base[0]

  const sides = formality === 'Formal' ? 'a clean low-to-mid taper' : 'a defined mid-to-high fade'

  const lenNote = {
    Short: 'Keep it short and easy to style.',
    Medium: 'Medium length gives styling flexibility day to day.',
    Long: 'Longer length needs a bit more upkeep but holds shape and movement.',
  }[hairLength] || ''

  const typeNote = {
    Straight: 'Straight hair holds clean lines well — add light texture so it isn’t flat.',
    Wavy: 'Wavy hair works great with texture; a matte product keeps it natural.',
    Curly: 'Lean into the curl pattern; avoid over-thinning so it doesn’t frizz.',
    Coily: 'Define the curl with a sponge or light cream; sharp line-up frames it.',
    Thinning: 'Shorter on the sides with soft length on top creates the look of more density.',
  }[hairType] || ''

  return {
    style: pick,
    explanation: `For a ${faceShape.toLowerCase()} face, ${pick} balances your proportions. Paired with ${sides}, it suits a ${(lifestyle || 'flexible').toLowerCase()} routine. ${lenNote}`,
    barberNotes: `${typeNote} Confirm guard lengths and fade height with the customer before starting.`,
    reference: pick,
    confidence: 0.82,
    demo: true,
  }
}

/* Maintenance windows (weeks) keyed by detected style family */
function maintenanceWeeks(style = '') {
  const s = style.toLowerCase()
  if (/fade|skin/.test(s)) return [2, 3]
  if (/taper|crew|buzz|line/.test(s)) return [3, 4]
  if (/part|quiff|pompadour|crop|fringe/.test(s)) return [4, 5]
  return [5, 6]
}

export function nextSession(customer, history = []) {
  const last = history[0]
  if (!last) {
    return {
      schedule: 'No history yet — suggest a follow-up in 3–4 weeks after the first cut.',
      refinements: ['Capture a before/after photo this visit to build the style record.'],
      note: '',
    }
  }
  const [lo, hi] = maintenanceWeeks(last.style || last.service)
  const due = new Date(last.date)
  due.setDate(due.getDate() + hi * 7)
  const dueStr = due.toISOString().slice(0, 10)

  // Has the customer repeated the same style 2+ times?
  const repeats = history.filter((h) => (h.style || '') === (last.style || '')).length

  const refinements = []
  if (repeats >= 2) {
    refinements.push(`Same style ${repeats} visits running — offer a subtle variation (e.g., adjust fade height or add texture) to keep it fresh.`)
  } else {
    refinements.push(`Build on “${last.style || last.service}” — small refinements based on how it grew out.`)
  }
  if (/fade|skin/i.test(last.style || last.service)) refinements.push('Suggest a mid-visit line-up to stretch time between full cuts.')
  refinements.push('Recommend a matching maintenance product based on hair type.')

  return {
    schedule: `Maintenance window: every ${lo}–${hi} weeks. Next visit suggested around ${dueStr}.`,
    refinements,
    note: last.nextRecommendation || '',
  }
}
