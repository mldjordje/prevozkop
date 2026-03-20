import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import HeroUIProviders from "@/components/heroui-provider";
import { company } from "@/content/site";
import { SITE_URL } from "@/lib/seo";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Prevozkop Nis | Isporuka betona, behaton i beton pumpa",
    template: "%s | Prevozkop",
  },
  description:
    "Prevozkop iz Nisa: isporuka gotovog betona, behaton, beton pumpe i zemljani radovi. Radimo Nis, Leskovac, Prokuplje, Aleksinac i okolinu.",
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
    title: "Prevozkop Nis | Isporuka betona, behaton i beton pumpa",
    description:
      "Beton i logistika gradilista: isporuka gotovog betona, behaton, pumpe za beton i zemljani radovi iz Nisa za jug i centralnu Srbiju.",
    images: [{ url: "/img/napolje1.webp" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Prevozkop Nis | Isporuka betona, behaton i beton pumpa",
    description: "Isporuka betona, behaton, beton pumpe i zemljani radovi iz Nisa.",
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
    <html lang="sr-Latn-RS" className={inter.variable}>
      <body className="bg-light text-dark antialiased">
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
              "Prevozkop je gradjevinska podrska iz Nisa specijalizovana za isporuku gotovog betona, behaton, visoke pumpe za beton i zemljane radove za stambenu i poslovnu gradnju.",
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
