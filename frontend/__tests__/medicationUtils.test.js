import assert from 'node:assert';
import test from 'node:test';
import { parseFrequencyToDailyCount, calculateMedicationDurationDays, validateDosageInput, calculateRefillDate, checkPotentialDrugInteraction, calculateAdherenceRate, generateDoseScheduleTimes, formatDosageInstructions, calculateNextMedicationReminder, calculateMedicationRefillUrgency, calculateDailyDoseComplianceScore, formatPrescriptionSummary, calculateBMIAndHealthRiskCategory, calculatePediatricDoseByWeight, calculateEstimatedOutofPocketMedicationCost, calculatePatientVitalSignsAlertLevel, calculatePatientWaterHydrationTarget, calculateMedicationAdherenceRiskScore, calculateDoctorSlotOccupancyAndAvailability, calculateEmergencyTriagePriorityLevel, calculateMedicationAdherenceRate, calculateTelehealthSlotOptimizationScore, calculateMedicationInteractionRiskScore, calculatePatientVitalSignStabilityIndex, calculatePatientAppointmentTriagePriority, calculatePatientPrescriptionRefillRiskIndex, calculatePatientPolypharmacyRiskIndex, calculatePatientReadmissionRiskScore, calculatePatientMedicationAdherenceTier, calculatePatientEmergencyRiskScore, calculatePatientAppointmentNoShowProbability, calculatePatientChronicConditionComplexityIndex, calculatePatientMedicationRefillAdherenceScore, calculatePatientMedicationStorageTemperatureSafety, calculatePatientVitalSignAnomalyAlertScore, calculatePatientLabTestResultSeverityScore, calculateTelehealthSlotOptimizationIndex, calculateTelehealthConsultationTriagingIndex, calculatePatientHealthScoreAndRiskTier, calculatePatientMedicationSideEffectRiskScore, calculatePatientPediatricDosageSafety, calculatePatientRenalDoseAdjustment, calculatePatientAnticholinergicCognitiveRiskScore, calculatePatientPolypharmacyInteractionIndex, calculatePatientGeriatricMedicationSafetyAudit, calculatePatientComprehensiveLabAlertAndRiskScore, calculatePatientChronicDiseaseMultimorbidityScore, calculatePatientCardiovascularRiskScore, calculatePatientGlycemicControlAndDiabetesRiskScore, calculatePatientHypertensionAndCardiovascularRiskScore } from '../src/utils/medicationUtils.js';















test('parseFrequencyToDailyCount', () => {
  assert.strictEqual(parseFrequencyToDailyCount('once daily'), 1);
  assert.strictEqual(parseFrequencyToDailyCount('twice a day (BID)'), 2);
  assert.strictEqual(parseFrequencyToDailyCount('thrice daily (TID)'), 3);
  assert.strictEqual(parseFrequencyToDailyCount('4x daily'), 4);
  assert.strictEqual(parseFrequencyToDailyCount(null), 1);
 });

test('calculateMedicationDurationDays', () => {
  assert.strictEqual(calculateMedicationDurationDays('2026-07-01', '2026-07-10'), 10);
  assert.strictEqual(calculateMedicationDurationDays('2026-07-10', '2026-07-01'), 0);
  assert.strictEqual(calculateMedicationDurationDays(null, '2026-07-10'), 0);
});

test('validateDosageInput', () => {
  assert.strictEqual(validateDosageInput(250).valid, true);
  assert.strictEqual(validateDosageInput(-50).valid, false);
  assert.strictEqual(validateDosageInput(1500, 1000).valid, false);
});

test('calculateRefillDate', () => {
  assert.strictEqual(calculateRefillDate('2026-07-01', 60, 2), '2026-07-31');
  assert.strictEqual(calculateRefillDate('invalid-date', 60, 2), null);
  assert.strictEqual(calculateRefillDate('2026-07-01', 0, 2), null);
});

test('checkPotentialDrugInteraction', () => {
  const resultHigh = checkPotentialDrugInteraction(['Aspirin 81mg', 'Warfarin 5mg']);
  assert.strictEqual(resultHigh.hasInteraction, true);
  assert.strictEqual(resultHigh.warnings.length, 1);
  assert.strictEqual(resultHigh.warnings[0].severity, 'high');

  const resultSafe = checkPotentialDrugInteraction(['Vitamin C', 'Zinc']);
  assert.strictEqual(resultSafe.hasInteraction, false);
  assert.strictEqual(resultSafe.warnings.length, 0);
});

test('calculateAdherenceRate', () => {
  const logs = [{ taken: true }, { taken: true }, { taken: false }, { taken: true }];
  const res = calculateAdherenceRate(logs);
  assert.strictEqual(res.percentage, 75);
  assert.strictEqual(res.status, 'Good');

  const emptyRes = calculateAdherenceRate([]);
  assert.strictEqual(emptyRes.percentage, 0);
  assert.strictEqual(emptyRes.status, 'No Data');
});

test('generateDoseScheduleTimes', () => {
  const times2 = generateDoseScheduleTimes(2, 8);
  assert.strictEqual(times2.length, 2);
  assert.strictEqual(times2[0], '08:00 AM');
  assert.strictEqual(times2[1], '04:00 PM');
});

test('formatDosageInstructions', () => {
  assert.strictEqual(formatDosageInstructions('Amoxicillin', 500, 'twice daily', 'take after meal'), 'Amoxicillin 500mg (twice daily) — Note: take after meal');
  assert.strictEqual(formatDosageInstructions('Paracetamol', 0, ''), 'Paracetamol (as prescribed)');
  assert.strictEqual(formatDosageInstructions(null, 500, 'once daily'), '');
});

