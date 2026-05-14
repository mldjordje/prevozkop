'use client';

import { useEffect, useMemo, useState } from "react";
import { Button, Card, CardBody, CardHeader, Chip, Input, Select, SelectItem, Textarea } from "@heroui/react";
import type {
  CompanyExpense,
  ExpenseCategory,
  ExpensePaymentMethod,
  PayrollStatus,
  Worker,
  WorkerPayroll,
  WorkerPayrollType,
  WorkerPosition,
} from "@/lib/api";
import {
  adminCreateExpense,
  adminCreateWorker,
  adminDeactivateWorker,
  adminDeleteExpense,
  adminExpenseSummary,
  adminGeneratePayrolls,
  adminListExpenses,
  adminListPayrolls,
  adminListWorkers,
  adminPayrollSummary,
  adminUpdateExpense,
  adminUpdatePayroll,
  adminUpdateWorker,
} from "@/lib/admin-client";

type BusinessModule = "workers" | "expenses";

type BusinessModulesProps = {
  module: BusinessModule;
  isAuthenticated: boolean;
  setMessage: (message: string | null) => void;
};

const workerPositions: { key: WorkerPosition; label: string }[] = [
  { key: "driver", label: "Vozac" },
  { key: "craftsman", label: "Majstor" },
  { key: "worker", label: "Radnik" },
  { key: "administration", label: "Administracija" },
  { key: "other", label: "Ostalo" },
];

const payrollTypes: { key: WorkerPayrollType; label: string }[] = [
  { key: "fixed", label: "Fiksna plata" },
  { key: "daily", label: "Dnevnica" },
];

const payrollStatuses: { key: PayrollStatus | "all"; label: string }[] = [
  { key: "all", label: "Svi statusi" },
  { key: "unpaid", label: "Nije isplaceno" },
  { key: "partial", label: "Delimicno" },
  { key: "paid", label: "Isplaceno" },
];

const expenseCategories: { key: ExpenseCategory | "all"; label: string }[] = [
  { key: "all", label: "Sve kategorije" },
  { key: "fuel", label: "Gorivo" },
  { key: "material", label: "Materijal" },
  { key: "service", label: "Servis" },
  { key: "registration", label: "Registracija" },
  { key: "payroll", label: "Plate" },
  { key: "rent", label: "Zakup" },
  { key: "bills", label: "Racuni" },
  { key: "other", label: "Ostalo" },
];

const expensePaymentMethods: { key: ExpensePaymentMethod; label: string }[] = [
  { key: "cash", label: "Kes" },
  { key: "bank", label: "Racun" },
  { key: "card", label: "Kartica" },
  { key: "other", label: "Drugo" },
];

const currentDate = new Date();

const emptyWorkerForm = {
  full_name: "",
  phone: "",
  position: "worker" as WorkerPosition,
  payroll_type: "fixed" as WorkerPayrollType,
  default_monthly_salary: "",
  default_daily_wage: "",
  note: "",
  is_active: "1",
};

const emptyExpenseForm = {
  expense_date: currentDate.toISOString().slice(0, 10),
  category: "fuel" as ExpenseCategory,
  description: "",
  amount: "",
  payment_method: "cash" as ExpensePaymentMethod,
  vendor: "",
  worker_id: "",
  note: "",
};

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

function calculatePayrollTotal(payroll: Pick<WorkerPayroll, "payroll_type" | "work_days" | "daily_wage" | "monthly_salary" | "advances" | "bonus" | "deductions">) {
  const base =
    payroll.payroll_type === "daily"
      ? toNumber(payroll.work_days) * toNumber(payroll.daily_wage)
      : toNumber(payroll.monthly_salary);
  return base + toNumber(payroll.bonus) - toNumber(payroll.advances) - toNumber(payroll.deductions);
}

