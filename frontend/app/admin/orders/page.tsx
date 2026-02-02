import Link from "next/link";
import AdminPanel from "@/components/admin/admin-panel";

export default function AdminOrdersPage() {
  return (
    <div className="content-section py-6 space-y-6">
      <Link href="/admin" className="text-sm font-semibold text-primary">
        Nazad na admin meni
      </Link>
      <AdminPanel defaultSection="orders" showSectionSwitcher={false} />
    </div>
  );
}
