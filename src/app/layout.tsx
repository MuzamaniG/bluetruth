import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TapCheck — Is Your Tap Water Safe?",
  description:
    "Check the safety of your tap water using EPA violation data. Get a clear Green, Yellow, or Red safety rating for your city's water system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* Navigation */}
        <nav className="sticky top-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
          <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-teal-500 text-xs font-black text-white">
                TC
              </span>
              TapCheck
            </Link>
            <div className="flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                Check
              </Link>
              <Link
                href="/about"
                className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
              >
                About
              </Link>
            </div>
          </div>
        </nav>

        {/* Main content */}
        <main className="min-h-[calc(100vh-3.5rem)]">{children}</main>

        {/* Footer */}
        <footer className="border-t border-slate-100 bg-white">
          <div className="mx-auto max-w-4xl px-6 py-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <p className="text-xs text-slate-400">
                TapCheck uses EPA SDWIS data. Not a substitute for professional
                water testing.
              </p>
              <p className="text-xs text-slate-400">
                Built for{" "}
                <span className="font-medium text-slate-500">
                  public health awareness
                </span>
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
