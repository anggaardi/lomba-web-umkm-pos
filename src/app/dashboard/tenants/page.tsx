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

  const tenants = await prisma.tenant.findMany({
    orderBy: { createdAt: "desc" },
  });

  return <TenantsClient tenants={tenants} />;
}

