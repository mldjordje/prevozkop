import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import HeroUIProviders from "@/components/heroui-provider";
import { company } from "@/content/site";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs"),
  title: {
    default: "Prevozkop | Isporuka betona, visinske pumpe i zemljani radovi | Niš",
    template: "%s | Prevozkop",
  },
  description:
    "Prevozkop (Prevoz Kop) je građevinska podrška iz Niša, specijalizovana za isporuku gotovog betona, visoke pumpe za beton i zemljane radove (iskopi, ravnanje terena, priprema gradilišta) na području juga i centralne Srbije.",
  applicationName: "Prevozkop",
  keywords: [
    "poručivanje betona",
    "poruci beton",
    "beton dostava",
    "dostava betona",
    "isporuka betona na gradilište",
    "dostava betona na gradilište",
    "gotov beton",
    "beton Niš",
    "isporuka betona Niš",
    "beton pumpa",
    "visoka pumpa za beton",
    "visinske pumpe za beton",
    "zemljani radovi",
    "zemljani radovi Niš",
    "iskopi temelja",
    "priprema gradilišta",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: "/",
    siteName: "Prevozkop",
    title: "Prevozkop | Isporuka betona, visinske pumpe i zemljani radovi | Niš",
    description:
      "Beton i logistika gradilišta: isporuka gotovog betona, visoke pumpe za beton i zemljani radovi iz Niša. Servisna zona: Niš, Leskovac, Prokuplje, Aleksinac i jug/centralna Srbija.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const googleAdsId = process.env.NEXT_PUBLIC_GADS_ID || "AW-17801652604";

  return (
    <html lang="sr-Latn-RS" className={inter.variable}>
      <body className="bg-light text-dark antialiased">
        <Script id="prevozkop-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ConstructionCompany",
            name: "Prevozkop",
            alternateName: company.name,
            url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://prevozkop.rs",
            telephone: "+381605887471",
            email: company.email,
            address: {
              "@type": "PostalAddress",
              streetAddress: company.address,
              addressLocality: "Niš",
              postalCode: "18000",
              addressCountry: "RS",
            },
            areaServed: [
              { "@type": "City", name: "Niš" },
              { "@type": "City", name: "Leskovac" },
              { "@type": "City", name: "Prokuplje" },
              { "@type": "City", name: "Aleksinac" },
              "Južna i centralna Srbija",
            ],
            description:
              "Prevozkop je građevinska podrška iz Niša specijalizovana za isporuku gotovog betona, visoke pumpe za beton i zemljane radove za stambenu i poslovnu gradnju.",
            knowsAbout: [
              "isporuka betona",
              "gotov beton",
              "beton pumpa",
              "visinske pumpe za beton",
              "zemljani radovi",
              "iskopi temelja",
              "priprema gradilišta",
            ],
            makesOffer: [
              {
                "@type": "Offer",
                itemOffered: { "@type": "Service", name: "Isporuka gotovog betona" },
              },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Visoke pumpe za beton" } },
              {
                "@type": "Offer",
                itemOffered: { "@type": "Service", name: "Zemljani radovi i priprema gradilišta" },
              },
            ],
          })}
        </Script>

        {googleAdsId && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
              strategy="afterInteractive"
            />
            <Script id="google-ads-gtag" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${googleAdsId}');
              `}
            </Script>
          </>
        )}

        <HeroUIProviders>
          <Navigation />
          <main>{children}</main>
          <Footer />
        </HeroUIProviders>
      </body>
    </html>
  );
}
