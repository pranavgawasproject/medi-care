-- Create Doctors table
CREATE TABLE IF NOT EXISTS doctors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name TEXT NOT NULL,
    specialization TEXT NOT NULL,
    location TEXT NOT NULL,
    max_patients_per_day INTEGER NOT NULL
);

-- Create Patients table
CREATE TABLE IF NOT EXISTS patients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT NOT NULL,
    medical_history TEXT
);

-- Create Schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
    day_of_week TEXT CHECK (day_of_week IN ('Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday')) NOT NULL,
    start_time TEXT NOT NULL,
    end_time TEXT NOT NULL,
    available_slots INTEGER NOT NULL
);

-- Create Appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID REFERENCES patients(id) ON DELETE CASCADE NOT NULL,
    doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE NOT NULL,
    appointment_date DATE NOT NULL,
    appointment_time TEXT NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled')) DEFAULT 'pending' NOT NULL
);

-- Insert Seed Data
-- Insert Doctors
INSERT INTO doctors (id, full_name, specialization, location, max_patients_per_day) VALUES
('c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411', 'Dr. Sarah Jenkins', 'Cardiology', 'Building A, Room 104', 12),
('c7a7b8e1-512c-473d-9cb1-e8dfd6a5a422', 'Dr. David Miller', 'Pediatrics', 'Building B, Room 205', 15),
('c7a7b8e1-512c-473d-9cb1-e8dfd6a5a433', 'Dr. Elena Rostova', 'Neurology', 'Building A, Room 302', 8)
ON CONFLICT DO NOTHING;

-- Insert Patients
INSERT INTO patients (id, name, email, phone, medical_history) VALUES
('b1e7c8a1-512c-473d-9cb1-e8dfd6a5a411', 'Pranav Gawas', 'pranavgawas1999@gmail.com', '+91 9876543210', 'Hypertension under control, regular checkups'),
('b1e7c8a1-512c-473d-9cb1-e8dfd6a5a422', 'Emily Watson', 'emily@example.com', '+1 555 382 9102', 'None'),
('b1e7c8a1-512c-473d-9cb1-e8dfd6a5a433', 'Michael Chang', 'm.chang@example.com', '+1 555 491 3022', 'Asthma history')
ON CONFLICT DO NOTHING;

-- Insert Schedules
INSERT INTO schedules (doctor_id, day_of_week, start_time, end_time, available_slots) VALUES
('c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411', 'Monday', '09:00 AM', '04:00 PM', 10),
('c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411', 'Wednesday', '09:00 AM', '04:00 PM', 8),
('c7a7b8e1-512c-473d-9cb1-e8dfd6a5a422', 'Tuesday', '10:00 AM', '05:00 PM', 12),
('c7a7b8e1-512c-473d-9cb1-e8dfd6a5a433', 'Thursday', '08:00 AM', '01:00 PM', 6)
ON CONFLICT DO NOTHING;

-- Insert Appointments
INSERT INTO appointments (patient_id, doctor_id, appointment_date, appointment_time, status) VALUES
('b1e7c8a1-512c-473d-9cb1-e8dfd6a5a411', 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411', '2026-06-26', '10:00 AM', 'confirmed'),
('b1e7c8a1-512c-473d-9cb1-e8dfd6a5a422', 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a422', '2026-06-26', '11:30 AM', 'pending'),
('b1e7c8a1-512c-473d-9cb1-e8dfd6a5a433', 'c7a7b8e1-512c-473d-9cb1-e8dfd6a5a411', '2026-06-27', '02:00 PM', 'pending')
ON CONFLICT DO NOTHING;
