"use client";

import { useEffect, useMemo, useState } from "react";
import type { AvailabilityDay, BookingPayload, Therapist, ValidationErrors } from "@/lib/types";
import { validateBookingPayload } from "@/lib/validation";

const DEFAULT_DATE_BATCH = 8;
const DEFAULT_TIME_BATCH = 6;

type Props = {
  therapist: Therapist;
};

const emptyForm: Omit<BookingPayload, "therapistId" | "bookingDate" | "bookingTime"> = {
  clientName: "",
  clientEmail: "",
  clientPhone: "",
  contactMethod: "",
  clientNotes: "",
  consent: false
};

export function BookingPage({ therapist }: Props) {
  const [availabilityDays, setAvailabilityDays] = useState<AvailabilityDay[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [visibleDateStart, setVisibleDateStart] = useState(0);
  const [visibleTimeCount, setVisibleTimeCount] = useState(DEFAULT_TIME_BATCH);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [formValues, setFormValues] = useState(emptyForm);

  useEffect(() => {
    let cancelled = false;

    async function loadAvailability() {
      setIsLoadingAvailability(true);
      setStatusMessage("");

      try {
        const response = await fetch(`/api/availability?therapistId=${therapist.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Could not load availability.");
        }

        if (!cancelled) {
          setAvailabilityDays(data.availabilityDays);
        }
      } catch (error) {
        if (!cancelled) {
          setStatusMessage(error instanceof Error ? error.message : "Could not load availability.");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingAvailability(false);
        }
      }
    }

    void loadAvailability();
    return () => {
      cancelled = true;
    };
  }, [therapist.id]);

  const visibleDates = useMemo(
    () => availabilityDays.slice(visibleDateStart, visibleDateStart + DEFAULT_DATE_BATCH),
    [availabilityDays, visibleDateStart]
  );

  const selectedDay = availabilityDays.find((day) => day.dateKey === selectedDate) ?? null;
  const visibleSlots = selectedDay?.slots.slice(0, visibleTimeCount) ?? [];
  const detailsEnabled = Boolean(selectedDate && selectedTime);

  function handleSelectDate(dateKey: string) {
    setSelectedDate(dateKey);
    setSelectedTime("");
    setVisibleTimeCount(DEFAULT_TIME_BATCH);
    setConfirmation("");
    setErrors((current) => ({ ...current, bookingDate: undefined, bookingTime: undefined }));
  }

  function handleSelectTime(time: string) {
    setSelectedTime(time);
    setConfirmation("");
    setErrors((current) => ({ ...current, bookingTime: undefined }));
  }

  function updateFormValue<K extends keyof typeof formValues>(key: K, value: (typeof formValues)[K]) {
    setFormValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setConfirmation("");

    const payload: BookingPayload = {
      therapistId: therapist.id,
      bookingDate: selectedDate,
      bookingTime: selectedTime,
      ...formValues
    };

    const nextErrors = validateBookingPayload(payload);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      setStatusMessage("Please complete the required fields before confirming the consultation request.");
      return;
    }

    setStatusMessage("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.errors) {
          setErrors(data.errors as ValidationErrors);
        }
        throw new Error(data.message || "Could not save the booking.");
      }

      setFormValues(emptyForm);
      setSelectedDate("");
      setSelectedTime("");
      setVisibleDateStart(0);
      setVisibleTimeCount(DEFAULT_TIME_BATCH);
      setStatusMessage("");
      setConfirmation(
        `${payload.clientName} is set for ${selectedDay?.fullLabel || payload.bookingDate} at ${payload.bookingTime} with ${therapist.name}.`
      );

      const availabilityResponse = await fetch(`/api/availability?therapistId=${therapist.id}`);
      const availabilityData = await availabilityResponse.json();
      if (availabilityResponse.ok) {
        setAvailabilityDays(availabilityData.availabilityDays);
      }
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : "Could not save the booking.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const pageCountLabel = visibleDates.length
    ? `Showing ${visibleDates[0].fullLabel} to ${visibleDates[visibleDates.length - 1].fullLabel}.`
    : "No dates available right now.";

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <img className="brand-mark" src="/logo.png" alt="Footprints logo" />
          <div>
            <p className="title" style={{ fontSize: "1.1rem" }}>Footprints to Feel Better</p>
            <p className="muted" style={{ margin: "4px 0 0" }}>Consultation Booking</p>
          </div>
        </div>
        <a className="secondary-button" href="/">Back to therapists</a>
      </header>

      <main className="shell">
        <section className="hero-grid">
          <div className="hero card">
            <span className="hero-chip">Personalized Consultation</span>
            <h1>Choose a time that feels manageable, calm, and right for you.</h1>
            <p>Start with therapist availability, pick a session time, then complete the booking details in one clean flow.</p>

            <div className="steps">
              <div className="step">
                <p className="eyebrow" style={{ color: "rgba(255,255,255,0.75)" }}>Step 1</p>
                <strong>Select a date</strong>
                <p>Browse upcoming availability without leaving the page.</p>
              </div>
              <div className="step">
                <p className="eyebrow" style={{ color: "rgba(255,255,255,0.75)" }}>Step 2</p>
                <strong>Choose a time</strong>
                <p>Each time slot updates the booking summary instantly.</p>
              </div>
              <div className="step">
                <p className="eyebrow" style={{ color: "rgba(255,255,255,0.75)" }}>Step 3</p>
                <strong>Finish details</strong>
                <p>The form submits to the server and stores the request centrally.</p>
              </div>
            </div>
          </div>

          <aside className="aside card">
            <div className="therapist-row">
              <img className="therapist-avatar" src={therapist.image} alt={therapist.name} />
              <div>
                <p className="eyebrow">Selected therapist</p>
                <h2 className="title" style={{ marginTop: "8px", fontSize: "2rem", color: "var(--primary)" }}>{therapist.name}</h2>
                <p className="muted" style={{ marginTop: "6px" }}>
                  {therapist.title} | {therapist.location} | {therapist.languages.join(", ")}
                </p>
              </div>
            </div>

            <div className="mini-grid" style={{ marginTop: "20px" }}>
              <div className="mini-card">
                <p className="eyebrow">Session rate</p>
                <div className="title" style={{ marginTop: "10px", fontSize: "1.8rem" }}>
                  {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                    therapist.price
                  )}
                </div>
              </div>
              <div className="mini-card">
                <p className="eyebrow">Availability</p>
                <div className="title" style={{ marginTop: "10px", fontSize: "1.8rem" }}>{therapist.availability}</div>
              </div>
            </div>

            <div className="summary-card" style={{ marginTop: "20px" }}>
              <p className="eyebrow">Booking summary</p>
              <div style={{ marginTop: "16px", display: "grid", gap: "12px" }}>
                <div className="summary-row">
                  <span>Date</span>
                  <span>{selectedDay?.fullLabel || "Choose a date"}</span>
                </div>
                <div className="summary-row">
                  <span>Time</span>
                  <span>{selectedTime || "Choose a time"}</span>
                </div>
                <div className="summary-row">
                  <span>Format</span>
                  <span>Video consultation</span>
                </div>
              </div>
            </div>

            <div className="helper-card" style={{ marginTop: "20px" }}>
              <strong>What happens next?</strong>
              <p style={{ margin: "8px 0 0" }}>
                After the client submits, the request is saved centrally and the slot disappears from availability.
              </p>
            </div>
          </aside>
        </section>

        <section className="content-grid">
          <div className="panel">
            <p className="eyebrow">Availability</p>
            <h2 style={{ marginTop: "10px", fontSize: "2.2rem", color: "var(--primary)" }}>Pick an appointment window</h2>
            <p className="muted" style={{ maxWidth: "720px" }}>
              This schedule is generated server-side, filtered against existing reservations, and ready to be backed by Postgres in production.
            </p>

            <div className="toolbar">
              <div>
                <strong>Available dates</strong>
                <p className="muted" style={{ margin: "6px 0 0" }}>{pageCountLabel}</p>
              </div>
              <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={visibleDateStart === 0}
                  onClick={() => setVisibleDateStart((current) => Math.max(0, current - DEFAULT_DATE_BATCH))}
                >
                  Earlier dates
                </button>
                <button
                  className="secondary-button"
                  type="button"
                  disabled={visibleDateStart + DEFAULT_DATE_BATCH >= availabilityDays.length}
                  onClick={() =>
                    setVisibleDateStart((current) =>
                      Math.min(Math.max(0, availabilityDays.length - DEFAULT_DATE_BATCH), current + DEFAULT_DATE_BATCH)
                    )
                  }
                >
                  Later dates
                </button>
              </div>
            </div>

            {isLoadingAvailability ? (
              <div className="empty-state" style={{ marginTop: "16px" }}>Loading availability...</div>
            ) : (
              <>
                <div className="date-grid" style={{ marginTop: "16px" }}>
                  {visibleDates.map((day) => {
                    const isSelected = selectedDate === day.dateKey;
                    return (
                      <button
                        key={day.dateKey}
                        type="button"
                        className={`date-button${isSelected ? " selected" : ""}`}
                        onClick={() => handleSelectDate(day.dateKey)}
                      >
                        <div className="eyebrow" style={{ color: isSelected ? "rgba(255,255,255,0.82)" : "var(--accent)" }}>
                          {day.label.dayName}
                        </div>
                        <div className="day-number">{day.label.dayNumber}</div>
                        <div className="muted" style={{ color: isSelected ? "rgba(255,255,255,0.82)" : "var(--muted)" }}>
                          {day.label.monthName}
                        </div>
                        <span className="pill">{day.slots.length} open</span>
                      </button>
                    );
                  })}
                </div>

                <div style={{ marginTop: "28px" }}>
                  <div className="summary-row">
                    <strong>Time slots</strong>
                    <span className="muted">
                      {selectedDay ? `${selectedDay.slots.length} available time slots on ${selectedDay.fullLabel}.` : "Select a date first."}
                    </span>
                  </div>

                  {!selectedDay ? (
                    <div className="empty-state" style={{ marginTop: "16px" }}>
                      Available consultation times will appear here after you choose a date.
                    </div>
                  ) : (
                    <>
                      <div className="time-grid" style={{ marginTop: "16px" }}>
                        {visibleSlots.map((slot) => (
                          <button
                            key={slot}
                            type="button"
                            className={`time-button${selectedTime === slot ? " selected" : ""}`}
                            onClick={() => handleSelectTime(slot)}
                          >
                            <div className="slot-time">{slot}</div>
                            <div className="muted" style={{ marginTop: "6px" }}>50-minute video consultation</div>
                          </button>
                        ))}
                      </div>

                      {selectedDay.slots.length > visibleTimeCount ? (
                        <div style={{ marginTop: "16px" }}>
                          <button
                            className="secondary-button"
                            type="button"
                            onClick={() => setVisibleTimeCount((current) => Math.min(selectedDay.slots.length, current + DEFAULT_TIME_BATCH))}
                          >
                            Show more times
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className={`panel${detailsEnabled ? "" : " details-locked"}`}>
            <p className="eyebrow">Remaining process</p>
            <h2 style={{ marginTop: "10px", fontSize: "2.2rem", color: "var(--primary)" }}>Client details</h2>
            <p className="muted">
              {detailsEnabled
                ? `You selected ${selectedDay?.fullLabel} at ${selectedTime}. Complete the client details to finish the booking request.`
                : "Select a time first to unlock the rest of the consultation booking flow."}
            </p>

            <form style={{ marginTop: "24px" }} onSubmit={handleSubmit}>
              {statusMessage ? <div className="status">{statusMessage}</div> : null}

              <div className="form-grid">
                <label className="field">
                  <span>Full name</span>
                  <input
                    className="text-input"
                    disabled={!detailsEnabled || isSubmitting}
                    value={formValues.clientName}
                    onChange={(event) => updateFormValue("clientName", event.target.value)}
                    placeholder="Your full name"
                  />
                  {errors.clientName ? <span className="field-error">{errors.clientName}</span> : null}
                </label>

                <label className="field">
                  <span>Email address</span>
                  <input
                    className="text-input"
                    disabled={!detailsEnabled || isSubmitting}
                    value={formValues.clientEmail}
                    onChange={(event) => updateFormValue("clientEmail", event.target.value)}
                    placeholder="name@example.com"
                    type="email"
                  />
                  {errors.clientEmail ? <span className="field-error">{errors.clientEmail}</span> : null}
                </label>

                <label className="field">
                  <span>Phone number</span>
                  <input
                    className="text-input"
                    disabled={!detailsEnabled || isSubmitting}
                    value={formValues.clientPhone}
                    onChange={(event) => updateFormValue("clientPhone", event.target.value)}
                    placeholder="(555) 123-4567"
                  />
                  {errors.clientPhone ? <span className="field-error">{errors.clientPhone}</span> : null}
                </label>

                <label className="field">
                  <span>Preferred contact</span>
                  <select
                    className="select-input"
                    disabled={!detailsEnabled || isSubmitting}
                    value={formValues.contactMethod}
                    onChange={(event) => updateFormValue("contactMethod", event.target.value)}
                  >
                    <option value="">Select one</option>
                    <option value="Email">Email</option>
                    <option value="Phone">Phone</option>
                    <option value="Text message">Text message</option>
                  </select>
                  {errors.contactMethod ? <span className="field-error">{errors.contactMethod}</span> : null}
                </label>

                <label className="field-full">
                  <span>What would you like support with?</span>
                  <textarea
                    className="text-area"
                    disabled={!detailsEnabled || isSubmitting}
                    value={formValues.clientNotes}
                    onChange={(event) => updateFormValue("clientNotes", event.target.value)}
                    placeholder="Share a short note so the team can prepare for your consultation."
                  />
                  {errors.clientNotes ? <span className="field-error">{errors.clientNotes}</span> : null}
                </label>

                <label className="field-full checkbox-row">
                  <input
                    checked={formValues.consent}
                    disabled={!detailsEnabled || isSubmitting}
                    onChange={(event) => updateFormValue("consent", event.target.checked)}
                    type="checkbox"
                  />
                  <span>I agree to be contacted by the Footprints team regarding this consultation request.</span>
                </label>
              </div>

              {errors.consent ? <div className="field-error" style={{ marginTop: "8px" }}>{errors.consent}</div> : null}

              <button
                className="primary-button"
                type="submit"
                disabled={!detailsEnabled || isSubmitting}
                style={{ width: "100%", marginTop: "20px" }}
              >
                {isSubmitting ? "Saving consultation request..." : "Confirm consultation request"}
              </button>
            </form>

            {confirmation ? (
              <div className="confirmation">
                <p className="eyebrow" style={{ color: "var(--success-text)" }}>Request received</p>
                <h3 className="title" style={{ marginTop: "8px", fontSize: "1.8rem" }}>Consultation reserved</h3>
                <p style={{ marginBottom: 0 }}>{confirmation}</p>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}
