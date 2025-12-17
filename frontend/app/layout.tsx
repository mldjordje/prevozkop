import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
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
  keywords: [
    "beton",
    "beton niš",
    "poručivanje betona",
    "beton pumpa",
    "nasipanje betona",
    "zemljani radovi",
    "tamponiranje",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sr" className={inter.variable}>
      <body className="bg-light text-dark antialiased">
        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=AW-17801652604"
          strategy="afterInteractive"
        />
        <Script id="google-ads-gtag" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'AW-17801652604');
          `}
        </Script>
        <HeroUIProviders>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </HeroUIProviders>
      </body>
    </html>
  );
}
