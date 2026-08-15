import Link from "next/link";
import AdminAuthGate from "@/components/admin/admin-auth-gate";
import AnalyticsDashboard from "@/components/admin/analytics-dashboard";

export default function AdminAnalyticsPage() {
  return (
    <div className="content-section py-6 space-y-6">
      <Link href="/admin" className="text-sm font-semibold text-primary">
        Nazad na admin meni
      </Link>
      <AdminAuthGate>
        <AnalyticsDashboard />
      </AdminAuthGate>
    </div>
  );
}
