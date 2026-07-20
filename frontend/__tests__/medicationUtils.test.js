import assert from 'node:assert';
import test from 'node:test';
import { parseFrequencyToDailyCount, calculateMedicationDurationDays, validateDosageInput, calculateRefillDate, checkPotentialDrugInteraction } from '../src/utils/medicationUtils.js';

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

