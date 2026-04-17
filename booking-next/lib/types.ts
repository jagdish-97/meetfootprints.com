export type AvailabilityStatus = "Available" | "Limited" | "Waitlist";

export type Therapist = {
  id: string;
  name: string;
  image: string;
  title: string;
  location: string;
  specialties: string[];
  languages: string[];
  therapyTypes: string[];
  price: number;
  availability: AvailabilityStatus;
  summary: string;
};

export type AvailabilityDay = {
  dateKey: string;
  fullLabel: string;
  label: {
    dayName: string;
    dayNumber: string;
    monthName: string;
  };
  slots: string[];
  totalSlots: number;
};

export type BookingPayload = {
  therapistId: string;
  bookingDate: string;
  bookingTime: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  contactMethod: string;
  clientNotes: string;
  consent: boolean;
};

export type BookingRecord = BookingPayload & {
  id: string;
  status: "confirmed";
  timezone: string;
  createdAt: string;
};

export type ValidationErrors = Partial<Record<keyof BookingPayload, string>>;
