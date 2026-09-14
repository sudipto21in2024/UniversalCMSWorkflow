import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ZARVIS - Crypto & Financial Asset Dashboard",
  description: "Next.js responsive Glassmorphism dashboard generated from Figma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-app font-sans antialiased text-content-primary transition-colors duration-200">
        {children}
      </body>
    </html>
  );
}
