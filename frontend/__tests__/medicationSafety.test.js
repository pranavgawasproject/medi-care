import assert from 'node:assert';
import { calculatePatientMedicationSafetyScore } from '../src/utils/medicationSafety.js';

console.log('Running medicationSafety unit tests...');

// 1. Clean profile with no interactions
const cleanResult = calculatePatientMedicationSafetyScore({
  medications: ['Amoxicillin', 'Paracetamol'],
  allergies: [],
  patientAge: 30,
  kidneyFunctionCrCl: 100
});

assert.strictEqual(cleanResult.safetyScore, 100, 'Clean profile should have 100 safety score');
assert.strictEqual(cleanResult.riskLevel, 'LOW');
assert.strictEqual(cleanResult.interactionCount, 0);

// 2. High risk drug pair interaction
const interactionResult = calculatePatientMedicationSafetyScore({
  medications: ['Warfarin', 'Aspirin 81mg'],
  allergies: [],
  patientAge: 55,
  kidneyFunctionCrCl: 90
});

assert.ok(interactionResult.safetyScore < 100, 'Score should decrease on drug interaction');
assert.strictEqual(interactionResult.interactionCount, 1);
assert.strictEqual(interactionResult.severeInteractions[0].severity, 'HIGH');

// 3. Allergy conflict
const allergyResult = calculatePatientMedicationSafetyScore({
  medications: ['Penicillin V', 'Ibuprofen'],
  allergies: ['Penicillin'],
  patientAge: 40,
  kidneyFunctionCrCl: 85
});

assert.strictEqual(allergyResult.allergyConflicts.length, 1);
assert.ok(allergyResult.safetyScore <= 70);

// 4. Renal impairment warning
const renalResult = calculatePatientMedicationSafetyScore({
  medications: ['Metformin 500mg'],
  allergies: [],
  patientAge: 60,
  kidneyFunctionCrCl: 35
});

assert.strictEqual(renalResult.renalAdjustmentNeeded, true);
assert.ok(renalResult.dosageWarnings.length > 0);

// 5. High risk elderly patient (Beers criteria)
const elderlyResult = calculatePatientMedicationSafetyScore({
  medications: ['Alprazolam 0.5mg'],
  allergies: [],
  patientAge: 72,
  kidneyFunctionCrCl: 80
});

assert.ok(elderlyResult.dosageWarnings.some(w => w.includes('Elderly patient')));

console.log('✅ All medicationSafety unit tests passed successfully!');
