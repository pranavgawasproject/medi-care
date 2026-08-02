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

export function calculateMedicationAdherenceRiskScore({ missedDoses30Days = 0, refillDelayDays = 0, activeMedicationsCount = 1 } = {}) {
  const missed = typeof missedDoses30Days === 'number' && !isNaN(missedDoses30Days) ? Math.max(0, missedDoses30Days) : 0;
  const delay = typeof refillDelayDays === 'number' && !isNaN(refillDelayDays) ? Math.max(0, refillDelayDays) : 0;
  const count = typeof activeMedicationsCount === 'number' && !isNaN(activeMedicationsCount) ? Math.max(1, activeMedicationsCount) : 1;

  let riskScore = 0;
  const riskFactors = [];

  // Missed doses weight (up to 50 pts)
  if (missed >= 6) {
    riskScore += 50;
    riskFactors.push('High frequency of missed doses (6+ in 30 days)');
  } else if (missed >= 3) {
    riskScore += 30;
    riskFactors.push('Moderate missed doses (3-5 in 30 days)');
  } else if (missed >= 1) {
    riskScore += 10;
    riskFactors.push('Occasional missed dose');
  }

  // Refill delay weight (up to 30 pts)
  if (delay >= 7) {
    riskScore += 30;
    riskFactors.push('Severe refill delay (7+ days elapsed)');
  } else if (delay >= 3) {
    riskScore += 15;
    riskFactors.push('Moderate refill delay (3-6 days)');
  }

  // Polypharmacy complexity weight (up to 20 pts)
  if (count >= 5) {
    riskScore += 20;
    riskFactors.push('Polypharmacy complexity (5+ active prescriptions)');
  } else if (count >= 3) {
    riskScore += 10;
    riskFactors.push('Multiple active prescriptions (3-4)');
  }

  riskScore = Math.min(100, riskScore);

  let riskLevel = 'LOW';
  let recommendation = 'Maintain current reminder schedule.';

  if (riskScore >= 60) {
    riskLevel = 'HIGH';
    recommendation = 'Schedule pharmacist follow-up and enable automated SMS / Push refill reminders.';
  } else if (riskScore >= 30) {
    riskLevel = 'MODERATE';
    recommendation = 'Recommend smart pillbox organizer and custom notification sound.';
  }

  return {
    riskScore,
    riskLevel,
    riskFactors,
    recommendation,
    isHighRisk: riskLevel === 'HIGH'
  };
}

export function calculateDoctorSlotOccupancyAndAvailability(schedules = [], appointments = [], targetDoctorId = null) {
  if (!Array.isArray(schedules) || schedules.length === 0) {
    return {
      totalCapacitySlots: 0,
      bookedAppointmentsCount: 0,
      availableSlotsCount: 0,
      occupancyPercentage: 0,
      status: 'AVAILABLE'
    };
  }

  const filteredSchedules = targetDoctorId
    ? schedules.filter(s => s && s.doctor_id === targetDoctorId)
    : schedules;

  const filteredAppointments = targetDoctorId
    ? (Array.isArray(appointments) ? appointments.filter(a => a && a.doctor_id === targetDoctorId && a.status !== 'cancelled') : [])
    : (Array.isArray(appointments) ? appointments.filter(a => a && a.status !== 'cancelled') : []);

  let totalCapacitySlots = 0;
  for (const s of filteredSchedules) {
    if (s && typeof s.available_slots === 'number' && !isNaN(s.available_slots) && s.available_slots > 0) {
      totalCapacitySlots += s.available_slots;
    }
  }

  const bookedAppointmentsCount = filteredAppointments.length;
  const availableSlotsCount = Math.max(0, totalCapacitySlots - bookedAppointmentsCount);
  const occupancyPercentage = totalCapacitySlots > 0
    ? Math.round((bookedAppointmentsCount / totalCapacitySlots) * 100 * 100) / 100
    : 0;

  let status = 'AVAILABLE';
  if (occupancyPercentage >= 100 || availableSlotsCount === 0) {
    status = 'FULL';
  } else if (occupancyPercentage >= 75) {
    status = 'HIGH_DEMAND';
  }

  return {
    totalCapacitySlots,
    bookedAppointmentsCount,
    availableSlotsCount,
    occupancyPercentage,
    status
  };
}

export function calculateEmergencyTriagePriorityLevel({ heartRate = 72, systolicBp = 120, temperatureC = 37.0, painScale = 0, respsPerMin = 16, isUnresponsive = false } = {}) {
  const hr = typeof heartRate === 'number' && !isNaN(heartRate) ? heartRate : 72;
  const sbp = typeof systolicBp === 'number' && !isNaN(systolicBp) ? systolicBp : 120;
  const temp = typeof temperatureC === 'number' && !isNaN(temperatureC) ? temperatureC : 37.0;
  const pain = typeof painScale === 'number' && !isNaN(painScale) ? Math.max(0, Math.min(10, painScale)) : 0;
  const resp = typeof respsPerMin === 'number' && !isNaN(respsPerMin) ? respsPerMin : 16;
  const unresponsive = Boolean(isUnresponsive);

  if (unresponsive || hr < 40 || hr > 150 || sbp < 70) {
    return {
      triageLevel: 1,
      levelLabel: 'LEVEL 1 - RESUSCITATION',
      maxWaitMinutes: 0,
      requiresImmediateResuscitation: true,
      primaryReason: unresponsive ? 'Patient unresponsive' : 'Severe vital sign instability / hemodynamic collapse'
    };
  }

  if (sbp >= 180 || pain >= 8 || temp >= 39.5 || resp > 28) {
    return {
      triageLevel: 2,
      levelLabel: 'LEVEL 2 - EMERGENT',
      maxWaitMinutes: 15,
      requiresImmediateResuscitation: false,
      primaryReason: 'High risk condition, severe pain, or severe physiological distress'
    };
  }

  if (temp >= 38.3 || pain >= 5 || resp >= 22 || hr > 100) {
    return {
      triageLevel: 3,
      levelLabel: 'LEVEL 3 - URGENT',
      maxWaitMinutes: 30,
      requiresImmediateResuscitation: false,
      primaryReason: 'Moderate systemic symptoms or moderate pain requiring timely evaluation'
    };
  }

  if (pain >= 3 || temp > 37.5) {
    return {
      triageLevel: 4,
      levelLabel: 'LEVEL 4 - LESS URGENT',
      maxWaitMinutes: 60,
      requiresImmediateResuscitation: false,
      primaryReason: 'Mild localized symptoms or minor discomfort'
    };
  }

  return {
    triageLevel: 5,
    levelLabel: 'LEVEL 5 - NON-URGENT',
    maxWaitMinutes: 120,
    requiresImmediateResuscitation: false,
    primaryReason: 'Routine health checkup or non-acute presentation'
  };
}

export function calculateMedicationAdherenceRate({ dosesScheduled = 30, dosesTaken = 30 } = {}) {
  const scheduled = typeof dosesScheduled === 'number' && !isNaN(dosesScheduled) && dosesScheduled > 0 ? dosesScheduled : 30;
  const taken = typeof dosesTaken === 'number' && !isNaN(dosesTaken) && dosesTaken >= 0 ? dosesTaken : 0;

  const validTaken = Math.min(scheduled, taken);
  const adherencePercentage = Math.min(100, Math.round((validTaken / scheduled) * 100 * 100) / 100);
  const missedDosesCount = Math.max(0, scheduled - validTaken);

  let riskTier = 'OPTIMAL';
  let isAlertTriggered = false;
  let clinicalAdvice = 'Excellent adherence. Keep maintaining your daily dosage schedule.';

  if (adherencePercentage < 70) {
    riskTier = 'NON_ADHERENT';
    isAlertTriggered = true;
    clinicalAdvice = 'High risk of therapeutic failure. Urgent clinical follow-up or automated pill reminder recommended.';
  } else if (adherencePercentage < 85) {
    riskTier = 'SUB_OPTIMAL';
    isAlertTriggered = true;
    clinicalAdvice = 'Sub-optimal adherence. Consider setting daily alarm reminders to avoid missed doses.';
  }

  return {
    valid: true,
    dosesScheduled: scheduled,
    dosesTaken: validTaken,
    missedDosesCount,
    adherencePercentage,
    riskTier,
    isAlertTriggered,
    clinicalAdvice
  };
}

export function calculateTelehealthSlotOptimizationScore({
  doctorAvailableHours = 6,
  bookedSlots = 4,
  patientUrgencyLevel = 'MEDIUM',
  isFollowUpAppointment = false
} = {}) {
  if (typeof doctorAvailableHours !== 'number' || doctorAvailableHours <= 0 || isNaN(doctorAvailableHours)) {
    return { valid: false, error: 'Doctor available hours must be a positive number' };
  }
  if (typeof bookedSlots !== 'number' || bookedSlots < 0 || isNaN(bookedSlots)) {
    return { valid: false, error: 'Booked slots must be a non-negative number' };
  }

  const maxSlots = Math.floor(doctorAvailableHours * 4);
  const remainingSlots = Math.max(0, maxSlots - bookedSlots);
  const occupancyPercentage = Math.min(100, Math.round((bookedSlots / maxSlots) * 100));

  let priorityWeight = 1.0;
  if (patientUrgencyLevel === 'HIGH' || patientUrgencyLevel === 'CRITICAL') priorityWeight = 2.5;
  else if (patientUrgencyLevel === 'MEDIUM') priorityWeight = 1.5;

  if (isFollowUpAppointment) priorityWeight += 0.5;

  const slotScore = Math.min(100, Math.round((remainingSlots / maxSlots) * 50 + (priorityWeight * 20)));

  return {
    valid: true,
    maxSlots,
    bookedSlots,
    remainingSlots,
    occupancyPercentage,
    priorityWeight,
    slotScore,
    isHighPrioritySlot: priorityWeight >= 2.0,
    recommendation: remainingSlots < 2
      ? 'Limited availability. Reserve slot immediately for priority case.'
      : 'Sufficient slots available for routine scheduling.'
  };
}

export function calculateMedicationInteractionRiskScore({
  activeMedications = [],
  knownAllergies = [],
  hasRenalImpairment = false
} = {}) {
  const meds = Array.isArray(activeMedications) ? activeMedications.map(m => (typeof m === 'string' ? m : m.name || '').trim().toLowerCase()).filter(Boolean) : [];
  const allergies = Array.isArray(knownAllergies) ? knownAllergies.map(a => (typeof a === 'string' ? a : a.name || '').trim().toLowerCase()).filter(Boolean) : [];

  let score = 0;
  const warnings = [];

  if (meds.length >= 5) {
    score += 30;
    warnings.push('Polypharmacy risk: 5+ concurrent medications');
  } else if (meds.length >= 3) {
    score += 15;
  }

  if (hasRenalImpairment) {
    score += 25;
    warnings.push('Renal clearance adjustment required');
  }

  // Check for allergy matches
  for (const m of meds) {
    if (allergies.some(a => m.includes(a) || a.includes(m))) {
      score += 40;
      warnings.push(`Potential allergy flag for medication: ${m}`);
    }
  }

  score = Math.min(100, score);

  let riskTier = 'LOW';
  if (score >= 60) riskTier = 'CRITICAL';
  else if (score >= 35) riskTier = 'MODERATE';

  return {
    valid: true,
    medicationCount: meds.length,
    interactionRiskScore: score,
    riskTier,
    hasAllergyConflict: score >= 40,
    warnings,
    clinicalRecommendation: score >= 60
      ? 'High risk profile: Request immediate clinical pharmacy review.'
      : 'Low to moderate interaction risk: Standard dosing schedule.'
  };
}

