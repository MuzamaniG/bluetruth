import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="water-bg min-h-[calc(100vh-3.5rem)] px-6 py-16">
      <div className="mx-auto max-w-2xl">
        <div className="animate-in">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            About TapCheck
          </h1>
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            TapCheck helps you understand the safety of your tap water using
            publicly available EPA data. Enter your city and state to get a clear
            safety rating.
          </p>
        </div>

        <div className="mt-12 space-y-10">
          {/* Methodology */}
          <section className="animate-in" style={{ animationDelay: "100ms" }}>
            <h2 className="text-lg font-bold text-slate-900">
              How it works
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-slate-600">
              <p>
                TapCheck queries the EPA&apos;s Safe Drinking Water Information
                System (SDWIS) through the Envirofacts REST API. We look up
                public water systems that serve your city and check their
                violation history.
              </p>
              <p>Based on what we find, we assign a safety status:</p>
            </div>

            <div className="mt-5 space-y-3">
              {[
                {
                  color: "bg-emerald-500",
                  label: "Green — Safe",
                  desc: "No violations found in the recent window (past 5 years).",
                },
                {
                  color: "bg-amber-500",
                  label: "Yellow — Caution",
                  desc: "Only non-health-based violations, or older (>5 year) health violations on record.",
                },
                {
                  color: "bg-red-500",
                  label: "Red — Health Risk",
                  desc: "Recent health-based violations or enforcement actions within the past 5 years.",
                },
                {
                  color: "bg-slate-400",
                  label: "Gray — Unknown",
                  desc: "Could not find a matching water system in EPA records for this location.",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start gap-3 rounded-lg border border-slate-100 bg-white p-4"
                >
                  <span
                    className={`mt-1 h-3 w-3 shrink-0 rounded-full ${item.color}`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {item.label}
                    </p>
                    <p className="mt-0.5 text-sm text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Data sources */}
          <section className="animate-in" style={{ animationDelay: "200ms" }}>
            <h2 className="text-lg font-bold text-slate-900">
              Data sources
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-500" />
                <span>
                  <strong className="text-slate-800">EPA SDWIS</strong> — Safe
                  Drinking Water Information System, accessed via the
                  Envirofacts REST API
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-cyan-500" />
                <span>
                  <strong className="text-slate-800">Nominatim</strong> —
                  OpenStreetMap reverse geocoding for location detection
                </span>
              </li>
            </ul>
          </section>

          {/* Disclaimers */}
          <section className="animate-in" style={{ animationDelay: "300ms" }}>
            <h2 className="text-lg font-bold text-slate-900">
              Disclaimers
            </h2>
            <div className="mt-4 space-y-3 rounded-xl border border-amber-100 bg-amber-50/50 p-5 text-sm leading-relaxed text-slate-600">
              <p>
                <strong className="text-slate-800">
                  Not a substitute for professional testing.
                </strong>{" "}
                TapCheck provides a general overview based on publicly available
                regulatory data. It does not test your actual water.
              </p>
              <p>
                <strong className="text-slate-800">
                  Data may be incomplete or delayed.
                </strong>{" "}
                EPA records may not reflect the most recent violations or
                corrective actions. Small or private water systems may not appear
                in EPA data.
              </p>
              <p>
                <strong className="text-slate-800">
                  Individual exposure varies.
                </strong>{" "}
                Your actual water quality depends on many factors including your
                home&apos;s plumbing, the age of pipes, and your specific
                location within a water system&apos;s service area.
              </p>
              <p>
                <strong className="text-slate-800">
                  When in doubt, get tested.
                </strong>{" "}
                Contact your local water utility or state drinking water agency
                for the most accurate and up-to-date information. You can also
                call the EPA Safe Drinking Water Hotline at 1-800-426-4791.
              </p>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center animate-in" style={{ animationDelay: "400ms" }}>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:shadow-lg hover:brightness-110"
          >
            Check your water
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
}