test('calculateNextMedicationReminder', () => {
  const schedules = [{ name: 'Aspirin', time: '08:00' }, { name: 'Vitamin D', time: '20:00' }];
  const res = calculateNextMedicationReminder(schedules, '12:00');
  assert.strictEqual(res.nextDose.name, 'Vitamin D');
  assert.ok(res.message.includes('20:00'));

  const empty = calculateNextMedicationReminder([]);
  assert.strictEqual(empty.nextDose, null);
});

test('calculateMedicationRefillUrgency', () => {
  const critical = calculateMedicationRefillUrgency(3, 2, 5);
  assert.strictEqual(critical.daysRemaining, 1);
  assert.strictEqual(critical.urgency, 'CRITICAL');
  assert.strictEqual(critical.needsRefill, true);

  const warning = calculateMedicationRefillUrgency(8, 2, 5);
  assert.strictEqual(warning.daysRemaining, 4);
  assert.strictEqual(warning.urgency, 'WARNING');
  assert.strictEqual(warning.needsRefill, true);

  const ok = calculateMedicationRefillUrgency(20, 2, 5);
  assert.strictEqual(ok.daysRemaining, 10);
  assert.strictEqual(ok.urgency, 'OK');
  assert.strictEqual(ok.needsRefill, false);
});

test('calculateDailyDoseComplianceScore', () => {
  const logs = [{ taken: true }, { taken: true }, { taken: false }];
  const res = calculateDailyDoseComplianceScore(logs, 3);
  assert.strictEqual(res.scorePercentage, 67);
  assert.strictEqual(res.isCompliant, false);

  const empty = calculateDailyDoseComplianceScore([]);
  assert.strictEqual(empty.scorePercentage, 0);
});

test('formatPrescriptionSummary', () => {
  const med = { name: 'Metformin', dosage: '500mg', frequency: 'twice daily', refills: 3 };
  assert.strictEqual(formatPrescriptionSummary(med), 'Metformin - 500mg (twice daily) | Refills left: 3');
});

test('calculateBMIAndHealthRiskCategory', () => {
  const normal = calculateBMIAndHealthRiskCategory(70, 175);
  assert.strictEqual(normal.bmi, 22.9);
  assert.strictEqual(normal.category, 'Normal weight');

  const overweight = calculateBMIAndHealthRiskCategory(85, 175);
  assert.strictEqual(overweight.bmi, 27.8);
  assert.strictEqual(overweight.category, 'Overweight');
  assert.strictEqual(overweight.riskLevel, 'Increased');
});

test('calculatePediatricDoseByWeight', () => {
  const child = calculatePediatricDoseByWeight(500, 35, 70); // 35kg / 70kg = 50%
  assert.strictEqual(child.valid, true);
  assert.strictEqual(child.recommendedDoseMg, 250);
  assert.strictEqual(child.percentageOfAdultDose, 50);

  const invalid = calculatePediatricDoseByWeight(0, 35);
  assert.strictEqual(invalid.valid, false);
});

test('calculateEstimatedOutofPocketMedicationCost', () => {
  const brand = calculateEstimatedOutofPocketMedicationCost({ retailPriceUsd: 100, copayUsd: 15 });
  assert.strictEqual(brand.valid, true);
  assert.strictEqual(brand.outOfPocketCostUsd, 15);
  assert.strictEqual(brand.savingsUsd, 85);

  const generic = calculateEstimatedOutofPocketMedicationCost({ retailPriceUsd: 100, isGeneric: true, genericDiscountPct: 50, insuranceCoveragePct: 80 });
  assert.strictEqual(generic.effectivePrice, 50);
  assert.strictEqual(generic.outOfPocketCostUsd, 10);
  assert.strictEqual(generic.savingsUsd, 90);
});

test('calculatePatientVitalSignsAlertLevel', () => {
  const normal = calculatePatientVitalSignsAlertLevel({ heartRateBpm: 72, systolicBp: 118, diastolicBp: 78, oxygenSaturationPct: 98 });
  assert.strictEqual(normal.alertLevel, 'NORMAL');
  assert.strictEqual(normal.requiresImmediateAttention, false);

  const critical = calculatePatientVitalSignsAlertLevel({ heartRateBpm: 130, systolicBp: 185, diastolicBp: 125, oxygenSaturationPct: 88 });
  assert.strictEqual(critical.alertLevel, 'CRITICAL_ALERT');
  assert.strictEqual(critical.requiresImmediateAttention, true);
  assert.ok(critical.warnings.length >= 2);
});

test('calculatePatientWaterHydrationTarget', () => {
  const norm = calculatePatientWaterHydrationTarget(70, 30, false);
  assert.strictEqual(norm.valid, true);
  assert.strictEqual(norm.totalMl, 2800);
  assert.strictEqual(norm.targetLiters, 2.8);
  assert.strictEqual(norm.targetGlasses, 11);

  const hot = calculatePatientWaterHydrationTarget(70, 60, true);
  assert.strictEqual(hot.valid, true);
  assert.strictEqual(hot.totalMl, 3650);

  const invalid = calculatePatientWaterHydrationTarget(0);
  assert.strictEqual(invalid.valid, false);
  assert.strictEqual(invalid.targetLiters, 0);
});

test('calculateMedicationAdherenceRiskScore', () => {
  const highRisk = calculateMedicationAdherenceRiskScore({ missedDoses30Days: 7, refillDelayDays: 5, activeMedicationsCount: 5 });
  assert.strictEqual(highRisk.riskLevel, 'HIGH');
  assert.strictEqual(highRisk.isHighRisk, true);
  assert.ok(highRisk.riskScore >= 60);
  assert.ok(highRisk.riskFactors.length >= 3);

  const lowRisk = calculateMedicationAdherenceRiskScore({ missedDoses30Days: 0, refillDelayDays: 0, activeMedicationsCount: 1 });
  assert.strictEqual(lowRisk.riskLevel, 'LOW');
  assert.strictEqual(lowRisk.isHighRisk, false);
  assert.strictEqual(lowRisk.riskScore, 0);
});

