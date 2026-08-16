'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Header } from '@/components/Header'
import { Footer } from '@/components/Footer'
import { PatientView } from '@/components/PatientView'
import { DoctorView } from '@/components/DoctorView'
import { AdminView } from '@/components/AdminView'
import { ToastProvider } from '@/hooks/useToast'
import { ThemeProvider } from '@/hooks/useTheme'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { createClient } from '@/lib/supabase/client'
import {
  FALLBACK_APPOINTMENTS,
  FALLBACK_DOCTORS,
  FALLBACK_PATIENTS,
  FALLBACK_SCHEDULES,
} from '@/lib/data/seed'
import type {
  Appointment,
  AppointmentStatus,
  Doctor,
  Patient,
  Role,
  Schedule,
} from '@/lib/types'

export interface AppClientProps {
  initialDoctors: Doctor[]
  initialPatients: Patient[]
  initialAppointments: Appointment[]
  initialSchedules: Schedule[]
  initialConnected: boolean
}

export function AppClient({
  initialDoctors,
  initialPatients,
  initialAppointments,
  initialSchedules,
  initialConnected,
}: AppClientProps) {
  const [role, setRole] = useState<Role>('patient')
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors)
  // `patients` and `schedules` are seeded server-side and currently read-only
  // client-side (the UI doesn't mutate them locally). Setters kept for future
  // use; underscore prefix marks them intentionally unused for now.
  const [patients, _setPatients] = useState<Patient[]>(initialPatients)
  const [appointments, setAppointments] = useState<Appointment[]>(
    initialAppointments
  )
  const [schedules, _setSchedules] = useState<Schedule[]>(initialSchedules)
  const [connected, setConnected] = useState<boolean>(initialConnected)

  /* ----- Mutations (Supabase-aware, fall back to optimistic local state) ----- */
  const handleBook = useCallback(async (appt: Omit<Appointment, 'id'>) => {
    const tempId = `temp-${Date.now()}`
    setAppointments((prev) => [{ ...appt, id: tempId }, ...prev])
    const client = createClient()
    if (!client) return
    try {
      const { data, error } = await client
        .from('appointments')
        .insert([appt])
        .select()
      if (error) throw error
      if (data && data[0]) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === tempId ? (data[0] as Appointment) : a))
        )
      }
    } catch (err) {
      console.warn(
        'Supabase insert failed, keeping optimistic entry:',
        err instanceof Error ? err.message : err
      )
    }
  }, [])

  const handleCancel = useCallback(async (appt: Appointment) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appt.id ? { ...a, status: 'cancelled' } : a))
    )
    const client = createClient()
    if (!client) return
    try {
      const { error } = await client
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appt.id)
      if (error) throw error
    } catch (err) {
      console.warn(
        'Supabase update failed, keeping optimistic change:',
        err instanceof Error ? err.message : err
      )
    }
  }, [])

  const handleUpdateStatus = useCallback(
    async (appt: Appointment, newStatus: AppointmentStatus) => {
      setAppointments((prev) =>
        prev.map((a) => (a.id === appt.id ? { ...a, status: newStatus } : a))
      )
      const client = createClient()
      if (!client) return
      try {
        const { error } = await client
          .from('appointments')
          .update({ status: newStatus })
          .eq('id', appt.id)
        if (error) throw error
      } catch (err) {
        console.warn(
          'Supabase update failed, keeping optimistic change:',
          err instanceof Error ? err.message : err
        )
      }
    },
    []
  )

  const handleAddDoctor = useCallback(async (doc: Omit<Doctor, 'id'>) => {
    const tempId = `temp-${Date.now()}`
    setDoctors((prev) => [...prev, { ...doc, id: tempId }])
    const client = createClient()
    if (!client) return
    try {
      const { data, error } = await client.from('doctors').insert([doc]).select()
      if (error) throw error
      if (data && data[0]) {
        setDoctors((prev) =>
          prev.map((d) => (d.id === tempId ? (data[0] as Doctor) : d))
        )
      }
    } catch (err) {
      console.warn(
        'Supabase insert failed, keeping optimistic entry:',
        err instanceof Error ? err.message : err
      )
    }
  }, [])

  /* ----- Realtime subscriptions (best-effort; safe to no-op when unconfigured) ----- */
  useEffect(() => {
    const client = createClient()
    if (!client) return

    let active = true

    const refreshDoctors = async () => {
      if (!active) return
      try {
        const { data, error } = await client.from('doctors').select('*')
        if (error) throw error
        if (data && data.length) {
          setDoctors(data as Doctor[])
          setConnected(true)
        }
      } catch {
        /* ignore realtime refresh failures — keep current state */
      }
    }
    const refreshAppointments = async () => {
      if (!active) return
      try {
        const { data, error } = await client
          .from('appointments')
          .select('*')
          .order('appointment_date', { ascending: false })
        if (error) throw error
        if (data) setAppointments(data as Appointment[])
      } catch {
        /* ignore */
      }
    }

    const channel = client
      .channel('public:appointments')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'appointments' },
        refreshAppointments
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'doctors' },
        refreshDoctors
      )
      .subscribe()

    return () => {
      active = false
      client.removeChannel(channel)
    }
  }, [])

  return (
    <ErrorBoundary>
      <ThemeProvider>
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
      </ThemeProvider>
    </ErrorBoundary>
  )
}

/** Convenience export for callers that want the fallback bundle. */
export function withFallbacks(): AppClientProps {
  return {
    initialDoctors: FALLBACK_DOCTORS,
    initialPatients: FALLBACK_PATIENTS,
    initialAppointments: FALLBACK_APPOINTMENTS,
    initialSchedules: FALLBACK_SCHEDULES,
    initialConnected: false,
  }
}
