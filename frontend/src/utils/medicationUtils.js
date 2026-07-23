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






