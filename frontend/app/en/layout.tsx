import type { Metadata } from "next";
import "../globals.css";
import Navigation from "@/components/navigation";
import Footer from "@/components/footer";
import HeroUIProviders from "@/components/heroui-provider";

export const metadata: Metadata = {
  title: "Prevoz Kop | Concrete supply and earthworks in Serbia",
  description:
    "Concrete production and delivery, excavation, grading, demolition and transport of bulk materials across southern Serbia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
