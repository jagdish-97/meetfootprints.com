import type { AvailabilityDay, AvailabilityStatus, Therapist } from "@/lib/types";

const slotLibrary: Record<AvailabilityStatus, string[]> = {
  Available: ["8:30 AM", "9:30 AM", "10:30 AM", "11:30 AM", "1:00 PM", "2:30 PM", "4:00 PM", "5:30 PM", "6:30 PM"],
  Limited: ["9:30 AM", "11:00 AM", "1:30 PM", "4:30 PM", "6:00 PM"],
  Waitlist: ["10:00 AM", "12:30 PM", "3:00 PM", "5:00 PM"]
};

const dayCounts: Record<AvailabilityStatus, number> = {
  Available: 90,
  Limited: 75,
  Waitlist: 60
};

export function buildAvailabilityDays(therapist: Therapist, bookedSlotsByDate: Record<string, string[]>): AvailabilityDay[] {
  const daysToGenerate = dayCounts[therapist.availability] ?? 90;
  const slotsPerDay = slotLibrary[therapist.availability] ?? slotLibrary.Available;
  const leadDays = therapist.availability === "Waitlist" ? 5 : 1;

  const cursor = new Date();
  cursor.setDate(cursor.getDate() + leadDays);

  const days: AvailabilityDay[] = [];
  let generatedDays = 0;

  while (generatedDays < daysToGenerate) {
    if (cursor.getDay() === 0 || cursor.getDay() === 6) {
      cursor.setDate(cursor.getDate() + 1);
      continue;
    }

    const dateKey = formatDateKey(cursor);
    const allSlots = rotateSlots(slotsPerDay, generatedDays);
    const reservedSlots = bookedSlotsByDate[dateKey] ?? [];
    const openSlots = allSlots.filter((slot) => !reservedSlots.includes(slot));

    days.push({
      dateKey,
      fullLabel: formatReadableDate(cursor),
      label: formatDateCardLabel(cursor),
      slots: openSlots,
      totalSlots: allSlots.length
    });

    generatedDays += 1;
    cursor.setDate(cursor.getDate() + 1);
  }

  return days.filter((day) => day.slots.length > 0);
}

function rotateSlots(slots: string[], offset: number) {
  if (!slots.length) {
    return [];
  }

  return slots.map((_, index) => slots[(index + offset) % slots.length]);
}

function formatDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatDateCardLabel(date: Date) {
  return {
    dayName: new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date),
    dayNumber: new Intl.DateTimeFormat("en-US", { day: "2-digit" }).format(date),
    monthName: new Intl.DateTimeFormat("en-US", { month: "short" }).format(date)
  };
}

function formatReadableDate(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  }).format(date);
}
