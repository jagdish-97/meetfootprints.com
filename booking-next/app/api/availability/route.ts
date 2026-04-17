import { NextRequest, NextResponse } from "next/server";
import { buildAvailabilityDays } from "@/lib/availability";
import { getReservedSlotsForTherapist } from "@/lib/bookings";
import { getTherapistById } from "@/lib/therapists";

export async function GET(request: NextRequest) {
  const therapistId = request.nextUrl.searchParams.get("therapistId");
  if (!therapistId) {
    return NextResponse.json({ message: "Missing therapistId." }, { status: 400 });
  }

  const therapist = await getTherapistById(therapistId);
  if (!therapist) {
    return NextResponse.json({ message: "Therapist not found." }, { status: 404 });
  }

  const bookedSlots = await getReservedSlotsForTherapist(therapistId);
  const availabilityDays = buildAvailabilityDays(therapist, bookedSlots);

  return NextResponse.json({
    therapist,
    availabilityDays
  });
}
