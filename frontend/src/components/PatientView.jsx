import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import {
  CalendarDays,
  Clock,
  MapPin,
  Plus,
  Stethoscope,
  FileText,
  CheckCircle2,
  CalendarCheck,
  Activity,
  TrendingUp,
  Star,
  Video,
  PhoneCall,
} from 'lucide-react'
import { supabase } from '../supabaseClient'
import { useToast } from '../hooks/useToast'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Select,
  Input,
  Label,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  ScrollArea,
  StatusBadge,
  InitialsAvatar,
} from './ui'
import { cn } from '../lib/utils'
import {
  ACTING_PATIENT_ID,
  FALLBACK_DOCTORS,
  FALLBACK_APPOINTMENTS,
  MEDICAL_NOTES,
  TIME_SLOTS,
  colorForName,
} from '../data/seed'

export function PatientView({ doctors, appointments, onBook, onCancel, connected }) {
  const { toast } = useToast()
  const [selectedDoctorId, setSelectedDoctorId] = useState(
    doctors[0]?.id ?? FALLBACK_DOCTORS[0].id
  )
  const [bookingDate, setBookingDate] = useState('2026-07-01')
  const [selectedSlot, setSelectedSlot] = useState('09:30 AM')

  useEffect(() => {
    if (doctors.length && !doctors.find((d) => d.id === selectedDoctorId)) {
      setSelectedDoctorId(doctors[0].id)
    }
  }, [doctors, selectedDoctorId])

  const selectedDoctor = useMemo(
    () =>
      doctors.find((d) => d.id === selectedDoctorId) ?? FALLBACK_DOCTORS[0],
    [doctors, selectedDoctorId]
  )

  const myAppointments = useMemo(
    () => appointments.filter((a) => a.patient_id === ACTING_PATIENT_ID),
    [appointments]
  )
  const upcoming = myAppointments
    .filter((a) => a.status === 'confirmed' || a.status === 'pending')
    .sort((a, b) => a.appointment_date.localeCompare(b.appointment_date))
  const history = myAppointments.filter(
    (a) => a.status === 'cancelled' || a.status === 'completed'
  )

  const actingPatient = { name: 'Pranav Gawas', id: ACTING_PATIENT_ID }

  const handleRequest = () => {
    if (!selectedDoctorId || !bookingDate || !selectedSlot) {
      toast({
        title: 'Missing details',
        description: 'Please pick a practitioner, date, and time slot.',
        variant: 'destructive',
      })
      return
    }
    onBook({
      patient_id: ACTING_PATIENT_ID,
      doctor_id: selectedDoctorId,
      appointment_date: bookingDate,
      appointment_time: selectedSlot,
      status: 'pending',
    })
    toast({
      title: 'Appointment requested',
      description: `${selectedDoctor.full_name} on ${format(parseISO(bookingDate), 'MMM d')} at ${selectedSlot}.`,
    })
  }

  const handleCancel = (appt) => {
    onCancel(appt)
    toast({
      title: 'Appointment cancelled',
      description: `${appt.appointment_date} · ${appt.appointment_time}`,
      variant: 'destructive',
    })
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-primary/95 via-emerald-600 to-teal-700 p-6 text-white shadow-xl shadow-primary/20 sm:p-8"
      >
        <div className="absolute inset-0 bg-grid opacity-10" />
        <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        <div className="absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-accent/20 blur-2xl" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Welcome back
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
              {actingPatient.name}
            </h2>
            <p className="max-w-md text-sm text-white/80">
              Your health journey at a glance. Manage upcoming visits, review
              medical notes, and book new consultations in seconds.
            </p>
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                Patient ID · MC-4291
              </span>
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                Hypertension · Monitored
              </span>
              <span className="rounded-lg bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur">
                Blood Type · O+
              </span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 lg:gap-4">
            <HeroStat icon={CalendarCheck} label="Upcoming" value={upcoming.length.toString()} />
            <HeroStat icon={Activity} label="Visits" value={history.length.toString()} />
            <HeroStat icon={TrendingUp} label="Health Score" value="92" />
          </div>
        </div>
      </motion.div>

      {/* Upcoming + Medical notes */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 bg-muted/30">
            <div>
              <CardTitle>
                <CalendarDays className="h-4 w-4 text-primary" /> Upcoming Booking
              </CardTitle>
              <CardDescription>Your next scheduled consultations</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Plus className="h-3.5 w-3.5" /> Add visit
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px]">
              <div className="divide-y divide-border/50">
                {upcoming.length === 0 && (
                  <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                    <CalendarDays className="h-8 w-8 opacity-40" />
                    No upcoming bookings yet.
                  </div>
                )}
                {upcoming.map((a, i) => {
                  const doc = doctors.find((d) => d.id === a.doctor_id)
                  const d = parseISO(a.appointment_date)
                  return (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="group flex items-center gap-4 p-4 transition-colors hover:bg-muted/40"
                    >
                      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-emerald-500/10 text-primary">
                        <span className="text-[10px] font-semibold uppercase">
                          {format(d, 'MMM')}
                        </span>
                        <span className="text-lg font-bold leading-none">{format(d, 'd')}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="truncate text-sm font-semibold">
                            {doc?.full_name ?? 'Unknown Doctor'}
                          </p>
                          <StatusBadge status={a.status} />
                        </div>
                        <p className="truncate text-xs text-muted-foreground">
                          {doc?.specialization ?? '—'}
                        </p>
                        <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> {a.appointment_time}
                          </span>
                          {doc?.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> {doc.location}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-1.5">
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <Video className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-primary">
                          <PhoneCall className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle>
              <FileText className="h-4 w-4 text-primary" /> Medical Notes
            </CardTitle>
            <CardDescription>Recent clinical summaries</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[280px]">
              <div className="divide-y divide-border/50">
                {MEDICAL_NOTES.map((note, i) => (
                  <motion.div
                    key={note.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group cursor-pointer p-4 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                        {note.tag}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {format(parseISO(note.date), 'MMM d, yyyy')}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold leading-tight">{note.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {note.content}
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-muted-foreground/80">
                      {note.doctor} · {note.specialty}
                    </p>
                  </motion.div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Book consultation */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle>
            <Stethoscope className="h-4 w-4 text-primary" /> Book Consultation
          </CardTitle>
          <CardDescription>Choose a practitioner, date, and time slot</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 lg:grid-cols-3">
          {/* Doctor pick */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Practitioner</Label>
              <Select
                value={selectedDoctorId}
                onChange={(e) => setSelectedDoctorId(e.target.value)}
              >
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.full_name} ({d.specialization})
                  </option>
                ))}
              </Select>
            </div>
            <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-card to-muted/20 p-4">
              <div className="flex items-start gap-3">
                <InitialsAvatar
                  name={selectedDoctor.full_name}
                  color={colorForName(selectedDoctor.full_name)}
                  size="lg"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{selectedDoctor.full_name}</p>
                  <p className="text-xs text-muted-foreground">{selectedDoctor.specialization}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1 font-medium">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      4.9
                    </span>
                    <span className="text-muted-foreground">
                      {selectedDoctor.max_patients_per_day} slots/day
                    </span>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2 text-xs text-muted-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {selectedDoctor.location}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Available practitioners</Label>
              <div className="flex flex-wrap gap-2">
                {doctors.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDoctorId(d.id)}
                    className={cn(
                      'flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all',
                      d.id === selectedDoctorId
                        ? 'border-primary bg-primary/15 text-primary'
                        : 'border-border/70 bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground'
                    )}
                  >
                    <InitialsAvatar name={d.full_name} color={colorForName(d.full_name)} size="sm" />
                    <span className="max-w-[80px] truncate">
                      {d.full_name.replace('Dr. ', '')}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date */}
          <div className="space-y-3">
            <Label>Select date</Label>
            <div className="rounded-2xl border border-border/60 bg-card p-4">
              <Input
                type="date"
                value={bookingDate}
                onChange={(e) => setBookingDate(e.target.value)}
                className="mb-3"
              />
              <div className="rounded-xl bg-muted/40 p-3 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Selected
                </p>
                <p className="mt-1 text-lg font-bold" style={{ fontFamily: 'var(--font-heading)' }}>
                  {bookingDate ? format(parseISO(bookingDate), 'EEEE') : '—'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {bookingDate ? format(parseISO(bookingDate), 'MMM d, yyyy') : 'Pick a date'}
                </p>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-1.5">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].slice(0, 7).map((d, idx) => (
                  <div
                    key={d}
                    className={cn(
                      'rounded-lg py-1.5 text-center text-[10px] font-medium',
                      idx < 5 ? 'bg-primary/10 text-primary' : 'bg-muted/40 text-muted-foreground'
                    )}
                  >
                    {d}
                  </div>
                ))}
              </div>
              <p className="mt-2 text-center text-[10px] text-muted-foreground">
                Weekdays highlighted · Clinic open Mon–Sat
              </p>
            </div>
          </div>

          {/* Time slots + submit */}
          <div className="space-y-3">
            <Label>Available time slots</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
              {TIME_SLOTS.map((slot) => {
                const active = slot === selectedSlot
                return (
                  <button
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={cn(
                      'flex flex-col items-center gap-0.5 rounded-xl border px-2 py-2.5 text-xs font-medium transition-all',
                      active
                        ? 'border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20'
                        : 'border-border/70 bg-card text-foreground hover:border-primary/40 hover:bg-primary/5'
                    )}
                  >
                    <Clock className="h-3.5 w-3.5" />
                    {slot}
                  </button>
                )
              })}
            </div>
            <div className="rounded-xl border border-dashed border-border/70 bg-muted/20 p-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-medium text-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                {bookingDate ? format(parseISO(bookingDate), 'EEEE, MMM d') : 'Select a date'}
                {selectedSlot && <span className="text-muted-foreground">· {selectedSlot}</span>}
              </p>
              <p className="mt-1">Confirmation typically arrives within 15 minutes.</p>
            </div>
            <Button
              onClick={handleRequest}
              className="h-10 w-full"
            >
              <CalendarCheck className="h-4 w-4" />
              Request Appointment
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle>
            <Activity className="h-4 w-4 text-primary" /> My Consultations History
          </CardTitle>
          <CardDescription>Past visits and their outcomes</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[420px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead>Doctor</TableHead>
                  <TableHead>Specialty</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...upcoming, ...history].map((a) => {
                  const doc = doctors.find((d) => d.id === a.doctor_id)
                  return (
                    <TableRow key={a.id} className="group">
                      <TableCell>
                        <div className="flex items-center gap-2.5">
                          <InitialsAvatar
                            name={doc?.full_name ?? 'Dr. ?'}
                            color={colorForName(doc?.full_name ?? '')}
                            size="sm"
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {doc?.full_name ?? 'Unknown Doctor'}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {doc?.specialization ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(parseISO(a.appointment_date), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {a.appointment_time}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={a.status} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1.5">
                          <Button size="sm" variant="outline">
                            Reschedule
                          </Button>
                          {(a.status === 'pending' || a.status === 'confirmed') && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleCancel(a)}
                            >
                              Cancel
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function HeroStat({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-white/10 p-3 backdrop-blur-md ring-1 ring-white/15">
      <Icon className="h-4 w-4 text-white/80" />
      <p className="mt-1.5 text-2xl font-bold leading-none">{value}</p>
      <p className="mt-1 text-[10px] font-medium uppercase tracking-wide text-white/70">
        {label}
      </p>
    </div>
  )
}
