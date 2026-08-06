import assert from 'node:assert';
import { test, describe, it } from 'node:test';
import {
  calculateTriageCategory,
  calculateMedicationAdherenceRisk
} from '../src/utils/triagePriorityEngine.js';

describe('triagePriorityEngine', () => {
  it('identifies RESUSCITATION level 1 for critical hypoxia (SpO2 < 90%)', () => {
    const res = calculateTriageCategory({ spO2: 88, heartRate: 110, systolicBp: 120 });
    assert.strictEqual(res.esiLevel, 1);
    assert.strictEqual(res.category, 'RESUSCITATION');
    assert.ok(res.flags.includes('HYPOXIA_CRITICAL'));
  });

  it('identifies EMERGENT level 2 for hypertensive crisis', () => {
    const res = calculateTriageCategory({ systolicBp: 195, diastolicBp: 125, spO2: 98 });
    assert.strictEqual(res.esiLevel, 2);
    assert.strictEqual(res.category, 'EMERGENT');
    assert.ok(res.flags.includes('HYPERTENSIVE_CRISIS'));
  });

  it('defaults to NON_URGENT level 5 for normal vitals', () => {
    const res = calculateTriageCategory({ heartRate: 72, systolicBp: 120, spO2: 99, tempC: 36.6 });
    assert.strictEqual(res.esiLevel, 5);
    assert.strictEqual(res.category, 'NON_URGENT');
    assert.strictEqual(res.flags.length, 0);
  });

  it('calculates medication adherence risk correctly', () => {
    const optimal = calculateMedicationAdherenceRisk(30, 29);
    assert.strictEqual(optimal.adherencePercentage, 96.7);
    assert.strictEqual(optimal.riskTier, 'OPTIMAL');
    assert.strictEqual(optimal.requiresFollowUp, false);

    const poor = calculateMedicationAdherenceRisk(30, 15);
    assert.strictEqual(poor.adherencePercentage, 50.0);
    assert.strictEqual(poor.riskTier, 'HIGH_NON_ADHERENCE_RISK');
    assert.strictEqual(poor.requiresFollowUp, true);
  });
});
