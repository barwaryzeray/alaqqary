import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Duhok Real Estate - Find Your Dream Property",
  description: "Modern real estate platform for Duhok Governorate, Iraq. Browse properties on an interactive map.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
