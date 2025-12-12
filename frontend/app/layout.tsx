import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "@heroui/theme/styles.css";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import HeroUIProviders from "@/components/heroui-provider";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Prevoz Kop | Betonska baza i građevinske usluge",
  description:
    "Proizvodnja i isporuka betona, iskopi, tamponiranje, rušenje objekata i transport rasutih materijala u Nišu i okolini.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={inter.variable}>
      <body className="bg-light text-dark antialiased">
        <HeroUIProviders>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </HeroUIProviders>
      </body>
    </html>
  );
}
