import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

export default async function SubscriptionsAdminPage() {
  // Hanya SUPER_ADMIN yang boleh mengakses halaman ini
  try {
    await requireRole(Role.SUPER_ADMIN);
  } catch {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Langganan</h1>
        <p className="text-gray-500 text-sm">
          Halaman ini akan digunakan untuk mengelola paket dan status langganan tenant.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-sm text-gray-600">
        <p className="mb-2 font-semibold">Status Saat Ini</p>
        <p className="text-gray-500">
          Sistem langganan belum diimplementasikan. Halaman ini menjadi placeholder untuk:
        </p>
        <ul className="mt-2 list-disc list-inside space-y-1 text-gray-500">
          <li>Daftar paket (Basic, Pro, Enterprise).</li>
          <li>Status pembayaran dan masa aktif tenant.</li>
          <li>Histori billing dan upgrade/downgrade paket.</li>
        </ul>
      </div>
    </div>
  );
}