export function calculatePatientVitalSignStabilityIndex({
  systolicBp = 120,
  diastolicBp = 80,
  heartRate = 72,
  oxygenSatPercentage = 98,
  temperatureC = 37.0
} = {}) {
  if (typeof systolicBp !== 'number' || systolicBp <= 0 || isNaN(systolicBp)) {
    return { valid: false, error: 'Systolic blood pressure must be a positive number' };
  }
  if (typeof diastolicBp !== 'number' || diastolicBp <= 0 || isNaN(diastolicBp)) {
    return { valid: false, error: 'Diastolic blood pressure must be a positive number' };
  }

  let stabilityIndex = 100;
  const flags = [];

  if (systolicBp > 140 || systolicBp < 90) {
    stabilityIndex -= 20;
    flags.push(systolicBp > 140 ? 'High Systolic BP' : 'Low Systolic BP');
  }

  if (diastolicBp > 90 || diastolicBp < 60) {
    stabilityIndex -= 15;
    flags.push(diastolicBp > 90 ? 'High Diastolic BP' : 'Low Diastolic BP');
  }

  const hr = typeof heartRate === 'number' && !isNaN(heartRate) ? heartRate : 72;
  if (hr > 100 || hr < 50) {
    stabilityIndex -= 20;
    flags.push(hr > 100 ? 'Tachycardia' : 'Bradycardia');
  }

  const spo2 = typeof oxygenSatPercentage === 'number' && !isNaN(oxygenSatPercentage) ? oxygenSatPercentage : 98;
  if (spo2 < 95) {
    stabilityIndex -= 25;
    flags.push('Low Oxygen Saturation (<95%)');
  }

  const temp = typeof temperatureC === 'number' && !isNaN(temperatureC) ? temperatureC : 37.0;
  if (temp > 37.8 || temp < 36.0) {
    stabilityIndex -= 15;
    flags.push(temp > 37.8 ? 'Fever / Pyrexia' : 'Hypothermia risk');
  }

  stabilityIndex = Math.max(0, stabilityIndex);

  let clinicalTier = 'OPTIMAL';
  if (stabilityIndex < 60) clinicalTier = 'CRITICAL';
  else if (stabilityIndex < 85) clinicalTier = 'WATCH';

  return {
    valid: true,
    systolicBp,
    diastolicBp,
    heartRate: hr,
    oxygenSatPercentage: spo2,
    temperatureC: temp,
    stabilityIndex,
    clinicalTier,
    isStable: stabilityIndex >= 70,
    flags,
    recommendation: stabilityIndex >= 85
      ? 'Vital signs within target therapeutic range.'
      : 'Vitals require close clinical observation and potential physician consult.'
  };
}

export function calculatePatientAppointmentTriagePriority({
  symptomSeverityScore = 5,
  waitTimeMinutes = 20,
  hasPreExistingCondition = false,
  ageYears = 45
} = {}) {
  if (typeof symptomSeverityScore !== 'number' || symptomSeverityScore < 1 || symptomSeverityScore > 10 || isNaN(symptomSeverityScore)) {
    return { valid: false, error: 'Symptom severity score must be a number between 1 and 10' };
  }

  const wait = typeof waitTimeMinutes === 'number' && waitTimeMinutes >= 0 ? waitTimeMinutes : 0;
  const age = typeof ageYears === 'number' && ageYears > 0 ? ageYears : 45;

  let priorityScore = symptomSeverityScore * 10;
  if (wait > 45) priorityScore += 15;
  else if (wait > 30) priorityScore += 10;

  if (hasPreExistingCondition) priorityScore += 15;
  if (age > 65 || age < 5) priorityScore += 10;

  priorityScore = Math.min(100, Math.round(priorityScore));

  let triageCategory = 'LOW';
  if (priorityScore >= 80) triageCategory = 'EMERGENCY';
  else if (priorityScore >= 60) triageCategory = 'HIGH';
  else if (priorityScore >= 40) triageCategory = 'MEDIUM';

  return {
    valid: true,
    symptomSeverityScore,
    waitTimeMinutes: wait,
    hasPreExistingCondition: Boolean(hasPreExistingCondition),
    ageYears: age,
    priorityScore,
    triageCategory,
    isUrgent: triageCategory === 'EMERGENCY' || triageCategory === 'HIGH',
    recommendation: priorityScore >= 80
      ? 'Immediate clinical evaluation required (Emergency Triage).'
      : 'Standard intake queue processing.'
  };
}

export function calculatePatientPrescriptionRefillRiskIndex({
  daysSupplyRemaining = 5,
  pharmacyProcessingDays = 3,
  isControlledSubstance = false,
  hasRefillsRemaining = true
} = {}) {
  if (typeof daysSupplyRemaining !== 'number' || daysSupplyRemaining < 0 || isNaN(daysSupplyRemaining)) {
    return { valid: false, error: 'Days supply remaining must be a non-negative number' };
  }

  const processing = typeof pharmacyProcessingDays === 'number' && pharmacyProcessingDays >= 0 ? pharmacyProcessingDays : 3;
  const leadBufferDays = daysSupplyRemaining - processing;

  let riskScore = 20;
  if (!hasRefillsRemaining) riskScore += 40;
  if (leadBufferDays <= 1) riskScore += 30;
  else if (leadBufferDays <= 3) riskScore += 15;
  if (isControlledSubstance) riskScore += 15;

  riskScore = Math.min(100, riskScore);

  let riskLevel = 'LOW';
  if (riskScore >= 75) riskLevel = 'CRITICAL';
  else if (riskScore >= 50) riskLevel = 'HIGH';
  else if (riskScore >= 35) riskLevel = 'MODERATE';

  return {
    valid: true,
    daysSupplyRemaining,
    pharmacyProcessingDays: processing,
    leadBufferDays,
    isControlledSubstance,
    hasRefillsRemaining,
    riskScore,
    riskLevel,
    isStockoutRisk: leadBufferDays <= 1 || !hasRefillsRemaining,
    recommendation: leadBufferDays <= 1 || !hasRefillsRemaining
      ? 'Immediate refill processing required to prevent medication gap.'
      : 'Adequate supply buffer remaining for standard refill processing.'
  };
}

export function calculatePatientPolypharmacyRiskIndex({
  activeMedicationCount = 1,
  patientAgeYears = 45,
  hasHepaticImpairment = false,
  hasRenalImpairment = false
} = {}) {
  if (typeof activeMedicationCount !== 'number' || activeMedicationCount < 0 || isNaN(activeMedicationCount)) {
    return { valid: false, error: 'Active medication count must be a non-negative number' };
  }
  if (typeof patientAgeYears !== 'number' || patientAgeYears < 0 || isNaN(patientAgeYears)) {
    return { valid: false, error: 'Patient age must be a non-negative number' };
  }

  let riskScore = Math.min(50, activeMedicationCount * 8);
  if (patientAgeYears >= 65) riskScore += 15;
  if (hasHepaticImpairment) riskScore += 15;
  if (hasRenalImpairment) riskScore += 20;

  riskScore = Math.min(100, Math.round(riskScore));

  let riskLevel = 'LOW';
  if (riskScore >= 75) riskLevel = 'CRITICAL';
  else if (riskScore >= 50) riskLevel = 'HIGH';
  else if (riskScore >= 30) riskLevel = 'MODERATE';

  let recommendation = 'Low polypharmacy risk. Standard medication review frequency.';
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    recommendation = 'High polypharmacy risk: Recommend clinical pharmacist review for potential drug-drug interactions and deprescribing options.';
  } else if (riskLevel === 'MODERATE') {
    recommendation = 'Moderate polypharmacy risk: Monitor for side effects and ensure dose adjustments for organ function.';
  }

  return {
    valid: true,
    activeMedicationCount,
    patientAgeYears,
    hasHepaticImpairment,
    hasRenalImpairment,
    riskScore,
    riskLevel,
    isHighRisk: riskLevel === 'HIGH' || riskLevel === 'CRITICAL',
    recommendation
  };
}

export function calculatePatientReadmissionRiskScore({
  patientAgeYears = 65,
  priorHospitalizationsCount = 0,
  activeMedicationCount = 4,
  vitalStabilityIndex = 80,
  hasChronicConditions = false
} = {}) {
  if (typeof patientAgeYears !== 'number' || patientAgeYears < 0 || isNaN(patientAgeYears)) {
    return { valid: false, error: 'Patient age must be a non-negative number' };
  }

  let riskScore = 15;
  if (patientAgeYears >= 75) riskScore += 20;
  else if (patientAgeYears >= 65) riskScore += 10;

  const prior = typeof priorHospitalizationsCount === 'number' && priorHospitalizationsCount > 0 ? priorHospitalizationsCount : 0;
  riskScore += Math.min(30, prior * 10);

  const meds = typeof activeMedicationCount === 'number' && activeMedicationCount > 0 ? activeMedicationCount : 0;
  if (meds >= 5) riskScore += 15;

  const vitals = typeof vitalStabilityIndex === 'number' ? vitalStabilityIndex : 80;
  if (vitals < 70) riskScore += 20;

  if (hasChronicConditions) riskScore += 15;

  riskScore = Math.min(100, Math.round(riskScore));

  let riskLevel = 'LOW';
  if (riskScore >= 70) riskLevel = 'HIGH';
  else if (riskScore >= 45) riskLevel = 'MODERATE';

  return {
    valid: true,
    patientAgeYears,
    priorHospitalizationsCount: prior,
    activeMedicationCount: meds,
    vitalStabilityIndex: vitals,
    hasChronicConditions: Boolean(hasChronicConditions),
    riskScore,
    riskLevel,
    isHighReadmissionRisk: riskLevel === 'HIGH',
    recommendation: riskLevel === 'HIGH'
      ? 'High 30-day readmission risk: Assign dedicated care manager and schedule post-discharge follow-up within 48 hours.'
      : 'Standard post-discharge monitoring and routine care plan.'
  };
}

export function calculatePatientMedicationAdherenceTier({
  totalPrescribedDoses = 30,
  totalDosesTaken = 28,
  lateDosesCount = 2,
  sideEffectEventsCount = 0
} = {}) {
  if (typeof totalPrescribedDoses !== 'number' || totalPrescribedDoses <= 0 || isNaN(totalPrescribedDoses)) {
    return { valid: false, error: 'Total prescribed doses must be a positive number' };
  }
  if (typeof totalDosesTaken !== 'number' || totalDosesTaken < 0 || isNaN(totalDosesTaken)) {
    return { valid: false, error: 'Total doses taken must be a non-negative number' };
  }

  const prescribed = Math.floor(totalPrescribedDoses);
  const taken = Math.min(prescribed, Math.floor(totalDosesTaken));
  const late = Math.max(0, typeof lateDosesCount === 'number' ? Math.floor(lateDosesCount) : 0);
  const sideEffects = Math.max(0, typeof sideEffectEventsCount === 'number' ? Math.floor(sideEffectEventsCount) : 0);

  const rawComplianceRatio = (taken / prescribed);
  let score = rawComplianceRatio * 80;
  if (late === 0) score += 10;
  else score = Math.max(0, score - (late * 2));

  if (sideEffects > 0) score = Math.max(0, score - (sideEffects * 5));

  const adherenceScore = Math.round(Math.min(100, score));

  let tier = 'POOR';
  if (adherenceScore >= 85) tier = 'EXCELLENT';
  else if (adherenceScore >= 70) tier = 'MODERATE';

  return {
    valid: true,
    totalPrescribedDoses: prescribed,
    totalDosesTaken: taken,
    compliancePercentage: Math.round(rawComplianceRatio * 100),
    adherenceScore,
    tier,
    isCompliant: adherenceScore >= 70,
    recommendation: adherenceScore >= 85
      ? 'Optimal patient medication adherence.'
      : 'Review dosage schedule and address side effect concerns with patient.'
  };
}