test('calculateDoctorSlotOccupancyAndAvailability', () => {
  const schedules = [
    { doctor_id: 'doc1', available_slots: 10 },
    { doctor_id: 'doc2', available_slots: 10 }
  ];
  const appointments = [
    { doctor_id: 'doc1', status: 'confirmed' },
    { doctor_id: 'doc1', status: 'pending' }
  ];

  const overall = calculateDoctorSlotOccupancyAndAvailability(schedules, appointments);
  assert.strictEqual(overall.totalCapacitySlots, 20);
  assert.strictEqual(overall.bookedAppointmentsCount, 2);
  assert.strictEqual(overall.availableSlotsCount, 18);
  assert.strictEqual(overall.occupancyPercentage, 10);
  assert.strictEqual(overall.status, 'AVAILABLE');

  const doc1 = calculateDoctorSlotOccupancyAndAvailability(schedules, appointments, 'doc1');
  assert.strictEqual(doc1.totalCapacitySlots, 10);
  assert.strictEqual(doc1.bookedAppointmentsCount, 2);
  assert.strictEqual(doc1.availableSlotsCount, 8);
  assert.strictEqual(doc1.occupancyPercentage, 20);
});

test('calculateEmergencyTriagePriorityLevel', () => {
  const resuscitation = calculateEmergencyTriagePriorityLevel({ isUnresponsive: true });
  assert.strictEqual(resuscitation.triageLevel, 1);
  assert.strictEqual(resuscitation.maxWaitMinutes, 0);
  assert.strictEqual(resuscitation.requiresImmediateResuscitation, true);

  const emergent = calculateEmergencyTriagePriorityLevel({ systolicBp: 185, painScale: 9 });
  assert.strictEqual(emergent.triageLevel, 2);
  assert.strictEqual(emergent.maxWaitMinutes, 15);
  assert.strictEqual(emergent.requiresImmediateResuscitation, false);

  const urgent = calculateEmergencyTriagePriorityLevel({ temperatureC: 38.5, painScale: 6 });
  assert.strictEqual(urgent.triageLevel, 3);
  assert.strictEqual(urgent.maxWaitMinutes, 30);

  const nonUrgent = calculateEmergencyTriagePriorityLevel({ heartRate: 72, systolicBp: 118, temperatureC: 36.8, painScale: 0 });
  assert.strictEqual(nonUrgent.triageLevel, 5);
  assert.strictEqual(nonUrgent.maxWaitMinutes, 120);
});

test('calculateMedicationAdherenceRate', () => {
  const optimal = calculateMedicationAdherenceRate({ dosesScheduled: 30, dosesTaken: 29 });
  assert.strictEqual(optimal.adherencePercentage, 96.67);
  assert.strictEqual(optimal.riskTier, 'OPTIMAL');
  assert.strictEqual(optimal.isAlertTriggered, false);

  const subOptimal = calculateMedicationAdherenceRate({ dosesScheduled: 30, dosesTaken: 24 });
  assert.strictEqual(subOptimal.adherencePercentage, 80);
  assert.strictEqual(subOptimal.riskTier, 'SUB_OPTIMAL');
  assert.strictEqual(subOptimal.isAlertTriggered, true);

  const nonAdherent = calculateMedicationAdherenceRate({ dosesScheduled: 30, dosesTaken: 15 });
  assert.strictEqual(nonAdherent.adherencePercentage, 50);
  assert.strictEqual(nonAdherent.riskTier, 'NON_ADHERENT');
  assert.strictEqual(nonAdherent.isAlertTriggered, true);
});

test('calculateTelehealthSlotOptimizationScore', () => {
  const res = calculateTelehealthSlotOptimizationScore({
    doctorAvailableHours: 8,
    bookedSlots: 10,
    patientUrgencyLevel: 'HIGH',
    isFollowUpAppointment: true
  });
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.maxSlots, 32);
  assert.strictEqual(res.remainingSlots, 22);
  assert.strictEqual(res.isHighPrioritySlot, true);
});

test('calculateMedicationInteractionRiskScore', () => {
  const res = calculateMedicationInteractionRiskScore({
    activeMedications: ['Aspirin', 'Lisinopril', 'Metformin', 'Atorvastatin', 'Omeprazole'],
    knownAllergies: ['Aspirin'],
    hasRenalImpairment: true
  });
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.riskTier, 'CRITICAL');
  assert.strictEqual(res.hasAllergyConflict, true);
  assert.ok(res.interactionRiskScore >= 60);
});

test('calculatePatientVitalSignStabilityIndex', () => {
  const res = calculatePatientVitalSignStabilityIndex({
    systolicBp: 120,
    diastolicBp: 80,
    heartRate: 72,
    oxygenSatPercentage: 98,
    temperatureC: 37.0
  });
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.stabilityIndex, 100);
  assert.strictEqual(res.clinicalTier, 'OPTIMAL');
  assert.strictEqual(res.isStable, true);

  const resAbnormal = calculatePatientVitalSignStabilityIndex({
    systolicBp: 155,
    diastolicBp: 95,
    heartRate: 110,
    oxygenSatPercentage: 92,
    temperatureC: 38.5
  });
  assert.strictEqual(resAbnormal.valid, true);
  assert.strictEqual(resAbnormal.clinicalTier, 'CRITICAL');
  assert.strictEqual(resAbnormal.isStable, false);
});

