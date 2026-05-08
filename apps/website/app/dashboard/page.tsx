import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default async function DashboardPage() {
  const session = await auth();
  
  if (!session?.user) {
    redirect("/signin");
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Research Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Welcome back, {session.user.name}! Manage your research activities here.
          </p>
        </div>
      </div>

      <StatsCards />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardOverview />
        </div>
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>
    </div>
  );
}