export function calculatePatientEmergencyRiskScore({
  heartRateBpm = 75,
  systolicBp = 120,
  oxygenSaturationPercent = 98,
  bodyTempCelsius = 37.0,
  respiratoryRateBpm = 16,
  hasChestPain = false,
  hasShortnessOfBreath = false
} = {}) {
  if (typeof heartRateBpm !== 'number' || heartRateBpm <= 0 || isNaN(heartRateBpm)) {
    return { valid: false, error: 'Heart rate must be a positive number' };
  }
  if (typeof systolicBp !== 'number' || systolicBp <= 0 || isNaN(systolicBp)) {
    return { valid: false, error: 'Systolic BP must be a positive number' };
  }
  if (typeof oxygenSaturationPercent !== 'number' || oxygenSaturationPercent <= 0 || oxygenSaturationPercent > 100 || isNaN(oxygenSaturationPercent)) {
    return { valid: false, error: 'Oxygen saturation must be between 1 and 100%' };
  }

  let riskPoints = 0;
  if (heartRateBpm > 110 || heartRateBpm < 45) riskPoints += 20;
  else if (heartRateBpm > 100 || heartRateBpm < 50) riskPoints += 10;

  if (systolicBp > 160 || systolicBp < 85) riskPoints += 25;
  else if (systolicBp > 140 || systolicBp < 90) riskPoints += 12;

  if (oxygenSaturationPercent < 90) riskPoints += 30;
  else if (oxygenSaturationPercent < 94) riskPoints += 15;

  if (bodyTempCelsius > 39.0 || bodyTempCelsius < 35.0) riskPoints += 15;
  else if (bodyTempCelsius > 38.0) riskPoints += 8;

  if (respiratoryRateBpm > 25 || respiratoryRateBpm < 10) riskPoints += 20;
  else if (respiratoryRateBpm > 20) riskPoints += 10;

  if (hasChestPain) riskPoints += 35;
  if (hasShortnessOfBreath) riskPoints += 30;

  const totalRiskScore = Math.min(100, Math.round(riskPoints));

  let triageTier = 'STABLE';
  if (totalRiskScore >= 75) triageTier = 'CRITICAL';
  else if (totalRiskScore >= 50) triageTier = 'HIGH';
  else if (totalRiskScore >= 25) triageTier = 'MODERATE';

  let recommendation = 'Patient vitals within normal parameters. Routine monitoring.';
  if (triageTier === 'CRITICAL') {
    recommendation = 'CRITICAL ALERT: Immediate emergency department escalation or intensive care triage required.';
  } else if (triageTier === 'HIGH') {
    recommendation = 'HIGH RISK: Urgent clinical evaluation required within 1 hour.';
  } else if (triageTier === 'MODERATE') {
    recommendation = 'MODERATE RISK: Schedule same-day physician evaluation and monitor vitals closely.';
  }

  return {
    valid: true,
    heartRateBpm,
    systolicBp,
    oxygenSaturationPercent,
    bodyTempCelsius,
    respiratoryRateBpm,
    hasChestPain: Boolean(hasChestPain),
    hasShortnessOfBreath: Boolean(hasShortnessOfBreath),
    totalRiskScore,
    triageTier,
    isEmergencyEscalationRequired: triageTier === 'CRITICAL' || triageTier === 'HIGH',
    recommendation
  };
}

export function calculatePatientAppointmentNoShowProbability({
  pastNoShowCount = 1,
  totalAppointmentsBooked = 5,
  distanceToClinicKm = 10,
  appointmentLeadDays = 7,
  reminderSent = true
} = {}) {
  if (typeof totalAppointmentsBooked !== 'number' || totalAppointmentsBooked <= 0 || isNaN(totalAppointmentsBooked)) {
    return { valid: false, error: 'Total appointments booked must be a positive number' };
  }

  const noShows = typeof pastNoShowCount === 'number' && pastNoShowCount >= 0 ? pastNoShowCount : 0;
  const leadDays = typeof appointmentLeadDays === 'number' && appointmentLeadDays >= 0 ? appointmentLeadDays : 0;
  const distance = typeof distanceToClinicKm === 'number' && distanceToClinicKm >= 0 ? distanceToClinicKm : 0;

  const historicalNoShowRate = Math.min(1.0, noShows / Math.max(1, totalAppointmentsBooked));
  let baseScore = historicalNoShowRate * 50;

  if (leadDays > 14) baseScore += 20;
  else if (leadDays > 7) baseScore += 10;

  if (distance > 25) baseScore += 15;
  else if (distance > 10) baseScore += 8;

  if (!reminderSent) baseScore += 15;

  const noShowProbabilityScore = Math.min(100, Math.round(baseScore));

  let riskTier = 'LOW_RISK';
  if (noShowProbabilityScore >= 60) riskTier = 'HIGH_RISK';
  else if (noShowProbabilityScore >= 35) riskTier = 'MODERATE_RISK';

  let recommendation = 'Low risk of appointment no-show. Standard reminder schedule.';
  if (riskTier === 'HIGH_RISK') {
    recommendation = 'High no-show risk: Send automated SMS/phone confirmation and consider overbooking/standby slot.';
  } else if (riskTier === 'MODERATE_RISK') {
    recommendation = 'Moderate no-show risk: Send 24-hour reminder prompt.';
  }

  return {
    valid: true,
    pastNoShowCount: noShows,
    totalAppointmentsBooked,
    distanceToClinicKm: distance,
    appointmentLeadDays: leadDays,
    reminderSent: Boolean(reminderSent),
    noShowProbabilityScore,
    riskTier,
    requiresConfirmationCall: riskTier === 'HIGH_RISK',
    recommendation
  };
}

export function calculatePatientChronicConditionComplexityIndex({
  chronicConditionCount = 2,
  activeMedicationCount = 4,
  hospitalizationPastYearCount = 0,
  ageYears = 60,
  hasSpecialistCare = true
} = {}) {
  if (typeof chronicConditionCount !== 'number' || chronicConditionCount < 0 || isNaN(chronicConditionCount)) {
    return { valid: false, error: 'Chronic condition count must be a non-negative number' };
  }
  if (typeof activeMedicationCount !== 'number' || activeMedicationCount < 0 || isNaN(activeMedicationCount)) {
    return { valid: false, error: 'Active medication count must be a non-negative number' };
  }

  const age = typeof ageYears === 'number' && ageYears >= 0 ? ageYears : 50;
  const hospitalizations = typeof hospitalizationPastYearCount === 'number' && hospitalizationPastYearCount >= 0 ? hospitalizationPastYearCount : 0;

  let score = chronicConditionCount * 15 + activeMedicationCount * 5 + hospitalizations * 20;

  if (age >= 65) score += 10;
  if (!hasSpecialistCare && chronicConditionCount >= 3) score += 15;

  const complexityScore = Math.min(100, Math.round(score));

  let complexityTier = 'LOW_COMPLEXITY';
  if (complexityScore >= 65) complexityTier = 'HIGH_COMPLEXITY';
  else if (complexityScore >= 35) complexityTier = 'MODERATE_COMPLEXITY';

  let recommendation = 'Standard primary care follow-up schedule.';
  if (complexityTier === 'HIGH_COMPLEXITY') {
    recommendation = 'Assign multidisciplinary care coordinator and schedule monthly medication review.';
  } else if (complexityTier === 'MODERATE_COMPLEXITY') {
    recommendation = 'Schedule quarterly chronic disease management review.';
  }

  return {
    valid: true,
    chronicConditionCount,
    activeMedicationCount,
    hospitalizationPastYearCount: hospitalizations,
    ageYears: age,
    hasSpecialistCare: Boolean(hasSpecialistCare),
    complexityScore,
    complexityTier,
    requiresMultidisciplinaryCare: complexityTier === 'HIGH_COMPLEXITY',
    recommendation
  };
}

export function calculatePatientMedicationRefillAdherenceScore({
  totalPrescriptions = 3,
  refilledOnTimeCount = 3,
  missedDosesPastMonth = 0,
  refillDelayDaysAvg = 0
} = {}) {
  if (typeof totalPrescriptions !== 'number' || totalPrescriptions <= 0 || isNaN(totalPrescriptions)) {
    return { valid: false, error: 'Total prescriptions must be a positive number' };
  }

  const onTime = typeof refilledOnTimeCount === 'number' && refilledOnTimeCount >= 0 ? Math.min(refilledOnTimeCount, totalPrescriptions) : 0;
  const missed = typeof missedDosesPastMonth === 'number' && missedDosesPastMonth >= 0 ? missedDosesPastMonth : 0;
  const delay = typeof refillDelayDaysAvg === 'number' && refillDelayDaysAvg >= 0 ? refillDelayDaysAvg : 0;

  const refillOnTimeRate = (onTime / totalPrescriptions) * 100;
  let score = refillOnTimeRate - (missed * 5) - (delay * 3);
  score = Math.max(0, Math.min(100, Math.round(score)));

  let adherenceTier = 'HIGH_ADHERENCE';
  if (score < 50) adherenceTier = 'POOR_ADHERENCE';
  else if (score < 80) adherenceTier = 'MODERATE_RISK';

  let recommendation = 'Optimal medication adherence. Continue routine refills.';
  if (adherenceTier === 'POOR_ADHERENCE') {
    recommendation = 'HIGH CLINICAL RISK: Severe non-adherence detected. Pharmacist consultation and automated SMS pill reminders required.';
  } else if (adherenceTier === 'MODERATE_RISK') {
    recommendation = 'MODERATE RISK: Occasional missed doses or refill delays. Recommend setting up auto-refills.';
  }

  return {
    valid: true,
    totalPrescriptions,
    refilledOnTimeCount: onTime,
    missedDosesPastMonth: missed,
    refillDelayDaysAvg: delay,
    refillOnTimeRate: Math.round(refillOnTimeRate),
    adherenceScore: score,
    adherenceTier,
    isInterventionRequired: adherenceTier === 'POOR_ADHERENCE',
    recommendation
  };
}

export function calculatePatientMedicationStorageTemperatureSafety({
  storageTemperatureCelsius = 22.0,
  minAllowedCelsius = 15.0,
  maxAllowedCelsius = 25.0,
  exposureDurationHours = 0,
  isRefrigeratedItem = false
} = {}) {
  if (typeof storageTemperatureCelsius !== 'number' || isNaN(storageTemperatureCelsius)) {
    return { valid: false, error: 'Storage temperature must be a valid number' };
  }

  const minTemp = typeof minAllowedCelsius === 'number' ? minAllowedCelsius : (isRefrigeratedItem ? 2.0 : 15.0);
  const maxTemp = typeof maxAllowedCelsius === 'number' ? maxAllowedCelsius : (isRefrigeratedItem ? 8.0 : 25.0);
  const duration = typeof exposureDurationHours === 'number' && exposureDurationHours >= 0 ? exposureDurationHours : 0;

  const isExcursion = storageTemperatureCelsius < minTemp || storageTemperatureCelsius > maxTemp;
  let safetyTier = 'OPTIMAL';
  let isPotencyCompromised = false;

  if (isExcursion) {
    if (duration > 24 || storageTemperatureCelsius > maxTemp + 10 || storageTemperatureCelsius < minTemp - 10) {
      safetyTier = 'CRITICAL_EXCURSION';
      isPotencyCompromised = true;
    } else if (duration > 4) {
      safetyTier = 'MODERATE_EXCURSION';
    } else {
      safetyTier = 'MINOR_EXCURSION';
    }
  }

  let recommendation = 'Storage temperature is within safe specification.';
  if (safetyTier === 'CRITICAL_EXCURSION') {
    recommendation = 'Potency likely compromised due to severe or prolonged temperature excursion. Replace medication immediately.';
  } else if (safetyTier === 'MODERATE_EXCURSION') {
    recommendation = 'Temperature excursion recorded. Consult pharmacist before administering.';
  } else if (safetyTier === 'MINOR_EXCURSION') {
    recommendation = 'Brief minor temperature drift. Return to recommended storage temperature range.';
  }

  return {
    valid: true,
    storageTemperatureCelsius,
    minAllowedCelsius: minTemp,
    maxAllowedCelsius: maxTemp,
    exposureDurationHours: duration,
    isRefrigeratedItem: Boolean(isRefrigeratedItem),
    isExcursion,
    safetyTier,
    isPotencyCompromised,
    recommendation
  };
}

