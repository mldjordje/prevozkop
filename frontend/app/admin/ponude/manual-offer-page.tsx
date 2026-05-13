'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Input, Select, SelectItem, Textarea } from "@heroui/react";
import {
  ApiError,
  adminCreateManualOffer,
  adminListProjects,
  adminOfferPdfUrl,
  adminOfferPrintUrl,
} from "@/lib/admin-client";
import type { OrderOffer } from "@/lib/api";

export default function ManualOfferPage() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [subject, setSubject] = useState("Rucna komercijalna ponuda");
  const [serviceType, setServiceType] = useState("beton");
  const [city, setCity] = useState("");
  const [description, setDescription] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("m3");
  const [unitPrice, setUnitPrice] = useState("");
  const [taxRate, setTaxRate] = useState("20");
  const [validUntil, setValidUntil] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Po dogovoru");
  const [deliveryTerms, setDeliveryTerms] = useState("Po dogovoru");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOffer, setCreatedOffer] = useState<OrderOffer | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        await adminListProjects();
        if (!cancelled) setIsCheckingAuth(false);
      } catch (error) {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          window.location.href = "/admin";
          return;
        }
        setMessage("Neuspesna provera admin sesije.");
        setIsCheckingAuth(false);
      }
    }

    void checkAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const total =
    (Number(quantity.replace(",", ".")) || 0) *
    (Number(unitPrice.replace(",", ".")) || 0) *
    (1 + ((Number(taxRate.replace(",", ".")) || 0) / 100));

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setCreatedOffer(null);

    const parsedQuantity = Number(quantity.replace(",", "."));
    const parsedUnitPrice = Number(unitPrice.replace(",", "."));
    const parsedTaxRate = Number(taxRate.replace(",", "."));

    if (!customerName.trim() || !description.trim() || !parsedQuantity || !parsedUnitPrice) {
      setMessage("Unesite kupca, opis stavke, kolicinu i cenu.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await adminCreateManualOffer({
        customer: {
          name: customerName.trim(),
          email: customerEmail.trim() || "ponuda@prevozkop.rs",
          phone: customerPhone.trim() || null,
        },
        order: {
          subject: subject.trim() || "Rucna komercijalna ponuda",
          service_type: serviceType as "beton" | "behaton" | "other",
          city_slug: city.trim() || null,
          message: note.trim() || "Ponuda kreirana rucno u admin panelu.",
        },
        offer: {
          items: [
            {
              description: description.trim(),
              quantity: parsedQuantity,
              unit: unit.trim() || "kom",
              unit_price: parsedUnitPrice,
            },
          ],
          tax_rate: Number.isFinite(parsedTaxRate) ? parsedTaxRate : 0,
          valid_until: validUntil || null,
          payment_terms: paymentTerms.trim() || null,
          delivery_terms: deliveryTerms.trim() || null,
          note: note.trim() || null,
        },
      });
      setCreatedOffer(res.offer);
      setMessage("Ponuda je kreirana.");
    } catch {
      setMessage("Greska pri kreiranju rucne ponude.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="content-section py-6">
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-dark shadow-sm">
          Provera admin pristupa...
        </div>
      </div>
    );
  }

  return (
    <div className="content-section py-6 space-y-6">
      <Link href="/admin" className="text-sm font-semibold text-primary">
        Nazad na admin meni
      </Link>

      <div className="rounded-2xl border border-black/5 bg-white px-5 py-6 shadow-sm sm:px-7">
        <p className="text-sm uppercase tracking-[0.2em] text-primary">Admin</p>
        <h1 className="mt-2 text-3xl font-bold text-dark">Rucna ponuda</h1>
        <p className="mt-2 text-sm leading-6 text-gray-600">
          Za kupce koji nisu poslali upit preko sajta. Kreira se interni lead i PDF ponuda.
        </p>
      </div>

      {message && (
        <div className="rounded-xl border border-black/10 bg-white p-4 text-sm text-dark shadow-sm">
          {message}
        </div>
      )}

      <form className="grid gap-5 xl:grid-cols-[1fr_360px]" onSubmit={handleSubmit}>
        <div className="space-y-5">
          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-dark">Kupac</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Input label="Ime / firma" value={customerName} onChange={(e) => setCustomerName(e.target.value)} isRequired />
              <Input label="Email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
              <Input label="Telefon" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
              <Input label="Grad / lokacija" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
          </section>

          <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-dark">Ponuda</h2>
            <div className="mt-4 grid gap-3">
              <Input label="Naslov / osnov ponude" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <Select label="Tip usluge" selectedKeys={[serviceType]} onSelectionChange={(keys) => setServiceType(Array.from(keys).at(0)?.toString() || "beton")}>
                <SelectItem key="beton">Beton</SelectItem>
                <SelectItem key="behaton">Behaton</SelectItem>
                <SelectItem key="other">Ostalo</SelectItem>
              </Select>
              <Textarea label="Opis stavke" value={description} onChange={(e) => setDescription(e.target.value)} minRows={2} isRequired />
              <div className="grid gap-3 sm:grid-cols-3">
                <Input label="Kolicina" value={quantity} onChange={(e) => setQuantity(e.target.value)} isRequired />
                <Input label="Jedinica" value={unit} onChange={(e) => setUnit(e.target.value)} />
                <Input label="Cena bez PDV-a" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} isRequired />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="PDV %" value={taxRate} onChange={(e) => setTaxRate(e.target.value)} />
                <Input label="Vazi do" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Uslovi placanja" value={paymentTerms} onChange={(e) => setPaymentTerms(e.target.value)} />
                <Input label="Uslovi isporuke" value={deliveryTerms} onChange={(e) => setDeliveryTerms(e.target.value)} />
              </div>
              <Textarea label="Napomena" value={note} onChange={(e) => setNote(e.target.value)} minRows={2} />
            </div>
          </section>
        </div>

        <aside className="h-fit rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-dark">Pregled</h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Ukupno sa PDV-om</span>
              <span className="font-semibold text-dark">
                {total.toLocaleString("sr-RS", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} RSD
              </span>
            </div>
            <Button color="primary" type="submit" isDisabled={isSubmitting} className="w-full">
              Kreiraj ponudu
            </Button>
            {createdOffer && (
              <div className="space-y-2 rounded-xl border border-black/5 bg-gray-50 p-3">
                <p className="font-semibold text-dark">{createdOffer.offer_number}</p>
                <Button as="a" href={adminOfferPrintUrl(createdOffer.id)} target="_blank" rel="noreferrer" variant="flat" className="w-full">
                  Otvori PDF prikaz
                </Button>
                <Button as="a" href={adminOfferPdfUrl(createdOffer.id)} variant="flat" className="w-full">
                  Preuzmi PDF
                </Button>
              </div>
            )}
          </div>
        </aside>
      </form>
    </div>
  );
}
