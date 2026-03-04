import LocationInput from "@/components/LocationInput";

export default function Home() {
  return (
    <div className="water-bg flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-6 py-20">
      <div className="animate-in mx-auto max-w-lg text-center">
        {/* Hero */}
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-500" />
          <span className="text-xs font-medium text-cyan-700">
            EPA SDWIS Data
          </span>
        </div>

        <h1 className="mt-4 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          Is your tap water{" "}
          <span className="bg-gradient-to-r from-cyan-600 to-teal-600 bg-clip-text text-transparent">
            safe to drink?
          </span>
        </h1>

        <p className="mt-4 text-base leading-relaxed text-slate-500 sm:text-lg">
          Enter your city or share your location. We&apos;ll check EPA violation
          records and give you a clear safety rating.
        </p>
      </div>

      {/* Input */}
      <div className="mt-10 w-full max-w-lg animate-in" style={{ animationDelay: "150ms" }}>
        <LocationInput />
      </div>

      {/* Trust signals */}
      <div
        className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 animate-in"
        style={{ animationDelay: "300ms" }}
      >
        {[
          "Free & open source",
          "No sign-up required",
          "EPA verified data",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-xs text-slate-400">
            <svg className="h-3.5 w-3.5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}
