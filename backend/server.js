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
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/doctors
app.post('/api/doctors', async (req, res) => {
  try {
    const { full_name, specialization, location, max_patients_per_day } = req.body;
    if (!full_name || !specialization) {
      return res.status(400).json({ error: 'full_name and specialization are required fields.' });
    }
    const { data, error } = await supabase
      .from('doctors')
      .insert([{ full_name, specialization, location, max_patients_per_day: max_patients_per_day || 20 }])
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
    if (!name || !email) {
      return res.status(400).json({ error: 'name and email are required fields.' });
    }
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
    if (!patient_id || !doctor_id || !appointment_date || !appointment_time) {
      return res.status(400).json({
        error: 'patient_id, doctor_id, appointment_date, and appointment_time are required fields.'
      });
    }

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
    if (!status) {
      return res.status(400).json({ error: 'status field is required for update.' });
    }
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

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;