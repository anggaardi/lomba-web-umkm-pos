import { redirect } from "next/navigation";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

export default async function SystemAdminPage() {
  // Hanya SUPER_ADMIN yang boleh mengakses halaman ini
  try {
    await requireRole(Role.SUPER_ADMIN);
  } catch {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
        <p className="text-gray-500 text-sm">
          Area kontrol internal platform (hanya untuk pemilik platform).
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Info Platform</h2>
          <p className="text-xs text-gray-500 mb-3">
            Placeholder untuk informasi status sistem: versi aplikasi, status database, dsb.
          </p>
          <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
            <li>Versi Aplikasi: v0.1.0 (prototype lomba).</li>
            <li>Status Database: Online (single Postgres instance).</li>
            <li>Mode: Development / Demo.</li>
          </ul>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-semibold text-gray-800 mb-2">Roadmap Admin</h2>
          <p className="text-xs text-gray-500 mb-3">
            Catatan fitur lanjutan untuk panel super admin.
          </p>
          <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
            <li>Monitoring performa tenant (request per tenant, error rate).</li>
            <li>Moderasi dan suspend tenant.</li>
            <li>Broadcast pengumuman ke seluruh tenant.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

