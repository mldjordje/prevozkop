import AdminAuthGate from "@/components/admin/admin-auth-gate";
import AdminDashboardHome from "@/components/admin/admin-dashboard-home";

export default function AdminLandingPage() {
  return (
    <AdminAuthGate>
      <AdminDashboardHome />
    </AdminAuthGate>
  );
}