export default function BusinessModules({ module, isAuthenticated, setMessage }: BusinessModulesProps) {
  const [month, setMonth] = useState(String(currentDate.getMonth() + 1));
  const [year, setYear] = useState(String(currentDate.getFullYear()));
  const monthNumber = Math.max(1, Math.min(12, Number(month) || currentDate.getMonth() + 1));
  const yearNumber = Number(year) || currentDate.getFullYear();

  if (module === "expenses") {
    return (
      <ExpensesModule
        isAuthenticated={isAuthenticated}
        month={month}
        year={year}
        monthNumber={monthNumber}
        yearNumber={yearNumber}
        setMonth={setMonth}
        setYear={setYear}
        setMessage={setMessage}
      />
    );
  }

  return (
    <WorkersModule
      isAuthenticated={isAuthenticated}
      month={month}
      year={year}
      monthNumber={monthNumber}
      yearNumber={yearNumber}
      setMonth={setMonth}
      setYear={setYear}
      setMessage={setMessage}
    />
  );
}

type ModuleBaseProps = {
  isAuthenticated: boolean;
  month: string;
  year: string;
  monthNumber: number;
  yearNumber: number;
  setMonth: (value: string) => void;
  setYear: (value: string) => void;
  setMessage: (message: string | null) => void;
};

