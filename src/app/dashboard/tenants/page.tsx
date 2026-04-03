import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { Role } from "@prisma/client";
import TenantsClient from "./TenantsClient";

export default async function TenantsAdminPage() {
  // Hanya SUPER_ADMIN yang boleh mengakses halaman ini
  try {
    await requireRole(Role.SUPER_ADMIN);
  } catch {
    redirect("/dashboard");
  }

  const rawTenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      whatsappNumber: true,
      isActive: true,
      createdAt: true,
    },
  });

  // Serialize Date → string untuk Client Component
  const tenants = rawTenants.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
  }));

  return <TenantsClient tenants={tenants} />;
}

