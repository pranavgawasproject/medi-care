import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import {
  Users,
  Stethoscope,
  CalendarCheck,
  Activity,
  UserPlus,
  Search,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Award,
} from 'lucide-react'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useToast } from '../hooks/useToast'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Input,
  Label,
  Select,
  Badge,
  ScrollArea,
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
import { SPECIALTIES, colorForName, CLINIC_WEEKLY_TREND } from '../data/seed'
import { useTheme } from '../hooks/useTheme'

export function AdminView({ doctors, patients, appointments, onAddDoctor, onUpdateStatus }) {
  const { toast } = useToast()
  const { theme } = useTheme()
  const [query, setQuery] = useState('')
  const isDark = theme === 'dark'

  // Onboard form
  const [name, setName] = useState('')
  const [specialty, setSpecialty] = useState(SPECIALTIES[0])
  const [room, setRoom] = useState('')
  const [capacity, setCapacity] = useState('10')

  const trendData = CLINIC_WEEKLY_TREND.map((v, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i],
    bookings: v,
  }))

  const filteredAppts = useMemo(() => {
    if (!query.trim()) return appointments
    const q = query.toLowerCase()
    return appointments.filter((a) => {
      const p = patients.find((x) => x.id === a.patient_id)?.name?.toLowerCase() ?? ''
      const d = doctors.find((x) => x.id === a.doctor_id)?.full_name?.toLowerCase() ?? ''
      return p.includes(q) || d.includes(q)
    })
  }, [appointments, query, patients, doctors])

  const getPatientName = (id) => patients.find((p) => p.id === id)?.name ?? 'Unknown Patient'
  const getDoctorName = (id) => doctors.find((d) => d.id === id)?.full_name ?? 'Unknown Doctor'
  const getDoctorSpecialty = (id) => doctors.find((d) => d.id === id)?.specialization ?? '—'

  const handleOnboard = (e) => {
    e.preventDefault()
    if (!name.trim() || !room.trim()) {
      toast({
        title: 'Missing fields',
        description: 'Doctor name and room are required.',
        variant: 'destructive',
      })
      return
    }
    const finalName = name.trim().startsWith('Dr.') ? name.trim() : `Dr. ${name.trim()}`
    onAddDoctor({
      full_name: finalName,
      specialization: specialty,
      location: room.trim(),
      max_patients_per_day: parseInt(capacity, 10) || 8,
    })
    setName('')
    setRoom('')
    setCapacity('10')
    toast({
      title: 'Practitioner onboarded',
      description: `${finalName} has been added to ${room.trim() || 'the directory'}.`,
    })
  }

  const completionRate = useMemo(() => {
    if (appointments.length === 0) return 94
    const done = appointments.filter((a) => a.status === 'confirmed' || a.status === 'cancelled').length
    return Math.round((done / appointments.length) * 100)
  }, [appointments])

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative overflow-hidden rounded-3xl border border-border/60 bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="absolute inset-0 bg-grid opacity-[0.04]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/15 px-3 py-1 text-[11px] font-semibold text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" /> Admin Console
            </div>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl" style={{ fontFamily: 'var(--font-heading)' }}>
              Clinic Operations Control Console
            </h2>
            <p className="max-w-xl text-sm text-muted-foreground">
              Oversee practitioners, monitor appointments, and onboard new talent.
              Real-time visibility across the entire clinic network.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-gradient-to-br from-primary/10 to-emerald-500/10 p-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-md shadow-primary/30">
              <Award className="h-6 w-6" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Completion Rate
              </p>
              <p className="text-2xl font-bold leading-none">{completionRate}%</p>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-400">+2.4% this month</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <AdminStatCard icon={Stethoscope} label="Onboarded Doctors" value={doctors.length.toString()} trend={{ dir: 'up', text: 'Active practitioners' }} accent="from-primary to-emerald-600" />
        <AdminStatCard icon={Users} label="Registered Patients" value={patients.length.toString()} trend={{ dir: 'up', text: 'In the system' }} accent="from-teal-500 to-cyan-600" />
        <AdminStatCard icon={CalendarCheck} label="Total Bookings" value={appointments.length.toString()} trend={{ dir: 'up', text: 'All time' }} accent="from-amber-500 to-orange-500" />
        <AdminStatCard icon={Activity} label="Avg Wait Time" value="8m" trend={{ dir: 'down', text: '-3m improvement' }} accent="from-rose-500 to-pink-500" />
      </div>

      {/* Chart + onboard form */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 overflow-hidden">
          <CardHeader className="bg-muted/30">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>
                  <TrendingUp className="h-4 w-4 text-primary" /> Weekly Bookings Trend
                </CardTitle>
                <CardDescription>Appointment volume over the last 7 days</CardDescription>
              </div>
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">+18.2% WoW</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[240px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="bookingsFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={isDark ? 'oklch(0.68 0.13 178)' : 'oklch(0.55 0.12 178)'} stopOpacity={0.4} />
                      <stop offset="100%" stopColor={isDark ? 'oklch(0.68 0.13 178)' : 'oklch(0.55 0.12 178)'} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'oklch(1 0 0 / 0.08)' : 'oklch(0 0 0 / 0.08)'} vertical={false} />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: isDark ? 'oklch(0.68 0.015 200)' : 'oklch(0.5 0.015 175)' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: isDark ? 'oklch(0.68 0.015 200)' : 'oklch(0.5 0.015 175)' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: isDark ? '1px solid oklch(1 0 0 / 0.1)' : '1px solid oklch(0 0 0 / 0.1)',
                      background: isDark ? 'oklch(0.21 0.018 200 / 0.95)' : 'oklch(1 0 0 / 0.95)',
                      color: isDark ? '#f8fafc' : '#1a2a2a',
                      fontSize: 12,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="bookings"
                    stroke={isDark ? 'oklch(0.68 0.13 178)' : 'oklch(0.55 0.12 178)'}
                    strokeWidth={2.5}
                    fill="url(#bookingsFill)"
                    dot={{ r: 3, fill: isDark ? 'oklch(0.68 0.13 178)' : 'oklch(0.55 0.12 178)' }}
                    activeDot={{ r: 5 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 overflow-hidden">
          <CardHeader className="bg-muted/30">
            <CardTitle>
              <UserPlus className="h-4 w-4 text-primary" /> Onboard New Doctor
            </CardTitle>
            <CardDescription>Register a new practitioner to the clinic</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOnboard} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="doc-name">Full name</Label>
                <Input id="doc-name" placeholder="Dr. Alexander Wright" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-spec">Specialty</Label>
                <Select id="doc-spec" value={specialty} onChange={(e) => setSpecialty(e.target.value)}>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-room">Practice room</Label>
                <Input id="doc-room" placeholder="Building A, Room 102" value={room} onChange={(e) => setRoom(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="doc-cap">Daily slots</Label>
                <Input id="doc-cap" type="number" min={1} max={20} value={capacity} onChange={(e) => setCapacity(e.target.value)} />
              </div>
              <Button type="submit" className="h-10 w-full">
                <CheckCircle2 className="h-4 w-4" />
                Register Practitioner
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Doctor roster */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle>
            <Stethoscope className="h-4 w-4 text-primary" /> Practitioner Roster
          </CardTitle>
          <CardDescription>{doctors.length} active practitioners across all specialties</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {doctors.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.04 }}
                className="group rounded-2xl border border-border/60 bg-gradient-to-b from-card to-muted/20 p-3 transition-all hover:border-primary/40 hover:shadow-md"
              >
                <InitialsAvatar name={d.full_name} color={colorForName(d.full_name)} size="md" />
                <p className="mt-2 truncate text-sm font-semibold">{d.full_name}</p>
                <p className="truncate text-xs text-muted-foreground">{d.specialization}</p>
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                    <Award className="h-3 w-3" /> 4.8
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="truncate text-muted-foreground">{d.location}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Appointment log */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-muted/30">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>
                <CalendarCheck className="h-4 w-4 text-primary" /> Clinic Appointment Log
              </CardTitle>
              <CardDescription>All appointments across every practitioner</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search patient or doctor…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="max-h-[440px]">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/20 hover:bg-muted/20">
                  <TableHead>Patient</TableHead>
                  <TableHead>Practitioner</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAppts.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-32 text-center text-sm text-muted-foreground">
                      No appointments match your search.
                    </TableCell>
                  </TableRow>
                )}
                {filteredAppts.map((a) => (
                  <TableRow key={a.id} className="group">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <InitialsAvatar name={getPatientName(a.patient_id)} color={colorForName(getPatientName(a.patient_id))} size="sm" />
                        <p className="truncate text-sm font-medium">{getPatientName(a.patient_id)}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <InitialsAvatar name={getDoctorName(a.doctor_id)} color={colorForName(getDoctorName(a.doctor_id))} size="sm" />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{getDoctorName(a.doctor_id)}</p>
                          <p className="text-xs text-muted-foreground">{getDoctorSpecialty(a.doctor_id)}</p>
                        </div>
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
                        {a.status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => onUpdateStatus(a, 'confirmed')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => onUpdateStatus(a, 'cancelled')}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {a.status !== 'pending' && (
                          <span className="text-xs text-muted-foreground">Finalized</span>
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

function AdminStatCard({ icon: Icon, label, value, trend, accent }) {
  const TrendIcon = trend.dir === 'up' ? TrendingUp : TrendingDown
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-all hover:shadow-md"
    >
      <div className="flex items-start justify-between">
        <div className={cn('flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-sm', accent)}>
          <Icon className="h-5 w-5" />
        </div>
        <div
          className={cn(
            'flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold',
            trend.dir === 'up'
              ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400'
              : 'bg-rose-500/15 text-rose-600 dark:text-rose-400'
          )}
        >
          <TrendIcon className="h-2.5 w-2.5" />
          {trend.dir}
        </div>
      </div>
      <p className="mt-3 text-2xl font-bold leading-none tracking-tight">{value}</p>
      <p className="mt-1 text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-[11px] text-muted-foreground/80">{trend.text}</p>
    </motion.div>
  )
}
