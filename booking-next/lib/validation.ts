import type { BookingPayload, ValidationErrors } from "@/lib/types";

export function validateBookingPayload(payload: Partial<BookingPayload>) {
  const errors: ValidationErrors = {};

  if (!payload.therapistId?.trim()) {
    errors.therapistId = "A therapist must be selected.";
  }

  if (!payload.bookingDate?.trim()) {
    errors.bookingDate = "Please choose a date.";
  }

  if (!payload.bookingTime?.trim()) {
    errors.bookingTime = "Please choose a time.";
  }

  if (!payload.clientName?.trim()) {
    errors.clientName = "Please enter your full name.";
  }

  if (!payload.clientEmail?.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.clientEmail)) {
    errors.clientEmail = "Please enter a valid email address.";
  }

  const phoneDigits = String(payload.clientPhone || "").replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    errors.clientPhone = "Please enter a valid phone number.";
  }

  if (!payload.contactMethod?.trim()) {
    errors.contactMethod = "Please choose a preferred contact method.";
  }

  if (!payload.clientNotes?.trim()) {
    errors.clientNotes = "Please share a short note about what support you need.";
  }

  if (!payload.consent) {
    errors.consent = "Please agree before confirming the consultation request.";
  }

  return errors;
}
