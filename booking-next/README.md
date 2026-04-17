# Footprints Booking Next

This app is the Next.js replacement for the current `book-consultation.html` flow.

## What it does

- ships with its own `data/therapists.json` copy so deployment is self-contained
- renders a booking page at `/book/[therapistId]`
- generates availability on the server
- stores booking submissions in Postgres when `DATABASE_URL` is set
- falls back to `booking-next/database/dev-bookings.json` for local testing when no database is configured
- blocks duplicate bookings with a unique constraint on therapist + date + time

## Run locally

1. Open a terminal in `booking-next`
2. Install packages with `npm install`
3. Copy `.env.example` to `.env.local`
4. Start the app with `npm run dev`

## Database setup

Use any Postgres provider such as Neon, Supabase, Railway, or Hostinger VPS Postgres.

1. Create a database
2. Set `DATABASE_URL` in `.env.local`
3. Run the SQL in `database/schema.sql`

The app will also try to create the `bookings` table automatically on first request if the database user has permission.

## How to connect your existing site

Once this app is deployed, update the current booking links:

- current: `book-consultation.html?therapist=<id>`
- new: `https://your-booking-domain.com/book/<id>`

## Next improvements

- add admin authentication for booking management
- send confirmation emails after successful booking
- move therapist content from JSON into the database
- add therapist-managed recurring availability rules
