'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, Input, Select, SelectItem, Textarea } from "@heroui/react";
import {
  ApiError,
  adminCreateManualOffer,
  adminListOffers,
  adminListProjects,
  adminOfferPdfUrl,
  adminOfferPrintUrl,
  adminUpdateOrderOffer,
} from "@/lib/admin-client";
import type { OrderOffer } from "@/lib/api";

type OfferLineDraft = {
  description: string;
  quantity: string;
  unit: string;
  unitPrice: string;
};

type OfferEditDraft = {
  title: string;
  items: OfferLineDraft[];
  taxRate: string;
  validUntil: string;
  paymentTerms: string;
  deliveryTerms: string;
  note: string;
  status: OrderOffer["status"];
};

const offerStatusOptions: { key: OrderOffer["status"]; label: string }[] = [
  { key: "draft", label: "Priprema" },
  { key: "sent", label: "Poslata" },
  { key: "accepted", label: "Prihvacena" },
  { key: "paid", label: "Placena" },
  { key: "rejected", label: "Odbijena" },
];

export default function ManualOfferPage() {
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [offerTitle, setOfferTitle] = useState("Rucna komercijalna ponuda");
  const [subject, setSubject] = useState("Rucna komercijalna ponuda");
  const [serviceType, setServiceType] = useState("beton");
  const [city, setCity] = useState("");
  const [offerItems, setOfferItems] = useState<OfferLineDraft[]>([
    { description: "", quantity: "1", unit: "m3", unitPrice: "" },
  ]);
  const [taxRate, setTaxRate] = useState("20");
  const [validUntil, setValidUntil] = useState("");
  const [paymentTerms, setPaymentTerms] = useState("Po dogovoru");
  const [deliveryTerms, setDeliveryTerms] = useState("Po dogovoru");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOffer, setCreatedOffer] = useState<OrderOffer | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [offers, setOffers] = useState<OrderOffer[]>([]);
  const [offersLoading, setOffersLoading] = useState(false);
  const [offerEditDrafts, setOfferEditDrafts] = useState<Record<number, OfferEditDraft>>({});

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      try {
        await adminListProjects();
        if (!cancelled) {
          setIsCheckingAuth(false);
          void loadOfferHistory();
        }
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
    offerItems.reduce((sum, item) => {
      const quantity = Number(item.quantity.replace(",", ".")) || 0;
      const unitPrice = Number(item.unitPrice.replace(",", ".")) || 0;
      return sum + quantity * unitPrice;
    }, 0) *
    (1 + ((Number(taxRate.replace(",", ".")) || 0) / 100));

  function updateOfferItem(index: number, field: keyof OfferLineDraft, value: string) {
    setOfferItems((prev) => prev.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item));
  }

  function addOfferItem() {
    setOfferItems((prev) => [...prev, { description: "", quantity: "1", unit: "kom", unitPrice: "" }]);
  }

  function removeOfferItem(index: number) {
    setOfferItems((prev) => {
      const next = prev.filter((_, itemIndex) => itemIndex !== index);
      return next.length ? next : prev;
    });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setCreatedOffer(null);

    const parsedTaxRate = Number(taxRate.replace(",", "."));
    const items = offerItems
      .map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity.replace(",", ".")),
        unit: item.unit.trim() || "kom",
        unit_price: Number(item.unitPrice.replace(",", ".")),
      }))
      .filter((item) => item.description && item.quantity > 0 && item.unit_price > 0);

    if (!customerName.trim() || !items.length) {
      setMessage("Unesite kupca i bar jednu stavku sa opisom, kolicinom i cenom.");
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
          title: offerTitle.trim() || subject.trim() || null,
          items,
          tax_rate: Number.isFinite(parsedTaxRate) ? parsedTaxRate : 0,
          valid_until: validUntil || null,
          payment_terms: paymentTerms.trim() || null,
          delivery_terms: deliveryTerms.trim() || null,
          note: note.trim() || null,
        },
      });
      setCreatedOffer(res.offer);
      setMessage("Ponuda je kreirana.");
      await loadOfferHistory(false);
    } catch {
      setMessage("Greska pri kreiranju rucne ponude.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function draftFromOffer(offer: OrderOffer): OfferEditDraft {
    return {
      title: offer.title || offer.order_subject || offer.offer_number,
      items: offer.items.length
        ? offer.items.map((item) => ({
            description: item.description || "",
            quantity: item.quantity ? String(item.quantity) : "1",
            unit: item.unit || "kom",
            unitPrice: item.unit_price ? String(item.unit_price) : "",
          }))
        : [{ description: "", quantity: "1", unit: "kom", unitPrice: "" }],
      taxRate: String(offer.tax_rate ?? 0),
      validUntil: offer.valid_until || "",
      paymentTerms: offer.payment_terms || "",
      deliveryTerms: offer.delivery_terms || "",
      note: offer.note || "",
      status: offer.status,
    };
  }

  function getEditDraft(offer: OrderOffer) {
    return offerEditDrafts[offer.id] || draftFromOffer(offer);
  }

  function updateEditDraft(id: number, field: keyof OfferEditDraft, value: string) {
    const offer = offers.find((item) => item.id === id);
    if (!offer) return;
    setOfferEditDrafts((prev) => ({
      ...prev,
      [id]: {
        ...getEditDraft(offer),
        [field]: value,
      },
    }));
  }

  function updateEditLineDraft(id: number, index: number, field: keyof OfferLineDraft, value: string) {
    const offer = offers.find((item) => item.id === id);
    if (!offer) return;
    setOfferEditDrafts((prev) => {
      const draft = getEditDraft(offer);
      const items = draft.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      );
      return { ...prev, [id]: { ...draft, items } };
    });
  }

  function addEditLineDraft(id: number) {
    const offer = offers.find((item) => item.id === id);
    if (!offer) return;
    setOfferEditDrafts((prev) => {
      const draft = getEditDraft(offer);
      return { ...prev, [id]: { ...draft, items: [...draft.items, { description: "", quantity: "1", unit: "kom", unitPrice: "" }] } };
    });
  }

  function removeEditLineDraft(id: number, index: number) {
    const offer = offers.find((item) => item.id === id);
    if (!offer) return;
    setOfferEditDrafts((prev) => {
      const draft = getEditDraft(offer);
      const items = draft.items.filter((_, itemIndex) => itemIndex !== index);
      return { ...prev, [id]: { ...draft, items: items.length ? items : draft.items } };
    });
  }

  async function loadOfferHistory(showLoader: boolean = true) {
    if (showLoader) setOffersLoading(true);
    try {
      const res = await adminListOffers({ limit: 200 });
      setOffers(res.data || []);
      setOfferEditDrafts((prev) => {
        const next = { ...prev };
        (res.data || []).forEach((offer) => {
          if (!next[offer.id]) next[offer.id] = draftFromOffer(offer);
        });
        return next;
      });
    } catch {
      setMessage("Neuspesno ucitavanje istorije ponuda.");
    } finally {
      if (showLoader) setOffersLoading(false);
    }
  }

  async function handleUpdateOffer(offer: OrderOffer) {
    const draft = getEditDraft(offer);
    const tax = Number(draft.taxRate.replace(",", "."));
    const items = draft.items
      .map((item) => ({
        description: item.description.trim(),
        quantity: Number(item.quantity.replace(",", ".")),
        unit: item.unit.trim() || "kom",
        unit_price: Number(item.unitPrice.replace(",", ".")),
        line_total: (Number(item.quantity.replace(",", ".")) || 0) * (Number(item.unitPrice.replace(",", ".")) || 0),
      }))
      .filter((item) => item.description && item.quantity > 0 && item.unit_price > 0);
    if (!items.length) {
      setMessage("Za izmenu ponude unesite bar jednu stavku sa opisom, kolicinom i cenom.");
      return;
    }
    setOffersLoading(true);
    setMessage(null);
    try {
      const updated = await adminUpdateOrderOffer(offer.id, {
        title: draft.title.trim() || null,
        status: draft.status,
        items,
        tax_rate: Number.isFinite(tax) ? tax : 0,
        valid_until: draft.validUntil || null,
        payment_terms: draft.paymentTerms || null,
        delivery_terms: draft.deliveryTerms || null,
        note: draft.note || null,
      });
      setOffers((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      setOfferEditDrafts((prev) => ({ ...prev, [updated.id]: draftFromOffer(updated) }));
      setMessage("Ponuda je azurirana.");
    } catch {
      setMessage("Greska pri izmeni ponude.");
    } finally {
      setOffersLoading(false);
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
              <Input label="Naziv ponude / PDF fajla" value={offerTitle} onChange={(e) => setOfferTitle(e.target.value)} />
              <Input label="Naslov / osnov ponude" value={subject} onChange={(e) => setSubject(e.target.value)} />
              <Select label="Tip usluge" selectedKeys={[serviceType]} onSelectionChange={(keys) => setServiceType(Array.from(keys).at(0)?.toString() || "beton")}>
                <SelectItem key="beton">Beton</SelectItem>
                <SelectItem key="behaton">Behaton</SelectItem>
                <SelectItem key="other">Ostalo</SelectItem>
              </Select>
              <div className="space-y-3">
                {offerItems.map((item, index) => (
                  <div key={index} className="rounded-xl border border-black/10 bg-gray-50 p-3">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-dark">Stavka {index + 1}</p>
                      <Button
                        size="sm"
                        variant="light"
                        color="danger"
                        onPress={() => removeOfferItem(index)}
                        isDisabled={offerItems.length === 1}
                      >
                        Ukloni
                      </Button>
                    </div>
                    <Textarea
                      label="Opis stavke"
                      value={item.description}
                      onChange={(e) => updateOfferItem(index, "description", e.target.value)}
                      minRows={2}
                      isRequired
                    />
                    <div className="mt-3 grid gap-3 sm:grid-cols-3">
                      <Input label="Kolicina" value={item.quantity} onChange={(e) => updateOfferItem(index, "quantity", e.target.value)} isRequired />
                      <Input label="Jedinica" value={item.unit} onChange={(e) => updateOfferItem(index, "unit", e.target.value)} />
                      <Input label="Cena bez PDV-a" value={item.unitPrice} onChange={(e) => updateOfferItem(index, "unitPrice", e.target.value)} isRequired />
                    </div>
                  </div>
                ))}
                <Button variant="flat" onPress={addOfferItem}>
                  Dodaj stavku
                </Button>
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

      <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-dark">Istorija ponuda</h2>
            <p className="mt-1 text-sm text-gray-600">Sve kreirane ponude, ukljucujuci rucne i ponude iz porudzbina sa sajta.</p>
          </div>
          <Button variant="flat" onPress={() => loadOfferHistory()} isDisabled={offersLoading}>
            Osvezi
          </Button>
        </div>

        <div className="mt-5 space-y-4">
          {offers.length === 0 && (
            <div className="rounded-xl border border-black/5 bg-gray-50 p-4 text-sm text-gray-600">
              Nema kreiranih ponuda.
            </div>
          )}
          {offers.map((offer) => {
            const draft = getEditDraft(offer);
            const customer = offer.customer_name || offer.customer_email || "Kupac nije unet";
            return (
              <article key={offer.id} className="rounded-xl border border-black/10 bg-gray-50 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-dark">{draft.title || offer.offer_number}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      {offer.offer_number} | {customer} | {new Date(offer.created_at).toLocaleString("sr-RS")}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button as="a" href={adminOfferPrintUrl(offer.id)} target="_blank" rel="noreferrer" size="sm" variant="flat">
                      PDF prikaz
                    </Button>
                    <Button as="a" href={adminOfferPdfUrl(offer.id)} size="sm" variant="flat">
                      Preuzmi
                    </Button>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <Input label="Naziv ponude / PDF fajla" size="sm" value={draft.title} onChange={(e) => updateEditDraft(offer.id, "title", e.target.value)} />
                  <Select label="Status" size="sm" selectedKeys={[draft.status]} onSelectionChange={(keys) => updateEditDraft(offer.id, "status", Array.from(keys).at(0)?.toString() || "draft")}>
                    {offerStatusOptions.map((item) => (
                      <SelectItem key={item.key}>{item.label}</SelectItem>
                    ))}
                  </Select>
                  <div className="space-y-2 lg:col-span-2">
                    {draft.items.map((item, index) => (
                      <div key={index} className="rounded-lg border border-black/10 bg-white p-3">
                        <div className="mb-2 flex items-center justify-between gap-2">
                          <p className="text-xs font-semibold text-gray-700">Stavka {index + 1}</p>
                          <Button
                            size="sm"
                            variant="light"
                            color="danger"
                            onPress={() => removeEditLineDraft(offer.id, index)}
                            isDisabled={draft.items.length === 1}
                          >
                            Ukloni
                          </Button>
                        </div>
                        <Textarea
                          label="Opis stavke"
                          size="sm"
                          minRows={2}
                          value={item.description}
                          onChange={(e) => updateEditLineDraft(offer.id, index, "description", e.target.value)}
                        />
                        <div className="mt-2 grid gap-3 sm:grid-cols-3">
                          <Input label="Kolicina" size="sm" value={item.quantity} onChange={(e) => updateEditLineDraft(offer.id, index, "quantity", e.target.value)} />
                          <Input label="Jedinica" size="sm" value={item.unit} onChange={(e) => updateEditLineDraft(offer.id, index, "unit", e.target.value)} />
                          <Input label="Cena" size="sm" value={item.unitPrice} onChange={(e) => updateEditLineDraft(offer.id, index, "unitPrice", e.target.value)} />
                        </div>
                      </div>
                    ))}
                    <Button size="sm" variant="flat" onPress={() => addEditLineDraft(offer.id)}>
                      Dodaj stavku
                    </Button>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="PDV %" size="sm" value={draft.taxRate} onChange={(e) => updateEditDraft(offer.id, "taxRate", e.target.value)} />
                    <Input label="Vazi do" size="sm" type="date" value={draft.validUntil} onChange={(e) => updateEditDraft(offer.id, "validUntil", e.target.value)} />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <Input label="Placanje" size="sm" value={draft.paymentTerms} onChange={(e) => updateEditDraft(offer.id, "paymentTerms", e.target.value)} />
                    <Input label="Isporuka" size="sm" value={draft.deliveryTerms} onChange={(e) => updateEditDraft(offer.id, "deliveryTerms", e.target.value)} />
                  </div>
                  <Textarea label="Napomena" size="sm" minRows={2} value={draft.note} onChange={(e) => updateEditDraft(offer.id, "note", e.target.value)} />
                </div>
                <div className="mt-3 flex justify-end">
                  <Button color="primary" size="sm" onPress={() => handleUpdateOffer(offer)} isDisabled={offersLoading}>
                    Sacuvaj izmene
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
