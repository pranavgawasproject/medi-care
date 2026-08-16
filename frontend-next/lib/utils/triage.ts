/**
 * Triage priority engine.
 *
 * Calculates Emergency Severity Index (ESI level 1-5), detects vital-sign
 * red flags, and computes patient medication adherence risk scores.
 *
 * Used by appointment booking to suggest an urgency level based on vitals
 * the patient self-reports.
 */

export interface Vitals {
  heartRate?: number
  systolicBp?: number
  diastolicBp?: number
  spO2?: number
  tempC?: number
  respRate?: number
}

export type EsiLevel = 1 | 2 | 3 | 4 | 5

export type TriageCategory =
  | 'RESUSCITATION'
  | 'EMERGENT'
  | 'URGENT'
  | 'LESS_URGENT'
  | 'NON_URGENT'

export interface TriageAssessment {
  esiLevel: EsiLevel
  category: TriageCategory
  flags: string[]
  clinicalSummary: string
}

const CATEGORY_BY_ESI: Record<EsiLevel, TriageCategory> = {
  1: 'RESUSCITATION',
  2: 'EMERGENT',
  3: 'URGENT',
  4: 'LESS_URGENT',
  5: 'NON_URGENT',
}

export function calculateTriageCategory(vitals: Vitals = {}): TriageAssessment {
  const flags: string[] = []
  let esiLevel: EsiLevel = 5

  const { heartRate, systolicBp, diastolicBp, spO2, tempC, respRate } = vitals

  if (typeof spO2 === 'number') {
    if (spO2 < 90) {
      flags.push('HYPOXIA_CRITICAL')
      esiLevel = Math.min(esiLevel, 1) as EsiLevel
    } else if (spO2 < 94) {
      flags.push('OXYGEN_DESATURATION')
      esiLevel = Math.min(esiLevel, 2) as EsiLevel
    }
  }

  if (typeof systolicBp === 'number') {
    if (systolicBp >= 180 || (typeof diastolicBp === 'number' && diastolicBp >= 120)) {
      flags.push('HYPERTENSIVE_CRISIS')
      esiLevel = Math.min(esiLevel, 2) as EsiLevel
    } else if (systolicBp < 90) {
      flags.push('HYPOTENSION_SHOCK_RISK')
      esiLevel = Math.min(esiLevel, 2) as EsiLevel
    }
  }

  if (typeof heartRate === 'number') {
    if (heartRate > 130) {
      flags.push('SEVERE_TACHYCARDIA')
      esiLevel = Math.min(esiLevel, 2) as EsiLevel
    } else if (heartRate < 45) {
      flags.push('SEVERE_BRADYCARDIA')
      esiLevel = Math.min(esiLevel, 2) as EsiLevel
    }
  }

  if (typeof tempC === 'number' && (tempC >= 39.5 || tempC <= 35.0)) {
    flags.push('TEMPERATURE_EXTREME')
    esiLevel = Math.min(esiLevel, 3) as EsiLevel
  }

  if (typeof respRate === 'number' && (respRate > 30 || respRate < 10)) {
    flags.push('ABNORMAL_RESPIRATORY_RATE')
    esiLevel = Math.min(esiLevel, 2) as EsiLevel
  }

  const category = CATEGORY_BY_ESI[esiLevel]
  const clinicalSummary =
    flags.length > 0
      ? `ESI Level ${esiLevel} (${category}): ${flags.join(', ')}`
      : `ESI Level ${esiLevel} (${category}): Normal vital parameters`

  return { esiLevel, category, flags, clinicalSummary }
}

export type AdherenceRiskTier =
  | 'OPTIMAL'
  | 'MODERATE_RISK'
  | 'HIGH_NON_ADHERENCE_RISK'
  | 'UNKNOWN'

export interface MedicationAdherence {
  adherencePercentage: number
  riskTier: AdherenceRiskTier
  requiresFollowUp: boolean
}

export function calculateMedicationAdherenceRisk(
  prescribedDoses = 0,
  takenDoses = 0
): MedicationAdherence {
  if (typeof prescribedDoses !== 'number' || prescribedDoses <= 0) {
    return { adherencePercentage: 0, riskTier: 'UNKNOWN', requiresFollowUp: false }
  }

  const validTaken = Math.max(
    0,
    Math.min(prescribedDoses, Number(takenDoses) || 0)
  )
  const adherencePercentage = Number(
    ((validTaken / prescribedDoses) * 100).toFixed(1)
  )

  let riskTier: AdherenceRiskTier = 'OPTIMAL'
  let requiresFollowUp = false

  if (adherencePercentage < 75) {
    riskTier = 'HIGH_NON_ADHERENCE_RISK'
    requiresFollowUp = true
  } else if (adherencePercentage < 90) {
    riskTier = 'MODERATE_RISK'
  }

  return { adherencePercentage, riskTier, requiresFollowUp }
}

/** Map a triage ESI level to the appointment urgency enum used by the schema. */
export function urgencyFromEsi(esi: EsiLevel): 'routine' | 'urgent' | 'emergency' {
  if (esi <= 2) return 'emergency'
  if (esi === 3) return 'urgent'
  return 'routine'
}
