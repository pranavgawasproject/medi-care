/**
 * Insurance billing utilities.
 *
 * Lightweight claim/eligibility helpers used by future billing features.
 * Currently used only for display formatting on patient records.
 */

export interface InsurancePlan {
  provider: string
  policyNumber: string
  groupNumber?: string
  coveragePercent: number // 0-100
  copay?: number
}

export interface BillingEstimate {
  procedureCode: string
  description: string
  baseCost: number
  patientResponsibility: number
  insuranceResponsibility: number
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function estimateBilling(
  procedureCost: number,
  plan: InsurancePlan
): {
  patientResponsibility: number
  insuranceResponsibility: number
  total: number
} {
  const insurance = (procedureCost * plan.coveragePercent) / 100
  const patient = Math.max(0, procedureCost - insurance + (plan.copay ?? 0))
  return {
    patientResponsibility: patient,
    insuranceResponsibility: insurance,
    total: procedureCost + (plan.copay ?? 0),
  }
}

export function maskPolicyNumber(policy: string): string {
  if (!policy || policy.length < 4) return '••••'
  return `••••${policy.slice(-4)}`
}
