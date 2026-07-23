import assert from 'node:assert';
import test from 'node:test';
import { parseFrequencyToDailyCount, calculateMedicationDurationDays, validateDosageInput, calculateRefillDate, checkPotentialDrugInteraction, calculateAdherenceRate, generateDoseScheduleTimes, formatDosageInstructions, calculateNextMedicationReminder, calculateMedicationRefillUrgency, calculateDailyDoseComplianceScore, formatPrescriptionSummary, calculateBMIAndHealthRiskCategory, calculatePediatricDoseByWeight, calculateEstimatedOutofPocketMedicationCost, calculatePatientVitalSignsAlertLevel, calculatePatientWaterHydrationTarget, calculateMedicationAdherenceRiskScore, calculateDoctorSlotOccupancyAndAvailability, calculateEmergencyTriagePriorityLevel, calculateMedicationAdherenceRate } from '../src/utils/medicationUtils.js';




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












