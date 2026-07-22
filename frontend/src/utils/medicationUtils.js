/**
 * Utility methods for prescription dosage calculation, schedule validation, and time formatting.
 */

export function parseFrequencyToDailyCount(frequencyString) {
  if (typeof frequencyString !== 'string') return 1;
  const lower = frequencyString.toLowerCase();
  if (lower.includes('4x') || lower.includes('qid')) return 4;
  if (lower.includes('thrice') || lower.includes('3x') || lower.includes('tid')) return 3;
  if (lower.includes('twice') || lower.includes('2x') || lower.includes('bid')) return 2;
  if (lower.includes('once') || lower.includes('1x') || lower.includes('daily')) return 1;
  return 1;
}

export function calculateMedicationDurationDays(startDateStr, endDateStr) {
  if (!startDateStr || !endDateStr) return 0;
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  const diffTime = end.getTime() - start.getTime();
  if (diffTime < 0) return 0;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
}

export function validateDosageInput(dosage, maxAllowedMg = 1000) {
  if (typeof dosage !== 'number' || isNaN(dosage) || dosage <= 0) {
    return { valid: false, message: 'Dosage must be a positive number' };
  }
  if (dosage > maxAllowedMg) {
    return { valid: false, message: `Dosage exceeds maximum threshold of ${maxAllowedMg}mg` };
  }
  return { valid: true, message: 'Dosage valid' };
}

export function calculateRefillDate(startDateStr, totalPills, dailyDoseCount) {
  if (!startDateStr || typeof totalPills !== 'number' || totalPills <= 0 || typeof dailyDoseCount !== 'number' || dailyDoseCount <= 0) {
    return null;
  }
  const start = new Date(startDateStr);
  if (isNaN(start.getTime())) return null;

  const daysSupply = Math.floor(totalPills / dailyDoseCount);
  const refillDate = new Date(start);
  refillDate.setDate(refillDate.getDate() + daysSupply);
  return refillDate.toISOString().split('T')[0];
}

export function checkPotentialDrugInteraction(medList = []) {
  if (!Array.isArray(medList) || medList.length < 2) {
    return { hasInteraction: false, warnings: [] };
  }

  const normalized = medList.map(m => (typeof m === 'string' ? m : m.name || '').toLowerCase().trim());
  const warnings = [];

  const knownPairs = [
    { pair: ['aspirin', 'warfarin'], severity: 'high', note: 'Increased bleeding risk when combining antiplatelet and anticoagulant agents.' },
    { pair: ['ibuprofen', 'aspirin'], severity: 'moderate', note: 'Ibuprofen may decrease the cardioprotective effect of aspirin.' },
    { pair: ['lisinopril', 'spironolactone'], severity: 'high', note: 'Risk of hyperkalemia (high potassium levels).' },
    { pair: ['metformin', 'contrast'], severity: 'high', note: 'Risk of lactic acidosis with iodinated contrast media.' }
  ];

  for (const rule of knownPairs) {
    const [medA, medB] = rule.pair;
    if (normalized.some(m => m.includes(medA)) && normalized.some(m => m.includes(medB))) {
      warnings.push({
        pair: [medA, medB],
        severity: rule.severity,
        note: rule.note
      });
    }
  }

  return {
    hasInteraction: warnings.length > 0,
    warnings
  };
}

export function calculateAdherenceRate(doseLogs = []) {
  if (!Array.isArray(doseLogs) || doseLogs.length === 0) {
    return { percentage: 0, taken: 0, total: 0, status: 'No Data' };
  }

  const total = doseLogs.length;
  const taken = doseLogs.filter(log => log && log.taken === true).length;
  const percentage = Math.round((taken / total) * 100);

  let status = 'Needs Improvement';
  if (percentage >= 90) status = 'Excellent';
  else if (percentage >= 75) status = 'Good';

  return { percentage, taken, total, status };
}

