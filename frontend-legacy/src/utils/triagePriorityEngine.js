/**
 * triagePriorityEngine.js
 * Utility engine to calculate clinical emergency severity index (ESI level 1-5),
 * detect vital sign red flags, and compute patient medication adherence risk scores.
 */

/**
 * Calculates ESI triage category and vital sign red flags.
 * @param {object} vitals 
 * @param {number} [vitals.heartRate] BPM
 * @param {number} [vitals.systolicBp] mmHg
 * @param {number} [vitals.diastolicBp] mmHg
 * @param {number} [vitals.spO2] %
 * @param {number} [vitals.tempC] °C
 * @param {number} [vitals.respRate] breaths/min
 * @returns {{ esiLevel: number, category: string, flags: Array<string>, clinicalSummary: string }}
 */
export function calculateTriageCategory(vitals = {}) {
  const flags = [];
  let esiLevel = 5; // default non-urgent

  const { heartRate, systolicBp, diastolicBp, spO2, tempC, respRate } = vitals;

  if (typeof spO2 === 'number' && spO2 < 90) {
    flags.push('HYPOXIA_CRITICAL');
    esiLevel = Math.min(esiLevel, 1);
  } else if (typeof spO2 === 'number' && spO2 < 94) {
    flags.push('OXYGEN_DESATURATION');
    esiLevel = Math.min(esiLevel, 2);
  }

  if (typeof systolicBp === 'number' && (systolicBp >= 180 || (typeof diastolicBp === 'number' && diastolicBp >= 120))) {
    flags.push('HYPERTENSIVE_CRISIS');
    esiLevel = Math.min(esiLevel, 2);
  } else if (typeof systolicBp === 'number' && systolicBp < 90) {
    flags.push('HYPOTENSION_SHOCK_RISK');
    esiLevel = Math.min(esiLevel, 2);
  }

  if (typeof heartRate === 'number' && heartRate > 130) {
    flags.push('SEVERE_TACHYCARDIA');
    esiLevel = Math.min(esiLevel, 2);
  } else if (typeof heartRate === 'number' && heartRate < 45) {
    flags.push('SEVERE_BRADYCARDIA');
    esiLevel = Math.min(esiLevel, 2);
  }

  if (typeof tempC === 'number' && (tempC >= 39.5 || tempC <= 35.0)) {
    flags.push('TEMPERATURE_EXTREME');
    esiLevel = Math.min(esiLevel, 3);
  }

  if (typeof respRate === 'number' && (respRate > 30 || respRate < 10)) {
    flags.push('ABNORMAL_RESPIRATORY_RATE');
    esiLevel = Math.min(esiLevel, 2);
  }

  let category = 'NON_URGENT';
  if (esiLevel === 1) category = 'RESUSCITATION';
  else if (esiLevel === 2) category = 'EMERGENT';
  else if (esiLevel === 3) category = 'URGENT';
  else if (esiLevel === 4) category = 'LESS_URGENT';

  const clinicalSummary = flags.length > 0
    ? `ESI Level ${esiLevel} (${category}): ${flags.join(', ')}`
    : `ESI Level ${esiLevel} (${category}): Normal vital parameters`;

  return {
    esiLevel,
    category,
    flags,
    clinicalSummary
  };
}

/**
 * Calculates medication adherence rate and risk score.
 * @param {number} prescribedDoses 
 * @param {number} takenDoses 
 * @returns {{ adherencePercentage: number, riskTier: string, requiresFollowUp: boolean }}
 */
export function calculateMedicationAdherenceRisk(prescribedDoses = 0, takenDoses = 0) {
  if (typeof prescribedDoses !== 'number' || prescribedDoses <= 0) {
    return { adherencePercentage: 0, riskTier: 'UNKNOWN', requiresFollowUp: false };
  }

  const validTaken = Math.max(0, Math.min(prescribedDoses, Number(takenDoses) || 0));
  const adherencePercentage = Number(((validTaken / prescribedDoses) * 100).toFixed(1));

  let riskTier = 'OPTIMAL';
  let requiresFollowUp = false;

  if (adherencePercentage < 75) {
    riskTier = 'HIGH_NON_ADHERENCE_RISK';
    requiresFollowUp = true;
  } else if (adherencePercentage < 90) {
    riskTier = 'MODERATE_RISK';
  }

  return {
    adherencePercentage,
    riskTier,
    requiresFollowUp
  };
}
