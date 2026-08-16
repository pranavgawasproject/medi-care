/**
 * Medication interaction & safety assessment utility.
 *
 * Evaluates drug-drug interactions, allergy conflicts, renal dosing
 * adjustments, and age-sensitive risk factors for clinical decision support.
 *
 * Used by the prescription form to surface warnings BEFORE the doctor signs
 * the prescription.
 */

export type InteractionSeverity = 'LOW' | 'MODERATE' | 'HIGH'

export interface DrugInteraction {
  pair: [string, string]
  severity: InteractionSeverity
  impact: number
  description: string
}

export interface AllergyConflict {
  medication: string
  allergy: string
  description: string
}

export interface MedicationSafetyAssessment {
  safetyScore: number
  riskLevel: 'LOW' | 'MODERATE' | 'HIGH'
  interactionCount: number
  severeInteractions: DrugInteraction[]
  allergyConflicts: AllergyConflict[]
  dosageWarnings: string[]
  renalAdjustmentNeeded: boolean
}

interface SeverePair {
  pair: [string, string]
  severity: InteractionSeverity
  impact: number
  description: string
}

const SEVERE_DRUG_PAIRS: SeverePair[] = [
  {
    pair: ['warfarin', 'aspirin'],
    severity: 'HIGH',
    impact: 30,
    description:
      'Increased bleeding risk from combined anticoagulant/antiplatelet effect.',
  },
  {
    pair: ['lisinopril', 'potassium'],
    severity: 'HIGH',
    impact: 25,
    description:
      'Hyperkalemia risk with concurrent ACE inhibitor and potassium supplementation.',
  },
  {
    pair: ['metformin', 'contrast'],
    severity: 'HIGH',
    impact: 25,
    description: 'Lactic acidosis risk with iodinated radiocontrast agents.',
  },
  {
    pair: ['simvastatin', 'amiodarone'],
    severity: 'MODERATE',
    impact: 15,
    description: 'Increased rhabdomyolysis risk due to CYP3A4 inhibition.',
  },
  {
    pair: ['sildenafil', 'nitroglycerin'],
    severity: 'HIGH',
    impact: 35,
    description: 'Severe hypotension hazard with concurrent nitrate therapy.',
  },
  {
    pair: ['tramadol', 'ssri'],
    severity: 'MODERATE',
    impact: 15,
    description: 'Potential serotonin syndrome risk.',
  },
]

const RENAL_SENSITIVE_DRUGS = [
  'metformin',
  'digoxin',
  'gentamicin',
  'ibuprofen',
  'naproxen',
  'gabapentin',
]

const BEERS_CRITERIA_DRUGS = [
  'diphenhydramine',
  'alprazolam',
  'diazepam',
  'zolpidem',
  'indomethacin',
]

export interface MedicationSafetyInput {
  medications?: string[]
  allergies?: string[]
  patientAge?: number
  kidneyFunctionCrCl?: number
}

export function calculatePatientMedicationSafetyScore(
  input: MedicationSafetyInput = {}
): MedicationSafetyAssessment {
  const {
    medications = [],
    allergies = [],
    patientAge = 45,
    kidneyFunctionCrCl = 90,
  } = input

  const normMeds = medications.map((m) => String(m).trim().toLowerCase())
  const normAllergies = allergies.map((a) => String(a).trim().toLowerCase())

  let score = 100
  const severeInteractions: DrugInteraction[] = []
  const allergyConflicts: AllergyConflict[] = []
  const dosageWarnings: string[] = []
  let renalAdjustmentNeeded = false

  // 1. Drug-drug interactions
  SEVERE_DRUG_PAIRS.forEach(({ pair, severity, impact, description }) => {
    const hasFirst = normMeds.some((m) => m.includes(pair[0]))
    const hasSecond = normMeds.some((m) => m.includes(pair[1]))

    if (hasFirst && hasSecond) {
      score -= impact
      severeInteractions.push({ pair, severity, impact, description })
    }
  })

  // 2. Allergy conflicts
  normMeds.forEach((med) => {
    normAllergies.forEach((allergy) => {
      if (med.includes(allergy) || allergy.includes(med)) {
        score -= 30
        allergyConflicts.push({
          medication: med,
          allergy,
          description: `Direct allergy conflict detected between prescribed ${med} and known allergy ${allergy}.`,
        })
      }
    })
  })

  // 3. Renal dose adjustment
  if (kidneyFunctionCrCl < 50) {
    const renalMeds = normMeds.filter((m) =>
      RENAL_SENSITIVE_DRUGS.some((rd) => m.includes(rd))
    )
    if (renalMeds.length > 0) {
      score -= 15 * renalMeds.length
      renalAdjustmentNeeded = true
      dosageWarnings.push(
        `Reduced renal clearance (CrCl ${kidneyFunctionCrCl} mL/min) requires dosage reduction for: ${renalMeds.join(', ')}.`
      )
    }
  }

  // 4. Elderly risk (Beers Criteria)
  if (patientAge >= 65) {
    const highRiskElderly = normMeds.filter((m) =>
      BEERS_CRITERIA_DRUGS.some((bd) => m.includes(bd))
    )
    if (highRiskElderly.length > 0) {
      score -= 10 * highRiskElderly.length
      dosageWarnings.push(
        `Elderly patient (age ${patientAge}) prescribed high-risk geriatric medication(s): ${highRiskElderly.join(', ')}.`
      )
    }
  }

  const finalScore = Math.max(0, Math.min(100, Math.round(score)))

  let riskLevel: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW'
  if (finalScore < 50) riskLevel = 'HIGH'
  else if (finalScore < 80) riskLevel = 'MODERATE'

  return {
    safetyScore: finalScore,
    riskLevel,
    interactionCount: severeInteractions.length,
    severeInteractions,
    allergyConflicts,
    dosageWarnings,
    renalAdjustmentNeeded,
  }
}

/** Convenience wrapper used by the prescription form. */
export function checkMedicationInteractions(medications: string[]): {
  hasHighRisk: boolean
  warnings: string[]
} {
  const assessment = calculatePatientMedicationSafetyScore({ medications })
  const warnings: string[] = []
  for (const i of assessment.severeInteractions) {
    warnings.push(`${i.severity}: ${i.description}`)
  }
  return {
    hasHighRisk: assessment.riskLevel === 'HIGH',
    warnings,
  }
}