function WorkersModule({ isAuthenticated, month, year, monthNumber, yearNumber, setMonth, setYear, setMessage }: ModuleBaseProps) {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [payrolls, setPayrolls] = useState<WorkerPayroll[]>([]);
  const [workerStatus, setWorkerStatus] = useState<"all" | "active" | "inactive">("active");
  const [payrollStatus, setPayrollStatus] = useState<PayrollStatus | "all">("all");
  const [summary, setSummary] = useState({ workers_total: 0, active_workers: 0, total_due: 0, paid: 0, remaining: 0 });
  const [workerForm, setWorkerForm] = useState(emptyWorkerForm);
  const [editingWorkerId, setEditingWorkerId] = useState<number | null>(null);
  const [payrollDrafts, setPayrollDrafts] = useState<Record<number, Partial<WorkerPayroll>>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    void refreshWorkers();
  }, [isAuthenticated, workerStatus]);

  useEffect(() => {
    if (!isAuthenticated) return;
    void refreshPayrolls();
  }, [isAuthenticated, monthNumber, yearNumber, payrollStatus]);

  async function refreshWorkers() {
    setLoading(true);
    try {
      const res = await adminListWorkers({ status: workerStatus });
      setWorkers(res.data);
    } catch {
      setMessage("Neuspesno ucitavanje radnika.");
    } finally {
      setLoading(false);
    }
  }

  async function refreshPayrolls() {
    setLoading(true);
    try {
      const [list, totals] = await Promise.all([
        adminListPayrolls({ month: monthNumber, year: yearNumber, status: payrollStatus }),
        adminPayrollSummary(monthNumber, yearNumber),
      ]);
      setPayrolls(list.data);
      setSummary(totals);
      setPayrollDrafts({});
    } catch {
      setMessage("Neuspesno ucitavanje plata.");
    } finally {
      setLoading(false);
    }
  }

  function startEditWorker(worker: Worker) {
    setEditingWorkerId(worker.id);
    setWorkerForm({
      full_name: worker.full_name,
      phone: worker.phone || "",
      position: worker.position,
      payroll_type: worker.payroll_type,
      default_monthly_salary: String(worker.default_monthly_salary || ""),
      default_daily_wage: String(worker.default_daily_wage || ""),
      note: worker.note || "",
      is_active: worker.is_active ? "1" : "0",
    });
  }

  function resetWorkerForm() {
    setEditingWorkerId(null);
    setWorkerForm(emptyWorkerForm);
  }

  async function saveWorker(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!workerForm.full_name.trim()) {
      setMessage("Ime radnika je obavezno.");
      return;
    }
    if (toNumber(workerForm.default_monthly_salary) < 0 || toNumber(workerForm.default_daily_wage) < 0) {
      setMessage("Iznos plate ili dnevnice ne sme biti negativan.");
      return;
    }
    const payload = {
      full_name: workerForm.full_name.trim(),
      phone: workerForm.phone.trim() || null,
      position: workerForm.position,
      payroll_type: workerForm.payroll_type,
      default_monthly_salary: toNumber(workerForm.default_monthly_salary),
      default_daily_wage: toNumber(workerForm.default_daily_wage),
      note: workerForm.note.trim() || null,
      is_active: workerForm.is_active === "1",
    };
    setLoading(true);
    try {
      if (editingWorkerId) {
        await adminUpdateWorker(editingWorkerId, payload);
        setMessage("Radnik je sacuvan.");
      } else {
        await adminCreateWorker(payload);
        setMessage("Radnik je dodat.");
      }
      resetWorkerForm();
      await refreshWorkers();
    } catch {
      setMessage("Radnik nije sacuvan.");
    } finally {
      setLoading(false);
    }
  }

  async function deactivateWorker(worker: Worker) {
    if (!window.confirm(`Deaktivirati radnika: ${worker.full_name}?`)) return;
    setLoading(true);
    try {
      await adminDeactivateWorker(worker.id);
      setMessage("Radnik je deaktiviran.");
      await refreshWorkers();
    } catch {
      setMessage("Radnik nije deaktiviran.");
    } finally {
      setLoading(false);
    }
  }

  async function generatePayrolls() {
    setLoading(true);
    try {
      const res = await adminGeneratePayrolls(monthNumber, yearNumber);
      setMessage(res.created > 0 ? `Napravljen obracun za ${res.created} radnika.` : "Obracun za ovaj mesec vec postoji.");
      await refreshPayrolls();
    } catch {
      setMessage("Obracun nije napravljen.");
    } finally {
      setLoading(false);
    }
  }

  function payrollValue(payroll: WorkerPayroll, field: keyof WorkerPayroll) {
    return payrollDrafts[payroll.id]?.[field] ?? payroll[field];
  }

  function updatePayrollDraft(id: number, field: keyof WorkerPayroll, value: string | number | null) {
    setPayrollDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function savePayroll(payroll: WorkerPayroll) {
    const draft = payrollDrafts[payroll.id] || {};
    const payload = { ...draft };
    const workDays = toNumber(payload.work_days ?? payroll.work_days);
    const dailyWage = toNumber(payload.daily_wage ?? payroll.daily_wage);
    const monthlySalary = toNumber(payload.monthly_salary ?? payroll.monthly_salary);
    const advances = toNumber(payload.advances ?? payroll.advances);
    const bonus = toNumber(payload.bonus ?? payroll.bonus);
    const deductions = toNumber(payload.deductions ?? payroll.deductions);

    if ([workDays, dailyWage, monthlySalary, advances, bonus, deductions].some((value) => value < 0)) {
      setMessage("Obracun ne sme imati negativne iznose ili dane.");
      return;
    }

    setLoading(true);
    try {
      await adminUpdatePayroll(payroll.id, payload);
      setMessage("Obracun plate je sacuvan.");
      await refreshPayrolls();
    } catch {
      setMessage("Obracun plate nije sacuvan.");
    } finally {
      setLoading(false);
    }
  }

  const stats = [
    { label: "Radnici", value: summary.workers_total, tone: "bg-gray-950 text-white" },
    { label: "Aktivni", value: summary.active_workers, tone: "bg-sky-100 text-sky-900" },
    { label: "Za isplatu", value: money(summary.total_due), tone: "bg-amber-100 text-amber-900" },
    { label: "Isplaceno", value: money(summary.paid), tone: "bg-emerald-100 text-emerald-900" },
    { label: "Preostalo", value: money(summary.remaining), tone: "bg-white text-gray-900" },
  ];

  return (
    <section className="space-y-5">
      <ModuleHeader title="Radnici i plate" text="Evidencija radnika, mesecni obracuni i status isplate." />
      <StatsGrid stats={stats} />

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card className="border border-black/5 shadow-sm">
          <CardHeader className="flex-col items-start gap-1">
            <h3 className="text-lg font-semibold text-dark">{editingWorkerId ? "Izmena radnika" : "Dodaj radnika"}</h3>
          </CardHeader>
          <CardBody>
            <form className="grid gap-3" onSubmit={saveWorker}>
              <Input label="Ime i prezime" value={workerForm.full_name} onChange={(e) => setWorkerForm((p) => ({ ...p, full_name: e.target.value }))} />
              <Input label="Telefon" value={workerForm.phone} onChange={(e) => setWorkerForm((p) => ({ ...p, phone: e.target.value }))} />
              <Select label="Pozicija" selectedKeys={[workerForm.position]} onSelectionChange={(keys) => setWorkerForm((p) => ({ ...p, position: Array.from(keys).at(0)?.toString() as WorkerPosition }))}>
                {workerPositions.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
              <Select label="Tip obracuna" selectedKeys={[workerForm.payroll_type]} onSelectionChange={(keys) => setWorkerForm((p) => ({ ...p, payroll_type: Array.from(keys).at(0)?.toString() as WorkerPayrollType }))}>
                {payrollTypes.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
              <div className="grid gap-3 sm:grid-cols-2">
                <Input label="Default plata" type="number" min="0" value={workerForm.default_monthly_salary} onChange={(e) => setWorkerForm((p) => ({ ...p, default_monthly_salary: e.target.value }))} />
                <Input label="Default dnevnica" type="number" min="0" value={workerForm.default_daily_wage} onChange={(e) => setWorkerForm((p) => ({ ...p, default_daily_wage: e.target.value }))} />
              </div>
              <Select label="Status radnika" selectedKeys={[workerForm.is_active]} onSelectionChange={(keys) => setWorkerForm((p) => ({ ...p, is_active: Array.from(keys).at(0)?.toString() || "1" }))}>
                <SelectItem key="1">Aktivan</SelectItem>
                <SelectItem key="0">Neaktivan</SelectItem>
              </Select>
              <Textarea label="Napomena" minRows={2} value={workerForm.note} onChange={(e) => setWorkerForm((p) => ({ ...p, note: e.target.value }))} />
              <div className="grid gap-2 sm:grid-cols-2">
                <Button color="primary" type="submit" isDisabled={loading}>{editingWorkerId ? "Sacuvaj" : "Dodaj"}</Button>
                <Button type="button" variant="flat" onPress={resetWorkerForm}>Ocisti</Button>
              </div>
            </form>
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card className="border border-black/5 shadow-sm">
            <CardBody className="grid gap-3 sm:grid-cols-3">
              <Input label="Mesec" type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} />
              <Input label="Godina" type="number" min="2020" value={year} onChange={(e) => setYear(e.target.value)} />
              <Select label="Status isplate" selectedKeys={[payrollStatus]} onSelectionChange={(keys) => setPayrollStatus((Array.from(keys).at(0)?.toString() as PayrollStatus | "all") || "all")}>
                {payrollStatuses.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
              <Select label="Prikaz radnika" selectedKeys={[workerStatus]} onSelectionChange={(keys) => setWorkerStatus((Array.from(keys).at(0)?.toString() as "all" | "active" | "inactive") || "active")}>
                <SelectItem key="active">Aktivni</SelectItem>
                <SelectItem key="inactive">Neaktivni</SelectItem>
                <SelectItem key="all">Svi</SelectItem>
              </Select>
              <Button color="primary" className="sm:col-span-2" onPress={generatePayrolls} isDisabled={loading}>
                Napravi obracun za mesec
              </Button>
            </CardBody>
          </Card>

          <div className="grid gap-3">
            {workers.map((worker) => (
              <Card key={worker.id} className="border border-black/5 shadow-sm">
                <CardBody className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold text-dark">{worker.full_name}</h3>
                      <Chip size="sm" variant="flat" color={worker.is_active ? "success" : "default"}>{worker.is_active ? "Aktivan" : "Neaktivan"}</Chip>
                    </div>
                    <p className="mt-1 text-sm text-gray-600">
                      {labelFor(workerPositions, worker.position)} · {labelFor(payrollTypes, worker.payroll_type)}
                    </p>
                    <p className="mt-1 text-sm text-gray-500">
                      Plata: {money(worker.default_monthly_salary)} · Dnevnica: {money(worker.default_daily_wage)}
                    </p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2 md:w-56">
                    <Button size="sm" variant="flat" onPress={() => startEditWorker(worker)}>Izmeni</Button>
                    <Button size="sm" color="danger" variant="light" onPress={() => deactivateWorker(worker)} isDisabled={!worker.is_active}>Deaktiviraj</Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Card className="border border-black/5 shadow-sm">
        <CardHeader className="flex-col items-start">
          <h3 className="text-lg font-semibold text-dark">Obracuni plata</h3>
        </CardHeader>
        <CardBody className="grid gap-3">
          {payrolls.length === 0 ? (
            <p className="rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-600">Nema obracuna za izabrani mesec.</p>
          ) : (
            payrolls.map((payroll) => {
              const draftTotal = calculatePayrollTotal({
                payroll_type: (payrollValue(payroll, "payroll_type") as WorkerPayrollType) || "fixed",
                work_days: toNumber(payrollValue(payroll, "work_days") as number),
                daily_wage: toNumber(payrollValue(payroll, "daily_wage") as number),
                monthly_salary: toNumber(payrollValue(payroll, "monthly_salary") as number),
                advances: toNumber(payrollValue(payroll, "advances") as number),
                bonus: toNumber(payrollValue(payroll, "bonus") as number),
                deductions: toNumber(payrollValue(payroll, "deductions") as number),
              });
              return (
                <article key={payroll.id} className="rounded-xl border border-black/5 bg-white p-3">
                  <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(4,0.8fr)_1fr]">
                    <div>
                      <p className="font-semibold text-dark">{payroll.worker_name}</p>
                      <p className="text-sm text-gray-500">{monthNumber}/{yearNumber} · {money(draftTotal)}</p>
                    </div>
                    <Select size="sm" label="Tip" selectedKeys={[String(payrollValue(payroll, "payroll_type"))]} onSelectionChange={(keys) => updatePayrollDraft(payroll.id, "payroll_type", Array.from(keys).at(0)?.toString() || "fixed")}>
                      {payrollTypes.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
                    </Select>
                    <Input size="sm" label="Dani" type="number" min="0" value={String(payrollValue(payroll, "work_days") ?? 0)} onChange={(e) => updatePayrollDraft(payroll.id, "work_days", Number(e.target.value))} />
                    <Input size="sm" label="Dnevnica" type="number" min="0" value={String(payrollValue(payroll, "daily_wage") ?? 0)} onChange={(e) => updatePayrollDraft(payroll.id, "daily_wage", Number(e.target.value))} />
                    <Input size="sm" label="Plata" type="number" min="0" value={String(payrollValue(payroll, "monthly_salary") ?? 0)} onChange={(e) => updatePayrollDraft(payroll.id, "monthly_salary", Number(e.target.value))} />
                    <Select size="sm" label="Status" selectedKeys={[String(payrollValue(payroll, "status"))]} onSelectionChange={(keys) => updatePayrollDraft(payroll.id, "status", Array.from(keys).at(0)?.toString() || "unpaid")}>
                      {payrollStatuses.filter((item) => item.key !== "all").map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
                    </Select>
                  </div>
                  <div className="mt-3 grid gap-3 md:grid-cols-6">
                    <Input size="sm" label="Akontacije" type="number" min="0" value={String(payrollValue(payroll, "advances") ?? 0)} onChange={(e) => updatePayrollDraft(payroll.id, "advances", Number(e.target.value))} />
                    <Input size="sm" label="Bonus" type="number" min="0" value={String(payrollValue(payroll, "bonus") ?? 0)} onChange={(e) => updatePayrollDraft(payroll.id, "bonus", Number(e.target.value))} />
                    <Input size="sm" label="Odbici" type="number" min="0" value={String(payrollValue(payroll, "deductions") ?? 0)} onChange={(e) => updatePayrollDraft(payroll.id, "deductions", Number(e.target.value))} />
                    <Input size="sm" label="Datum isplate" type="date" value={String(payrollValue(payroll, "paid_at") ?? "").slice(0, 10)} onChange={(e) => updatePayrollDraft(payroll.id, "paid_at", e.target.value || null)} />
                    <Input size="sm" label="Napomena" value={String(payrollValue(payroll, "note") ?? "")} onChange={(e) => updatePayrollDraft(payroll.id, "note", e.target.value)} />
                    <Button size="sm" color="primary" onPress={() => savePayroll(payroll)} isDisabled={loading}>Sacuvaj</Button>
                  </div>
                </article>
              );
            })
          )}
        </CardBody>
      </Card>
    </section>
  );
}

function ExpensesModule({ isAuthenticated, month, year, monthNumber, yearNumber, setMonth, setYear, setMessage }: ModuleBaseProps) {
  const [expenses, setExpenses] = useState<CompanyExpense[]>([]);
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [category, setCategory] = useState<ExpenseCategory | "all">("all");
  const [summary, setSummary] = useState<{ total: number; by_category: Record<string, number> }>({ total: 0, by_category: {} });
  const [form, setForm] = useState(emptyExpenseForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;
    void refreshExpenses();
  }, [isAuthenticated, monthNumber, yearNumber, category]);

  useEffect(() => {
    if (!isAuthenticated) return;
    adminListWorkers({ status: "active" }).then((res) => setWorkers(res.data)).catch(() => setWorkers([]));
  }, [isAuthenticated]);

  async function refreshExpenses() {
    setLoading(true);
    try {
      const [list, totals] = await Promise.all([
        adminListExpenses({ month: monthNumber, year: yearNumber, category }),
        adminExpenseSummary(monthNumber, yearNumber),
      ]);
      setExpenses(list.data);
      setSummary(totals);
    } catch {
      setMessage("Neuspesno ucitavanje troskova.");
    } finally {
      setLoading(false);
    }
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyExpenseForm);
  }

  function startEdit(expense: CompanyExpense) {
    setEditingId(expense.id);
    setForm({
      expense_date: expense.expense_date,
      category: expense.category,
      description: expense.description,
      amount: String(expense.amount),
      payment_method: expense.payment_method,
      vendor: expense.vendor || "",
      worker_id: expense.worker_id ? String(expense.worker_id) : "",
      note: expense.note || "",
    });
  }

  async function saveExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!form.expense_date) {
      setMessage("Datum troska je obavezan.");
      return;
    }
    if (!form.category) {
      setMessage("Kategorija troska je obavezna.");
      return;
    }
    if (toNumber(form.amount) <= 0) {
      setMessage("Iznos troska mora biti veci od 0.");
      return;
    }
    const payload = {
      expense_date: form.expense_date,
      category: form.category,
      description: form.description.trim(),
      amount: toNumber(form.amount),
      payment_method: form.payment_method,
      vendor: form.vendor.trim() || null,
      worker_id: form.worker_id ? Number(form.worker_id) : null,
      note: form.note.trim() || null,
    };
    setLoading(true);
    try {
      if (editingId) {
        await adminUpdateExpense(editingId, payload);
        setMessage("Trosak je sacuvan.");
      } else {
        await adminCreateExpense(payload);
        setMessage("Trosak je dodat.");
      }
      resetForm();
      await refreshExpenses();
    } catch {
      setMessage("Trosak nije sacuvan.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteExpense(expense: CompanyExpense) {
    if (!window.confirm(`Obrisati trosak: ${expense.description || money(expense.amount)}?`)) return;
    setLoading(true);
    try {
      await adminDeleteExpense(expense.id);
      setMessage("Trosak je obrisan.");
      await refreshExpenses();
    } catch {
      setMessage("Trosak nije obrisan.");
    } finally {
      setLoading(false);
    }
  }

  const otherTotal = useMemo(() => {
    const highlighted = new Set(["fuel", "material", "payroll"]);
    return Object.entries(summary.by_category || {}).reduce((sum, [key, value]) => sum + (highlighted.has(key) ? 0 : toNumber(value)), 0);
  }, [summary]);

  const stats = [
    { label: "Ukupno", value: money(summary.total), tone: "bg-gray-950 text-white" },
    { label: "Gorivo", value: money(summary.by_category?.fuel), tone: "bg-amber-100 text-amber-900" },
    { label: "Materijal", value: money(summary.by_category?.material), tone: "bg-sky-100 text-sky-900" },
    { label: "Plate", value: money(summary.by_category?.payroll), tone: "bg-emerald-100 text-emerald-900" },
    { label: "Ostalo", value: money(otherTotal), tone: "bg-white text-gray-900" },
  ];

  return (
    <section className="space-y-5">
      <ModuleHeader title="Troskovi" text="Mesecna evidencija troskova, kategorije i nacin placanja." />
      <StatsGrid stats={stats} />

      <div className="grid gap-4 lg:grid-cols-[380px_1fr]">
        <Card className="border border-black/5 shadow-sm">
          <CardHeader className="flex-col items-start gap-1">
            <h3 className="text-lg font-semibold text-dark">{editingId ? "Izmena troska" : "Dodaj trosak"}</h3>
          </CardHeader>
          <CardBody>
            <form className="grid gap-3" onSubmit={saveExpense}>
              <Input label="Datum" type="date" value={form.expense_date} onChange={(e) => setForm((p) => ({ ...p, expense_date: e.target.value }))} />
              <Select label="Kategorija" selectedKeys={[form.category]} onSelectionChange={(keys) => setForm((p) => ({ ...p, category: Array.from(keys).at(0)?.toString() as ExpenseCategory }))}>
                {expenseCategories.filter((item) => item.key !== "all").map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
              <Input label="Opis" value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
              <Input label="Iznos" type="number" min="0.01" step="0.01" value={form.amount} onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))} />
              <Select label="Nacin placanja" selectedKeys={[form.payment_method]} onSelectionChange={(keys) => setForm((p) => ({ ...p, payment_method: Array.from(keys).at(0)?.toString() as ExpensePaymentMethod }))}>
                {expensePaymentMethods.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
              <Input label="Dobavljac / kome je placeno" value={form.vendor} onChange={(e) => setForm((p) => ({ ...p, vendor: e.target.value }))} />
              <Select label="Vezan radnik" selectedKeys={form.worker_id ? [form.worker_id] : []} onSelectionChange={(keys) => setForm((p) => ({ ...p, worker_id: Array.from(keys).at(0)?.toString() || "" }))}>
                {workers.map((worker) => <SelectItem key={String(worker.id)}>{worker.full_name}</SelectItem>)}
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
              <Input label="Mesec" type="number" min="1" max="12" value={month} onChange={(e) => setMonth(e.target.value)} />
              <Input label="Godina" type="number" min="2020" value={year} onChange={(e) => setYear(e.target.value)} />
              <Select label="Kategorija" selectedKeys={[category]} onSelectionChange={(keys) => setCategory((Array.from(keys).at(0)?.toString() as ExpenseCategory | "all") || "all")}>
                {expenseCategories.map((item) => <SelectItem key={item.key}>{item.label}</SelectItem>)}
              </Select>
            </CardBody>
          </Card>

          <Card className="border border-black/5 shadow-sm">
            <CardHeader className="flex-col items-start">
              <h3 className="text-lg font-semibold text-dark">Troskovi za mesec</h3>
            </CardHeader>
            <CardBody className="grid gap-3">
              {expenses.length === 0 ? (
                <p className="rounded-xl bg-gray-50 px-4 py-4 text-sm text-gray-600">Nema troskova za izabrani filter.</p>
              ) : (
                expenses.map((expense) => (
                  <article key={expense.id} className="rounded-xl border border-black/5 bg-white p-3">
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-semibold text-dark">{expense.description || labelFor(expenseCategories, expense.category)}</p>
                          <Chip size="sm" variant="flat">{labelFor(expenseCategories, expense.category)}</Chip>
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{expense.expense_date} · {labelFor(expensePaymentMethods, expense.payment_method)}</p>
                        <p className="mt-1 text-sm text-gray-500">
                          {expense.vendor ? `${expense.vendor} · ` : ""}{expense.worker_name ? `Radnik: ${expense.worker_name}` : ""}
                        </p>
                      </div>
                      <div className="grid gap-2 sm:grid-cols-3 md:w-80">
                        <p className="self-center text-right font-semibold text-dark sm:text-left md:text-right">{money(expense.amount)}</p>
                        <Button size="sm" variant="flat" onPress={() => startEdit(expense)}>Izmeni</Button>
                        <Button size="sm" color="danger" variant="light" onPress={() => deleteExpense(expense)}>Obrisi</Button>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </section>
  );
}

function ModuleHeader({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white px-5 py-5 shadow-sm">
      <p className="text-sm uppercase tracking-[0.2em] text-primary">Poslovanje</p>
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
