(function initFootprintsBookingConfig() {
  function readMeta(name) {
    const meta = document.querySelector(`meta[name="${name}"]`);
    return meta ? meta.content.trim() : "";
  }

  function readConfigValue(key, metaName, fallback = "") {
    const globalConfig = window.FOOTPRINTS_BOOKING_CONFIG || {};
    const value = globalConfig[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }

    const metaValue = readMeta(metaName);
    return metaValue || fallback;
  }

  function buildUrl(path) {
    return new URL(path, window.location.href);
  }

  const config = {
    bookingPageUrl: readConfigValue("bookingPageUrl", "footprints:booking-page-url", "book-consultation.html"),
    directoryPageUrl: readConfigValue("directoryPageUrl", "footprints:directory-page-url", "index.html"),
    therapistParam: readConfigValue("therapistParam", "footprints:therapist-param", "therapist"),
    bookingSubmitUrl: readConfigValue("bookingSubmitUrl", "footprints:booking-submit-url", ""),
    therapistsDataUrl: readConfigValue("therapistsDataUrl", "footprints:therapists-data-url", "data/therapists.json"),
    therapists: Array.isArray((window.FOOTPRINTS_BOOKING_CONFIG || {}).therapists)
      ? window.FOOTPRINTS_BOOKING_CONFIG.therapists
      : null
  };

  function buildBookingUrl(therapistId) {
    const bookingUrl = buildUrl(config.bookingPageUrl);
    if (therapistId) {
      bookingUrl.searchParams.set(config.therapistParam, therapistId);
    }
    return bookingUrl.toString();
  }

  function buildDirectoryUrl() {
    return buildUrl(config.directoryPageUrl).toString();
  }

  function getTherapistIdFromLocation() {
    const params = new URLSearchParams(window.location.search);
    return params.get(config.therapistParam) || "";
  }

  async function submitBooking(payload) {
    if (!config.bookingSubmitUrl) {
      return { ok: false, skipped: true };
    }

    const response = await fetch(config.bookingSubmitUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let data = null;
    try {
      data = await response.json();
    } catch (error) {
      data = null;
    }

    if (!response.ok) {
      const message = data && typeof data.message === "string"
        ? data.message
        : "The booking request could not be saved.";
      throw new Error(message);
    }

    return {
      ok: true,
      skipped: false,
      data
    };
  }

  window.FootprintsBooking = {
    config,
    buildBookingUrl,
    buildDirectoryUrl,
    getTherapistIdFromLocation,
    submitBooking
  };
}());