export function calculatePatientVitalSignAnomalyAlertScore({
  systolicBp = 120,
  diastolicBp = 80,
  heartRateBpm = 72,
  oxygenSaturationPct = 98,
  bodyTemperatureC = 37.0
} = {}) {
  const sbp = typeof systolicBp === 'number' && !isNaN(systolicBp) ? systolicBp : 120;
  const dbp = typeof diastolicBp === 'number' && !isNaN(diastolicBp) ? diastolicBp : 80;
  const hr = typeof heartRateBpm === 'number' && !isNaN(heartRateBpm) ? heartRateBpm : 72;
  const spo2 = typeof oxygenSaturationPct === 'number' && !isNaN(oxygenSaturationPct) ? oxygenSaturationPct : 98;
  const temp = typeof bodyTemperatureC === 'number' && !isNaN(bodyTemperatureC) ? bodyTemperatureC : 37.0;

  let anomalyScore = 0;
  const warnings = [];

  if (sbp >= 180 || dbp >= 120) {
    anomalyScore += 40;
    warnings.push('Hypertensive Crisis');
  } else if (sbp >= 140 || dbp >= 90) {
    anomalyScore += 20;
    warnings.push('Elevated Blood Pressure');
  } else if (sbp < 90) {
    anomalyScore += 30;
    warnings.push('Hypotension');
  }

  if (spo2 < 90) {
    anomalyScore += 40;
    warnings.push('Severe Hypoxia');
  } else if (spo2 < 95) {
    anomalyScore += 20;
    warnings.push('Mild Hypoxia');
  }

  if (hr > 120) {
    anomalyScore += 20;
    warnings.push('Tachycardia');
  } else if (hr < 50) {
    anomalyScore += 20;
    warnings.push('Bradycardia');
  }

  if (temp >= 39.0) {
    anomalyScore += 20;
    warnings.push('High Fever');
  } else if (temp < 35.0) {
    anomalyScore += 30;
    warnings.push('Hypothermia');
  }

  const finalScore = Math.min(100, anomalyScore);
  let alertTier = 'NORMAL';
  if (finalScore >= 60) alertTier = 'CRITICAL_ALERT';
  else if (finalScore >= 30) alertTier = 'WARNING';
  else if (finalScore > 0) alertTier = 'MILD_ANOMALY';

  return {
    valid: true,
    systolicBp: sbp,
    diastolicBp: dbp,
    heartRateBpm: hr,
    oxygenSaturationPct: spo2,
    bodyTemperatureC: temp,
    anomalyScore: finalScore,
    alertTier,
    isUrgentCareNeeded: alertTier === 'CRITICAL_ALERT',
    warnings,
    recommendation: alertTier === 'CRITICAL_ALERT'
      ? `CRITICAL CLINICAL ALERT: Severe vital sign anomalies (${warnings.join(', ')}). Dispatch emergency response or immediate triage.`
      : alertTier === 'WARNING'
      ? `CLINICAL WARNING: Vital sign deviations (${warnings.join(', ')}). Monitor patient and schedule physician review.`
      : 'Patient vital signs are within normal clinical thresholds.'
  };
}

export function calculatePatientLabTestResultSeverityScore({
  hba1cPct = 5.6,
  fastingGlucoseMgDl = 95,
  creatinineMgDl = 0.9,
  altLiverEnzymeUL = 25
} = {}) {
  const hba1c = typeof hba1cPct === 'number' && hba1cPct > 0 ? hba1cPct : 5.6;
  const glucose = typeof fastingGlucoseMgDl === 'number' && fastingGlucoseMgDl > 0 ? fastingGlucoseMgDl : 95;
  const creatinine = typeof creatinineMgDl === 'number' && creatinineMgDl > 0 ? creatinineMgDl : 0.9;
  const alt = typeof altLiverEnzymeUL === 'number' && altLiverEnzymeUL > 0 ? altLiverEnzymeUL : 25;

  let severityScore = 0;
  const abnormalMarkers = [];

  if (hba1c >= 9.0) {
    severityScore += 35;
    abnormalMarkers.push('Severe Diabetes (HbA1c >= 9.0%)');
  } else if (hba1c >= 6.5) {
    severityScore += 20;
    abnormalMarkers.push('Elevated HbA1c (Diabetic Range)');
  }

  if (glucose >= 200) {
    severityScore += 25;
    abnormalMarkers.push('Severe Hyperglycemia');
  } else if (glucose >= 126) {
    severityScore += 15;
    abnormalMarkers.push('High Fasting Glucose');
  }

  if (creatinine >= 2.0) {
    severityScore += 30;
    abnormalMarkers.push('Impaired Renal Function (High Creatinine)');
  } else if (creatinine > 1.3) {
    severityScore += 15;
    abnormalMarkers.push('Mildly Elevated Creatinine');
  }

  if (alt >= 100) {
    severityScore += 20;
    abnormalMarkers.push('Elevated ALT (Hepatic Stress)');
  }

  const finalScore = Math.min(100, severityScore);
  let severityTier = 'NORMAL';
  if (finalScore >= 50) severityTier = 'HIGH_SEVERITY';
  else if (finalScore >= 20) severityTier = 'MODERATE_SEVERITY';

  return {
    valid: true,
    hba1cPct: hba1c,
    fastingGlucoseMgDl: glucose,
    creatinineMgDl: creatinine,
    altLiverEnzymeUL: alt,
    severityScore: finalScore,
    severityTier,
    abnormalMarkers,
    isFollowUpRequired: finalScore >= 20,
    recommendation: severityTier === 'HIGH_SEVERITY'
      ? `HIGH SEVERITY LAB RESULTS (${abnormalMarkers.join(', ')}). Immediate physician consultation and dose adjustment required.`
      : severityTier === 'MODERATE_SEVERITY'
      ? `MODERATE SEVERITY (${abnormalMarkers.join(', ')}). Schedule follow-up lab review.`
      : 'All primary lab biomarkers are within normal reference ranges.'
  };
}

export function calculateTelehealthSlotOptimizationIndex({
  totalDoctors = 5,
  totalPatientAppointments = 45,
  maxSlotsPerDoctorDay = 10,
  averageConsultationDurationMins = 20
} = {}) {
  if (typeof totalDoctors !== 'number' || totalDoctors <= 0 || isNaN(totalDoctors)) {
    return { valid: false, error: 'Total doctors count must be a positive number' };
  }
  if (typeof totalPatientAppointments !== 'number' || totalPatientAppointments < 0 || isNaN(totalPatientAppointments)) {
    return { valid: false, error: 'Total patient appointments must be a non-negative number' };
  }
  if (typeof maxSlotsPerDoctorDay !== 'number' || maxSlotsPerDoctorDay <= 0 || isNaN(maxSlotsPerDoctorDay)) {
    return { valid: false, error: 'Max slots per doctor day must be a positive number' };
  }

  const totalAvailableSlots = totalDoctors * maxSlotsPerDoctorDay;
  const utilizationPct = Math.round((totalPatientAppointments / totalAvailableSlots) * 100 * 10) / 10;
  const slotMarginPct = Math.round((100 - utilizationPct) * 10) / 10;

  let capacityStatus = 'OPTIMAL';
  if (utilizationPct > 85) capacityStatus = 'OVERBOOKED';
  else if (utilizationPct < 40) capacityStatus = 'UNDERUTILIZED';

  return {
    valid: true,
    totalDoctors,
    totalAvailableSlots,
    totalPatientAppointments,
    utilizationPct,
    slotMarginPct,
    capacityStatus,
    recommendation: capacityStatus === 'OVERBOOKED'
      ? `Telehealth capacity overbooked (${utilizationPct}% utilization). Onboard additional physicians or expand daily slot limits.`
      : capacityStatus === 'OPTIMAL'
      ? `Telehealth capacity is operating at optimal efficiency (${utilizationPct}% utilization).`
      : `Telehealth capacity underutilized (${utilizationPct}% utilization). Open additional patient booking windows.`
  };
}

export function calculateTelehealthConsultationTriagingIndex({
  symptomSeverityScore = 7,
  vitalsStabilityScore = 8,
  medicationAdherenceRate = 90,
  pastVisitCount30Days = 1
} = {}) {
  if (typeof symptomSeverityScore !== 'number' || symptomSeverityScore < 1 || symptomSeverityScore > 10 || isNaN(symptomSeverityScore)) {
    return { valid: false, error: 'Symptom severity score must be between 1 and 10' };
  }
  if (typeof vitalsStabilityScore !== 'number' || vitalsStabilityScore < 1 || vitalsStabilityScore > 10 || isNaN(vitalsStabilityScore)) {
    return { valid: false, error: 'Vitals stability score must be between 1 and 10' };
  }

  const triageUrgencyScore = Math.min(100, Math.round((symptomSeverityScore * 6) + ((10 - vitalsStabilityScore) * 3) + ((100 - medicationAdherenceRate) * 0.1)));

  let triageTier = 'ROUTINE';
  let recommendedSlotDurationMins = 15;

  if (triageUrgencyScore >= 75) {
    triageTier = 'URGENT_TELEHEALTH';
    recommendedSlotDurationMins = 30;
  } else if (triageUrgencyScore >= 50) {
    triageTier = 'PRIORITY';
    recommendedSlotDurationMins = 20;
  }

  return {
    valid: true,
    symptomSeverityScore,
    vitalsStabilityScore,
    triageUrgencyScore,
    triageTier,
    recommendedSlotDurationMins,
    recommendation: triageTier === 'URGENT_TELEHEALTH'
      ? `Urgent telehealth consultation required (Urgency Score: ${triageUrgencyScore}/100). Allocate 30-minute priority slot.`
      : triageTier === 'PRIORITY'
      ? `Priority telehealth consultation recommended (Urgency Score: ${triageUrgencyScore}/100).`
      : `Routine consultation scheduled (Urgency Score: ${triageUrgencyScore}/100). Standard 15-minute slot.`
  };
}

export function calculatePatientHealthScoreAndRiskTier({
  vitalsStabilityIndex = 85,
  adherenceRatePct = 90,
  readmissionRiskScore = 20,
  chronicConditionsCount = 1
} = {}) {
  const vitals = Math.min(100, Math.max(0, typeof vitalsStabilityIndex === 'number' ? vitalsStabilityIndex : 75));
  const adherence = Math.min(100, Math.max(0, typeof adherenceRatePct === 'number' ? adherenceRatePct : 75));
  const readmission = Math.min(100, Math.max(0, typeof readmissionRiskScore === 'number' ? readmissionRiskScore : 25));
  const conditions = Math.max(0, typeof chronicConditionsCount === 'number' ? chronicConditionsCount : 0);

  let rawScore = (vitals * 0.4) + (adherence * 0.4) + ((100 - readmission) * 0.2);
  const conditionPenalty = Math.min(20, conditions * 5);

  const healthScore = Math.min(100, Math.max(0, Math.round(rawScore - conditionPenalty)));

  let riskTier = 'LOW_RISK';
  if (healthScore < 50) riskTier = 'HIGH_RISK';
  else if (healthScore < 75) riskTier = 'MODERATE_RISK';

  return {
    valid: true,
    vitalsStabilityIndex: vitals,
    adherenceRatePct: adherence,
    readmissionRiskScore: readmission,
    chronicConditionsCount: conditions,
    healthScore,
    riskTier,
    recommendation: riskTier === 'LOW_RISK'
      ? `Patient health score (${healthScore}/100) is stable with low readmission risk.`
      : riskTier === 'MODERATE_RISK'
      ? `Patient health score (${healthScore}/100) requires routine monitoring.`
      : `High patient health risk (${healthScore}/100). Schedule clinical follow-up immediately.`
  };
}

export function calculatePatientMedicationSideEffectRiskScore({
  activeMedicationCount = 4,
  patientAgeYears = 65,
  hasKidneyOrLiverImpairment = false,
  knownAllergiesCount = 1,
  highRiskMedClassCount = 1
} = {}) {
  const meds = Math.max(1, typeof activeMedicationCount === 'number' ? activeMedicationCount : 1);
  const age = Math.max(0, typeof patientAgeYears === 'number' ? patientAgeYears : 45);
  const allergies = Math.max(0, typeof knownAllergiesCount === 'number' ? knownAllergiesCount : 0);
  const highRiskClasses = Math.max(0, typeof highRiskMedClassCount === 'number' ? highRiskMedClassCount : 0);

  let medScore = Math.min(40, (meds / 10) * 40);
  let ageScore = age >= 65 ? 20 : age >= 50 ? 10 : 0;
  let organScore = hasKidneyOrLiverImpairment ? 20 : 0;
  let allergyScore = Math.min(10, allergies * 5);
  let classScore = Math.min(10, highRiskClasses * 5);

  const sideEffectRiskScore = Math.min(100, Math.round(medScore + ageScore + organScore + allergyScore + classScore));

  let riskTier = 'LOW_RISK';
  if (sideEffectRiskScore >= 60) riskTier = 'HIGH_SIDE_EFFECT_RISK';
  else if (sideEffectRiskScore >= 35) riskTier = 'MODERATE_SIDE_EFFECT_RISK';

  return {
    valid: true,
    activeMedicationCount: meds,
    patientAgeYears: age,
    hasKidneyOrLiverImpairment: Boolean(hasKidneyOrLiverImpairment),
    knownAllergiesCount: allergies,
    highRiskMedClassCount: highRiskClasses,
    sideEffectRiskScore,
    riskTier,
    recommendation: riskTier === 'HIGH_SIDE_EFFECT_RISK'
      ? `High side-effect risk score (${sideEffectRiskScore}/100). Comprehensive clinical pharmacy review recommended.`
      : riskTier === 'MODERATE_SIDE_EFFECT_RISK'
      ? `Moderate side-effect risk score (${sideEffectRiskScore}/100). Monitor patient symptoms and lab values routinely.`
      : `Low side-effect risk score (${sideEffectRiskScore}/100). Standard medication regimen.`
  };
}