export function generateDoseScheduleTimes(dailyFrequency = 1, startHour = 8) {
  const count = Math.max(1, Math.min(6, typeof dailyFrequency === 'number' ? dailyFrequency : 1));
  const baseHour = Math.max(0, Math.min(23, typeof startHour === 'number' ? startHour : 8));

  const interval = Math.floor(16 / Math.max(1, count));
  const times = [];

  for (let i = 0; i < count; i++) {
    const hour = (baseHour + i * interval) % 24;
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 === 0 ? 12 : hour % 12;
    const formatted = `${displayHour.toString().padStart(2, '0')}:00 ${period}`;
    times.push(formatted);
  }

  return times;
}

export function formatDosageInstructions(medName, dosageMg, frequencyStr, instructions = '') {
  if (!medName || typeof medName !== 'string') return '';
  const dose = typeof dosageMg === 'number' && dosageMg > 0 ? `${dosageMg}mg` : '';
  const freq = typeof frequencyStr === 'string' && frequencyStr.trim() ? frequencyStr.trim() : 'as prescribed';
  const notes = typeof instructions === 'string' && instructions.trim() ? ` — Note: ${instructions.trim()}` : '';
  return `${medName.trim()}${dose ? ' ' + dose : ''} (${freq})${notes}`.trim();
}

export function calculateNextMedicationReminder(schedules = [], currentTimeStr = '') {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return { nextDose: null, message: 'No scheduled doses' };
  }
  const valid = schedules.filter(s => s && typeof s.time === 'string' && s.time.trim());
  if (valid.length === 0) return { nextDose: null, message: 'No valid dose times' };

  const sorted = [...valid].sort((a, b) => a.time.localeCompare(b.time));
  if (!currentTimeStr) {
    return { nextDose: sorted[0], message: `Next dose at ${sorted[0].time}` };
  }

  const upcoming = sorted.find(s => s.time > currentTimeStr);
  const selected = upcoming || sorted[0];
  return {
    nextDose: selected,
    message: upcoming ? `Next dose at ${selected.time}` : `Tomorrow at ${selected.time}`
  };
}

export function calculateMedicationRefillUrgency(currentPills, dailyDoseCount = 1, thresholdDays = 5) {
  if (typeof currentPills !== 'number' || isNaN(currentPills) || currentPills < 0) {
    return { daysRemaining: 0, urgency: 'CRITICAL', needsRefill: true };
  }
  const daily = Math.max(1, typeof dailyDoseCount === 'number' && !isNaN(dailyDoseCount) ? dailyDoseCount : 1);
  const thresh = Math.max(1, typeof thresholdDays === 'number' && !isNaN(thresholdDays) ? thresholdDays : 5);

  const daysRemaining = Math.floor(currentPills / daily);
  const needsRefill = daysRemaining <= thresh;

  let urgency = 'OK';
  if (daysRemaining <= 2) {
    urgency = 'CRITICAL';
  } else if (daysRemaining <= thresh) {
    urgency = 'WARNING';
  }

  return {
    daysRemaining,
    urgency,
    needsRefill
  };
}

export function calculateDailyDoseComplianceScore(doseLogs = [], targetDoseCount = 1) {
  if (!Array.isArray(doseLogs) || doseLogs.length === 0) {
    return { scorePercentage: 0, takenCount: 0, targetCount: Math.max(1, targetDoseCount), isCompliant: false };
  }

  const target = Math.max(1, typeof targetDoseCount === 'number' && !isNaN(targetDoseCount) ? targetDoseCount : 1);
  const takenCount = doseLogs.filter(log => log && (log.taken === true || log.status === 'TAKEN')).length;
  const scorePercentage = Math.min(100, Math.round((takenCount / target) * 100));

  return {
    scorePercentage,
    takenCount,
    targetCount: target,
    isCompliant: scorePercentage >= 80
  };
}

