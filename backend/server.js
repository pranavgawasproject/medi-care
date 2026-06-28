import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import supabase from "./db/supabaseClient.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json()); // to parse the incoming request with json payload (from req.body)

app.get('/', (req, res) => {
  res.send('Medi-Care Supabase API is Running!');
});

// GET /api/doctors
app.get('/api/doctors', async (req, res) => {
  try {
    const { data, error } = await supabase.from('doctors').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/doctors
app.post('/api/doctors', async (req, res) => {
  try {
    const { full_name, specialization, location, max_patients_per_day } = req.body;
    const { data, error } = await supabase
      .from('doctors')
      .insert([{ full_name, specialization, location, max_patients_per_day }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/patients
app.get('/api/patients', async (req, res) => {
  try {
    const { data, error } = await supabase.from('patients').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/patients
app.post('/api/patients', async (req, res) => {
  try {
    const { name, email, phone, medical_history } = req.body;
    const { data, error } = await supabase
      .from('patients')
      .insert([{ name, email, phone, medical_history }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/schedules
app.get('/api/schedules', async (req, res) => {
  try {
    const { data, error } = await supabase.from('schedules').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/appointments
app.get('/api/appointments', async (req, res) => {
  try {
    const { data, error } = await supabase.from('appointments').select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/appointments
app.post('/api/appointments', async (req, res) => {
  try {
    const { patient_id, doctor_id, appointment_date, appointment_time, status } = req.body;
    const { data, error } = await supabase
      .from('appointments')
      .insert([{ patient_id, doctor_id, appointment_date, appointment_time, status: status || 'pending' }])
      .select();
    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PATCH /api/appointments/:id
app.patch('/api/appointments/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const { data, error } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', id)
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});