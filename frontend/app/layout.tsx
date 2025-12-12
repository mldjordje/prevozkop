"use client";

import "./globals.css";
import { ReactNode } from "react";
import { Inter } from "next/font/google";
import Link from "next/link";
import clsx from "clsx";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata = {
  title: "Prevoz Kop",
  description: "Betonska baza i isporuka betona.",
};

const navItems = [
  { href: "/", label: "Pocetna" },
  { href: "/o-nama", label: "O nama" },
  { href: "/usluge", label: "Usluge" },
  { href: "/projekti", label: "Projekti" },
  { href: "/kontakt", label: "Kontakt" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="sr">
      <body className={clsx(inter.className, "min-h-screen flex flex-col")}>
        <header className="border-b border-gray-200 bg-white/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-bold text-primary">
              Prevoz Kop
            </Link>
            <nav className="flex gap-4 text-sm font-medium">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href} className="hover:text-primary">
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="flex-1">
          {children}
        </main>
        <footer className="border-t border-gray-200 bg-white">
          <div className="mx-auto max-w-6xl px-6 py-6 flex items-center justify-between text-sm text-gray-600">
            <span>&copy; {new Date().getFullYear()} Prevoz Kop</span>
            <span>Betonska baza i isporuka betona</span>
          </div>
        </footer>
      </body>
    </html>
  );
}
