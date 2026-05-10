import type { Metadata } from "next";
import { Rubik } from "next/font/google";
import "./globals.css";

const rubik = Rubik({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-rubik",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sanaq — Train your brain, one grid at a time",
  description: "A next-generation Sudoku app with AI coaching, Wrong Notes mode, and daily challenges.",
  openGraph: {
    title: "Sanaq Sudoku",
    description: "Train your brain, one grid at a time",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={rubik.variable}>
      <body className={`min-h-screen bg-app-bg ${rubik.className}`}>{children}</body>
    </html>
  );
}
