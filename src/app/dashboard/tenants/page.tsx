import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";

export default async function TenantsAdminPage() {
  // Hanya SUPER_ADMIN yang boleh mengakses halaman ini
  try {
    await requireRole(Role.SUPER_ADMIN);
  } catch {
    redirect("/dashboard");
  }

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Tenant</h1>
        <p className="text-gray-500 text-sm">
          Kelola daftar UMKM yang terdaftar di platform UMKM-Flow.
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Nama Tenant</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Slug</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">WhatsApp</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Status</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600">Bergabung</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {tenants.map((tenant) => (
              <tr key={tenant.id}>
                <td className="px-4 py-3">
                  <div className="font-medium text-gray-900">{tenant.name}</div>
                  <div className="text-xs text-gray-400">{tenant.id}</div>
                </td>
                <td className="px-4 py-3 text-gray-700">{tenant.slug}</td>
                <td className="px-4 py-3 text-gray-700">{tenant.whatsappNumber}</td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      tenant.isActive
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    {tenant.isActive ? "Aktif" : "Nonaktif"}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700 text-xs">
                  {tenant.createdAt.toLocaleDateString("id-ID", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
            {tenants.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm italic">
                  Belum ada tenant yang terdaftar.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