export function calculatePatientPediatricDosageSafety({
  patientWeightKg = 15.0,
  recommendedMgPerKg = 10.0,
  prescribedSingleDoseMg = 150.0,
  maxDailyMgPerKg = 40.0,
  dailyDosesFrequency = 3
} = {}) {
  if (typeof patientWeightKg !== 'number' || patientWeightKg <= 0 || isNaN(patientWeightKg)) {
    return { valid: false, error: 'Patient weight must be a positive number' };
  }
  if (typeof recommendedMgPerKg !== 'number' || recommendedMgPerKg <= 0 || isNaN(recommendedMgPerKg)) {
    return { valid: false, error: 'Recommended mg per kg must be a positive number' };
  }

  const targetSingleDoseMg = Math.round(patientWeightKg * recommendedMgPerKg * 100) / 100;
  const totalPrescribedDailyMg = Math.round(prescribedSingleDoseMg * dailyDosesFrequency * 100) / 100;
  const maxAllowableDailyMg = Math.round(patientWeightKg * maxDailyMgPerKg * 100) / 100;

  const doseDeviationPct = Math.round(((prescribedSingleDoseMg - targetSingleDoseMg) / targetSingleDoseMg) * 100);
  const isOverdosed = totalPrescribedDailyMg > maxAllowableDailyMg;
  const isUnderdosed = prescribedSingleDoseMg < (targetSingleDoseMg * 0.7);

  let safetyStatus = 'OPTIMAL_DOSAGE';
  if (isOverdosed) {
    safetyStatus = 'OVERDOSE_WARNING';
  } else if (isUnderdosed) {
    safetyStatus = 'SUB_THERAPEUTIC';
  } else if (Math.abs(doseDeviationPct) > 15) {
    safetyStatus = 'DOSAGE_ADJUSTMENT_ADVISED';
  }

  return {
    valid: true,
    patientWeightKg,
    recommendedMgPerKg,
    prescribedSingleDoseMg,
    targetSingleDoseMg,
    totalPrescribedDailyMg,
    maxAllowableDailyMg,
    doseDeviationPct,
    isOverdosed,
    isUnderdosed,
    safetyStatus,
    recommendation: isOverdosed
      ? `CRITICAL: Prescribed daily dose (${totalPrescribedDailyMg}mg) exceeds maximum safe daily threshold (${maxAllowableDailyMg}mg).`
      : isUnderdosed
      ? `WARNING: Prescribed dose (${prescribedSingleDoseMg}mg) is sub-therapeutic. Recommended single dose is ${targetSingleDoseMg}mg.`
      : `Pediatric dosage is safe and optimal (${targetSingleDoseMg}mg target).`
  };
}

export function calculatePatientRenalDoseAdjustment({
  serumCreatinineMgDl = 1.0,
  patientAgeYears = 60,
  patientWeightKg = 70.0,
  isFemale = false,
  standardDoseMg = 500.0
} = {}) {
  if (
    typeof serumCreatinineMgDl !== 'number' || serumCreatinineMgDl <= 0 || isNaN(serumCreatinineMgDl) ||
    typeof patientAgeYears !== 'number' || patientAgeYears <= 0 || isNaN(patientAgeYears) ||
    typeof patientWeightKg !== 'number' || patientWeightKg <= 0 || isNaN(patientWeightKg) ||
    typeof standardDoseMg !== 'number' || standardDoseMg <= 0 || isNaN(standardDoseMg)
  ) {
    return { valid: false, error: 'Serum creatinine, age, weight, and standard dose must be positive numbers' };
  }

  const femaleFactor = isFemale ? 0.85 : 1.0;
  const crClRaw = (((140 - patientAgeYears) * patientWeightKg) / (72 * serumCreatinineMgDl)) * femaleFactor;
  const creatinineClearanceMlMin = Math.round(crClRaw * 100) / 100;

  let renalRiskTier = 'NORMAL_RENAL_FUNCTION';
  let doseAdjustmentPct = 100;

  if (creatinineClearanceMlMin < 30) {
    renalRiskTier = 'SEVERE_RENAL_IMPAIRMENT';
    doseAdjustmentPct = 50;
  } else if (creatinineClearanceMlMin < 60) {
    renalRiskTier = 'MODERATE_RENAL_IMPAIRMENT';
    doseAdjustmentPct = 75;
  } else if (creatinineClearanceMlMin < 90) {
    renalRiskTier = 'MILD_RENAL_IMPAIRMENT';
    doseAdjustmentPct = 100;
  }

  const adjustedDoseMg = Math.round((standardDoseMg * (doseAdjustmentPct / 100)) * 100) / 100;

  return {
    valid: true,
    serumCreatinineMgDl,
    patientAgeYears,
    patientWeightKg,
    isFemale,
    standardDoseMg,
    creatinineClearanceMlMin,
    renalRiskTier,
    doseAdjustmentPct,
    adjustedDoseMg,
    recommendation: renalRiskTier === 'SEVERE_RENAL_IMPAIRMENT'
      ? `CRITICAL: Severe renal impairment (CrCl: ${creatinineClearanceMlMin} mL/min). Reduce standard dose to 50% (${adjustedDoseMg}mg).`
      : renalRiskTier === 'MODERATE_RENAL_IMPAIRMENT'
      ? `WARNING: Moderate renal impairment (CrCl: ${creatinineClearanceMlMin} mL/min). Reduce standard dose to 75% (${adjustedDoseMg}mg).`
      : `Renal clearance normal (CrCl: ${creatinineClearanceMlMin} mL/min). Standard dose (${standardDoseMg}mg) recommended.`
  };
}

export function calculatePatientAnticholinergicCognitiveRiskScore({
  anticholinergicMedsCount = 2,
  patientAgeYears = 70,
  hasBaselineCognitiveImpairment = false,
  treatmentDurationMonths = 6
} = {}) {
  if (typeof anticholinergicMedsCount !== 'number' || anticholinergicMedsCount < 0 || isNaN(anticholinergicMedsCount)) {
    return { valid: false, error: 'Anticholinergic medication count must be a non-negative number' };
  }
  if (typeof patientAgeYears !== 'number' || patientAgeYears < 0 || isNaN(patientAgeYears)) {
    return { valid: false, error: 'Patient age must be a non-negative number' };
  }

  let medScore = Math.min(50, anticholinergicMedsCount * 25);
  let ageScore = patientAgeYears >= 75 ? 25 : patientAgeYears >= 65 ? 15 : 0;
  let cognitiveScore = hasBaselineCognitiveImpairment ? 20 : 0;
  let durationScore = anticholinergicMedsCount > 0 ? Math.min(10, (treatmentDurationMonths || 0) * 1) : 0;


  const cognitiveRiskScore = Math.min(100, Math.round(medScore + ageScore + cognitiveScore + durationScore));

  let riskTier = 'LOW_COGNITIVE_RISK';
  if (cognitiveRiskScore >= 70) riskTier = 'HIGH_COGNITIVE_RISK';
  else if (cognitiveRiskScore >= 40) riskTier = 'MODERATE_COGNITIVE_RISK';

  return {
    valid: true,
    anticholinergicMedsCount,
    patientAgeYears,
    hasBaselineCognitiveImpairment: Boolean(hasBaselineCognitiveImpairment),
    treatmentDurationMonths,
    cognitiveRiskScore,
    riskTier,
    recommendation: riskTier === 'HIGH_COGNITIVE_RISK'
      ? `HIGH RISK: Anticholinergic cognitive risk score (${cognitiveRiskScore}/100). High probability of cognitive decline or confusion; evaluate alternative non-anticholinergic therapies.`
      : riskTier === 'MODERATE_COGNITIVE_RISK'
      ? `MODERATE RISK: Anticholinergic cognitive risk score (${cognitiveRiskScore}/100). Monitor cognitive performance and memory periodically.`
      : `Anticholinergic cognitive burden is low (${cognitiveRiskScore}/100).`
  };
}

export function calculatePatientPolypharmacyInteractionIndex({
  totalActiveMedications = 5,
  majorInteractionPairsCount = 0,
  moderateInteractionPairsCount = 1,
  patientAgeYears = 68,
  renalImpairmentPresent = false
} = {}) {
  if (typeof totalActiveMedications !== 'number' || totalActiveMedications < 0 || isNaN(totalActiveMedications)) {
    return { valid: false, error: 'Total active medications must be a non-negative number' };
  }
  if (typeof patientAgeYears !== 'number' || patientAgeYears < 0 || isNaN(patientAgeYears)) {
    return { valid: false, error: 'Patient age must be a non-negative number' };
  }

  const medBaseScore = Math.min(40, totalActiveMedications * 5);
  const majorScore = Math.min(40, (majorInteractionPairsCount || 0) * 20);
  const moderateScore = Math.min(20, (moderateInteractionPairsCount || 0) * 5);
  const ageBonus = patientAgeYears >= 65 ? 10 : 0;
  const renalBonus = renalImpairmentPresent ? 10 : 0;

  const polypharmacyScore = Math.min(100, Math.round(medBaseScore + majorScore + moderateScore + ageBonus + renalBonus));

  let riskTier = 'LOW_POLYPHARMACY_RISK';
  if (polypharmacyScore >= 70) riskTier = 'HIGH_POLYPHARMACY_RISK';
  else if (polypharmacyScore >= 40) riskTier = 'MODERATE_POLYPHARMACY_RISK';

  return {
    valid: true,
    totalActiveMedications,
    majorInteractionPairsCount,
    moderateInteractionPairsCount,
    patientAgeYears,
    renalImpairmentPresent: Boolean(renalImpairmentPresent),
    polypharmacyScore,
    riskTier,
    requiresPharmacistConsultation: riskTier === 'HIGH_POLYPHARMACY_RISK',
    recommendation: riskTier === 'HIGH_POLYPHARMACY_RISK'
      ? `HIGH RISK: Polypharmacy interaction score (${polypharmacyScore}/100). Immediate comprehensive medication reconciliation and clinical pharmacist consultation required.`
      : riskTier === 'MODERATE_POLYPHARMACY_RISK'
      ? `MODERATE RISK: Polypharmacy interaction score (${polypharmacyScore}/100). Regular medication review recommended at next clinic visit.`
      : `Low polypharmacy interaction risk (${polypharmacyScore}/100).`
  };
}

export function calculatePatientGeriatricMedicationSafetyAudit({
  medicationList = [],
  patientAge = 70,
  estimatedCrCl = 60,
  hasHistoryOfFalls = false
} = {}) {
  if (!Array.isArray(medicationList)) {
    return { valid: false, error: 'Medication list must be an array' };
  }
  if (typeof patientAge !== 'number' || patientAge < 0) {
    return { valid: false, error: 'Patient age must be a non-negative number' };
  }

  const beersHighRiskClasses = ['sedative', 'anticholinergic', 'nsaid', 'benzodiazepine', 'antipsychotic'];
  let highRiskMedsCount = 0;
  let fallRiskMedsCount = 0;

  for (const med of medicationList) {
    if (!med) continue;
    const cat = ((typeof med === 'string' ? med : med.category || med.name) || '').toLowerCase();
    const isBeersRisk = beersHighRiskClasses.some(c => cat.includes(c));
    if (isBeersRisk) highRiskMedsCount++;

    if (cat.includes('sedative') || cat.includes('benzodiazepine') || cat.includes('antihistamine') || med.causesDrowsiness) {
      fallRiskMedsCount++;
    }
  }

  const ageFactor = patientAge >= 75 ? 15 : (patientAge >= 65 ? 10 : 0);
  const fallPenalty = hasHistoryOfFalls ? 15 : 0;
  const renalPenalty = estimatedCrCl < 50 ? 15 : 0;
  const medRiskPenalty = highRiskMedsCount * 15 + fallRiskMedsCount * 10;

  const geriatricSafetyScore = Math.max(0, Math.min(100, Math.round(100 - (ageFactor + fallPenalty + renalPenalty + medRiskPenalty))));

  let riskTier = 'LOW_GERIATRIC_RISK';
  if (geriatricSafetyScore < 50) riskTier = 'HIGH_GERIATRIC_RISK';
  else if (geriatricSafetyScore < 75) riskTier = 'MODERATE_GERIATRIC_RISK';

  return {
    valid: true,
    patientAge,
    totalMedicationsAnalyzed: medicationList.length,
    highRiskMedsCount,
    fallRiskMedsCount,
    geriatricSafetyScore,
    riskTier,
    recommendation: riskTier === 'LOW_GERIATRIC_RISK'
      ? `Geriatric medication safety score is optimal (${geriatricSafetyScore}/100). Low Beers criteria risk.`
      : riskTier === 'MODERATE_GERIATRIC_RISK'
      ? `Moderate geriatric risk (${geriatricSafetyScore}/100). Review sedative/anticholinergic drug burden and renal clearance.`
      : `High geriatric safety risk (${geriatricSafetyScore}/100). Multiple high-risk medications detected; clinical pharmacist review advised.`
  };
}

