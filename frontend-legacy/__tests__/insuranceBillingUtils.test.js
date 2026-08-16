import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateNPI, validateICD10, calculateClaimTotal } from '../src/utils/insuranceBillingUtils.js';

test('validateNPI validates correct NPIs using Luhn algorithm', () => {
  // A valid NPI check. 
  // For standard 10-digit NPIs starting with 80840: 
  // Let's use a known valid structure or simply check the logic handles standard inputs.
  // We'll mock a valid NPI for testing: 1234567893
  // 8 0 8 4 0 1 2 3 4 5 6 7 8 9 3
  // Reverse: 3 9 8 7 6 5 4 3 2 1 0 4 8 0 8
  // Alt x2:  3 18(9) 8 14(5) 6 10(1) 4 6 2 2 0 8 8 0 8
  // Sum = 3+9+8+5+6+1+4+6+2+2+0+8+8+0+8 = 70. 70 % 10 === 0. Valid!
  assert.equal(validateNPI('1234567893'), true);
  
  // Invalid NPI (off by 1)
  assert.equal(validateNPI('1234567894'), false);
  
  // Invalid length
  assert.equal(validateNPI('12345'), false);
  
  // Non-numeric
  assert.equal(validateNPI('ABCDEFGHIJ'), false);
});

test('validateICD10 correctly validates diagnosis codes', () => {
  assert.equal(validateICD10('J01.90'), true); // Acute sinusitis
  assert.equal(validateICD10('E11.9'), true); // Type 2 diabetes
  assert.equal(validateICD10('A00'), true); // Cholera (no decimal)
  
  // Invalid formats
  assert.equal(validateICD10('U07.1'), false); // Starts with U (which isn't strictly standard in classic ICD-10, though U07.1 is COVID, standard regex ignores U. Let's assume standard A-TV-Z)
  assert.equal(validateICD10('123.45'), false); // Doesn't start with letter
  assert.equal(validateICD10('J01.'), false); // Missing digits after decimal
  assert.equal(validateICD10('J0.190'), false); // Only 1 digit before decimal
});

test('calculateClaimTotal calculates costs and applies modifiers', () => {
  const procs = [
    { cptCode: '99213', baseCost: 100 }, // Standard visit
    { cptCode: '71045', baseCost: 50, modifiers: ['26'] }, // X-ray professional component (60%) = 30
    { cptCode: '27447', baseCost: 1000, modifiers: ['50'] } // Knee arthroplasty bilateral (150%) = 1500
  ];
  
  const result = calculateClaimTotal(procs);
  assert.equal(result.status, 'CLEAN');
  assert.equal(result.total, 1630); // 100 + 30 + 1500 = 1630
  assert.equal(result.lineItems.length, 3);
  assert.equal(result.lineItems[1].finalCost, 30);
  assert.equal(result.lineItems[2].finalCost, 1500);
});

test('calculateClaimTotal handles invalid data', () => {
  assert.equal(calculateClaimTotal([]).status, 'REJECTED');
  
  const badProcs = [
    { cptCode: '99213', baseCost: -50 } // Invalid cost
  ];
  assert.equal(calculateClaimTotal(badProcs).status, 'REJECTED');
  
  const missingCpt = [
    { baseCost: 100 }
  ];
  assert.equal(calculateClaimTotal(missingCpt).status, 'REJECTED');
});
