import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Habora | Your life, in one place",
  description: "A calmer way to manage the things you own, pay for, and maintain.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