export function calculatePatientComprehensiveLabAlertAndRiskScore({
  potassiumMeqL = 4.2,
  creatinineMgDl = 1.0,
  altUL = 25,
  wbcCount = 7.0,
  plateletCount = 250
} = {}) {
  const params = [potassiumMeqL, creatinineMgDl, altUL, wbcCount, plateletCount];
  if (params.some(p => typeof p !== 'number' || isNaN(p) || p < 0)) {
    return { valid: false, error: 'All lab values must be valid non-negative numbers' };
  }

  const criticalAlerts = [];
  let alertPoints = 0;

  if (potassiumMeqL < 3.5) {
    criticalAlerts.push('Hypokalemia (Low Potassium)');
    alertPoints += 25;
  } else if (potassiumMeqL > 5.0) {
    criticalAlerts.push('Hyperkalemia (High Potassium)');
    alertPoints += 30;
  }

  if (creatinineMgDl > 1.5) {
    criticalAlerts.push('Elevated Serum Creatinine (Renal Impairment)');
    alertPoints += 25;
  }

  if (altUL > 56) {
    criticalAlerts.push('Elevated ALT (Hepatic Enzyme Spike)');
    alertPoints += 20;
  }

  if (wbcCount < 4.0) {
    criticalAlerts.push('Leukopenia (Low WBC)');
    alertPoints += 20;
  } else if (wbcCount > 11.0) {
    criticalAlerts.push('Leukocytosis (Elevated WBC / Infection Risk)');
    alertPoints += 15;
  }

  if (plateletCount < 150) {
    criticalAlerts.push('Thrombocytopenia (Low Platelets)');
    alertPoints += 20;
  }

  const alertScore = Math.min(100, alertPoints);

  let riskTier = 'NORMAL_LAB_PROFILE';
  if (alertScore >= 50) riskTier = 'HIGH_LAB_ALERT';
  else if (alertScore >= 20) riskTier = 'MODERATE_LAB_ALERT';

  return {
    valid: true,
    alertScore,
    riskTier,
    criticalAlertCount: criticalAlerts.length,
    criticalAlerts,
    recommendation: riskTier === 'NORMAL_LAB_PROFILE'
      ? `All key lab parameters are within acceptable reference ranges (Alert Score: ${alertScore}/100).`
      : riskTier === 'MODERATE_LAB_ALERT'
      ? `Moderate lab abnormalities detected (${criticalAlerts.join(', ')}). Monitor routine lab panel.`
      : `CRITICAL LAB ALERT (${criticalAlerts.join(', ')}). Immediate physician notification recommended.`
  };
}

export function calculatePatientChronicDiseaseMultimorbidityScore({
  chronicDiseasesList = [],
  patientAgeYears = 65,
  activeMedicationsCount = 4,
  recentHospitalizationsCount = 0
} = {}) {
  if (!Array.isArray(chronicDiseasesList)) {
    return { valid: false, error: 'Chronic diseases list must be an array' };
  }
  if (typeof patientAgeYears !== 'number' || patientAgeYears < 0 || isNaN(patientAgeYears)) {
    return { valid: false, error: 'Patient age must be a valid non-negative number' };
  }

  const highWeightDiseases = ['heart disease', 'heart failure', 'copd', 'kidney disease', 'ckd', 'stroke', 'cancer'];
  let diseasePoints = 0;
  const categorizedDiseases = [];

  for (const d of chronicDiseasesList) {
    if (!d) continue;
    const name = (typeof d === 'string' ? d : d.name || '').trim();
    if (!name) continue;
    categorizedDiseases.push(name);
    const lower = name.toLowerCase();
    const isHighWeight = highWeightDiseases.some(kw => lower.includes(kw));
    diseasePoints += isHighWeight ? 15 : 10;
  }

  const ageBonus = patientAgeYears >= 75 ? 20 : (patientAgeYears >= 65 ? 10 : 0);
  const medBonus = Math.min(20, (activeMedicationsCount || 0) * 3);
  const hospBonus = Math.min(25, (recentHospitalizationsCount || 0) * 12.5);

  const rawScore = diseasePoints + ageBonus + medBonus + hospBonus;
  const multimorbidityRiskScore = Math.min(100, Math.round(rawScore));

  let riskTier = 'LOW_COMPLEXITY';
  let recommendedFollowupMonths = 6;

  if (multimorbidityRiskScore >= 65) {
    riskTier = 'HIGH_MULTIMORBIDITY_RISK';
    recommendedFollowupMonths = 1;
  } else if (multimorbidityRiskScore >= 35) {
    riskTier = 'MODERATE_COMPLEXITY';
    recommendedFollowupMonths = 3;
  }

  return {
    valid: true,
    patientAgeYears,
    chronicDiseasesCount: categorizedDiseases.length,
    activeMedicationsCount: activeMedicationsCount || 0,
    recentHospitalizationsCount: recentHospitalizationsCount || 0,
    multimorbidityRiskScore,
    riskTier,
    recommendedFollowupMonths,
    recommendation: riskTier === 'HIGH_MULTIMORBIDITY_RISK'
      ? `HIGH MULTIMORBIDITY RISK (${multimorbidityRiskScore}/100). Multidisciplinary care team coordination and monthly clinical review required.`
      : riskTier === 'MODERATE_COMPLEXITY'
      ? `MODERATE COMPLEXITY (${multimorbidityRiskScore}/100). Follow-up every ${recommendedFollowupMonths} months recommended.`
      : `Low chronic disease complexity score (${multimorbidityRiskScore}/100). Standard semi-annual review.`
  };
}

export function calculatePatientCardiovascularRiskScore({
  systolicBp = 135,
  diastolicBp = 85,
  totalCholesterolMgDl = 210,
  hdlCholesterolMgDl = 45,
  isSmoker = false,
  isDiabetic = false,
  patientAgeYears = 58
} = {}) {
  if (typeof systolicBp !== 'number' || systolicBp < 70 || systolicBp > 250) {
    return { valid: false, error: 'Systolic blood pressure must be a realistic number between 70 and 250 mmHg' };
  }
  if (typeof patientAgeYears !== 'number' || patientAgeYears < 18 || patientAgeYears > 120) {
    return { valid: false, error: 'Patient age must be an adult age between 18 and 120 years' };
  }

  let riskPoints = 0;
  if (systolicBp >= 160) riskPoints += 30;
  else if (systolicBp >= 140) riskPoints += 20;
  else if (systolicBp >= 130) riskPoints += 10;

  if (totalCholesterolMgDl >= 240) riskPoints += 25;
  else if (totalCholesterolMgDl >= 200) riskPoints += 15;

  if (hdlCholesterolMgDl < 40) riskPoints += 15;

  if (isSmoker) riskPoints += 20;
  if (isDiabetic) riskPoints += 20;

  if (patientAgeYears >= 65) riskPoints += 25;
  else if (patientAgeYears >= 55) riskPoints += 15;

  const cvdRiskScore = Math.min(100, Math.max(0, riskPoints));

  let cvdRiskTier = 'LOW_CARDIOVASCULAR_RISK';
  if (cvdRiskScore >= 60) cvdRiskTier = 'HIGH_CARDIOVASCULAR_RISK';
  else if (cvdRiskScore >= 30) cvdRiskTier = 'MODERATE_CARDIOVASCULAR_RISK';

  return {
    valid: true,
    patientAgeYears,
    systolicBp,
    diastolicBp,
    totalCholesterolMgDl,
    hdlCholesterolMgDl,
    isSmoker: Boolean(isSmoker),
    isDiabetic: Boolean(isDiabetic),
    cvdRiskScore,
    cvdRiskTier,
    recommendation: cvdRiskTier === 'HIGH_CARDIOVASCULAR_RISK'
      ? `HIGH CARDIOVASCULAR RISK (${cvdRiskScore}/100 score). Intensive BP and lipid management, lifestyle intervention, and cardiology consultation recommended.`
      : cvdRiskTier === 'MODERATE_CARDIOVASCULAR_RISK'
      ? `MODERATE CARDIOVASCULAR RISK (${cvdRiskScore}/100 score). Monitor blood pressure and lipid profile semi-annually.`
      : `LOW CARDIOVASCULAR RISK (${cvdRiskScore}/100 score). Continue healthy lifestyle and routine health checkups.`
  };
}

export function calculatePatientGlycemicControlAndDiabetesRiskScore({
  hba1cPercent = 7.2,
  fastingGlucoseMgDl = 135,
  hypoglycemicEpisodesPastMonth = 0,
  hasAnnualRetinalExam = true,
  hasAnnualKidneyScreening = true
} = {}) {
  if (typeof hba1cPercent !== 'number' || hba1cPercent <= 0 || isNaN(hba1cPercent)) {
    return { valid: false, error: 'HbA1c percentage must be a positive number' };
  }
  if (typeof fastingGlucoseMgDl !== 'number' || fastingGlucoseMgDl <= 0 || isNaN(fastingGlucoseMgDl)) {
    return { valid: false, error: 'Fasting blood glucose must be a positive number' };
  }

  let riskPoints = 0;
  if (hba1cPercent >= 9.0) riskPoints += 45;
  else if (hba1cPercent >= 8.0) riskPoints += 30;
  else if (hba1cPercent >= 7.0) riskPoints += 15;

  if (fastingGlucoseMgDl >= 200) riskPoints += 25;
  else if (fastingGlucoseMgDl >= 140) riskPoints += 15;

  if (hypoglycemicEpisodesPastMonth > 0) {
    riskPoints += Math.min(20, hypoglycemicEpisodesPastMonth * 10);
  }

  if (!hasAnnualRetinalExam) riskPoints += 10;
  if (!hasAnnualKidneyScreening) riskPoints += 10;

  const glycemicRiskScore = Math.min(100, Math.max(0, riskPoints));

  let glycemicControlTier = 'OPTIMAL_GLYCEMIC_CONTROL';
  if (glycemicRiskScore >= 60 || hba1cPercent >= 9.0) glycemicControlTier = 'POOR_GLYCEMIC_CONTROL';
  else if (glycemicRiskScore >= 30 || hba1cPercent >= 7.5) glycemicControlTier = 'SUBOPTIMAL_GLYCEMIC_CONTROL';

  return {
    valid: true,
    hba1cPercent,
    fastingGlucoseMgDl,
    hypoglycemicEpisodesPastMonth: Math.max(0, hypoglycemicEpisodesPastMonth || 0),
    hasAnnualRetinalExam: Boolean(hasAnnualRetinalExam),
    hasAnnualKidneyScreening: Boolean(hasAnnualKidneyScreening),
    glycemicRiskScore,
    glycemicControlTier,
    recommendation: glycemicControlTier === 'POOR_GLYCEMIC_CONTROL'
      ? `POOR GLYCEMIC CONTROL (${glycemicRiskScore}/100 score, HbA1c ${hba1cPercent}%). Urgent endocrinology review, medication titration, and diabetes education required.`
      : glycemicControlTier === 'SUBOPTIMAL_GLYCEMIC_CONTROL'
      ? `SUBOPTIMAL GLYCEMIC CONTROL (${glycemicRiskScore}/100 score, HbA1c ${hba1cPercent}%). Adjust anti-diabetic therapy and reinforce dietary compliance.`
      : `OPTIMAL GLYCEMIC CONTROL (${glycemicRiskScore}/100 score, HbA1c ${hba1cPercent}%). Continue routine quarterly HbA1c monitoring.`
  };
}