export function formatPrescriptionSummary(medication = {}) {
  if (!medication || typeof medication !== 'object') return 'Invalid medication entry';
  const name = (medication.name || 'Unnamed Medication').trim();
  const dose = medication.dosage ? ` - ${medication.dosage}` : '';
  const freq = medication.frequency ? ` (${medication.frequency})` : '';
  const refills = typeof medication.refills === 'number' ? ` | Refills left: ${medication.refills}` : '';

  return `${name}${dose}${freq}${refills}`.trim();
}

export function calculateBMIAndHealthRiskCategory(weightKg, heightCm) {
  if (typeof weightKg !== 'number' || isNaN(weightKg) || weightKg <= 0 ||
      typeof heightCm !== 'number' || isNaN(heightCm) || heightCm <= 0) {
    return { bmi: 0, category: 'Invalid Input', riskLevel: 'Unknown' };
  }

  const heightM = heightCm / 100;
  const bmi = Math.round((weightKg / (heightM * heightM)) * 10) / 10;

  let category = 'Normal weight';
  let riskLevel = 'Low';

  if (bmi < 18.5) {
    category = 'Underweight';
    riskLevel = 'Moderate';
  } else if (bmi >= 18.5 && bmi < 25) {
    category = 'Normal weight';
    riskLevel = 'Low';
  } else if (bmi >= 25 && bmi < 30) {
    category = 'Overweight';
    riskLevel = 'Increased';
  } else {
    category = 'Obese';
    riskLevel = 'High';
  }

  return { bmi, category, riskLevel };
}

export function calculatePediatricDoseByWeight(adultDoseMg, childWeightKg, adultStandardWeightKg = 70) {
  if (typeof adultDoseMg !== 'number' || isNaN(adultDoseMg) || adultDoseMg <= 0 ||
      typeof childWeightKg !== 'number' || isNaN(childWeightKg) || childWeightKg <= 0) {
    return { valid: false, recommendedDoseMg: 0, percentageOfAdultDose: 0, message: 'Invalid weight or adult dosage input' };
  }

  const stdWeight = typeof adultStandardWeightKg === 'number' && adultStandardWeightKg > 0 ? adultStandardWeightKg : 70;
  const ratio = Math.min(1.0, childWeightKg / stdWeight);
  const recommendedDoseMg = Math.round((adultDoseMg * ratio) * 10) / 10;
  const percentageOfAdultDose = Math.round(ratio * 100);

  return {
    valid: true,
    recommendedDoseMg,
    percentageOfAdultDose,
    childWeightKg,
    adultDoseMg,
    message: `Recommended pediatric dosage: ${recommendedDoseMg}mg (${percentageOfAdultDose}% of adult dose)`
  };
}

export function calculateEstimatedOutofPocketMedicationCost({ retailPriceUsd = 0, copayUsd = null, insuranceCoveragePct = 80, isGeneric = false, genericDiscountPct = 50 } = {}) {
  if (typeof retailPriceUsd !== 'number' || isNaN(retailPriceUsd) || retailPriceUsd <= 0) {
    return { valid: false, outOfPocketCostUsd: 0, savingsUsd: 0, message: 'Invalid retail price' };
  }

  const discount = isGeneric && typeof genericDiscountPct === 'number' && genericDiscountPct >= 0 ? (genericDiscountPct / 100) : 0;
  const effectivePrice = Math.max(0, retailPriceUsd * (1 - discount));

  let outOfPocketCostUsd = effectivePrice;

  if (typeof copayUsd === 'number' && copayUsd >= 0) {
    outOfPocketCostUsd = Math.min(effectivePrice, copayUsd);
  } else if (typeof insuranceCoveragePct === 'number' && insuranceCoveragePct >= 0) {
    const cov = Math.min(100, insuranceCoveragePct) / 100;
    outOfPocketCostUsd = Math.round(effectivePrice * (1 - cov) * 100) / 100;
  }

  const savingsUsd = Math.round((retailPriceUsd - outOfPocketCostUsd) * 100) / 100;

  return {
    valid: true,
    effectivePrice: Math.round(effectivePrice * 100) / 100,
    outOfPocketCostUsd,
    savingsUsd,
    isGeneric: Boolean(isGeneric)
  };
}

