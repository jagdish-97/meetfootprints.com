import { randomUUID } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { ensureBookingTables, getSqlClient } from "@/lib/db";
import type { BookingPayload, BookingRecord } from "@/lib/types";

const fallbackStorePath = path.join(process.cwd(), "database", "dev-bookings.json");

type StoredBookingRow = {
  id: string;
  therapist_id: string;
  booking_date: string;
  booking_time: string;
  client_name: string;
  client_email: string;
  client_phone: string;
  contact_method: string;
  client_notes: string;
  consent: boolean;
  timezone: string;
  status: "confirmed";
  created_at: string;
};

export async function getReservedSlotsForTherapist(therapistId: string) {
  const bookings = await listBookings();
  const reservedSlots: Record<string, string[]> = {};

  for (const booking of bookings) {
    if (booking.therapistId !== therapistId) {
      continue;
    }

    reservedSlots[booking.bookingDate] ??= [];
    reservedSlots[booking.bookingDate].push(booking.bookingTime);
  }

  return reservedSlots;
}

export async function createBooking(payload: BookingPayload): Promise<BookingRecord> {
  const sql = getSqlClient();
  const timezone = process.env.DEFAULT_BOOKING_TIMEZONE || "America/New_York";
  const record: BookingRecord = {
    id: randomUUID(),
    therapistId: payload.therapistId,
    bookingDate: payload.bookingDate,
    bookingTime: payload.bookingTime,
    clientName: payload.clientName,
    clientEmail: payload.clientEmail,
    clientPhone: payload.clientPhone,
    contactMethod: payload.contactMethod,
    clientNotes: payload.clientNotes,
    consent: payload.consent,
    timezone,
    status: "confirmed",
    createdAt: new Date().toISOString()
  };

  if (sql) {
    await ensureBookingTables();

    try {
      await sql`
        insert into bookings (
          id,
          therapist_id,
          booking_date,
          booking_time,
          client_name,
          client_email,
          client_phone,
          contact_method,
          client_notes,
          consent,
          timezone,
          status
        ) values (
          ${record.id},
          ${record.therapistId},
          ${record.bookingDate},
          ${record.bookingTime},
          ${record.clientName},
          ${record.clientEmail},
          ${record.clientPhone},
          ${record.contactMethod},
          ${record.clientNotes},
          ${record.consent},
          ${record.timezone},
          ${record.status}
        )
      `;
    } catch (error) {
      if (error instanceof Error && "code" in error && error.code === "23505") {
        throw new Error("That time was just reserved. Please choose another slot.");
      }
      throw error;
    }

    return record;
  }

  const bookings = await listBookings();
  const duplicate = bookings.find(
    (booking) =>
      booking.therapistId === payload.therapistId &&
      booking.bookingDate === payload.bookingDate &&
      booking.bookingTime === payload.bookingTime
  );

  if (duplicate) {
    throw new Error("That time was just reserved. Please choose another slot.");
  }

  bookings.push(record);
  await writeFile(fallbackStorePath, JSON.stringify(bookings, null, 2));
  return record;
}

export async function listBookings(): Promise<BookingRecord[]> {
  const sql = getSqlClient();

  if (sql) {
    await ensureBookingTables();
    const rows = await sql<StoredBookingRow[]>`
      select
        id,
        therapist_id,
        booking_date,
        booking_time,
        client_name,
        client_email,
        client_phone,
        contact_method,
        client_notes,
        consent,
        timezone,
        status,
        created_at
      from bookings
      order by created_at desc
    `;

    return rows.map(mapRowToBooking);
  }

  try {
    const raw = await readFile(fallbackStorePath, "utf8");
    return JSON.parse(raw) as BookingRecord[];
  } catch {
    await writeFile(fallbackStorePath, "[]");
    return [];
  }
}

function mapRowToBooking(row: StoredBookingRow): BookingRecord {
  return {
    id: row.id,
    therapistId: row.therapist_id,
    bookingDate: row.booking_date,
    bookingTime: row.booking_time,
    clientName: row.client_name,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    contactMethod: row.contact_method,
    clientNotes: row.client_notes,
    consent: row.consent,
    timezone: row.timezone,
    status: row.status,
    createdAt: row.created_at
  };
}
