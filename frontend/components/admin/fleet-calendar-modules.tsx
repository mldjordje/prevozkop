'use client';

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader, Chip, Input, Select, SelectItem, Textarea } from "@heroui/react";
import type { Delivery, DeliveryStatus, Order, Vehicle, VehicleStatus, VehicleType, Worker } from "@/lib/api";
import {
  adminCreateDelivery,
  adminCreateVehicle,
  adminDeleteDelivery,
  adminDeleteVehicle,
  adminDeliverySummary,
  adminListDeliveries,
  adminListOrders,
  adminListVehicles,
  adminListWorkers,
  adminUpdateDelivery,
  adminUpdateVehicle,
  adminVehicleSummary,
} from "@/lib/admin-client";

type FleetCalendarModule = "vehicles" | "calendar";

type FleetCalendarModulesProps = {
  module: FleetCalendarModule;
  isAuthenticated: boolean;
  setMessage: (message: string | null) => void;
};

const vehicleTypes: { key: VehicleType; label: string }[] = [
  { key: "mixer", label: "Mikser" },
  { key: "truck", label: "Kamion" },
  { key: "pump", label: "Pumpa" },
  { key: "van", label: "Kombi" },
  { key: "machine", label: "Masina" },
  { key: "other", label: "Ostalo" },
];

const vehicleStatuses: { key: VehicleStatus | "all"; label: string }[] = [
  { key: "all", label: "Sva vozila" },
  { key: "active", label: "Aktivno" },
  { key: "service", label: "Servis" },
  { key: "inactive", label: "Neaktivno" },
];

const deliveryStatuses: { key: DeliveryStatus | "all"; label: string }[] = [
  { key: "all", label: "Svi statusi" },
  { key: "scheduled", label: "Zakazano" },
  { key: "in_progress", label: "U toku" },
  { key: "done", label: "Zavrseno" },
  { key: "cancelled", label: "Otkazano" },
];

const serviceOptions = [
  { key: "beton", label: "Beton" },
  { key: "behaton", label: "Behaton" },
  { key: "transport", label: "Prevoz" },
  { key: "pump", label: "Pumpa" },
  { key: "other", label: "Ostalo" },
];

const today = new Date();

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCurrentWeekRange() {
  const day = today.getDay() || 7;
  const start = new Date(today);
  start.setHours(0, 0, 0, 0);
  start.setDate(today.getDate() - day + 1);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  return { from: formatLocalDate(start), to: formatLocalDate(end) };
}

const currentWeek = getCurrentWeekRange();
const todayDate = formatLocalDate(today);

const emptyVehicleForm = {
  name: "",
  vehicle_type: "truck" as VehicleType,
  registration_number: "",
  registration_expires_at: "",
  last_service_at: "",
  next_service_at: "",
  mileage: "",
  work_hours: "",
  status: "active" as VehicleStatus,
  note: "",
};

const emptyDeliveryForm = {
  order_id: "",
  customer_name: "",
  address: "",
  scheduled_date: todayDate,
  scheduled_time: "08:00",
  quantity: "",
  service_type: "beton",
  vehicle_id: "",
  worker_id: "",
  status: "scheduled" as DeliveryStatus,
  note: "",
};

const calendarSlots = Array.from({ length: 24 }, (_, index) => {
  const minutes = 7 * 60 + index * 30;
  const hour = Math.floor(minutes / 60);
  const minute = minutes % 60;
  return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
});

