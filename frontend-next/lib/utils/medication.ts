/**
 * Legacy medication utilities (typed port of the Vite source's
 * `medicationUtils.js`). Currently unused — kept for the upcoming
 * medication inventory / dispensing feature.
 */

export interface MedicationInfo {
  name: string
  genericName?: string
  strength?: string
  form?: string
}

export interface MedicationInstruction {
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions?: string
}

export function formatMedicationLine(item: MedicationInstruction): string {
  return `${item.medication} ${item.dosage} — ${item.frequency} for ${item.duration}`.trim()
}

export function parseMedicationName(input: string): MedicationInfo {
  const trimmed = input.trim()
  const spaceIdx = trimmed.indexOf(' ')
  if (spaceIdx === -1) return { name: trimmed }
  return {
    name: trimmed.slice(0, spaceIdx),
    strength: trimmed.slice(spaceIdx + 1),
  }
}