export function calculatePatientHypertensionAndCardiovascularRiskScore({
  systolicBp = 138,
  diastolicBp = 88,
  patientAgeYears = 62,
  isAntihypertensiveMedicated = true
} = {}) {
  if (typeof systolicBp !== 'number' || systolicBp < 70 || systolicBp > 260) {
    return { valid: false, error: 'Systolic blood pressure must be a realistic number between 70 and 260 mmHg' };
  }
  if (typeof diastolicBp !== 'number' || diastolicBp < 40 || diastolicBp > 150) {
    return { valid: false, error: 'Diastolic blood pressure must be a realistic number between 40 and 150 mmHg' };
  }

  let bpStage = 'NORMAL_BLOOD_PRESSURE';
  let score = 10;

  if (systolicBp >= 180 || diastolicBp >= 120) {
    bpStage = 'HYPERTENSIVE_CRISIS';
    score = 95;
  } else if (systolicBp >= 140 || diastolicBp >= 90) {
    bpStage = 'STAGE_2_HYPERTENSION';
    score = 75;
  } else if (systolicBp >= 130 || diastolicBp >= 80) {
    bpStage = 'STAGE_1_HYPERTENSION';
    score = 50;
  } else if (systolicBp >= 120 && diastolicBp < 80) {
    bpStage = 'ELEVATED';
    score = 30;
  }

  if (isAntihypertensiveMedicated && bpStage !== 'NORMAL_BLOOD_PRESSURE') {
    score = Math.min(100, score + 10);
  }

  const ageBonus = patientAgeYears >= 65 ? 10 : 0;
  const hypertensionRiskScore = Math.min(100, Math.max(0, score + ageBonus));

  return {
    valid: true,
    systolicBp,
    diastolicBp,
    patientAgeYears,
    isAntihypertensiveMedicated: Boolean(isAntihypertensiveMedicated),
    bpStage,
    hypertensionRiskScore,
    recommendation: bpStage === 'HYPERTENSIVE_CRISIS'
      ? `HYPERTENSIVE CRISIS (${systolicBp}/${diastolicBp} mmHg). Immediate emergency medical evaluation required.`
      : bpStage === 'STAGE_2_HYPERTENSION'
      ? `STAGE 2 HYPERTENSION (${systolicBp}/${diastolicBp} mmHg). Antihypertensive therapy adjustment and prompt clinical follow-up required.`
      : bpStage === 'STAGE_1_HYPERTENSION'
      ? `STAGE 1 HYPERTENSION (${systolicBp}/${diastolicBp} mmHg). Recommend lifestyle modifications and blood pressure monitoring.`
      : `Blood pressure within target range (${systolicBp}/${diastolicBp} mmHg). Continue routine wellness monitoring.`
  };
}

export function calculatePatientEmergencySymptomTriagingScore({
  symptomSeverityScale = 5,
  chestPainPresent = false,
  shortnessOfBreathPresent = false,
  feverTemperatureF = 98.6,
  patientAgeYears = 45
} = {}) {
  if (typeof symptomSeverityScale !== 'number' || symptomSeverityScale < 1 || symptomSeverityScale > 10) {
    return { valid: false, error: 'Symptom severity scale must be a number between 1 and 10' };
  }
  if (typeof feverTemperatureF !== 'number' || feverTemperatureF < 90 || feverTemperatureF > 110) {
    return { valid: false, error: 'Fever temperature must be between 90°F and 110°F' };
  }
  if (typeof patientAgeYears !== 'number' || patientAgeYears <= 0 || !Number.isInteger(patientAgeYears)) {
    return { valid: false, error: 'Patient age must be a positive integer' };
  }

  let score = symptomSeverityScale * 7;
  if (chestPainPresent) score += 25;
  if (shortnessOfBreathPresent) score += 20;
  if (feverTemperatureF >= 102) score += 15;
  if (patientAgeYears >= 65) score += 10;

  const totalTriageScore = Math.min(100, Math.max(0, score));

  let triagePriorityTier = 'ROUTINE_CARE';
  if (totalTriageScore >= 75 || chestPainPresent) triagePriorityTier = 'EMERGENCY_IMMEDIATE_CARE';
  else if (totalTriageScore >= 50 || shortnessOfBreathPresent) triagePriorityTier = 'URGENT_SAME_DAY_CARE';

  return {
    valid: true,
    symptomSeverityScale,
    chestPainPresent: Boolean(chestPainPresent),
    shortnessOfBreathPresent: Boolean(shortnessOfBreathPresent),
    feverTemperatureF,
    patientAgeYears,
    totalTriageScore,
    triagePriorityTier,
    recommendation: triagePriorityTier === 'EMERGENCY_IMMEDIATE_CARE'
      ? `CRITICAL TRIAGE SCORE (${totalTriageScore}/100). Immediate emergency department referral required.`
      : triagePriorityTier === 'URGENT_SAME_DAY_CARE'
      ? `URGENT TRIAGE SCORE (${totalTriageScore}/100). Schedule same-day urgent telehealth consultation.`
      : `Routine triage score (${totalTriageScore}/100). Standard appointment scheduling recommended.`
  };
}

export function calculatePatientInpatientReadmissionRiskScore({
  lengthOfStayDays = 3,
  isAcuteEmergencyAdmission = true,
  charlsonComorbidityIndex = 2,
  emergencyVisitsPast6Months = 1
} = {}) {
  if (typeof lengthOfStayDays !== 'number' || lengthOfStayDays <= 0 || !Number.isInteger(lengthOfStayDays)) {
    return { valid: false, error: 'Length of stay must be a positive integer' };
  }
  if (typeof charlsonComorbidityIndex !== 'number' || charlsonComorbidityIndex < 0 || !Number.isInteger(charlsonComorbidityIndex)) {
    return { valid: false, error: 'Charlson comorbidity index must be a non-negative integer' };
  }
  if (typeof emergencyVisitsPast6Months !== 'number' || emergencyVisitsPast6Months < 0 || !Number.isInteger(emergencyVisitsPast6Months)) {
    return { valid: false, error: 'Emergency visits past 6 months must be a non-negative integer' };
  }

  // LACE Index calculation
  let losPoints = 0;
  if (lengthOfStayDays >= 14) losPoints = 7;
  else if (lengthOfStayDays >= 7) losPoints = 5;
  else if (lengthOfStayDays >= 4) losPoints = 4;
  else if (lengthOfStayDays >= 3) losPoints = 3;
  else if (lengthOfStayDays >= 2) losPoints = 2;
  else losPoints = 1;

  const acuityPoints = isAcuteEmergencyAdmission ? 3 : 0;
  const comorbidityPoints = Math.min(6, charlsonComorbidityIndex);
  const edPoints = Math.min(4, emergencyVisitsPast6Months);

  const laceIndexScore = losPoints + acuityPoints + comorbidityPoints + edPoints;

  let readmissionRiskTier = 'LOW_DISCHARGE_RISK';
  let estimated30DayReadmissionRatePct = 5.0;

  if (laceIndexScore >= 10) {
    readmissionRiskTier = 'HIGH_READMISSION_RISK';
    estimated30DayReadmissionRatePct = 25.0;
  } else if (laceIndexScore >= 6) {
    readmissionRiskTier = 'MODERATE_DISCHARGE_RISK';
    estimated30DayReadmissionRatePct = 12.5;
  }

  return {
    valid: true,
    lengthOfStayDays,
    isAcuteEmergencyAdmission: Boolean(isAcuteEmergencyAdmission),
    charlsonComorbidityIndex,
    emergencyVisitsPast6Months,
    laceIndexScore,
    readmissionRiskTier,
    estimated30DayReadmissionRatePct,
    recommendation: readmissionRiskTier === 'HIGH_READMISSION_RISK'
      ? `HIGH 30-DAY READMISSION RISK (LACE Score: ${laceIndexScore}/28, ~${estimated30DayReadmissionRatePct}% risk). Post-discharge nurse follow-up call within 48h and 7-day clinic visit required.`
      : readmissionRiskTier === 'MODERATE_DISCHARGE_RISK'
      ? `MODERATE READMISSION RISK (LACE Score: ${laceIndexScore}/28, ~${estimated30DayReadmissionRatePct}% risk). Schedule 14-day outpatient follow-up.`
      : `LOW READMISSION RISK (LACE Score: ${laceIndexScore}/28). Standard routine post-discharge care.`
  };
}

export function calculatePatientPerioperativeMedicationHoldAudit({
  medicationName = 'Aspirin',
  medicationCategory = 'anticoagulant',
  plannedProcedureHoursAway = 48,
  hasHighBleedingRiskProcedure = true
} = {}) {
  const medCat = (medicationCategory || 'other').toLowerCase().trim();
  let recommendedHoldDays = 0;
  let actionRequired = 'CONTINUE_MEDICATION';

  if (['anticoagulant', 'antiplatelet'].includes(medCat)) {
    recommendedHoldDays = hasHighBleedingRiskProcedure ? 5 : 2;
    actionRequired = 'HOLD_MEDICATION_BEFORE_PROCEDURE';
  } else if (['nsaid', 'blood_thinner'].includes(medCat)) {
    recommendedHoldDays = 3;
    actionRequired = 'HOLD_MEDICATION_BEFORE_PROCEDURE';
  } else if (['ace_inhibitor', 'arb'].includes(medCat)) {
    recommendedHoldDays = 1;
    actionRequired = 'HOLD_DAY_OF_SURGERY';
  }

  const plannedHoldDays = plannedProcedureHoursAway / 24;
  const isHoldDurationCompliant = plannedHoldDays >= recommendedHoldDays;

  return {
    valid: true,
    medicationName,
    medicationCategory: medCat,
    plannedProcedureHoursAway,
    recommendedHoldDays,
    isHoldDurationCompliant,
    actionRequired,
    recommendation: isHoldDurationCompliant || actionRequired === 'CONTINUE_MEDICATION'
      ? `Perioperative safety verified for ${medicationName}. Hold duration (${plannedHoldDays.toFixed(1)} days) meets safety guidelines.`
      : `SAFETY WARNING: ${medicationName} (${medCat}) requires a ${recommendedHoldDays}-day hold before surgery. Current hold window is only ${plannedHoldDays.toFixed(1)} days.`
  };
}

export function calculatePatientChronicCareMonitoringIndex({
  systolicBp = 135,
  diastolicBp = 85,
  fastingGlucoseMgDl = 110,
  adherencePercentage = 90,
  daysSinceLastCheckup = 45
} = {}) {
  if (typeof systolicBp !== 'number' || systolicBp <= 0 || isNaN(systolicBp)) {
    return { valid: false, error: 'Systolic blood pressure must be a positive number' };
  }
  if (typeof adherencePercentage !== 'number' || adherencePercentage < 0 || adherencePercentage > 100) {
    return { valid: false, error: 'Adherence percentage must be between 0 and 100' };
  }

  let healthScore = 100;
  if (systolicBp >= 140 || diastolicBp >= 90) healthScore -= 25;
  else if (systolicBp >= 130 || diastolicBp >= 80) healthScore -= 10;

  if (fastingGlucoseMgDl >= 126) healthScore -= 25;
  else if (fastingGlucoseMgDl >= 100) healthScore -= 10;

  if (adherencePercentage < 80) healthScore -= 20;

  if (daysSinceLastCheckup > 90) healthScore -= 15;

  healthScore = Math.max(0, Math.min(100, healthScore));

  let careTier = 'OPTIMAL_CHRONIC_CONTROL';
  if (healthScore < 60) {
    careTier = 'ELEVATED_CHRONIC_RISK';
  } else if (healthScore < 80) {
    careTier = 'MODERATE_CHRONIC_CONTROL';
  }

  return {
    valid: true,
    systolicBp,
    diastolicBp,
    fastingGlucoseMgDl,
    adherencePercentage,
    daysSinceLastCheckup,
    healthScore,
    careTier,
    recommendation: careTier === 'ELEVATED_CHRONIC_RISK'
      ? `Elevated chronic care risk (Health Score: ${healthScore}/100). Recommend urgent physician consultation and medication review.`
      : careTier === 'MODERATE_CHRONIC_CONTROL'
      ? `Moderate chronic control (Health Score: ${healthScore}/100). Encourage adherence and routine follow-up.`
      : `Optimal chronic care management (Health Score: ${healthScore}/100). Maintain current regimen.`
  };
}

