import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grant Writing Demo",
  description: "Next.js frontend with FastAPI backend",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
