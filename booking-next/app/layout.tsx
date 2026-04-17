import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Footprints Booking",
  description: "Database-backed consultation booking for Footprints to Feel Better."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
