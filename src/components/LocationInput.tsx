"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

export default function LocationInput() {
  const router = useRouter();
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGeolocate() {
    setDetecting(true);
    setError(null);

    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await fetch("/api/geocode", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            }),
          });
          const data = await res.json();
          if (data.city && data.state) {
            router.push(
              `/result?city=${encodeURIComponent(data.city)}&state=${encodeURIComponent(data.state)}`
            );
          } else {
            setError("Could not determine your city. Please enter it manually.");
            setDetecting(false);
          }
        } catch {
          setError("Failed to detect location. Please enter it manually.");
          setDetecting(false);
        }
      },
      () => {
        setError("Location access denied. Please enter your city manually.");
        setDetecting(false);
      }
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!city.trim() || !state) return;
    router.push(
      `/result?city=${encodeURIComponent(city.trim())}&state=${encodeURIComponent(state)}`
    );
  }

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Geolocation button */}
      <button
        onClick={handleGeolocate}
        disabled={detecting}
        className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-4 text-base font-semibold text-white shadow-lg shadow-cyan-200/50 transition-all hover:shadow-xl hover:shadow-cyan-200/60 hover:brightness-110 active:scale-[0.98] disabled:opacity-60 disabled:cursor-wait"
      >
        {detecting ? (
          <>
            <svg
              className="h-5 w-5 animate-spin"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Detecting your location...
          </>
        ) : (
          <>
            <svg
              className="h-5 w-5 transition-transform group-hover:scale-110"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            Use my location
          </>
        )}
      </button>

      {/* Divider */}
      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="text-xs font-medium tracking-widest text-slate-400 uppercase">
          or enter manually
        </span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>

      {/* Manual form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="city"
            className="block text-sm font-medium text-slate-600 mb-1.5"
          >
            City
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Flint"
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 placeholder:text-slate-300 shadow-sm transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 focus:outline-none"
          />
        </div>
        <div>
          <label
            htmlFor="state"
            className="block text-sm font-medium text-slate-600 mb-1.5"
          >
            State
          </label>
          <select
            id="state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 shadow-sm transition-all focus:border-cyan-400 focus:ring-2 focus:ring-cyan-100 focus:outline-none appearance-none"
          >
            <option value="">Select a state</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!city.trim() || !state}
          className="w-full rounded-xl bg-slate-900 px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-slate-800 active:scale-[0.98] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Check my water
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
    </div>
  );
}
