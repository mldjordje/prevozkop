import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Prevoz Kop | Concrete supply and earthworks in Serbia",
  description:
    "Concrete production and delivery, excavation, grading, demolition and transport of bulk materials across southern Serbia.",
};

export default function EnLayout({ children }: { children: React.ReactNode }) {
  // Use root layout for header/footer; only provide metadata override here.
  return children;
}