test('calculatePatientAppointmentTriagePriority', () => {
  const res = calculatePatientAppointmentTriagePriority({
    symptomSeverityScore: 8,
    waitTimeMinutes: 50,
    hasPreExistingCondition: true,
    ageYears: 70
  });
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.triageCategory, 'EMERGENCY');
  assert.strictEqual(res.isUrgent, true);

  const resLow = calculatePatientAppointmentTriagePriority({
    symptomSeverityScore: 3,
    waitTimeMinutes: 10,
    hasPreExistingCondition: false,
    ageYears: 30
  });
  assert.strictEqual(resLow.valid, true);
  assert.strictEqual(resLow.triageCategory, 'LOW');
  assert.strictEqual(resLow.isUrgent, false);

  const resInvalid = calculatePatientAppointmentTriagePriority({ symptomSeverityScore: 12 });
  assert.strictEqual(resInvalid.valid, false);
});

test('calculatePatientPrescriptionRefillRiskIndex', () => {
  const stockout = calculatePatientPrescriptionRefillRiskIndex({
    daysSupplyRemaining: 2,
    pharmacyProcessingDays: 3,
    hasRefillsRemaining: false
  });
  assert.strictEqual(stockout.valid, true);
  assert.strictEqual(stockout.isStockoutRisk, true);
  assert.strictEqual(stockout.riskLevel, 'CRITICAL');
  assert.ok(stockout.riskScore >= 75);

  const adequate = calculatePatientPrescriptionRefillRiskIndex({
    daysSupplyRemaining: 15,
    pharmacyProcessingDays: 3,
    hasRefillsRemaining: true
  });
  assert.strictEqual(adequate.valid, true);
  assert.strictEqual(adequate.isStockoutRisk, false);
  assert.strictEqual(adequate.riskLevel, 'LOW');
});

