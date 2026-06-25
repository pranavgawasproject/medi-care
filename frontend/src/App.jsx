import { useState } from 'react';
import { 
  Activity, 
  Calendar, 
  Clock, 
  User, 
  Users, 
  ShieldAlert, 
  Plus, 
  Check, 
  X, 
  Search, 
  MapPin, 
  FileText, 
  Sliders, 
  Stethoscope 
} from 'lucide-react';
import './App.css';

// Initial Mock Data matching our Mongoose Schemas
const initialDoctors = [
  { id: 'doc-1', FullName: 'Dr. Sarah Jenkins', specialization: 'Cardiology', location: 'Building A, Room 104', max_patients_per_day: '12' },
  { id: 'doc-2', FullName: 'Dr. David Miller', specialization: 'Pediatrics', location: 'Building B, Room 205', max_patients_per_day: '15' },
  { id: 'doc-3', FullName: 'Dr. Elena Rostova', specialization: 'Neurology', location: 'Building A, Room 302', max_patients_per_day: '8' }
];

const initialPatients = [
  { id: 'pat-1', name: 'Pranav Gawas', email: 'pranavgawas1999@gmail.com', phone: '+91 9876543210', medical_history: 'Hypertension under control, regular checkups' },
  { id: 'pat-2', name: 'Emily Watson', email: 'emily@example.com', phone: '+1 555 382 9102', medical_history: 'None' },
  { id: 'pat-3', name: 'Michael Chang', email: 'm.chang@example.com', phone: '+1 555 491 3022', medical_history: 'Asthma history' }
];

const initialAppointments = [
  { id: 'app-1', patient_id: 'pat-1', doctor_id: 'doc-1', appointment_date: '2026-06-26', appointment_time: '10:00 AM', status: 'confirmed' },
  { id: 'app-2', patient_id: 'pat-2', doctor_id: 'doc-2', appointment_date: '2026-06-26', appointment_time: '11:30 AM', status: 'pending' },
  { id: 'app-3', patient_id: 'pat-3', doctor_id: 'doc-1', appointment_date: '2026-06-27', appointment_time: '02:00 PM', status: 'pending' }
];

const initialSchedules = [
  { id: 'sch-1', doctor_id: 'doc-1', day_of_week: 'Monday', start_time: '09:00 AM', end_time: '04:00 PM', available_slots: 10 },
  { id: 'sch-2', doctor_id: 'doc-1', day_of_week: 'Wednesday', start_time: '09:00 AM', end_time: '04:00 PM', available_slots: 8 },
  { id: 'sch-3', doctor_id: 'doc-2', day_of_week: 'Tuesday', start_time: '10:00 AM', end_time: '05:00 PM', available_slots: 12 },
  { id: 'sch-4', doctor_id: 'doc-3', day_of_week: 'Thursday', start_time: '08:00 AM', end_time: '01:00 PM', available_slots: 6 }
];

