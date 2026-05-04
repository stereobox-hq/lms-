import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Payroll System",
  description: "School Payroll Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900 antialiased">
        <header className="bg-blue-800 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
            <Link href="/" className="font-bold text-xl tracking-tight hover:text-blue-200 transition">
              Payroll System
            </Link>
            <nav className="flex gap-6 text-sm font-medium">
              <Link href="/" className="hover:text-blue-200 transition">Dashboard</Link>
              <Link href="/employees" className="hover:text-blue-200 transition">Employees</Link>
              <Link href="/payroll" className="hover:text-blue-200 transition">Payroll</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <footer className="bg-white border-t text-center py-3 text-xs text-gray-400">
          School Payroll Management System &copy; {new Date().getFullYear()}
        </footer>
      </body>
    </html>
  );
}
