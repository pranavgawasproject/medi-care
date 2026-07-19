import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import supabase from "./db/supabaseClient.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // parse incoming json payloads

app.get('/', (req, res) => {
  res.send('Medi-Care Supabase API is Running!');
});

// GET /api/health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    service: 'medi-care-api'
  });
});

// GET /api/doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const { data, error } = await supabase.from('doctors').select('*');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/doctors
app.post('/api/doctors', async (req, res) => {
  try {
    const { full_name, specialization, location, max_patients_per_day } = req.body;
    if (!full_name || typeof full_name !== 'string' || !full_name.trim() ||
        !specialization || typeof specialization !== 'string' || !specialization.trim()) {
      return res.status(400).json({ success: false, error: 'full_name and specialization are required string fields.' });
    }
    const parsedMax = parseInt(max_patients_per_day, 10);
    const validMax = !isNaN(parsedMax) && parsedMax > 0 ? parsedMax : 20;

    const { data, error } = await supabase
      .from('doctors')
      .insert([{
        full_name: full_name.trim(),
        specialization: specialization.trim(),
        location: (location || 'Main Clinic').trim(),
        max_patients_per_day: validMax
      }])
      .select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/patients
app.get('/api/patients', async (req, res) => {
  try {
    const { data, error } = await supabase.from('patients').select('*');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/patients
app.post('/api/patients', async (req, res) => {
  try {
    const { name, email, phone, medical_history } = req.body;
    if (!name || typeof name !== 'string' || !name.trim() ||
        !email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ success: false, error: 'name and email are required string fields.' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return res.status(400).json({ success: false, error: 'Invalid email address format.' });
    }

    const { data, error } = await supabase
      .from('patients')
      .insert([{
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone ? String(phone).trim() : null,
        medical_history: medical_history ? String(medical_history).trim() : null
      }])
      .select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const { data, error } = await supabase.from('schedules').select('*');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const { data, error } = await supabase.from('appointments').select('*');
    if (error) throw error;
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/appointments
app.post('/api/appointments', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, status } = req.body;
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        success: false,
        error: 'patient_id, doctor_id, appointment_date, and appointment_time are required fields.'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    const apptStatus = status && validStatuses.includes(status) ? status : 'pending';

    const { data, error } = await supabase
      .from('appointments')
      .insert([{
        patient_id,
        doctor_id,
        appointment_date,
        appointment_time,
        status: apptStatus
      }])
      .select();
    if (error) throw error;
    res.status(201).json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PATCH /api/appointments/:id
app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'cancelled'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `status field is required and must be one of: ${validStatuses.join(', ')}`
      });
    }
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: 'Appointment not found.' });
    }
    res.json({ success: true, data: data[0] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;