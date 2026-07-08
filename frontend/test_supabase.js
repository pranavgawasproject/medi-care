/* eslint-env node */
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('URL:', supabaseUrl);
console.log('Anon Key length:', supabaseAnonKey ? supabaseAnonKey.length : 0);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function test() {
  try {
    const { data: doctors, error: docError } = await supabase.from('doctors').select('*');
    console.log('Doctors error:', docError);
    console.log('Doctors count:', doctors ? doctors.length : null);
    console.log('Doctors:', doctors);

    const { data: patients, error: patError } = await supabase.from('patients').select('*');
    console.log('Patients error:', patError);
    console.log('Patients:', patients);

    const { data: appointments, error: appError } = await supabase.from('appointments').select('*');
    console.log('Appointments error:', appError);
    console.log('Appointments:', appointments);

    const { data: schedules, error: schError } = await supabase.from('schedules').select('*');
    console.log('Schedules error:', schError);
    console.log('Schedules:', schedules);
  } catch (e) {
    console.error('Exception:', e);
  }
}

test();
