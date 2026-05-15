import type { Metadata } from "next";
import Script from "next/script";
import { Barlow_Condensed, DM_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import HeroUIProviders from "@/components/heroui-provider";
import { company } from "@/content/site";
import { SITE_URL } from "@/lib/seo";

const barlowCondensed = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Prevozkop Nis | Beton za Nis i okolinu, behaton za Srbiju",
    template: "%s | Prevozkop",
  },
  description:
    "Prevozkop iz Nisa: isporuka gotovog betona za Nis i okolinu, behaton za Srbiju, beton pumpe i zemljani radovi.",
  applicationName: "Prevozkop",
  keywords: [
    "porucivanje betona",
    "poruci beton",
    "beton dostava",
    "dostava betona",
    "isporuka betona na gradiliste",
    "dostava betona na gradiliste",
    "gotov beton",
    "beton nis",
    "isporuka betona nis",
    "behaton nis",
    "beton pumpa",
    "visoka pumpa za beton",
    "visinske pumpe za beton",
    "zemljani radovi",
    "zemljani radovi nis",
    "iskopi temelja",
    "priprema gradilista",
  ],
  icons: {
    icon: [{ url: "/img/logos/favicon.png", type: "image/png" }],
    shortcut: "/img/logos/favicon.png",
    apple: "/img/logos/apple-touch-icon-57x57.png",
  },
  alternates: {
    canonical: "/",
    languages: {
      "sr-Latn-RS": "/",
      "en-US": "/en",
      "x-default": "/",
    },
  },
  openGraph: {
    type: "website",
    locale: "sr_RS",
    url: "/",
    siteName: "Prevozkop",
    title: "Prevozkop Nis | Beton za Nis i okolinu, behaton za Srbiju",
    description:
      "Beton i logistika gradilista: isporuka gotovog betona, behaton, pumpe za beton i zemljani radovi iz Nisa za jug i centralnu Srbiju.",
    images: [{ url: "/img/napolje1.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prevozkop Nis | Beton za Nis i okolinu, behaton za Srbiju",
    description: "Isporuka betona za Nis i okolinu, behaton za Srbiju i beton pumpe.",
    images: ["/img/napolje1.webp"],
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
    <html lang="sr-Latn-RS" className={`${barlowCondensed.variable} ${dmSans.variable}`}>
      <body>
        <Script id="prevozkop-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ConstructionCompany",
            "@id": `${SITE_URL}#organization`,
            name: "Prevozkop",
            alternateName: company.name,
            url: SITE_URL,
            logo: `${SITE_URL}/img/logos/logo.png`,
            telephone: "+381605887471",
            email: company.email,
            address: {
              "@type": "PostalAddress",
              streetAddress: company.address,
              addressLocality: "Nis",
              postalCode: "18000",
              addressCountry: "RS",
            },
            areaServed: [
              { "@type": "City", name: "Nis" },
              { "@type": "City", name: "Leskovac" },
              { "@type": "City", name: "Prokuplje" },
              { "@type": "City", name: "Aleksinac" },
              "Juzna i centralna Srbija",
            ],
            description:
              "Prevozkop je gradjevinska podrska iz Nisa specijalizovana za isporuku gotovog betona za Nis i okolinu, behaton za Srbiju, visoke pumpe za beton i zemljane radove.",
            knowsAbout: [
              "isporuka betona",
              "behaton",
              "gotov beton",
              "beton pumpa",
              "visinske pumpe za beton",
              "zemljani radovi",
              "iskopi temelja",
              "priprema gradilista",
            ],
            makesOffer: [
              {
                "@type": "Offer",
                itemOffered: { "@type": "Service", name: "Isporuka gotovog betona" },
              },
              { "@type": "Offer", itemOffered: { "@type": "Service", name: "Visoke pumpe za beton" } },
              {
                "@type": "Offer",
                itemOffered: { "@type": "Service", name: "Zemljani radovi i priprema gradilista" },
              },
            ],
          })}
        </Script>
        <Script id="prevozkop-website-jsonld" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "@id": `${SITE_URL}#website`,
            url: SITE_URL,
            name: "Prevozkop",
            alternateName: ["Prevoz Kop", "Prevozkop Nis"],
            inLanguage: "sr-Latn-RS",
            publisher: {
              "@id": `${SITE_URL}#organization`,
            },
          })}
        </Script>

        {googleAdsId && (
          <>
            <Script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${googleAdsId}`}
              strategy="lazyOnload"
            />
            <Script id="google-ads-gtag" strategy="lazyOnload">
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
        <Analytics />
      </body>
    </html>
  );
}
