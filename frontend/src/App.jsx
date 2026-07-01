import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from './supabaseClient'
import { ToastProvider } from './hooks/useToast'
import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { PatientView } from './components/PatientView'
import { DoctorView } from './components/DoctorView'
import { AdminView } from './components/AdminView'
import {
  FALLBACK_DOCTORS,
  FALLBACK_PATIENTS,
  FALLBACK_APPOINTMENTS,
  FALLBACK_SCHEDULES,
} from './data/seed'

function App() {
  const [role, setRole] = useState('patient') // 'patient' | 'doctor' | 'admin'
  const [doctors, setDoctors] = useState([])
  const [patients, setPatients] = useState([])
  const [appointments, setAppointments] = useState([])
  const [schedules, setSchedules] = useState([])
  const [connected, setConnected] = useState(false)

  /* ----- Data fetching (Supabase with graceful fallback) ----- */
  const fetchDoctors = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('doctors').select('*')
      if (error) throw error
      if (data && data.length) {
        setDoctors(data)
        setConnected(true)
        return
      }
    } catch (err) {
      console.warn('Supabase doctors fetch failed, using fallback:', err.message)
    }
    setDoctors(FALLBACK_DOCTORS)
    setConnected(false)
  }, [])

  const fetchPatients = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('patients').select('*')
      if (error) throw error
      if (data && data.length) {
        setPatients(data)
        return
      }
    } catch (err) {
      console.warn('Supabase patients fetch failed, using fallback:', err.message)
    }
    setPatients(FALLBACK_PATIENTS)
  }, [])

  const fetchAppointments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('appointment_date', { ascending: false })
      if (error) throw error
      if (data) {
        setAppointments(data)
        return
      }
    } catch (err) {
      console.warn('Supabase appointments fetch failed, using fallback:', err.message)
    }
    setAppointments(FALLBACK_APPOINTMENTS)
  }, [])

  const fetchSchedules = useCallback(async () => {
    try {
      const { data, error } = await supabase.from('schedules').select('*')
      if (error) throw error
      if (data && data.length) {
        setSchedules(data)
        return
      }
    } catch (err) {
      console.warn('Supabase schedules fetch failed, using fallback:', err.message)
    }
    setSchedules(FALLBACK_SCHEDULES)
  }, [])

  useEffect(() => {
    fetchDoctors()
    fetchPatients()
    fetchAppointments()
    fetchSchedules()
  }, [fetchDoctors, fetchPatients, fetchAppointments, fetchSchedules])

  /* ----- Mutations ----- */
  const handleBook = useCallback(
    async (appt) => {
      // Optimistic insert
      const tempId = `temp-${Date.now()}`
      setAppointments((prev) => [
        { ...appt, id: tempId },
        ...prev,
      ])
      try {
        const { data, error } = await supabase
          .from('appointments')
          .insert([appt])
          .select()
        if (error) throw error
        if (data && data[0]) {
          setAppointments((prev) =>
            prev.map((a) => (a.id === tempId ? data[0] : a))
          )
        }
      } catch (err) {
        console.warn('Supabase insert failed, keeping optimistic entry:', err.message)
        // Keep the optimistic entry (works in demo mode)
      }
    },
    []
  )

  const handleCancel = useCallback(
    async (appt) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...a, status: 'cancelled' } : a))
      )
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: 'cancelled' })
          .eq('id', appt.id)
        if (error) throw error
      } catch (err) {
        console.warn('Supabase update failed, keeping optimistic change:', err.message)
      }
    },
    []
  )

  const handleUpdateStatus = useCallback(
    async (appt, newStatus) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...a, status: newStatus } : a))
      )
      try {
        const { error } = await supabase
          .from('appointments')
          .update({ status: newStatus })
          .eq('id', appt.id)
        if (error) throw error
      } catch (err) {
        console.warn('Supabase update failed, keeping optimistic change:', err.message)
      }
    },
    []
  )

  const handleAddDoctor = useCallback(
    async (doc) => {
      const tempId = `temp-${Date.now()}`
      setDoctors((prev) => [...prev, { ...doc, id: tempId }])
      try {
        const { data, error } = await supabase
          .from('doctors')
          .insert([doc])
          .select()
        if (error) throw error
        if (data && data[0]) {
          setDoctors((prev) =>
            prev.map((d) => (d.id === tempId ? data[0] : d))
          )
        }
      } catch (err) {
        console.warn('Supabase insert failed, keeping optimistic entry:', err.message)
      }
    },
    []
  )

  return (
    <ToastProvider>
      <div className="flex min-h-screen flex-col bg-background">
        <Header view={role} setView={setRole} connected={connected} />

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={role}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {role === 'patient' && (
                <PatientView
                  doctors={doctors}
                  appointments={appointments}
                  onBook={handleBook}
                  onCancel={handleCancel}
                  connected={connected}
                />
              )}
              {role === 'doctor' && (
                <DoctorView
                  doctors={doctors}
                  patients={patients}
                  appointments={appointments}
                  schedules={schedules}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}
              {role === 'admin' && (
                <AdminView
                  doctors={doctors}
                  patients={patients}
                  appointments={appointments}
                  onAddDoctor={handleAddDoctor}
                  onUpdateStatus={handleUpdateStatus}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <Footer />
      </div>
    </ToastProvider>
  )
}

export default App
