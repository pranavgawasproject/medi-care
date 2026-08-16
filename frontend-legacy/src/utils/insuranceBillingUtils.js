/**
 * Enterprise Healthcare Insurance Billing Utility
 * Validates National Provider Identifiers (NPI), ICD-10 codes, 
 * and computes complex claim totals based on CPT modifiers.
 */

export function validateNPI(npi) {
  if (!npi) return false;
  const npiStr = String(npi).replace(/\D/g, '');
  if (npiStr.length !== 10) return false;

  // NPI uses the Luhn algorithm
  // For standard 10-digit NPI, we prefix with '80840' (the US prefix for health care)
  const fullNpi = '80840' + npiStr;
  let sum = 0;
  let alternate = false;

  for (let i = fullNpi.length - 1; i >= 0; i--) {
    let n = parseInt(fullNpi.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) {
        n = (n % 10) + 1;
      }
    }
    sum += n;
    alternate = !alternate;
  }

  return (sum % 10 === 0);
}

export function validateICD10(code) {
  if (!code || typeof code !== 'string') return false;
  // ICD-10 codes start with a letter (A-Z except U), followed by 2 digits, 
  // optionally followed by a decimal and 1-4 alphanumeric characters
  const icd10Regex = /^[A-TV-Z][0-9]{2}(\.[0-9A-Z]{1,4})?$/i;
  return icd10Regex.test(code.trim());
}

export function calculateClaimTotal(procedures) {
  if (!Array.isArray(procedures) || procedures.length === 0) {
    return { total: 0, lineItems: [], status: 'REJECTED', reason: 'No procedures provided' };
  }

  let total = 0;
  const lineItems = [];
  let hasError = false;

  for (const proc of procedures) {
    if (!proc.cptCode || typeof proc.baseCost !== 'number' || proc.baseCost < 0) {
      hasError = true;
      break;
    }

    let adjustedCost = proc.baseCost;

    // Apply modifiers if any
    if (Array.isArray(proc.modifiers)) {
      if (proc.modifiers.includes('26')) {
        // Professional component only - reduce cost by 40%
        adjustedCost *= 0.6;
      }
      if (proc.modifiers.includes('50')) {
        // Bilateral procedure - increase by 50%
        adjustedCost *= 1.5;
      }
      if (proc.modifiers.includes('53')) {
        // Discontinued procedure - reduce by 50%
        adjustedCost *= 0.5;
      }
    }

    const finalCost = Number(adjustedCost.toFixed(2));
    total += finalCost;
    lineItems.push({
      cptCode: proc.cptCode,
      originalCost: proc.baseCost,
      finalCost: finalCost,
      modifiers: proc.modifiers || []
    });
  }

  if (hasError) {
    return { total: 0, lineItems: [], status: 'REJECTED', reason: 'Invalid procedure data' };
  }

  return {
    total: Number(total.toFixed(2)),
    lineItems,
    status: 'CLEAN',
    reason: null
  };
}
