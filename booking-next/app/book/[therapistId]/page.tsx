import { notFound } from "next/navigation";
import { BookingPage } from "@/components/booking-page";
import { getTherapistById } from "@/lib/therapists";

export default async function BookTherapistPage({ params }: { params: Promise<{ therapistId: string }> }) {
  const { therapistId } = await params;
  const therapist = await getTherapistById(therapistId);

  if (!therapist) {
    notFound();
  }

  return <BookingPage therapist={therapist} />;
}