function daysBetween(from: string, to: string): string[] {
  const start = new Date(`${from}T00:00:00`);
  const end = new Date(`${to}T00:00:00`);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) return [];
  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end && days.length < 14) {
    days.push(formatLocalDate(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

function slotKey(date: string, time: string) {
  return `${date} ${time}`;
}

function toNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value: number | string | null | undefined): string {
  return `${toNumber(value).toLocaleString("sr-RS", { maximumFractionDigits: 2 })} RSD`;
}

function labelFor<T extends string>(items: { key: T; label: string }[], key: T | string | null | undefined): string {
  return items.find((item) => item.key === key)?.label || "-";
}

function dateLabel(value?: string | null): string {
  if (!value) return "-";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("sr-RS", { dateStyle: "short", timeStyle: value.includes("T") || value.includes(":") ? "short" : undefined });
}

function isWithinDays(value: string | null | undefined, days: number): boolean {
  if (!value) return false;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return false;
  const diff = date.getTime() - Date.now();
  return diff <= days * 24 * 60 * 60 * 1000;
}

export default function FleetCalendarModules({ module, isAuthenticated, setMessage }: FleetCalendarModulesProps) {
  if (module === "calendar") {
    return <CalendarModule isAuthenticated={isAuthenticated} setMessage={setMessage} />;
  }

  return <VehiclesModule isAuthenticated={isAuthenticated} setMessage={setMessage} />;
}

function VehiclesModule({ isAuthenticated, setMessage }: Omit<FleetCalendarModulesProps, "module">) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [status, setStatus] = useState<VehicleStatus | "all">("all");
  const [month, setMonth] = useState(String(today.getMonth() + 1));
  const [year, setYear] = useState(String(today.getFullYear()));
  const [summary, setSummary] = useState({ total: 0, active: 0, service: 0, registration_alerts: 0, service_alerts: 0, expenses_total: 0 });
  const [form, setForm] = useState(emptyVehicleForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  const monthNumber = Math.max(1, Math.min(12, Number(month) || today.getMonth() + 1));
  const yearNumber = Number(year) || today.getFullYear();

  useEffect(() => {
    if (!isAuthenticated) return;
    void refreshVehicles();
  }, [isAuthenticated, status, monthNumber, yearNumber]);

  async function refreshVehicles() {
    setLoading(true);
    try {
      const [list, totals] = await Promise.all([
        adminListVehicles({ status, month: monthNumber, year: yearNumber }),
        adminVehicleSummary(monthNumber, yearNumber),
      ]);
      setVehicles(list.data);
      setSummary(totals);
    } catch {
      setMessage("Neuspesno ucitavanje vozila.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyVehicleForm);
  }

  function startEdit(vehicle: Vehicle) {
    setEditingId(vehicle.id);
    setForm({
      name: vehicle.name,
      vehicle_type: vehicle.vehicle_type,
      registration_number: vehicle.registration_number || "",
      registration_expires_at: vehicle.registration_expires_at || "",
      last_service_at: vehicle.last_service_at || "",
      next_service_at: vehicle.next_service_at || "",
      mileage: vehicle.mileage ? String(vehicle.mileage) : "",
      work_hours: vehicle.work_hours ? String(vehicle.work_hours) : "",
      status: vehicle.status,
      note: vehicle.note || "",
    });
  }

  async function saveVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.name.trim()) {
      setMessage("Naziv vozila je obavezan.");
      return;
    }
    if (toNumber(form.mileage) < 0 || toNumber(form.work_hours) < 0) {
      setMessage("Kilometraza i radni sati ne smeju biti negativni.");
      return;
    }
    const payload = {
      name: form.name.trim(),
      vehicle_type: form.vehicle_type,
      registration_number: form.registration_number.trim() || null,
      registration_expires_at: form.registration_expires_at || null,
      last_service_at: form.last_service_at || null,
      next_service_at: form.next_service_at || null,
      mileage: form.mileage ? toNumber(form.mileage) : null,
      work_hours: form.work_hours ? toNumber(form.work_hours) : null,
      status: form.status,
      note: form.note.trim() || null,
    };
    setLoading(true);
    try {
      if (editingId) {
        await adminUpdateVehicle(editingId, payload);
        setMessage("Vozilo je sacuvano.");
      } else {
        await adminCreateVehicle(payload);
        setMessage("Vozilo je dodato.");
      }
      resetForm();
      await refreshVehicles();
    } catch {
      setMessage("Vozilo nije sacuvano.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteVehicle(vehicle: Vehicle) {
    if (!window.confirm(`Obrisati vozilo: ${vehicle.name}?`)) return;
    setLoading(true);
    try {
      await adminDeleteVehicle(vehicle.id);
      setMessage("Vozilo je obrisano.");
      await refreshVehicles();
    } catch {
      setMessage("Vozilo nije obrisano. Proverite da li je vezano za isporuke ili troskove.");
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { label: "Ukupno", value: summary.total, tone: "bg-gray-950 text-white" },
    { label: "Aktivno", value: summary.active, tone: "bg-emerald-100 text-emerald-900" },
    { label: "Na servisu", value: summary.service, tone: "bg-sky-100 text-sky-900" },
    { label: "Upozorenja", value: summary.registration_alerts + summary.service_alerts, tone: "bg-amber-100 text-amber-900" },
    { label: "Troskovi", value: money(summary.expenses_total), tone: "bg-white text-gray-900" },
  ];

  return (
    <section className="space-y-5">
      <ModuleHeader title="Vozila i servisi" text="Evidencija vozila, registracija, servisa, kilometraze i troskova po vozilu." />
      <StatsGrid stats={stats} />

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card className="border border-black/5 shadow-sm">
          <CardHeader className="flex-col items-start gap-1">
            <h3 className="text-lg font-semibold text-dark">{editingId ? "Izmena vozila" : "Dodaj vozilo"}</h3>
          </CardHeader>
          <CardBody>
            <form className="grid gap-3" onSubmit={saveVehicle}>
              <Input label="Naziv vozila / masine" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
              <Select label="Tip" selectedKeys={[form.vehicle_type]} onSelectionChange={(keys) => setForm((p) => ({ ...p, vehicle_type: Array.from(keys).at(0)?.toString() as VehicleType }))}>
                {vehicleTypes.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
              <Input label="Registracija" value={form.registration_number} onChange={(e) => setForm((p) => ({ ...p, registration_number: e.target.value }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Istice registracija" type="date" value={form.registration_expires_at} onChange={(e) => setForm((p) => ({ ...p, registration_expires_at: e.target.value }))} />
                <Input label="Sledeci servis" type="date" value={form.next_service_at} onChange={(e) => setForm((p) => ({ ...p, next_service_at: e.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Poslednji servis" type="date" value={form.last_service_at} onChange={(e) => setForm((p) => ({ ...p, last_service_at: e.target.value }))} />
                <Select label="Status" selectedKeys={[form.status]} onSelectionChange={(keys) => setForm((p) => ({ ...p, status: Array.from(keys).at(0)?.toString() as VehicleStatus }))}>
                  {vehicleStatuses.filter((item) => item.key !== "all").map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Kilometraza" type="number" min="0" value={form.mileage} onChange={(e) => setForm((p) => ({ ...p, mileage: e.target.value }))} />
                <Input label="Radni sati" type="number" min="0" value={form.work_hours} onChange={(e) => setForm((p) => ({ ...p, work_hours: e.target.value }))} />
              </div>
              <Textarea label="Napomena" minRows={2} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
              <div className="grid gap-2 sm:grid-cols-2">
                <Button color="primary" type="submit" isDisabled={loading}>{editingId ? "Sacuvaj" : "Dodaj"}</Button>
                <Button type="button" variant="flat" onPress={resetForm}>Ocisti</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card className="border border-black/5 shadow-sm">
            <CardBody className="grid gap-3 sm:grid-cols-3">
              <Input label="Mesec troskova" type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} />
              <Input label="Godina" type="number" min="2020" value={year} onChange={(e) => setYear(e.target.value)} />
              <Select label="Status" selectedKeys={[status]} onSelectionChange={(keys) => setStatus((Array.from(keys).at(0)?.toString() as VehicleStatus | "all") || "all")}>
                {vehicleStatuses.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
            </CardBody>
          </Card>

          <div className="grid gap-3">
            {vehicles.map((vehicle) => {
              const regWarn = isWithinDays(vehicle.registration_expires_at, 30);
              const serviceWarn = isWithinDays(vehicle.next_service_at, 14);
              return (
                <Card key={vehicle.id} className="border border-black/5 shadow-sm">
                  <CardBody className="grid gap-3 md:grid-cols-[1fr_auto]">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-dark">{vehicle.name}</h3>
                        <Chip size="sm" variant="flat">{labelFor(vehicleTypes, vehicle.vehicle_type)}</Chip>
                        <Chip size="sm" color={vehicle.status === "active" ? "success" : vehicle.status === "service" ? "warning" : "default"} variant="flat">
                          {labelFor(vehicleStatuses, vehicle.status)}
                        </Chip>
                        {(regWarn || serviceWarn) && <Chip size="sm" color="warning" variant="flat">Upozorenje</Chip>}
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        Reg: {vehicle.registration_number || "-"} · istice {dateLabel(vehicle.registration_expires_at)}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        Servis: {dateLabel(vehicle.next_service_at)} · km {vehicle.mileage || 0} · sati {vehicle.work_hours || 0}
                      </p>
                      <p className="mt-1 text-sm font-medium text-dark">Troskovi za mesec: {money(vehicle.month_expenses || 0)}</p>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-2 md:w-56">
                      <Button size="sm" variant="flat" onPress={() => startEdit(vehicle)}>Izmeni</Button>
                      <Button size="sm" color="danger" variant="light" onPress={() => deleteVehicle(vehicle)}>Obrisi</Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CalendarModule({ isAuthenticated, setMessage }: Omit<FleetCalendarModulesProps, "module">) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [from, setFrom] = useState(currentWeek.from);
  const [to, setTo] = useState(currentWeek.to);
  const [status, setStatus] = useState<DeliveryStatus | "all">("all");
  const [summary, setSummary] = useState({ total: 0, scheduled: 0, in_progress: 0, done: 0, cancelled: 0 });
  const [form, setForm] = useState(emptyDeliveryForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    void refreshDeliveries();
  }, [isAuthenticated, from, to, status]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void Promise.all([
      adminListVehicles({ status: "active" }).then((res) => setVehicles(res.data)),
      adminListWorkers({ status: "active" }).then((res) => setWorkers(res.data)),
      adminListOrders({ status: "new", limit: 100 }).then((res) => setOrders(res.data)),
    ]).catch(() => setMessage("Deo podataka za kalendar nije ucitan."));
  }, [isAuthenticated, setMessage]);

  async function refreshDeliveries() {
    setLoading(true);
    try {
      const [list, totals] = await Promise.all([
        adminListDeliveries({ from, to, status }),
        adminDeliverySummary({ from, to }),
      ]);
      setDeliveries(list.data);
      setSummary(totals);
    } catch {
      setMessage("Neuspesno ucitavanje isporuka.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyDeliveryForm);
    setIsPopupOpen(false);
  }

  function startAddAt(date: string, time: string) {
    setEditingId(null);
    setForm((prev) => ({
      ...emptyDeliveryForm,
      customer_name: prev.customer_name,
      address: prev.address,
      scheduled_date: date,
      scheduled_time: time,
    }));
    setIsPopupOpen(true);
  }

  function startEdit(delivery: Delivery) {
    const date = new Date(delivery.scheduled_at);
    const dateValue = Number.isNaN(date.getTime()) ? todayDate : date.toISOString().slice(0, 10);
    const timeValue = Number.isNaN(date.getTime()) ? "08:00" : date.toTimeString().slice(0, 5);
    setEditingId(delivery.id);
    setForm({
      order_id: delivery.order_id ? String(delivery.order_id) : "",
      customer_name: delivery.customer_name,
      address: delivery.address,
      scheduled_date: dateValue,
      scheduled_time: timeValue,
      quantity: delivery.quantity || "",
      service_type: delivery.service_type || "beton",
      vehicle_id: delivery.vehicle_id ? String(delivery.vehicle_id) : "",
      worker_id: delivery.worker_id ? String(delivery.worker_id) : "",
      status: delivery.status,
      note: delivery.note || "",
    });
    setIsPopupOpen(true);
  }

  function selectOrder(orderId: string) {
    const order = orders.find((item) => String(item.id) === orderId);
    setForm((prev) => ({
      ...prev,
      order_id: orderId,
      customer_name: order?.name || prev.customer_name,
      address: order?.city_slug || prev.address,
      quantity: order?.quantity ? `${order.quantity}${order.quantity_unit ? ` ${order.quantity_unit}` : ""}` : prev.quantity,
      service_type: order?.service_type || prev.service_type,
    }));
  }

  async function saveDelivery(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.customer_name.trim()) {
      setMessage("Kupac je obavezan.");
      return;
    }
    if (!form.address.trim()) {
      setMessage("Adresa isporuke je obavezna.");
      return;
    }
    if (!form.scheduled_date || !form.scheduled_time) {
      setMessage("Datum i vreme isporuke su obavezni.");
      return;
    }
    const payload = {
      order_id: form.order_id ? Number(form.order_id) : null,
      customer_name: form.customer_name.trim(),
      address: form.address.trim(),
      scheduled_at: `${form.scheduled_date} ${form.scheduled_time}:00`,
      quantity: form.quantity.trim() || null,
      service_type: form.service_type.trim() || null,
      vehicle_id: form.vehicle_id ? Number(form.vehicle_id) : null,
      worker_id: form.worker_id ? Number(form.worker_id) : null,
      status: form.status,
      note: form.note.trim() || null,
    };
    setLoading(true);
    try {
      if (editingId) {
        await adminUpdateDelivery(editingId, payload);
        setMessage("Isporuka je sacuvana.");
      } else {
        await adminCreateDelivery(payload);
        setMessage("Isporuka je dodata.");
      }
      resetForm();
      await refreshDeliveries();
    } catch {
      setMessage("Isporuka nije sacuvana.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteDelivery(delivery: Delivery) {
    if (!window.confirm(`Obrisati isporuku za ${delivery.customer_name}?`)) return;
    setLoading(true);
    try {
      await adminDeleteDelivery(delivery.id);
      setMessage("Isporuka je obrisana.");
      await refreshDeliveries();
    } catch {
      setMessage("Isporuka nije obrisana.");
    } finally {
      setLoading(false);
    }
  }

  const grouped = useMemo(() => {
    const map = new Map<string, Delivery[]>();
    deliveries.forEach((delivery) => {
      const key = delivery.scheduled_at.slice(0, 10);
      map.set(key, [...(map.get(key) || []), delivery]);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [deliveries]);

  const weekDays = useMemo(() => daysBetween(from, to), [from, to]);
  const deliveriesBySlot = useMemo(() => {
    const map = new Map<string, Delivery[]>();
    deliveries.forEach((delivery) => {
      const date = delivery.scheduled_at.slice(0, 10);
      const parsed = new Date(delivery.scheduled_at.replace(" ", "T"));
      if (Number.isNaN(parsed.getTime())) return;
      const minutes = parsed.getHours() * 60 + parsed.getMinutes();
      const rounded = Math.floor(minutes / 30) * 30;
      const time = `${String(Math.floor(rounded / 60)).padStart(2, "0")}:${String(rounded % 60).padStart(2, "0")}`;
      const key = slotKey(date, time);
      map.set(key, [...(map.get(key) || []), delivery]);
    });
    return map;
  }, [deliveries]);
  const calendarGridStyle = useMemo(
    () => ({ gridTemplateColumns: `72px repeat(${Math.max(1, weekDays.length)}, minmax(110px, 1fr))` }),
    [weekDays.length]
  );

  const stats = [
    { label: "Ukupno", value: summary.total, tone: "bg-gray-950 text-white" },
    { label: "Zakazano", value: summary.scheduled, tone: "bg-sky-100 text-sky-900" },
    { label: "U toku", value: summary.in_progress, tone: "bg-amber-100 text-amber-900" },
    { label: "Zavrseno", value: summary.done, tone: "bg-emerald-100 text-emerald-900" },
    { label: "Otkazano", value: summary.cancelled, tone: "bg-white text-gray-900" },
  ];

  const deliveryForm = (
    <form className="grid gap-3" onSubmit={saveDelivery}>
      <Select label="Porudzbina" selectedKeys={form.order_id ? [form.order_id] : []} onSelectionChange={(keys) => selectOrder(Array.from(keys).at(0)?.toString() || "")}>
        {orders.map((order) => <SelectItem key={String(order.id)}>{`${order.name} - ${order.subject || order.service_type || "upit"}`}</SelectItem>)}
      </Select>
      <Input label="Kupac" value={form.customer_name} onChange={(e) => setForm((p) => ({ ...p, customer_name: e.target.value }))} />
      <Input label="Adresa" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Datum" type="date" value={form.scheduled_date} onChange={(e) => setForm((p) => ({ ...p, scheduled_date: e.target.value }))} />
        <Input label="Vreme" type="time" value={form.scheduled_time} onChange={(e) => setForm((p) => ({ ...p, scheduled_time: e.target.value }))} />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <Input label="Kolicina" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} />
        <Select label="Usluga" selectedKeys={[form.service_type]} onSelectionChange={(keys) => setForm((p) => ({ ...p, service_type: Array.from(keys).at(0)?.toString() || "other" }))}>
          {serviceOptions.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
        </Select>
      </div>
      <Select label="Vozilo" selectedKeys={form.vehicle_id ? [form.vehicle_id] : []} onSelectionChange={(keys) => setForm((p) => ({ ...p, vehicle_id: Array.from(keys).at(0)?.toString() || "" }))}>
        {vehicles.map((vehicle) => <SelectItem key={String(vehicle.id)}>{vehicle.name}</SelectItem>)}
      </Select>
      <Select label="Vozac / radnik" selectedKeys={form.worker_id ? [form.worker_id] : []} onSelectionChange={(keys) => setForm((p) => ({ ...p, worker_id: Array.from(keys).at(0)?.toString() || "" }))}>
        {workers.map((worker) => <SelectItem key={String(worker.id)}>{worker.full_name}</SelectItem>)}
      </Select>
      <Select label="Status" selectedKeys={[form.status]} onSelectionChange={(keys) => setForm((p) => ({ ...p, status: Array.from(keys).at(0)?.toString() as DeliveryStatus }))}>
        {deliveryStatuses.filter((item) => item.key !== "all").map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
      </Select>
      <Textarea label="Napomena" minRows={2} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
      <div className="grid gap-2 sm:grid-cols-2">
        <Button color="primary" type="submit" isDisabled={loading}>{editingId ? "Sacuvaj" : "Dodaj"}</Button>
        <Button type="button" variant="flat" onPress={resetForm}>Zatvori</Button>
      </div>
    </form>
  );

  return (
    <section className="space-y-5">
      <ModuleHeader title="Kalendar isporuka" text="Dnevni i nedeljni raspored isporuka, vozila, vozaca i statusa." />
      <StatsGrid stats={stats} />

      <div className="grid gap-4">
        <Card className="hidden border border-black/5 shadow-sm">
          <CardHeader className="flex-col items-start gap-1">
            <h3 className="text-lg font-semibold text-dark">{editingId ? "Izmena isporuke" : "Dodaj isporuku"}</h3>
          </CardHeader>
          <CardBody>
            <form className="grid gap-3" onSubmit={saveDelivery}>
              <Select label="Porudzbina" selectedKeys={form.order_id ? [form.order_id] : []} onSelectionChange={(keys) => selectOrder(Array.from(keys).at(0)?.toString() || "")}>
                {orders.map((order) => <SelectItem key={String(order.id)}>{`${order.name} · ${order.subject || order.service_type || "upit"}`}</SelectItem>)}
              </Select>
              <Input label="Kupac" value={form.customer_name} onChange={(e) => setForm((p) => ({ ...p, customer_name: e.target.value }))} />
              <Input label="Adresa" value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Datum" type="date" value={form.scheduled_date} onChange={(e) => setForm((p) => ({ ...p, scheduled_date: e.target.value }))} />
                <Input label="Vreme" type="time" value={form.scheduled_time} onChange={(e) => setForm((p) => ({ ...p, scheduled_time: e.target.value }))} />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Kolicina" value={form.quantity} onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))} />
                <Select label="Usluga" selectedKeys={[form.service_type]} onSelectionChange={(keys) => setForm((p) => ({ ...p, service_type: Array.from(keys).at(0)?.toString() || "other" }))}>
                  {serviceOptions.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
                </Select>
              </div>
              <Select label="Vozilo" selectedKeys={form.vehicle_id ? [form.vehicle_id] : []} onSelectionChange={(keys) => setForm((p) => ({ ...p, vehicle_id: Array.from(keys).at(0)?.toString() || "" }))}>
                {vehicles.map((vehicle) => <SelectItem key={String(vehicle.id)}>{vehicle.name}</SelectItem>)}
              </Select>
              <Select label="Vozac / radnik" selectedKeys={form.worker_id ? [form.worker_id] : []} onSelectionChange={(keys) => setForm((p) => ({ ...p, worker_id: Array.from(keys).at(0)?.toString() || "" }))}>
                {workers.map((worker) => <SelectItem key={String(worker.id)}>{worker.full_name}</SelectItem>)}
              </Select>
              <Select label="Status" selectedKeys={[form.status]} onSelectionChange={(keys) => setForm((p) => ({ ...p, status: Array.from(keys).at(0)?.toString() as DeliveryStatus }))}>
                {deliveryStatuses.filter((item) => item.key !== "all").map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
              <Textarea label="Napomena" minRows={2} value={form.note} onChange={(e) => setForm((p) => ({ ...p, note: e.target.value }))} />
              <div className="grid gap-2 sm:grid-cols-2">
                <Button color="primary" type="submit" isDisabled={loading}>{editingId ? "Sacuvaj" : "Dodaj"}</Button>
                <Button type="button" variant="flat" onPress={resetForm}>Ocisti</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card className="border border-black/5 shadow-sm">
            <CardBody className="grid gap-3 sm:grid-cols-3">
              <Input label="Od" type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <Input label="Do" type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              <Select label="Status" selectedKeys={[status]} onSelectionChange={(keys) => setStatus((Array.from(keys).at(0)?.toString() as DeliveryStatus | "all") || "all")}>
                {deliveryStatuses.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
            </CardBody>
          </Card>

          <Card className="border border-black/5 shadow-sm">
            <CardHeader className="flex-col items-start">
              <h3 className="text-lg font-semibold text-dark">Mini raspored</h3>
            </CardHeader>
            <CardBody className="space-y-4">
              <div className="overflow-x-auto rounded-xl border border-black/5">
                <div className="min-w-[860px]">
                  <div className="grid border-b border-black/5 bg-gray-50" style={calendarGridStyle}>
                    <div className="px-2 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-gray-500">Vreme</div>
                    {weekDays.map((day) => (
                      <div key={day} className="border-l border-black/5 px-2 py-2 text-xs font-semibold text-dark">
                        {new Date(`${day}T00:00:00`).toLocaleDateString("sr-RS", { weekday: "short", day: "2-digit", month: "2-digit" })}
                      </div>
                    ))}
                  </div>
                  {calendarSlots.map((time) => (
                    <div key={time} className="grid border-b border-black/5 last:border-b-0" style={calendarGridStyle}>
                      <div className="bg-gray-50 px-2 py-2 text-xs font-semibold text-gray-500">{time}</div>
                      {weekDays.map((day) => {
                        const items = deliveriesBySlot.get(slotKey(day, time)) || [];
                        return (
                          <button
                            key={`${day}-${time}`}
                            type="button"
                            onClick={() => (items[0] ? startEdit(items[0]) : startAddAt(day, time))}
                            className="min-h-14 border-l border-black/5 px-2 py-1 text-left transition hover:bg-primary/10"
                          >
                            {items.length > 0 ? (
                              <span className="block rounded-lg bg-gray-950 px-2 py-1 text-xs font-semibold leading-4 text-white">
                                {items[0].customer_name}
                                {items.length > 1 ? ` +${items.length - 1}` : ""}
                              </span>
                            ) : (
                              <span className="block text-xs text-gray-300">+</span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>

              {grouped.length > 0 && (
                <div className="grid gap-3">
                  {grouped.map(([day, items]) => (
                    <div key={day} className="space-y-2">
                      <p className="text-sm font-semibold text-gray-600">{new Date(`${day}T00:00:00`).toLocaleDateString("sr-RS", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}</p>
                      {items.map((delivery) => (
                        <article key={delivery.id} className="rounded-xl border border-black/5 bg-white p-3">
                          <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="font-semibold text-dark">{delivery.customer_name}</p>
                                <Chip size="sm" variant="flat">{labelFor(deliveryStatuses, delivery.status)}</Chip>
                              </div>
                              <p className="mt-1 text-sm text-gray-600">{dateLabel(delivery.scheduled_at)} · {delivery.address}</p>
                              <p className="mt-1 text-sm text-gray-500">
                                {delivery.quantity || "-"} · {delivery.service_type || "-"} · {delivery.vehicle_name || "bez vozila"} · {delivery.worker_name || "bez radnika"}
                              </p>
                            </div>
                            <div className="grid gap-2 sm:grid-cols-2 md:w-56">
                              <Button size="sm" variant="flat" onPress={() => startEdit(delivery)}>Izmeni</Button>
                              <Button size="sm" color="danger" variant="light" onPress={() => deleteDelivery(delivery)}>Obrisi</Button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>

      {isPopupOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-3 py-6">
          <div className="max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-2xl border border-black/10 bg-white p-4 shadow-2xl sm:p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-primary">Kalendar</p>
                <h3 className="mt-1 text-xl font-semibold text-dark">{editingId ? "Izmena isporuke" : "Nova isporuka"}</h3>
                <p className="mt-1 text-sm text-gray-500">{form.scheduled_date} u {form.scheduled_time}</p>
              </div>
              <Button size="sm" variant="flat" onPress={resetForm}>Zatvori</Button>
            </div>
            {deliveryForm}
          </div>
        </div>
      )}
    </section>
  );
}

function ModuleHeader({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-5 py-5 shadow-sm">
      <p className="text-sm uppercase tracking-[0.2em] text-primary">Operativa</p>
      <h2 className="mt-2 text-2xl font-semibold text-dark sm:text-3xl">{title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-gray-600">{text}</p>
    </div>
  );
}

function StatsGrid({ stats }: { stats: { label: string; value: string | number; tone: string }[] }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      {stats.map((item) => (
        <div key={item.label} className={`rounded-2xl border border-black/5 px-4 py-4 shadow-sm ${item.tone}`}>
          <p className="text-xs uppercase tracking-[0.16em] opacity-70">{item.label}</p>
          <p className="mt-2 break-words text-xl font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}