export function calculatePatientVitalSignsAlertLevel({ heartRateBpm, systolicBp, diastolicBp, oxygenSaturationPct } = {}) {
  if (
    typeof heartRateBpm !== 'number' || isNaN(heartRateBpm) || heartRateBpm <= 0 ||
    typeof systolicBp !== 'number' || isNaN(systolicBp) || systolicBp <= 0 ||
    typeof diastolicBp !== 'number' || isNaN(diastolicBp) || diastolicBp <= 0 ||
    typeof oxygenSaturationPct !== 'number' || isNaN(oxygenSaturationPct) || oxygenSaturationPct <= 0
  ) {
    return { alertLevel: 'UNKNOWN', requiresImmediateAttention: false, warnings: ['Invalid or incomplete vital signs readings'] };
  }

  const warnings = [];

  if (oxygenSaturationPct < 90) {
    warnings.push(`Severe hypoxia detected (${oxygenSaturationPct}% SpO2)`);
  } else if (oxygenSaturationPct < 95) {
    warnings.push(`Mild hypoxia detected (${oxygenSaturationPct}% SpO2)`);
  }

  if (systolicBp >= 180 || diastolicBp >= 120) {
    warnings.push(`Hypertensive crisis level (${systolicBp}/${diastolicBp} mmHg)`);
  } else if (systolicBp >= 140 || diastolicBp >= 90) {
    warnings.push(`Stage 2 Hypertension (${systolicBp}/${diastolicBp} mmHg)`);
  } else if (systolicBp >= 130 || diastolicBp >= 80) {
    warnings.push(`Stage 1 Hypertension (${systolicBp}/${diastolicBp} mmHg)`);
  }

  if (heartRateBpm > 120) {
    warnings.push(`Tachycardia detected (${heartRateBpm} BPM)`);
  } else if (heartRateBpm < 50) {
    warnings.push(`Bradycardia detected (${heartRateBpm} BPM)`);
  }

  let alertLevel = 'NORMAL';
  if (oxygenSaturationPct < 90 || systolicBp >= 180 || diastolicBp >= 120) {
    alertLevel = 'CRITICAL_ALERT';
  } else if (oxygenSaturationPct < 95 || systolicBp >= 140 || diastolicBp >= 90 || heartRateBpm > 120 || heartRateBpm < 50) {
    alertLevel = 'HIGH_RISK';
  } else if (warnings.length > 0) {
    alertLevel = 'ELEVATED';
  }

  return {
    alertLevel,
    requiresImmediateAttention: alertLevel === 'CRITICAL_ALERT' || alertLevel === 'HIGH_RISK',
    warnings
  };
}

export function calculatePatientWaterHydrationTarget(weightKg, activityMinutes = 0, isHotClimate = false) {
  if (typeof weightKg !== 'number' || isNaN(weightKg) || weightKg <= 0) {
    return { valid: false, targetLiters: 0, targetGlasses: 0, message: 'Invalid body weight input' };
  }

  const baseMl = weightKg * 35; // 35 ml per kg body weight
  const activityMl = (Math.max(0, typeof activityMinutes === 'number' ? activityMinutes : 0) / 30) * 350; // 350 ml per 30 mins activity
  const climateMl = isHotClimate ? 500 : 0;

  const totalMl = Math.round(baseMl + activityMl + climateMl);
  const targetLiters = Math.round((totalMl / 1000) * 10) / 10;
  const targetGlasses = Math.round(totalMl / 250);

  return {
    valid: true,
    totalMl,
    targetLiters,
    targetGlasses,
    message: `Daily fluid target: ${targetLiters}L (${targetGlasses} glasses)`
  };
}

