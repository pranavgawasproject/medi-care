-- ============================================================
--  MediCare — Enterprise Healthcare Platform Schema
--  Target: Supabase (Postgres 15 + auth.users + RLS)
-- ============================================================
--
--  This file is the source of truth for the database schema. Run it
--  in the Supabase SQL editor (Dashboard → SQL → New query).
--
--  Order:
--    1. Extensions
--    2. Enums
--    3. Core tables (doctors, patients, schedules, appointments)
--    4. Auth-linked profile table + trigger
--    5. Clinical tables (prescriptions, prescription_items, medical_records, lab_reports)
--    6. Operational tables (notifications, audit_logs)
--    7. Indexes
--    8. Row Level Security policies
--    9. updated_at triggers
-- ============================================================

-- Required extension for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ============================================================
--  ENUMS
-- ============================================================
do $$ begin
  create type user_role as enum ('patient', 'doctor', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type appointment_status as enum ('pending', 'confirmed', 'cancelled', 'completed');
exception when duplicate_object then null; end $$;

do $$ begin
  create type prescription_status as enum ('active', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type medical_record_type as enum ('visit', 'diagnosis', 'treatment', 'allergy', 'immunization', 'surgery');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lab_test_type as enum ('blood', 'urine', 'imaging', 'biopsy', 'other');
exception when duplicate_object then null; end $$;

do $$ begin
  create type lab_report_status as enum ('ordered', 'collected', 'in_progress', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type notification_type as enum (
    'appointment_reminder',
    'prescription_created',
    'lab_result_ready',
    'appointment_cancelled',
    'system'
  );
exception when duplicate_object then null; end $$;

-- ============================================================
--  CORE TABLES
-- ============================================================

-- Doctors — kept from the original schema, now linked to a profile row.
create table if not exists doctors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references auth.users(id) on delete set null,
  full_name text not null,
  specialization text not null,
  location text not null,
  max_patients_per_day integer not null default 12,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists patients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null unique,
  phone text not null,
  medical_history text,
  date_of_birth date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists schedules (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid references doctors(id) on delete cascade not null,
  day_of_week text check (day_of_week in ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')) not null,
  start_time text not null,
  end_time text not null,
  available_slots integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references patients(id) on delete cascade not null,
  doctor_id uuid references doctors(id) on delete cascade not null,
  appointment_date date not null,
  appointment_time text not null,
  status text check (status in ('pending','confirmed','cancelled','completed')) default 'pending' not null,
  reason text,
  urgency text check (urgency in ('routine','urgent','emergency')) default 'routine' not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============================================================
--  PROFILES — extends auth.users
-- ============================================================
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  role user_role not null default 'patient',
  avatar_url text,
  phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Auto-create a profile row when a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'patient')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
--  CLINICAL TABLES
-- ============================================================
create table if not exists prescriptions (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references profiles(id) on delete cascade not null,
  doctor_id uuid references profiles(id) on delete cascade not null,
  diagnosis text not null,
  notes text,
  status prescription_status not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists prescription_items (
  id uuid primary key default gen_random_uuid(),
  prescription_id uuid references prescriptions(id) on delete cascade not null,
  medication_name text not null,
  dosage text not null,
  frequency text not null,
  duration text not null,
  instructions text,
  created_at timestamptz not null default now()
);

create table if not exists medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references profiles(id) on delete cascade not null,
  doctor_id uuid references profiles(id) on delete cascade not null,
  record_type medical_record_type not null default 'visit',
  title text not null,
  description text,
  record_date date not null default current_date,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists lab_reports (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references profiles(id) on delete cascade not null,
  doctor_id uuid references profiles(id) on delete cascade not null,
  test_name text not null,
  test_type lab_test_type not null default 'blood',
  status lab_report_status not null default 'ordered',
  result_summary text,
  result_url text,
  ordered_at timestamptz not null default now(),
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ============================================================
--  OPERATIONAL TABLES
-- ============================================================
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type notification_type not null default 'system',
  title text not null,
  message text not null,
  data jsonb default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  ip_address inet,
  created_at timestamptz not null default now()
);

-- ============================================================
--  INDEXES
-- ============================================================
create index if not exists idx_doctors_profile_id        on doctors(profile_id);
create index if not exists idx_doctors_specialization    on doctors(specialization);

create index if not exists idx_patients_profile_id       on patients(profile_id);
create index if not exists idx_patients_email            on patients(email);

create index if not exists idx_appointments_patient_id   on appointments(patient_id);
create index if not exists idx_appointments_doctor_id    on appointments(doctor_id);
create index if not exists idx_appointments_date         on appointments(appointment_date);
create index if not exists idx_appointments_status       on appointments(status);
create index if not exists idx_appointments_created_at   on appointments(created_at desc);

create index if not exists idx_prescriptions_patient_id  on prescriptions(patient_id);
create index if not exists idx_prescriptions_doctor_id   on prescriptions(doctor_id);
create index if not exists idx_prescriptions_status      on prescriptions(status);
create index if not exists idx_prescriptions_created_at  on prescriptions(created_at desc);

create index if not exists idx_prescription_items_rx_id  on prescription_items(prescription_id);

create index if not exists idx_medical_records_patient_id on medical_records(patient_id);
create index if not exists idx_medical_records_doctor_id  on medical_records(doctor_id);
create index if not exists idx_medical_records_type       on medical_records(record_type);
create index if not exists idx_medical_records_date       on medical_records(record_date desc);

create index if not exists idx_lab_reports_patient_id    on lab_reports(patient_id);
create index if not exists idx_lab_reports_doctor_id     on lab_reports(doctor_id);
create index if not exists idx_lab_reports_status        on lab_reports(status);
create index if not exists idx_lab_reports_ordered_at    on lab_reports(ordered_at desc);

create index if not exists idx_notifications_user_id     on notifications(user_id);
create index if not exists idx_notifications_read_at     on notifications(read_at);
create index if not exists idx_notifications_created_at  on notifications(created_at desc);

create index if not exists idx_audit_logs_actor_id      on audit_logs(actor_id);
create index if not exists idx_audit_logs_action        on audit_logs(action);
create index if not exists idx_audit_logs_entity        on audit_logs(entity_type, entity_id);
create index if not exists idx_audit_logs_created_at    on audit_logs(created_at desc);

-- ============================================================
--  updated_at trigger
-- ============================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'doctors','patients','schedules','appointments','profiles',
    'prescriptions','medical_records','lab_reports'
  ] loop
    execute format('drop trigger if exists trg_%I_touch on %I;', t, t);
    execute format(
      'create trigger trg_%I_touch before update on %I ' ||
      'for each row execute function public.touch_updated_at();',
      t, t
    );
  end loop;
end $$;

-- ============================================================
--  ROW LEVEL SECURITY
-- ============================================================
alter table doctors          enable row level security;
alter table patients         enable row level security;
alter table schedules        enable row level security;
alter table appointments     enable row level security;
alter table profiles         enable row level security;
alter table prescriptions    enable row level security;
alter table prescription_items enable row level security;
alter table medical_records  enable row level security;
alter table lab_reports      enable row level security;
alter table notifications    enable row level security;
alter table audit_logs       enable row level security;

-- Helper: current user's role
create or replace function public.current_role()
returns user_role language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid();
$$;

-- PROFILES — users can read their own; doctors/admins can read all
drop policy if exists "profiles_select_self_or_staff" on profiles;
create policy "profiles_select_self_or_staff" on profiles
  for select using (
    id = auth.uid()
    or public.current_role() in ('doctor','admin')
  );

drop policy if exists "profiles_update_self" on profiles;
create policy "profiles_update_self" on profiles
  for update using (id = auth.uid());

drop policy if exists "profiles_admin_all" on profiles;
create policy "profiles_admin_all" on profiles
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

-- DOCTORS — public read (needed for booking); self/admin write
drop policy if exists "doctors_select_any" on doctors;
create policy "doctors_select_any" on doctors for select using (true);

drop policy if exists "doctors_admin_all" on doctors;
create policy "doctors_admin_all" on doctors
  for all using (public.current_role() = 'admin') with check (public.current_role() = 'admin');

drop policy if exists "doctors_self_update" on doctors;
create policy "doctors_self_update" on doctors
  for update using (profile_id = auth.uid());

-- PATIENTS — patients see own row; doctors/admins see all
drop policy if exists "patients_select_self_or_staff" on patients;
create policy "patients_select_self_or_staff" on patients
  for select using (
    profile_id = auth.uid()
    or public.current_role() in ('doctor','admin')
  );

drop policy if exists "patients_insert_self" on patients;
create policy "patients_insert_self" on patients
  for insert with check (profile_id = auth.uid() or public.current_role() = 'admin');

drop policy if exists "patients_update_self_or_admin" on patients;
create policy "patients_update_self_or_admin" on patients
  for update using (profile_id = auth.uid() or public.current_role() = 'admin');

-- SCHEDULES — public read; doctor-owner/admin write
drop policy if exists "schedules_select_any" on schedules;
create policy "schedules_select_any" on schedules for select using (true);

drop policy if exists "schedules_owner_or_admin_write" on schedules;
create policy "schedules_owner_or_admin_write" on schedules
  for all using (
    exists (select 1 from doctors d where d.id = schedules.doctor_id and d.profile_id = auth.uid())
    or public.current_role() = 'admin'
  );

-- APPOINTMENTS — patient sees own; doctor sees own; admin sees all
drop policy if exists "appointments_select_participants" on appointments;
create policy "appointments_select_participants" on appointments
  for select using (
    exists (select 1 from patients p where p.id = appointments.patient_id and p.profile_id = auth.uid())
    or exists (select 1 from doctors d where d.id = appointments.doctor_id and d.profile_id = auth.uid())
    or public.current_role() = 'admin'
  );

drop policy if exists "appointments_insert_patient_or_admin" on appointments;
create policy "appointments_insert_patient_or_admin" on appointments
  for insert with check (
    exists (select 1 from patients p where p.id = appointments.patient_id and p.profile_id = auth.uid())
    or public.current_role() in ('admin','doctor')
  );

drop policy if exists "appointments_update_participants" on appointments;
create policy "appointments_update_participants" on appointments
  for update using (
    exists (select 1 from patients p where p.id = appointments.patient_id and p.profile_id = auth.uid())
    or exists (select 1 from doctors d where d.id = appointments.doctor_id and d.profile_id = auth.uid())
    or public.current_role() = 'admin'
  );

drop policy if exists "appointments_delete_admin" on appointments;
create policy "appointments_delete_admin" on appointments
  for delete using (public.current_role() = 'admin');

-- PRESCRIPTIONS — patient sees own; doctor sees own issued + own patients; admin all
drop policy if exists "prescriptions_select_participants" on prescriptions;
create policy "prescriptions_select_participants" on prescriptions
  for select using (
    patient_id = auth.uid()
    or doctor_id = auth.uid()
    or public.current_role() = 'admin'
  );

drop policy if exists "prescriptions_insert_doctor_or_admin" on prescriptions;
create policy "prescriptions_insert_doctor_or_admin" on prescriptions
  for insert with check (
    doctor_id = auth.uid() or public.current_role() = 'admin'
  );

drop policy if exists "prescriptions_update_doctor_or_admin" on prescriptions;
create policy "prescriptions_update_doctor_or_admin" on prescriptions
  for update using (
    doctor_id = auth.uid() or public.current_role() = 'admin'
  );

drop policy if exists "prescriptions_delete_doctor_or_admin" on prescriptions;
create policy "prescriptions_delete_doctor_or_admin" on prescriptions
  for delete using (
    doctor_id = auth.uid() or public.current_role() = 'admin'
  );

-- PRESCRIPTION_ITEMS — inherit via prescription
drop policy if exists "prescription_items_select_via_rx" on prescription_items;
create policy "prescription_items_select_via_rx" on prescription_items
  for select using (
    exists (
      select 1 from prescriptions p
      where p.id = prescription_items.prescription_id
        and (p.patient_id = auth.uid() or p.doctor_id = auth.uid() or public.current_role() = 'admin')
    )
  );

drop policy if exists "prescription_items_insert_doctor_or_admin" on prescription_items;
create policy "prescription_items_insert_doctor_or_admin" on prescription_items
  for insert with check (
    exists (
      select 1 from prescriptions p
      where p.id = prescription_items.prescription_id
        and (p.doctor_id = auth.uid() or public.current_role() = 'admin')
    )
  );

drop policy if exists "prescription_items_delete_doctor_or_admin" on prescription_items;
create policy "prescription_items_delete_doctor_or_admin" on prescription_items
  for delete using (
    exists (
      select 1 from prescriptions p
      where p.id = prescription_items.prescription_id
        and (p.doctor_id = auth.uid() or public.current_role() = 'admin')
    )
  );

-- MEDICAL_RECORDS — patient sees own; doctor sees own patients; admin all
drop policy if exists "medical_records_select_participants" on medical_records;
create policy "medical_records_select_participants" on medical_records
  for select using (
    patient_id = auth.uid()
    or doctor_id = auth.uid()
    or public.current_role() = 'admin'
  );

drop policy if exists "medical_records_insert_doctor_or_admin" on medical_records;
create policy "medical_records_insert_doctor_or_admin" on medical_records
  for insert with check (
    doctor_id = auth.uid() or public.current_role() = 'admin'
  );

drop policy if exists "medical_records_update_doctor_or_admin" on medical_records;
create policy "medical_records_update_doctor_or_admin" on medical_records
  for update using (
    doctor_id = auth.uid() or public.current_role() = 'admin'
  );

drop policy if exists "medical_records_delete_doctor_or_admin" on medical_records;
create policy "medical_records_delete_doctor_or_admin" on medical_records
  for delete using (
    doctor_id = auth.uid() or public.current_role() = 'admin'
  );

-- LAB_REPORTS — patient sees own; doctor sees own; admin all
drop policy if exists "lab_reports_select_participants" on lab_reports;
create policy "lab_reports_select_participants" on lab_reports
  for select using (
    patient_id = auth.uid()
    or doctor_id = auth.uid()
    or public.current_role() = 'admin'
  );

drop policy if exists "lab_reports_insert_doctor_or_admin" on lab_reports;
create policy "lab_reports_insert_doctor_or_admin" on lab_reports
  for insert with check (
    doctor_id = auth.uid() or public.current_role() = 'admin'
  );

drop policy if exists "lab_reports_update_doctor_or_admin" on lab_reports;
create policy "lab_reports_update_doctor_or_admin" on lab_reports
  for update using (
    doctor_id = auth.uid() or public.current_role() = 'admin'
  );

drop policy if exists "lab_reports_delete_doctor_or_admin" on lab_reports;
create policy "lab_reports_delete_doctor_or_admin" on lab_reports
  for delete using (
    doctor_id = auth.uid() or public.current_role() = 'admin'
  );

-- NOTIFICATIONS — owner only
drop policy if exists "notifications_select_owner" on notifications;
create policy "notifications_select_owner" on notifications
  for select using (user_id = auth.uid());

drop policy if exists "notifications_update_owner" on notifications;
create policy "notifications_update_owner" on notifications
  for update using (user_id = auth.uid());

drop policy if exists "notifications_insert_owner_or_system" on notifications;
create policy "notifications_insert_owner_or_system" on notifications
  for insert with check (
    user_id = auth.uid() or public.current_role() in ('doctor','admin')
  );

drop policy if exists "notifications_delete_owner" on notifications;
create policy "notifications_delete_owner" on notifications
  for delete using (user_id = auth.uid());

-- AUDIT_LOGS — admin read; any authenticated user can write (insert via API)
drop policy if exists "audit_logs_select_admin" on audit_logs;
create policy "audit_logs_select_admin" on audit_logs
  for select using (public.current_role() = 'admin');

drop policy if exists "audit_logs_insert_authenticated" on audit_logs;
create policy "audit_logs_insert_authenticated" on audit_logs
  for insert with check (auth.uid() is not null);

-- ============================================================
--  END OF SCHEMA
-- ============================================================