test('calculatePatientPolypharmacyRiskIndex', () => {
  const highRisk = calculatePatientPolypharmacyRiskIndex({
    activeMedicationCount: 6,
    patientAgeYears: 70,
    hasRenalImpairment: true
  });
  assert.strictEqual(highRisk.valid, true);
  assert.strictEqual(highRisk.riskLevel, 'CRITICAL');
  assert.strictEqual(highRisk.isHighRisk, true);
  assert.ok(highRisk.recommendation.includes('clinical pharmacist review'));

  const lowRisk = calculatePatientPolypharmacyRiskIndex({
    activeMedicationCount: 1,
    patientAgeYears: 30
  });
  assert.strictEqual(lowRisk.valid, true);
  assert.strictEqual(lowRisk.riskLevel, 'LOW');
  assert.strictEqual(lowRisk.isHighRisk, false);

  const invalid = calculatePatientPolypharmacyRiskIndex({ activeMedicationCount: -2 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientReadmissionRiskScore', () => {
  const highRisk = calculatePatientReadmissionRiskScore({
    patientAgeYears: 78,
    priorHospitalizationsCount: 3,
    activeMedicationCount: 6,
    vitalStabilityIndex: 65,
    hasChronicConditions: true
  });
  assert.strictEqual(highRisk.valid, true);
  assert.strictEqual(highRisk.riskLevel, 'HIGH');
  assert.strictEqual(highRisk.isHighReadmissionRisk, true);
  assert.ok(highRisk.recommendation.includes('48 hours'));

  const lowRisk = calculatePatientReadmissionRiskScore({
    patientAgeYears: 40,
    priorHospitalizationsCount: 0,
    activeMedicationCount: 1,
    vitalStabilityIndex: 95,
    hasChronicConditions: false
  });
  assert.strictEqual(lowRisk.valid, true);
  assert.strictEqual(lowRisk.riskLevel, 'LOW');
  assert.strictEqual(lowRisk.isHighReadmissionRisk, false);

  const invalid = calculatePatientReadmissionRiskScore({ patientAgeYears: -5 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientMedicationAdherenceTier', () => {
  const excel = calculatePatientMedicationAdherenceTier({
    totalPrescribedDoses: 30,
    totalDosesTaken: 30,
    lateDosesCount: 0,
    sideEffectEventsCount: 0
  });
  assert.strictEqual(excel.valid, true);
  assert.strictEqual(excel.tier, 'EXCELLENT');
  assert.strictEqual(excel.adherenceScore, 90);
  assert.strictEqual(excel.isCompliant, true);

  const poor = calculatePatientMedicationAdherenceTier({
    totalPrescribedDoses: 30,
    totalDosesTaken: 15,
    lateDosesCount: 5,
    sideEffectEventsCount: 2
  });
  assert.strictEqual(poor.valid, true);
  assert.strictEqual(poor.tier, 'POOR');
  assert.strictEqual(poor.isCompliant, false);

  const invalid = calculatePatientMedicationAdherenceTier({ totalPrescribedDoses: 0 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientEmergencyRiskScore', () => {
  const critical = calculatePatientEmergencyRiskScore({
    heartRateBpm: 120,
    systolicBp: 170,
    oxygenSaturationPercent: 88,
    hasChestPain: true,
    hasShortnessOfBreath: true
  });
  assert.strictEqual(critical.valid, true);
  assert.strictEqual(critical.triageTier, 'CRITICAL');
  assert.strictEqual(critical.isEmergencyEscalationRequired, true);
  assert.ok(critical.totalRiskScore >= 75);
  assert.ok(critical.recommendation.includes('CRITICAL ALERT'));

  const stable = calculatePatientEmergencyRiskScore({
    heartRateBpm: 72,
    systolicBp: 118,
    oxygenSaturationPercent: 99,
    bodyTempCelsius: 36.6,
    respiratoryRateBpm: 14,
    hasChestPain: false,
    hasShortnessOfBreath: false
  });
  assert.strictEqual(stable.valid, true);
  assert.strictEqual(stable.triageTier, 'STABLE');
  assert.strictEqual(stable.isEmergencyEscalationRequired, false);

  const invalid = calculatePatientEmergencyRiskScore({ heartRateBpm: -10 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientAppointmentNoShowProbability - evaluates low and high risk tiers correctly', () => {
  const lowRisk = calculatePatientAppointmentNoShowProbability({
    pastNoShowCount: 0,
    totalAppointmentsBooked: 10,
    distanceToClinicKm: 3,
    appointmentLeadDays: 2,
    reminderSent: true
  });
  assert.strictEqual(lowRisk.valid, true);
  assert.strictEqual(lowRisk.riskTier, 'LOW_RISK');
  assert.strictEqual(lowRisk.requiresConfirmationCall, false);

  const highRisk = calculatePatientAppointmentNoShowProbability({
    pastNoShowCount: 4,
    totalAppointmentsBooked: 5,
    distanceToClinicKm: 30,
    appointmentLeadDays: 20,
    reminderSent: false
  });
  assert.strictEqual(highRisk.valid, true);
  assert.strictEqual(highRisk.riskTier, 'HIGH_RISK');
  assert.strictEqual(highRisk.requiresConfirmationCall, true);

  const invalid = calculatePatientAppointmentNoShowProbability({ totalAppointmentsBooked: -1 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientChronicConditionComplexityIndex', () => {
  const highComplexity = calculatePatientChronicConditionComplexityIndex({
    chronicConditionCount: 4,
    activeMedicationCount: 6,
    hospitalizationPastYearCount: 1,
    ageYears: 70,
    hasSpecialistCare: false
  });
  assert.strictEqual(highComplexity.valid, true);
  assert.strictEqual(highComplexity.complexityTier, 'HIGH_COMPLEXITY');
  assert.strictEqual(highComplexity.requiresMultidisciplinaryCare, true);
  assert.strictEqual(highComplexity.recommendation.includes('multidisciplinary care coordinator'), true);

  const invalid = calculatePatientChronicConditionComplexityIndex({ chronicConditionCount: -1 });
  assert.strictEqual(invalid.valid, false);
  assert.strictEqual(invalid.error, 'Chronic condition count must be a non-negative number');
});

test('calculatePatientMedicationRefillAdherenceScore', () => {
  const high = calculatePatientMedicationRefillAdherenceScore({
    totalPrescriptions: 4,
    refilledOnTimeCount: 4,
    missedDosesPastMonth: 0,
    refillDelayDaysAvg: 0
  });
  assert.strictEqual(high.valid, true);
  assert.strictEqual(high.refillOnTimeRate, 100);
  assert.strictEqual(high.adherenceScore, 100);
  assert.strictEqual(high.adherenceTier, 'HIGH_ADHERENCE');
  assert.strictEqual(high.isInterventionRequired, false);

  const poor = calculatePatientMedicationRefillAdherenceScore({
    totalPrescriptions: 4,
    refilledOnTimeCount: 1,
    missedDosesPastMonth: 6,
    refillDelayDaysAvg: 5
  });
  assert.strictEqual(poor.valid, true);
  assert.strictEqual(poor.adherenceTier, 'POOR_ADHERENCE');
  assert.strictEqual(poor.isInterventionRequired, true);

  const invalid = calculatePatientMedicationRefillAdherenceScore({ totalPrescriptions: 0 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientMedicationStorageTemperatureSafety', () => {
  const optimal = calculatePatientMedicationStorageTemperatureSafety({
    storageTemperatureCelsius: 20.0,
    minAllowedCelsius: 15.0,
    maxAllowedCelsius: 25.0
  });
  assert.strictEqual(optimal.valid, true);
  assert.strictEqual(optimal.safetyTier, 'OPTIMAL');
  assert.strictEqual(optimal.isExcursion, false);
  assert.strictEqual(optimal.isPotencyCompromised, false);

  const excursion = calculatePatientMedicationStorageTemperatureSafety({
    storageTemperatureCelsius: 38.0,
    minAllowedCelsius: 15.0,
    maxAllowedCelsius: 25.0,
    exposureDurationHours: 30
  });
  assert.strictEqual(excursion.valid, true);
  assert.strictEqual(excursion.safetyTier, 'CRITICAL_EXCURSION');
  assert.strictEqual(excursion.isExcursion, true);
  assert.strictEqual(excursion.isPotencyCompromised, true);

  const invalid = calculatePatientMedicationStorageTemperatureSafety({ storageTemperatureCelsius: NaN });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientVitalSignAnomalyAlertScore - calculates anomaly alert score and warnings accurately', () => {
  const normal = calculatePatientVitalSignAnomalyAlertScore({
    systolicBp: 120,
    diastolicBp: 80,
    heartRateBpm: 72,
    oxygenSaturationPct: 98,
    bodyTemperatureC: 37.0
  });
  assert.strictEqual(normal.valid, true);
  assert.strictEqual(normal.anomalyScore, 0);
  assert.strictEqual(normal.alertTier, 'NORMAL');
  assert.strictEqual(normal.isUrgentCareNeeded, false);

  const critical = calculatePatientVitalSignAnomalyAlertScore({
    systolicBp: 185,
    diastolicBp: 125,
    heartRateBpm: 130,
    oxygenSaturationPct: 88,
    bodyTemperatureC: 39.5
  });
  assert.strictEqual(critical.valid, true);
  assert.strictEqual(critical.alertTier, 'CRITICAL_ALERT');
  assert.strictEqual(critical.isUrgentCareNeeded, true);
  assert.ok(critical.warnings.includes('Hypertensive Crisis'));
  assert.ok(critical.warnings.includes('Severe Hypoxia'));
});

test('calculatePatientLabTestResultSeverityScore', () => {
  const normal = calculatePatientLabTestResultSeverityScore({
    hba1cPct: 5.4,
    fastingGlucoseMgDl: 90,
    creatinineMgDl: 0.9,
    altLiverEnzymeUL: 22
  });
  assert.strictEqual(normal.valid, true);
  assert.strictEqual(normal.severityTier, 'NORMAL');
  assert.strictEqual(normal.isFollowUpRequired, false);

  const severe = calculatePatientLabTestResultSeverityScore({
    hba1cPct: 9.5,
    fastingGlucoseMgDl: 210,
    creatinineMgDl: 2.2,
    altLiverEnzymeUL: 110
  });
  assert.strictEqual(severe.valid, true);
  assert.strictEqual(severe.severityTier, 'HIGH_SEVERITY');
  assert.strictEqual(severe.isFollowUpRequired, true);
  assert.ok(severe.abnormalMarkers.length >= 3);
});

test('calculateTelehealthConsultationTriagingIndex', () => {
  const urgent = calculateTelehealthConsultationTriagingIndex({
    symptomSeverityScore: 9,
    vitalsStabilityScore: 4,
    medicationAdherenceRate: 50,
    pastVisitCount30Days: 2
  });
  assert.strictEqual(urgent.valid, true);
  assert.strictEqual(urgent.triageTier, 'URGENT_TELEHEALTH');
  assert.strictEqual(urgent.recommendedSlotDurationMins, 30);
  assert.ok(urgent.recommendation.includes('Urgent telehealth consultation required'));

  const routine = calculateTelehealthConsultationTriagingIndex({
    symptomSeverityScore: 3,
    vitalsStabilityScore: 9,
    medicationAdherenceRate: 95,
    pastVisitCount30Days: 0
  });
  assert.strictEqual(routine.valid, true);
  assert.strictEqual(routine.triageTier, 'ROUTINE');
  assert.strictEqual(routine.recommendedSlotDurationMins, 15);

  const invalid = calculateTelehealthConsultationTriagingIndex({ symptomSeverityScore: 15 });
  assert.strictEqual(invalid.valid, false);
  assert.strictEqual(invalid.error, 'Symptom severity score must be between 1 and 10');
});

test('calculatePatientHealthScoreAndRiskTier', () => {
  const healthy = calculatePatientHealthScoreAndRiskTier({
    vitalsStabilityIndex: 90,
    adherenceRatePct: 95,
    readmissionRiskScore: 10,
    chronicConditionsCount: 0
  });
  assert.strictEqual(healthy.valid, true);
  assert.strictEqual(healthy.healthScore, 92);
  assert.strictEqual(healthy.riskTier, 'LOW_RISK');

  const highRisk = calculatePatientHealthScoreAndRiskTier({
    vitalsStabilityIndex: 30,
    adherenceRatePct: 40,
    readmissionRiskScore: 80,
    chronicConditionsCount: 3
  });
  assert.strictEqual(highRisk.valid, true);
  assert.strictEqual(highRisk.riskTier, 'HIGH_RISK');
  assert.ok(highRisk.recommendation.includes('Schedule clinical follow-up'));
});

test('calculatePatientMedicationSideEffectRiskScore', () => {
  const high = calculatePatientMedicationSideEffectRiskScore({
    activeMedicationCount: 8,
    patientAgeYears: 72,
    hasKidneyOrLiverImpairment: true,
    knownAllergiesCount: 2,
    highRiskMedClassCount: 2
  });
  assert.strictEqual(high.valid, true);
  assert.strictEqual(high.sideEffectRiskScore, 92);
  assert.strictEqual(high.riskTier, 'HIGH_SIDE_EFFECT_RISK');

  const low = calculatePatientMedicationSideEffectRiskScore({
    activeMedicationCount: 1,
    patientAgeYears: 30,
    hasKidneyOrLiverImpairment: false,
    knownAllergiesCount: 0,
    highRiskMedClassCount: 0
  });
  assert.strictEqual(low.valid, true);
  assert.strictEqual(low.riskTier, 'LOW_RISK');
});

test('calculatePatientPediatricDosageSafety', () => {
  const optimal = calculatePatientPediatricDosageSafety({
    patientWeightKg: 15.0,
    recommendedMgPerKg: 10.0,
    prescribedSingleDoseMg: 150.0,
    maxDailyMgPerKg: 40.0,
    dailyDosesFrequency: 3
  });
  assert.strictEqual(optimal.valid, true);
  assert.strictEqual(optimal.targetSingleDoseMg, 150.0);
  assert.strictEqual(optimal.totalPrescribedDailyMg, 450.0);
  assert.strictEqual(optimal.safetyStatus, 'OPTIMAL_DOSAGE');
  assert.strictEqual(optimal.isOverdosed, false);

  const invalid = calculatePatientPediatricDosageSafety({ patientWeightKg: -5 });
  assert.strictEqual(invalid.valid, false);
  assert.strictEqual(invalid.error, 'Patient weight must be a positive number');
});

test('calculatePatientRenalDoseAdjustment - evaluates creatinine clearance and dose adjustment correctly', () => {
  const normal = calculatePatientRenalDoseAdjustment({
    serumCreatinineMgDl: 0.9,
    patientAgeYears: 50,
    patientWeightKg: 70,
    isFemale: false,
    standardDoseMg: 500
  });
  assert.strictEqual(normal.valid, true);
  assert.strictEqual(normal.renalRiskTier, 'NORMAL_RENAL_FUNCTION');
  assert.strictEqual(normal.adjustedDoseMg, 500);

  const moderate = calculatePatientRenalDoseAdjustment({
    serumCreatinineMgDl: 1.8,
    patientAgeYears: 65,
    patientWeightKg: 70,
    isFemale: false,
    standardDoseMg: 500
  });
  assert.strictEqual(moderate.valid, true);
  assert.strictEqual(moderate.renalRiskTier, 'MODERATE_RENAL_IMPAIRMENT');
  assert.strictEqual(moderate.adjustedDoseMg, 375);
  assert.strictEqual(moderate.doseAdjustmentPct, 75);

  const severe = calculatePatientRenalDoseAdjustment({
    serumCreatinineMgDl: 3.5,
    patientAgeYears: 75,
    patientWeightKg: 65,
    isFemale: true,
    standardDoseMg: 500
  });
  assert.strictEqual(severe.valid, true);
  assert.strictEqual(severe.renalRiskTier, 'SEVERE_RENAL_IMPAIRMENT');
  assert.strictEqual(severe.adjustedDoseMg, 250);
  assert.strictEqual(severe.doseAdjustmentPct, 50);

  const invalid = calculatePatientRenalDoseAdjustment({ serumCreatinineMgDl: 0 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientAnticholinergicCognitiveRiskScore - evaluates cognitive risk score and tier', () => {
  const high = calculatePatientAnticholinergicCognitiveRiskScore({
    anticholinergicMedsCount: 3,
    patientAgeYears: 78,
    hasBaselineCognitiveImpairment: true,
    treatmentDurationMonths: 12
  });
  assert.strictEqual(high.valid, true);
  assert.strictEqual(high.cognitiveRiskScore, 100);
  assert.strictEqual(high.riskTier, 'HIGH_COGNITIVE_RISK');
  assert.ok(high.recommendation.includes('HIGH RISK: Anticholinergic cognitive risk score'));

  const low = calculatePatientAnticholinergicCognitiveRiskScore({
    anticholinergicMedsCount: 0,
    patientAgeYears: 50,
    hasBaselineCognitiveImpairment: false
  });
  assert.strictEqual(low.valid, true);
  assert.strictEqual(low.cognitiveRiskScore, 0);
  assert.strictEqual(low.riskTier, 'LOW_COGNITIVE_RISK');

  const invalid = calculatePatientAnticholinergicCognitiveRiskScore({ anticholinergicMedsCount: -1 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientPolypharmacyInteractionIndex', () => {
  const high = calculatePatientPolypharmacyInteractionIndex({
    totalActiveMedications: 8,
    majorInteractionPairsCount: 2,
    moderateInteractionPairsCount: 2,
    patientAgeYears: 72,
    renalImpairmentPresent: true
  });
  assert.strictEqual(high.valid, true);
  assert.strictEqual(high.polypharmacyScore, 100);
  assert.strictEqual(high.riskTier, 'HIGH_POLYPHARMACY_RISK');
  assert.strictEqual(high.requiresPharmacistConsultation, true);

  const low = calculatePatientPolypharmacyInteractionIndex({
    totalActiveMedications: 2,
    majorInteractionPairsCount: 0,
    moderateInteractionPairsCount: 0,
    patientAgeYears: 40,
    renalImpairmentPresent: false
  });
  assert.strictEqual(low.valid, true);
  assert.strictEqual(low.polypharmacyScore, 10);
  assert.strictEqual(low.riskTier, 'LOW_POLYPHARMACY_RISK');

  const invalid = calculatePatientPolypharmacyInteractionIndex({ totalActiveMedications: -1 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientGeriatricMedicationSafetyAudit — computes safety score and risk tier', () => {
  const lowRisk = calculatePatientGeriatricMedicationSafetyAudit({
    medicationList: [{ name: 'Amlodipine', category: 'antihypertensive' }],
    patientAge: 68,
    estimatedCrCl: 80,
    hasHistoryOfFalls: false
  });
  assert.strictEqual(lowRisk.valid, true);
  assert.strictEqual(lowRisk.riskTier, 'LOW_GERIATRIC_RISK');

  const highRisk = calculatePatientGeriatricMedicationSafetyAudit({
    medicationList: [{ name: 'Diazepam', category: 'sedative benzodiazepine' }, { name: 'Diphenhydramine', category: 'anticholinergic' }],
    patientAge: 78,
    estimatedCrCl: 40,
    hasHistoryOfFalls: true
  });
  assert.strictEqual(highRisk.valid, true);
  assert.strictEqual(highRisk.riskTier, 'HIGH_GERIATRIC_RISK');

  const invalid = calculatePatientGeriatricMedicationSafetyAudit({ patientAge: -5 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientComprehensiveLabAlertAndRiskScore', () => {
  const normal = calculatePatientComprehensiveLabAlertAndRiskScore({
    potassiumMeqL: 4.2,
    creatinineMgDl: 1.0,
    altUL: 25,
    wbcCount: 7.0,
    plateletCount: 250
  });
  assert.strictEqual(normal.valid, true);
  assert.strictEqual(normal.riskTier, 'NORMAL_LAB_PROFILE');
  assert.strictEqual(normal.alertScore, 0);
  assert.strictEqual(normal.criticalAlertCount, 0);

  const highAlert = calculatePatientComprehensiveLabAlertAndRiskScore({
    potassiumMeqL: 5.8,
    creatinineMgDl: 2.1,
    altUL: 75,
    wbcCount: 14.0,
    plateletCount: 120
  });
  assert.strictEqual(highAlert.valid, true);
  assert.strictEqual(highAlert.riskTier, 'HIGH_LAB_ALERT');
  assert.ok(highAlert.alertScore >= 50);
  assert.strictEqual(highAlert.criticalAlertCount, 5);

  const invalid = calculatePatientComprehensiveLabAlertAndRiskScore({ potassiumMeqL: -1 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientChronicDiseaseMultimorbidityScore', () => {
  const highRisk = calculatePatientChronicDiseaseMultimorbidityScore({
    chronicDiseasesList: ['Type 2 Diabetes', 'Heart Failure', 'COPD'],
    patientAgeYears: 78,
    activeMedicationsCount: 6,
    recentHospitalizationsCount: 2
  });
  assert.strictEqual(highRisk.valid, true);
  assert.strictEqual(highRisk.riskTier, 'HIGH_MULTIMORBIDITY_RISK');
  assert.strictEqual(highRisk.recommendedFollowupMonths, 1);
  assert.ok(highRisk.multimorbidityRiskScore >= 65);
  assert.ok(highRisk.recommendation.includes('HIGH MULTIMORBIDITY RISK'));

  const lowRisk = calculatePatientChronicDiseaseMultimorbidityScore({
    chronicDiseasesList: ['Mild Asthma'],
    patientAgeYears: 35,
    activeMedicationsCount: 1,
    recentHospitalizationsCount: 0
  });
  assert.strictEqual(lowRisk.valid, true);
  assert.strictEqual(lowRisk.riskTier, 'LOW_COMPLEXITY');
  assert.strictEqual(lowRisk.recommendedFollowupMonths, 6);

  const invalid = calculatePatientChronicDiseaseMultimorbidityScore({ chronicDiseasesList: 'invalid' });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientCardiovascularRiskScore - calculates risk score and clinical tier accurately', () => {
  const highRisk = calculatePatientCardiovascularRiskScore({
    systolicBp: 165,
    diastolicBp: 95,
    totalCholesterolMgDl: 250,
    hdlCholesterolMgDl: 35,
    isSmoker: true,
    isDiabetic: true,
    patientAgeYears: 66
  });
  assert.strictEqual(highRisk.valid, true);
  assert.strictEqual(highRisk.cvdRiskTier, 'HIGH_CARDIOVASCULAR_RISK');
  assert.ok(highRisk.cvdRiskScore >= 60);

  const lowRisk = calculatePatientCardiovascularRiskScore({
    systolicBp: 118,
    diastolicBp: 75,
    totalCholesterolMgDl: 180,
    hdlCholesterolMgDl: 55,
    isSmoker: false,
    isDiabetic: false,
    patientAgeYears: 30
  });
  assert.strictEqual(lowRisk.valid, true);
  assert.strictEqual(lowRisk.cvdRiskTier, 'LOW_CARDIOVASCULAR_RISK');

  const invalid = calculatePatientCardiovascularRiskScore({ systolicBp: 50 });
  assert.strictEqual(invalid.valid, false);
});

test('calculatePatientGlycemicControlAndDiabetesRiskScore', () => {
  const highRisk = calculatePatientGlycemicControlAndDiabetesRiskScore({
    hba1cPercent: 9.5,
    fastingGlucoseMgDl: 210,
    hypoglycemicEpisodesPastMonth: 2,
    hasAnnualRetinalExam: false,
    hasAnnualKidneyScreening: false
  });
  assert.strictEqual(highRisk.valid, true);
  assert.strictEqual(highRisk.glycemicControlTier, 'POOR_GLYCEMIC_CONTROL');
  assert.ok(highRisk.glycemicRiskScore >= 60);

  const lowRisk = calculatePatientGlycemicControlAndDiabetesRiskScore({
    hba1cPercent: 6.2,
    fastingGlucoseMgDl: 95,
    hypoglycemicEpisodesPastMonth: 0,
    hasAnnualRetinalExam: true,
    hasAnnualKidneyScreening: true
  });
  assert.strictEqual(lowRisk.valid, true);
  assert.strictEqual(lowRisk.glycemicControlTier, 'OPTIMAL_GLYCEMIC_CONTROL');

  const invalid = calculatePatientGlycemicControlAndDiabetesRiskScore({ hba1cPercent: -1 });
  assert.strictEqual(invalid.valid, false);
  assert.strictEqual(invalid.error, 'HbA1c percentage must be a positive number');
});

test('calculatePatientHypertensionAndCardiovascularRiskScore', () => {
  const crisis = calculatePatientHypertensionAndCardiovascularRiskScore({
    systolicBp: 185,
    diastolicBp: 122,
    patientAgeYears: 65,
    isAntihypertensiveMedicated: true
  });
  assert.strictEqual(crisis.valid, true);
  assert.strictEqual(crisis.bpStage, 'HYPERTENSIVE_CRISIS');
  assert.strictEqual(crisis.hypertensionRiskScore, 100);
  assert.ok(crisis.recommendation.includes('HYPERTENSIVE CRISIS'));

  const stage1 = calculatePatientHypertensionAndCardiovascularRiskScore({
    systolicBp: 135,
    diastolicBp: 85,
    patientAgeYears: 50,
    isAntihypertensiveMedicated: false
  });
  assert.strictEqual(stage1.valid, true);
  assert.strictEqual(stage1.bpStage, 'STAGE_1_HYPERTENSION');
  assert.strictEqual(stage1.hypertensionRiskScore, 50);

  const invalid = calculatePatientHypertensionAndCardiovascularRiskScore({ systolicBp: 50 });
  assert.strictEqual(invalid.valid, false);
  assert.strictEqual(invalid.error, 'Systolic blood pressure must be a realistic number between 70 and 260 mmHg');
});




































