create table if not exists bookings (
  id text primary key,
  therapist_id text not null,
  booking_date text not null,
  booking_time text not null,
  client_name text not null,
  client_email text not null,
  client_phone text not null,
  contact_method text not null,
  client_notes text not null,
  consent boolean not null default true,
  timezone text not null default 'America/New_York',
  status text not null default 'confirmed',
  created_at timestamptz not null default now(),
  unique (therapist_id, booking_date, booking_time)
);
