import type { Metadata } from "next";
// 1. Import Poppins dari Google Fonts
import { Poppins } from "next/font/google";
import "./globals.css";
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// 2. Setup Poppins (Kita ambil berat 400, 600, 700)
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-poppins', // Ini nama variable untuk Tailwind nanti
  display: 'swap',
});

export const metadata: Metadata = {
  title: "FNDigital - Tech & Gadget Review",
  description: "Portal berita teknologi paling padu di Malaysia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      {/* 3. Pasang variable font pada body supaya satu website guna Poppins */}
      <body className={`${poppins.variable} font-sans antialiased bg-gray-50 text-gray-900`}>
        <Navbar />
        <main className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}