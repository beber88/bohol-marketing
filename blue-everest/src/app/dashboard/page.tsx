import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DashboardAuth } from "@/components/dashboard/dashboard-auth";

export default function DashboardPage() {
  return (
    <DashboardAuth>
      <DashboardShell />
    </DashboardAuth>
  );
}
