import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import {
  Users,
  Clock,
  MapPin,
  CheckCircle2,
  XCircle,
  CalendarDays,
  Star,
  TrendingUp,
  Bell,
  Building2,
  Award,
} from 'lucide-react'
import { useToast } from '../hooks/useToast'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
  ScrollArea,
  Progress,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  StatusBadge,
  InitialsAvatar,
} from './ui'
import { cn } from '../lib/utils'
import { ACTING_DOCTOR_ID, colorForName } from '../data/seed'

const DOCTOR_SELF = {
  id: ACTING_DOCTOR_ID,
  name: 'Dr. Sarah Jenkins',
  specialty: 'Cardiology',
  room: 'Building A, Room 104',
  rating: 4.9,
  experience: 12,
}

export function DoctorView({ doctors, patients, appointments, schedules, onUpdateStatus }) {
  const { toast } = useToast()

  const myAppts = useMemo(
    () => appointments.filter((a) => a.doctor_id === ACTING_DOCTOR_ID),
    [appointments]
  )
  const pending = myAppts.filter((a) => a.status === 'pending')
  const confirmed = myAppts.filter((a) => a.status === 'confirmed')
  const mySchedule = schedules.filter((s) => s.doctor_id === ACTING_DOCTOR_ID)

  const patientsToday = confirmed.length + pending.length
  const slotsPerDay = DOCTOR_SELF.max ?? 12
  const utilization = Math.min(100, Math.round((confirmed.length / slotsPerDay) * 100))

  const getPatientName = (id) =>
    patients.find((p) => p.id === id)?.name ?? 'Unknown Patient'

  const updateStatus = (appt, status, msg) => {
    onUpdateStatus(appt, status)
    toast({ title: msg })
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-md border border-border bg-card p-6  sm:p-8"
      >
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <InitialsAvatar name={DOCTOR_SELF.name} color={colorForName(DOCTOR_SELF.name)} size="lg" />
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Doctor Portal
              </div>
              <h2 className="text-2xl font-bold tracking-tight" style={{ fontFamily: 'var(--font-heading)' }}>
                {DOCTOR_SELF.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                  {DOCTOR_SELF.rating}
                </span>
                <span>·</span>
                <span>{DOCTOR_SELF.specialty}</span>
                <span>·</span>
                <span>{DOCTOR_SELF.experience} years experience</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-md border border-border bg-background px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/15 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Practice Location
              </p>
              <p className="text-sm font-medium">{DOCTOR_SELF.room}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Users} label="Patients Today" value={patientsToday.toString()} accent="border-l-primary" trend="+3 vs yesterday" />
        <StatCard icon={Bell} label="Pending Requests" value={pending.length.toString()} accent="border-l-accent" trend="Needs action" />
        <StatCard icon={Clock} label="Slots Filled" value={`${confirmed.length}/${slotsPerDay}`} accent="border-l-primary" trend={`${utilization}% utilization`} />
        <StatCard icon={TrendingUp} label="Weekly Rating" value={DOCTOR_SELF.rating.toFixed(1)} accent="border-l-destructive" trend="+0.2 this week" />
      </div>

      {/* Pending + Schedule */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle>
              <Bell className="h-4 w-4 text-amber-500" /> Pending Requests
              {pending.length > 0 && (
                <Badge className="ml-1 bg-amber-500 text-white">{pending.length}</Badge>
              )}
            </CardTitle>
            <CardDescription>Approve or decline incoming consultation requests</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[320px]">
              <div className="divide-y divide-border/50">
                {pending.length === 0 && (
                  <div className="flex h-[320px] flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                    All caught up. No pending requests.
                  </div>
                )}
                {pending.map((r, i) => {
                  const isToday =
                    parseISO(r.appointment_date).toDateString() ===
                    new Date(2026, 6, 1).toDateString()
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4"
                    >
                      <div className="flex items-start gap-3">
                        <InitialsAvatar name={getPatientName(r.patient_id)} color={colorForName(getPatientName(r.patient_id))} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{getPatientName(r.patient_id)}</p>
                          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <CalendarDays className="h-3 w-3" />
                              {format(parseISO(r.appointment_date), 'MMM d')}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {r.appointment_time}
                            </span>
                            {isToday && (
                              <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                                TODAY
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() =>
                            updateStatus(r, 'confirmed', `Approved ${getPatientName(r.patient_id)}'s request.`)
                          }
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="flex-1"
                          onClick={() =>
                            updateStatus(r, 'cancelled', `Declined ${getPatientName(r.patient_id)}'s request.`)
                          }
                        >
                          <XCircle className="h-3.5 w-3.5" /> Decline
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle>
              <CalendarDays className="h-4 w-4 text-primary" /> My Weekly Schedule
            </CardTitle>
            <CardDescription>Availability template across the week</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            {mySchedule.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center gap-2 text-center text-sm text-muted-foreground">
                <CalendarDays className="h-8 w-8 opacity-40" />
                No schedule template set.
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                {mySchedule.map((s, i) => {
                  const fill = Math.round((s.available_slots / slotsPerDay) * 100)
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06 }}
                      className="rounded-md border border-border bg-muted/20 p-4"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold uppercase tracking-wide" style={{ fontFamily: 'var(--font-heading)' }}>
                          {s.day_of_week}
                        </span>
                        <span className="rounded-md bg-primary/15 px-2 py-0.5 text-[10px] font-semibold text-primary">
                          {s.available_slots} slots
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.start_time} — {s.end_time}
                      </p>
                      <Progress value={fill} className="mt-3" />
                    </motion.div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Consultation requests & bookings table */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle>
            <Users className="h-4 w-4 text-primary" /> Consultation Requests &amp; Bookings
          </CardTitle>
          <CardDescription>All consultations assigned to you</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[420px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead>Patient</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {myAppts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                      No consultations assigned.
                    </TableCell>
                  </TableRow>
                )}
                {myAppts.map((a) => (
                  <TableRow key={a.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <InitialsAvatar name={getPatientName(a.patient_id)} color={colorForName(getPatientName(a.patient_id))} size="sm" />
                        <p className="truncate text-sm font-medium">{getPatientName(a.patient_id)}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      {format(parseISO(a.appointment_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{a.appointment_time}</TableCell>
                    <TableCell>
                      <StatusBadge status={a.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="outline">View</Button>
                        {a.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateStatus(a, 'cancelled', `Declined ${getPatientName(a.patient_id)}.`)}
                          >
                            Decline
                          </Button>
                        )}
                        {a.status === 'confirmed' && (
                          <Button
                            size="sm"
                            variant="success"
                            onClick={() => updateStatus(a, 'cancelled', `Marked ${getPatientName(a.patient_id)} visit as completed.`)}
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, accent, trend }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('rounded-md border border-border border-l-4 bg-card p-4 transition-colors hover:border-primary/50', accent)}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className="mt-2 font-mono text-2xl font-semibold leading-none tracking-tight">{value}</p>
      <p className="mt-2 text-[11px] text-muted-foreground/80">{trend}</p>
    </motion.div>
  )
}