export function calculatePatientTelehealthTriageScore({
  symptomAcuityRating = 5,
  hasChestPain = false,
  hasShortnessOfBreath = false,
  patientAgeYears = 45,
  comorbiditiesCount = 1
} = {}) {
  if (typeof symptomAcuityRating !== 'number' || symptomAcuityRating < 1 || symptomAcuityRating > 10 || isNaN(symptomAcuityRating)) {
    return { valid: false, error: 'Symptom acuity rating must be a number between 1 and 10' };
  }

  let acuityPoints = symptomAcuityRating * 6;
  if (hasChestPain) acuityPoints += 25;
  if (hasShortnessOfBreath) acuityPoints += 20;

  const age = typeof patientAgeYears === 'number' && patientAgeYears > 0 ? patientAgeYears : 45;
  if (age >= 65) acuityPoints += 10;

  const comorbidities = typeof comorbiditiesCount === 'number' && comorbiditiesCount >= 0 ? comorbiditiesCount : 0;
  acuityPoints += Math.min(15, comorbidities * 5);

  const triageScore = Math.min(100, Math.round(acuityPoints));

  let triageTier = 'ROUTINE_TELEHEALTH';
  let isEmergencyRedirectNeeded = false;

  if (triageScore >= 75 || hasChestPain || hasShortnessOfBreath) {
    triageTier = 'IMMEDIATE_ER_REDIRECT';
    isEmergencyRedirectNeeded = true;
  } else if (triageScore >= 50) {
    triageTier = 'SAME_DAY_URGENT_TELEHEALTH';
  }

  return {
    valid: true,
    symptomAcuityRating,
    hasChestPain: Boolean(hasChestPain),
    hasShortnessOfBreath: Boolean(hasShortnessOfBreath),
    patientAgeYears: age,
    comorbiditiesCount: comorbidities,
    triageScore,
    triageTier,
    isEmergencyRedirectNeeded,
    recommendation: isEmergencyRedirectNeeded
      ? `High acuity symptom presentation (${triageScore}/100). Recommend emergency room or 911 dispatch immediately.`
      : triageTier === 'SAME_DAY_URGENT_TELEHEALTH'
      ? `Urgent telehealth appointment recommended within 24 hours (${triageScore}/100).`
      : `Routine virtual consultation suitable (${triageScore}/100).`
  };
}

export function calculatePatientTelehealthVideoQualityScore({
  downloadSpeedMbps = 25.0,
  uploadSpeedMbps = 5.0,
  networkLatencyMs = 35,
  packetLossPct = 0.5,
  cameraResolutionP = 720
} = {}) {
  if (typeof downloadSpeedMbps !== 'number' || downloadSpeedMbps < 0 || isNaN(downloadSpeedMbps)) {
    return { valid: false, error: 'Download speed must be a non-negative number' };
  }
  if (typeof uploadSpeedMbps !== 'number' || uploadSpeedMbps < 0 || isNaN(uploadSpeedMbps)) {
    return { valid: false, error: 'Upload speed must be a non-negative number' };
  }

  let downloadScore = downloadSpeedMbps >= 25 ? 30 : downloadSpeedMbps >= 10 ? 20 : downloadSpeedMbps >= 3 ? 10 : 0;
  let uploadScore = uploadSpeedMbps >= 5 ? 25 : uploadSpeedMbps >= 2 ? 15 : 5;
  let latencyScore = networkLatencyMs <= 50 ? 25 : networkLatencyMs <= 150 ? 15 : 5;
  let packetLossPenalty = Math.min(20, Math.round(packetLossPct * 5));

  const totalScore = Math.max(0, Math.min(100, downloadScore + uploadScore + latencyScore - packetLossPenalty + (cameraResolutionP >= 720 ? 20 : 10)));

  let qualityTier = 'HD_VIDEO_READY';
  let isAudioOnlyFallbackAdvised = false;

  if (totalScore < 45 || downloadSpeedMbps < 3 || uploadSpeedMbps < 1) {
    qualityTier = 'AUDIO_ONLY_FALLBACK_RECOMMENDED';
    isAudioOnlyFallbackAdvised = true;
  } else if (totalScore < 75) {
    qualityTier = 'STANDARD_DEF_VIDEO';
  }

  return {
    valid: true,
    downloadSpeedMbps,
    uploadSpeedMbps,
    networkLatencyMs,
    packetLossPct,
    cameraResolutionP,
    videoQualityScore: totalScore,
    qualityTier,
    isAudioOnlyFallbackAdvised,
    recommendation: isAudioOnlyFallbackAdvised
      ? `Low bandwidth detected (Score: ${totalScore}/100). Switch to audio-only telehealth visit to avoid call drops.`
      : qualityTier === 'STANDARD_DEF_VIDEO'
      ? `Standard definition telehealth visit ready (Score: ${totalScore}/100). Close bandwidth-heavy background applications.`
      : `HD video consultation ready (Score: ${totalScore}/100). Optimal clinical video quality.`
  };
}

export function calculatePatientPrescriptionRefillAlertStatus({
  currentDosesRemaining = 5,
  dailyDoseFrequency = 2,
  pharmacyProcessingDays = 3,
  isControlledSubstance = false
} = {}) {
  if (typeof currentDosesRemaining !== 'number' || currentDosesRemaining < 0 || isNaN(currentDosesRemaining)) {
    return { valid: false, error: 'Current doses remaining must be a non-negative number' };
  }
  if (typeof dailyDoseFrequency !== 'number' || dailyDoseFrequency <= 0 || isNaN(dailyDoseFrequency)) {
    return { valid: false, error: 'Daily dose frequency must be a positive number' };
  }

  const daysSupplyRemaining = Math.round((currentDosesRemaining / dailyDoseFrequency) * 10) / 10;
  const leadTimeDaysRequired = pharmacyProcessingDays + (isControlledSubstance ? 2 : 1);
  const isRefillAlertNeeded = daysSupplyRemaining <= leadTimeDaysRequired;

  let alertUrgencyTier = 'NORMAL_SUPPLY';
  if (daysSupplyRemaining <= 1) {
    alertUrgencyTier = 'CRITICAL_RUN_OUT_IMMINENT';
  } else if (isRefillAlertNeeded) {
    alertUrgencyTier = 'REFILL_REQUEST_DUE';
  }

  return {
    valid: true,
    currentDosesRemaining,
    dailyDoseFrequency,
    daysSupplyRemaining,
    leadTimeDaysRequired,
    isControlledSubstance: Boolean(isControlledSubstance),
    isRefillAlertNeeded,
    alertUrgencyTier,
    recommendation: alertUrgencyTier === 'CRITICAL_RUN_OUT_IMMINENT'
      ? `Critical medication supply! Only ${daysSupplyRemaining} days left (${currentDosesRemaining} doses). Immediate refill request sent.`
      : alertUrgencyTier === 'REFILL_REQUEST_DUE'
      ? `Prescription refill required (${daysSupplyRemaining} days remaining, lead time needed: ${leadTimeDaysRequired} days).`
      : `Medication supply adequate (${daysSupplyRemaining} days remaining).`
  };
}

export function calculatePatientChronicDiseaseAdherenceScore({
  takenDosesCount = 28,
  prescribedDosesCount = 30,
  missedDoseStreakDays = 0,
  hasSevereSideEffectsReported = false,
  isHighRiskCondition = true
} = {}) {
  if (typeof takenDosesCount !== 'number' || takenDosesCount < 0 || isNaN(takenDosesCount)) {
    return { valid: false, error: 'Taken doses count must be a non-negative number' };
  }
  if (typeof prescribedDosesCount !== 'number' || prescribedDosesCount <= 0 || isNaN(prescribedDosesCount)) {
    return { valid: false, error: 'Prescribed doses count must be a positive number' };
  }

  const adherencePct = Math.min(100, Math.round((takenDosesCount / prescribedDosesCount) * 100 * 10) / 10);
  let penalty = 0;
  if (missedDoseStreakDays > 2) penalty += 15;
  if (hasSevereSideEffectsReported) penalty += 20;

  const finalAdherenceScore = Math.max(0, Math.min(100, Math.round(adherencePct - penalty)));

  let adherenceTier = 'OPTIMAL_ADHERENCE';
  if (finalAdherenceScore < 60 || missedDoseStreakDays >= 3) {
    adherenceTier = 'NON_ADHERENT_HIGH_RISK';
  } else if (finalAdherenceScore < 85) {
    adherenceTier = 'MODERATE_ADHERENCE_WARNING';
  }

  return {
    valid: true,
    takenDosesCount,
    prescribedDosesCount,
    adherencePct,
    missedDoseStreakDays,
    hasSevereSideEffectsReported: Boolean(hasSevereSideEffectsReported),
    isHighRiskCondition: Boolean(isHighRiskCondition),
    finalAdherenceScore,
    adherenceTier,
    recommendation: adherenceTier === 'NON_ADHERENT_HIGH_RISK'
      ? `High non-adherence risk (Score: ${finalAdherenceScore}/100, ${missedDoseStreakDays} consecutive missed days). Nurse check-in recommended.`
      : adherenceTier === 'MODERATE_ADHERENCE_WARNING'
      ? `Moderate adherence warning (${adherencePct}% adherence rate). Enable daily dosage push notifications.`
      : `Optimal medication adherence achieved (${adherencePct}% rate, Score: ${finalAdherenceScore}/100).`
  };
}

export function calculatePatientEmergencyTriageAndBedAllocationScore({
  vitalSignsAlertLevel = 3,
  triagePriorityLevel = 2,
  isICURequired = false,
  edWaitTimeMinutes = 45,
  availableBedsCount = 4
} = {}) {
  if (typeof vitalSignsAlertLevel !== 'number' || vitalSignsAlertLevel < 1 || vitalSignsAlertLevel > 5) {
    return { valid: false, error: 'Vital signs alert level must be between 1 and 5' };
  }
  if (typeof triagePriorityLevel !== 'number' || triagePriorityLevel < 1 || triagePriorityLevel > 5) {
    return { valid: false, error: 'Triage priority level must be between 1 and 5' };
  }
  if (typeof edWaitTimeMinutes !== 'number' || edWaitTimeMinutes < 0) {
    return { valid: false, error: 'ED wait time minutes must be a non-negative number' };
  }
  if (typeof availableBedsCount !== 'number' || availableBedsCount < 0) {
    return { valid: false, error: 'Available beds count must be a non-negative number' };
  }

  let urgencyPoints = (6 - triagePriorityLevel) * 20 + vitalSignsAlertLevel * 8;
  if (isICURequired) urgencyPoints += 25;
  if (edWaitTimeMinutes > 60) urgencyPoints += 10;

  const totalUrgencyScore = Math.min(100, Math.round(urgencyPoints));

  let allocationTier = 'STABLE_WAITING_ROOM';
  if (totalUrgencyScore >= 80 || isICURequired || triagePriorityLevel === 1) {
    allocationTier = 'EMERGENCY_IMMEDIATE_ICU';
  } else if (totalUrgencyScore >= 50 || availableBedsCount < 2) {
    allocationTier = 'URGENT_BED_ALLOCATION';
  }

  return {
    valid: true,
    vitalSignsAlertLevel,
    triagePriorityLevel,
    isICURequired: Boolean(isICURequired),
    edWaitTimeMinutes,
    availableBedsCount,
    totalUrgencyScore,
    allocationTier,
    recommendation: allocationTier === 'EMERGENCY_IMMEDIATE_ICU'
      ? `Critical emergency status (Urgency Score: ${totalUrgencyScore}/100). Immediate resuscitation room and ICU bed transfer mandatory.`
      : allocationTier === 'URGENT_BED_ALLOCATION'
      ? `Urgent bed assignment required (Urgency Score: ${totalUrgencyScore}/100, ${availableBedsCount} beds available).`
      : `Patient stable in triage waiting area (${edWaitTimeMinutes}m wait time).`
  };
}




























