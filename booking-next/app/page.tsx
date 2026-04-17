import { getTherapists } from "@/lib/therapists";

export default async function HomePage() {
  const therapists = await getTherapists();

  return (
    <>
      <header className="topbar">
        <div className="brand">
          <img className="brand-mark" src="/logo.png" alt="Footprints logo" />
          <div>
            <p className="title" style={{ fontSize: "1.1rem" }}>Footprints to Feel Better</p>
            <p className="muted" style={{ margin: "4px 0 0" }}>Next.js booking prototype</p>
          </div>
        </div>
      </header>

      <main className="shell">
        <section className="hero card" style={{ marginTop: "24px" }}>
          <span className="hero-chip">Booking directory</span>
          <h1>Choose a therapist and open the new database-backed booking flow.</h1>
          <p>
            This Next app sits beside the current static site. Once you are happy with it, your live therapist cards can link here instead of
            `book-consultation.html`.
          </p>
        </section>

        <div className="notice">
          Therapist data is still being read from the existing `data/therapists.json` file so your current content stays the source of truth while
          we migrate.
        </div>

        <section className="directory-grid">
          {therapists.slice(0, 12).map((therapist) => (
            <article className="directory-card" key={therapist.id}>
              <img src={therapist.image} alt={therapist.name} />
              <div className="directory-copy">
                <p className="eyebrow">{therapist.availability}</p>
                <h2 className="title" style={{ fontSize: "1.7rem" }}>{therapist.name}</h2>
                <p className="muted">
                  {therapist.title} | {therapist.location}
                </p>
                <p className="muted">{therapist.summary}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", gap: "12px" }}>
                  <span>
                    {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(therapist.price)}
                  </span>
                  <a className="primary-button" href={`/book/${therapist.id}`}>
                    Book now
                  </a>
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
