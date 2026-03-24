import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Navbar } from "@/components/dashboard/Navbar";
import { MobileBottomNav } from "@/components/dashboard/MobileBottomNav";
import { MobileHeader } from "@/components/dashboard/MobileHeader";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#F8F7F4]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar session={session} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Mobile Header */}
        <MobileHeader />

        {/* Desktop Navbar */}
        <div className="hidden lg:block">
          <Navbar session={session} />
        </div>

        <main className="p-4 lg:p-8 flex-1 overflow-y-auto pb-24 lg:pb-8">
          {children}
        </main>

        {/* Mobile Navigation */}
        <MobileBottomNav />
      </div>
    </div>
  );
}