function App() {
  const [role, setRole] = useState('patient'); // 'patient' | 'doctor' | 'admin'
  const [doctors, setDoctors] = useState(initialDoctors);
  const [patients, setPatients] = useState(initialPatients);
  const [appointments, setAppointments] = useState(initialAppointments);
  const [schedules, setSchedules] = useState(initialSchedules);

  // Form State for Booking
  const [selectedDoctorId, setSelectedDoctorId] = useState(initialDoctors[0].id);
  const [bookingDate, setBookingDate] = useState('2026-06-26');
  const [bookingTime, setBookingTime] = useState('10:00 AM');
  
  // Form State for Adding Doctor
  const [newDocName, setNewDocName] = useState('');
  const [newDocSpecialty, setNewDocSpecialty] = useState('General Medicine');
  const [newDocLocation, setNewDocLocation] = useState('');
  const [newDocCapacity, setNewDocCapacity] = useState('10');

  // Book Appointment Action
  const handleBookAppointment = (e) => {
    e.preventDefault();
    const newAppointment = {
      id: `app-${Date.now()}`,
      patient_id: 'pat-1', // Default acting as Pranav Gawas
      doctor_id: selectedDoctorId,
      appointment_date: bookingDate,
      appointment_time: bookingTime,
      status: 'pending'
    };
    setAppointments([newAppointment, ...appointments]);
    alert('Appointment requested successfully!');
  };

  // Add New Doctor Action
  const handleAddDoctor = (e) => {
    e.preventDefault();
    if (!newDocName || !newDocLocation) {
      alert('Please fill out all fields.');
      return;
    }
    const newDoc = {
      id: `doc-${Date.now()}`,
      FullName: newDocName,
      specialization: newDocSpecialty,
      location: newDocLocation,
      max_patients_per_day: newDocCapacity
    };
    setDoctors([...doctors, newDoc]);
    setNewDocName('');
    setNewDocLocation('');
    alert(`Added ${newDocName} to the directory!`);
  };

  // Update Appointment Status Action
  const updateAppointmentStatus = (id, newStatus) => {
    setAppointments(appointments.map(app => 
      app.id === id ? { ...app, status: newStatus } : app
    ));
  };

  // Helpers to resolve names
  const getDoctorName = (id) => doctors.find(d => d.id === id)?.FullName || 'Unknown Doctor';
  const getDoctorSpecialty = (id) => doctors.find(d => d.id === id)?.specialization || 'Unknown';
  const getPatientName = (id) => patients.find(p => p.id === id)?.name || 'Unknown Patient';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* 🧭 Top Navigation */}
      <header style={{ borderBottom: '1px solid var(--border-color)', background: 'rgba(9, 13, 22, 0.8)', backdropFilter: 'blur(10px)', position: 'sticky', top: 0, zIndex: 50 }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: '70px' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '0.5rem', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
              <Activity style={{ color: 'var(--primary)' }} size={24} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.25rem', fontFamily: 'var(--font-heading)' }}>Medi-Care</h1>
              <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Clinic Operations Platform</p>
            </div>
          </div>

          {/* 👥 Switch Roles Trigger */}
          <div style={{ display: 'flex', background: 'rgba(255, 255, 255, 0.05)', padding: '0.25rem', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
            <button 
              className={`btn ${role === 'patient' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setRole('patient')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', border: 'none', borderRadius: '10px', background: role === 'patient' ? 'var(--primary)' : 'transparent', color: role === 'patient' ? '#042f2e' : 'var(--text-secondary)' }}
            >
              <User size={16} /> Patient View
            </button>
            <button 
              className={`btn ${role === 'doctor' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setRole('doctor')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', border: 'none', borderRadius: '10px', background: role === 'doctor' ? 'var(--primary)' : 'transparent', color: role === 'doctor' ? '#042f2e' : 'var(--text-secondary)' }}
            >
              <Stethoscope size={16} /> Doctor View
            </button>
            <button 
              className={`btn ${role === 'admin' ? 'btn-primary' : 'btn-secondary'}`} 
              onClick={() => setRole('admin')}
              style={{ padding: '0.5rem 1rem', fontSize: '0.85rem', border: 'none', borderRadius: '10px', background: role === 'admin' ? 'var(--primary)' : 'transparent', color: role === 'admin' ? '#042f2e' : 'var(--text-secondary)' }}
            >
              <ShieldAlert size={16} /> Admin View
            </button>
          </div>

        </div>
      </header>

      {/* 🚀 Main Workspace Area */}
      <main style={{ flex: 1, padding: '2rem 0' }}>
        <div className="container">
          
          {/* Header Description */}
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem' }}>
              {role === 'patient' && 'Patient Dashboard'}
              {role === 'doctor' && 'Doctor Portal (Sarah Jenkins)'}
              {role === 'admin' && 'Clinic Operations Control Console'}
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
              {role === 'patient' && 'Book consultations, review your upcoming slots, and manage health records.'}
              {role === 'doctor' && 'Review your patient schedule, approve appointment cards, and manage availability.'}
              {role === 'admin' && 'Global view of clinic operations. Onboard doctors and monitor all schedules.'}
            </p>
          </div>

          {/* ================= PATIENT VIEW ================= */}
          {role === 'patient' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Summary Cards */}
              <div className="grid-cols-3">
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <User style={{ color: 'var(--secondary)' }} size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Acting Patient</h3>
                    <p style={{ fontSize: '1.15rem', fontWeight: 600 }}>Pranav Gawas</p>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
                    <Calendar style={{ color: 'var(--primary)' }} size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Upcoming Booking</h3>
                    <p style={{ fontSize: '1.15rem', fontWeight: 600 }}>
                      {appointments.find(a => a.patient_id === 'pat-1' && a.status === 'confirmed')?.appointment_date || 'No confirmed bookings'}
                    </p>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <FileText style={{ color: 'var(--success)' }} size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Medical Notes</h3>
                    <p style={{ fontSize: '0.95rem', color: 'var(--text-primary)', fontWeight: 500 }}>Active (Hypertension)</p>
                  </div>
                </div>
              </div>

              {/* Main Booking Panel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                
                {/* Booking Form */}
                <div className="glass-card" style={{ height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    Book Consultation
                  </h3>
                  
                  <form onSubmit={handleBookAppointment}>
                    <div className="form-group">
                      <label className="form-label">Select Practitioner</label>
                      <select 
                        className="form-input" 
                        value={selectedDoctorId} 
                        onChange={(e) => setSelectedDoctorId(e.target.value)}
                        style={{ width: '100%', background: '#0f172a' }}
                      >
                        {doctors.map(doc => (
                          <option key={doc.id} value={doc.id}>{doc.FullName} ({doc.specialization})</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Consultation Date</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={bookingDate} 
                        onChange={(e) => setBookingDate(e.target.value)} 
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Preferred Time Slot</label>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                        {['09:30 AM', '10:00 AM', '11:30 AM', '02:00 PM', '03:30 PM', '04:30 PM'].map(slot => (
                          <button
                            key={slot}
                            type="button"
                            className="btn"
                            style={{ 
                              padding: '0.5rem', 
                              fontSize: '0.8rem', 
                              border: bookingTime === slot ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                              background: bookingTime === slot ? 'rgba(20, 184, 166, 0.1)' : 'transparent',
                              color: bookingTime === slot ? 'var(--primary)' : 'var(--text-secondary)'
                            }}
                            onClick={() => setBookingTime(slot)}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                      <Calendar size={18} /> Request Appointment
                    </button>
                  </form>

                </div>

                {/* Patient Bookings Logs */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    My Consultations History
                  </h3>
                  
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Doctor</th>
                          <th>Specialty</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.filter(a => a.patient_id === 'pat-1').map(app => (
                          <tr key={app.id}>
                            <td style={{ fontWeight: 600 }}>{getDoctorName(app.doctor_id)}</td>
                            <td>
                              <span style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '0.2rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                {getDoctorSpecialty(app.doctor_id)}
                              </span>
                            </td>
                            <td>{app.appointment_date}</td>
                            <td>{app.appointment_time}</td>
                            <td>
                              <span className={`badge badge-${app.status}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              {app.status !== 'cancelled' && (
                                <button 
                                  className="btn btn-danger" 
                                  style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}
                                  onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                                >
                                  Cancel
                                </button>
                              )}
                              {app.status === 'cancelled' && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>None</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ================= DOCTOR VIEW ================= */}
          {role === 'doctor' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Stats */}
              <div className="grid-cols-3">
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
                    <Users style={{ color: 'var(--primary)' }} size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Patients Today</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      {appointments.filter(a => a.doctor_id === 'doc-1' && a.status === 'confirmed').length}
                    </p>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(245, 158, 11, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
                    <Clock style={{ color: 'var(--warning)' }} size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Pending Requests</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                      {appointments.filter(a => a.doctor_id === 'doc-1' && a.status === 'pending').length}
                    </p>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <MapPin style={{ color: 'var(--secondary)' }} size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Practice Location</h3>
                    <p style={{ fontSize: '1.05rem', fontWeight: 600 }}>Building A, Room 104</p>
                  </div>
                </div>
              </div>

              {/* Doctor Panel Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                
                {/* Appointments Log */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    Consultation Requests & Bookings
                  </h3>
                  
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Patient</th>
                          <th>Date</th>
                          <th>Time</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.filter(a => a.doctor_id === 'doc-1').map(app => (
                          <tr key={app.id}>
                            <td style={{ fontWeight: 600 }}>{getPatientName(app.patient_id)}</td>
                            <td>{app.appointment_date}</td>
                            <td>{app.appointment_time}</td>
                            <td>
                              <span className={`badge badge-${app.status}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              {app.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                  <button 
                                    className="btn btn-success" 
                                    style={{ padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                    onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                                  >
                                    <Check size={14} /> Confirm
                                  </button>
                                  <button 
                                    className="btn btn-danger" 
                                    style={{ padding: '0.35rem 0.6rem', display: 'flex', alignItems: 'center', gap: '0.2rem' }}
                                    onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                                  >
                                    <X size={14} /> Decline
                                  </button>
                                </div>
                              )}
                              {app.status === 'confirmed' && (
                                <button 
                                  className="btn btn-danger" 
                                  style={{ padding: '0.35rem 0.6rem' }}
                                  onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                                >
                                  Cancel
                                </button>
                              )}
                              {app.status === 'cancelled' && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Inactive</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

                {/* Availability Scheduler */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    My Weekly Schedule
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {schedules.filter(s => s.doctor_id === 'doc-1').map(sch => (
                      <div 
                        key={sch.id} 
                        style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          background: 'rgba(255, 255, 255, 0.03)', 
                          padding: '0.75rem 1rem', 
                          borderRadius: '10px', 
                          border: '1px solid var(--border-color)' 
                        }}
                      >
                        <div>
                          <p style={{ fontWeight: 600 }}>{sch.day_of_week}</p>
                          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{sch.start_time} - {sch.end_time}</p>
                        </div>
                        <span style={{ background: 'rgba(20, 184, 166, 0.1)', color: 'var(--primary)', border: '1px solid rgba(20, 184, 166, 0.2)', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600 }}>
                          {sch.available_slots} Slots
                        </span>
                      </div>
                    ))}
                  </div>

                </div>

              </div>

            </div>
          )}

          {/* ================= ADMIN VIEW ================= */}
          {role === 'admin' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Analytics */}
              <div className="grid-cols-3">
                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(20, 184, 166, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(20, 184, 166, 0.2)' }}>
                    <Stethoscope style={{ color: 'var(--primary)' }} size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Onboarded Doctors</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{doctors.length}</p>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(99, 102, 241, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(99, 102, 241, 0.2)' }}>
                    <Users style={{ color: 'var(--secondary)' }} size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Registered Patients</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{patients.length}</p>
                  </div>
                </div>

                <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '0.75rem', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <Calendar style={{ color: 'var(--success)' }} size={24} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Bookings</h3>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700 }}>{appointments.length}</p>
                  </div>
                </div>
              </div>

              {/* Admin Panel Forms & Logs */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
                
                {/* Onboard Doctor Form */}
                <div className="glass-card" style={{ height: 'fit-content' }}>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    Onboard New Doctor
                  </h3>
                  
                  <form onSubmit={handleAddDoctor}>
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input 
                        type="text" 
                        placeholder="Dr. Alexander Wright"
                        className="form-input" 
                        value={newDocName} 
                        onChange={(e) => setNewDocName(e.target.value)} 
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Specialty Department</label>
                      <select 
                        className="form-input" 
                        value={newDocSpecialty} 
                        onChange={(e) => setNewDocSpecialty(e.target.value)}
                        style={{ width: '100%', background: '#0f172a' }}
                      >
                        <option value="General Medicine">General Medicine</option>
                        <option value="Cardiology">Cardiology</option>
                        <option value="Neurology">Neurology</option>
                        <option value="Pediatrics">Pediatrics</option>
                        <option value="Dermatology">Dermatology</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Location / Room</label>
                      <input 
                        type="text" 
                        placeholder="Building A, Room 102"
                        className="form-input" 
                        value={newDocLocation} 
                        onChange={(e) => setNewDocLocation(e.target.value)} 
                        style={{ width: '100%' }}
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Max Patients Per Day</label>
                      <input 
                        type="number" 
                        className="form-input" 
                        value={newDocCapacity} 
                        onChange={(e) => setNewDocCapacity(e.target.value)} 
                        style={{ width: '100%' }}
                      />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                      <Plus size={18} /> Register Practitioner
                    </button>
                  </form>
                </div>

                {/* Global Appointments Dashboard */}
                <div className="glass-card">
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    Clinic Appointment Log (All Practitioners)
                  </h3>
                  
                  <div className="table-container">
                    <table className="custom-table">
                      <thead>
                        <tr>
                          <th>Patient Name</th>
                          <th>Practitioner</th>
                          <th>Schedule Date</th>
                          <th>Time Block</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.map(app => (
                          <tr key={app.id}>
                            <td style={{ fontWeight: 600 }}>{getPatientName(app.patient_id)}</td>
                            <td>{getDoctorName(app.doctor_id)}</td>
                            <td>{app.appointment_date}</td>
                            <td>{app.appointment_time}</td>
                            <td>
                              <span className={`badge badge-${app.status}`}>
                                {app.status}
                              </span>
                            </td>
                            <td>
                              {app.status === 'pending' && (
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                  <button 
                                    className="btn btn-success" 
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                    onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                                  >
                                    Approve
                                  </button>
                                  <button 
                                    className="btn btn-danger" 
                                    style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                                    onClick={() => updateAppointmentStatus(app.id, 'cancelled')}
                                  >
                                    Cancel
                                  </button>
                                </div>
                              )}
                              {app.status !== 'pending' && (
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Finalized</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                </div>

              </div>

            </div>
          )}

        </div>
      </main>

      {/* 📝 Footer */}
      <footer style={{ borderTop: '1px solid var(--border-color)', background: 'rgba(9, 13, 22, 0.9)', padding: '1.5rem 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p>© 2026 Medi-Care Systems. Designed by Antigravity Assistant.</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%' }}></span>
              Connected to Mock Mongoose DB
            </span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
