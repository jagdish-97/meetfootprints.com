import { NextRequest, NextResponse } from "next/server";
import { buildAvailabilityDays } from "@/lib/availability";
import { createBooking, getReservedSlotsForTherapist } from "@/lib/bookings";
import { getTherapistById } from "@/lib/therapists";
import type { BookingPayload } from "@/lib/types";
import { validateBookingPayload } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const payload = (await request.json()) as Partial<BookingPayload>;
  const errors = validateBookingPayload(payload);

  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ message: "Please correct the highlighted fields.", errors }, { status: 400 });
  }

  const therapist = await getTherapistById(payload.therapistId as string);
  if (!therapist) {
    return NextResponse.json({ message: "Therapist not found." }, { status: 404 });
  }

  const bookedSlots = await getReservedSlotsForTherapist(therapist.id);
  const availabilityDays = buildAvailabilityDays(therapist, bookedSlots);
  const selectedDay = availabilityDays.find((day) => day.dateKey === payload.bookingDate);

  if (!selectedDay || !selectedDay.slots.includes(payload.bookingTime as string)) {
    return NextResponse.json(
      { message: "That time is no longer available. Please choose another slot." },
      { status: 409 }
    );
  }

  try {
    const booking = await createBooking(payload as BookingPayload);
    return NextResponse.json({
      message: "Consultation request saved successfully.",
      booking
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "The booking could not be saved.";
    return NextResponse.json({ message }, { status: 409 });
  }
}
