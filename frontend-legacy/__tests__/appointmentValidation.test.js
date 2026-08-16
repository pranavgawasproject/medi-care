import { test } from 'node:test';
import assert from 'node:assert/strict';

export function isSlotAvailable(existingAppts, requestedDate, requestedTime) {
  if (!Array.isArray(existingAppts)) return true;
  const conflict = existingAppts.find(
    (a) =>
      a.appointment_date === requestedDate &&
      a.appointment_time === requestedTime &&
      a.status !== 'cancelled'
  );
  return !conflict;
}

export function validateAppointmentPayload(payload) {
  if (!payload || typeof payload !== 'object') {
    return { valid: false, error: 'Payload must be an object' };
  }
  const { patient_id, doctor_id, appointment_date, appointment_time } = payload;
  if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
    return { valid: false, error: 'Missing required appointment fields' };
  }
  return { valid: true };
}

test('isSlotAvailable returns true when no conflicts exist', () => {
  const appts = [
    { appointment_date: '2026-08-10', appointment_time: '10:00 AM', status: 'confirmed' }
  ];
  assert.equal(isSlotAvailable(appts, '2026-08-10', '11:00 AM'), true);
});

test('isSlotAvailable returns false when date and time conflict', () => {
  const appts = [
    { appointment_date: '2026-08-10', appointment_time: '10:00 AM', status: 'confirmed' }
  ];
  assert.equal(isSlotAvailable(appts, '2026-08-10', '10:00 AM'), false);
});

test('isSlotAvailable ignores cancelled appointments', () => {
  const appts = [
    { appointment_date: '2026-08-10', appointment_time: '10:00 AM', status: 'cancelled' }
  ];
  assert.equal(isSlotAvailable(appts, '2026-08-10', '10:00 AM'), true);
});

test('validateAppointmentPayload checks required fields', () => {
  assert.equal(validateAppointmentPayload({}).valid, false);
  assert.equal(
    validateAppointmentPayload({
      patient_id: 'p1',
      doctor_id: 'd1',
      appointment_date: '2026-08-10',
      appointment_time: '10:00 AM'
    }).valid,
    true
  );
});
