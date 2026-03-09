import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";

/**
 * Mengambil session NextAuth saat ini (server-side).
 */
export async function getCurrentSession() {
  return getServerSession(authOptions);
}

/**
 * Mengambil user yang sedang login beserta relasi penting dari database.
 * Menggunakan `session.user.id` untuk query.
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      tenant: true,
      branch: true,
    },
  });

  return user;
}

/**
 * Wajib login: melempar error jika tidak ada user yang login.
 * Cocok dipakai di server component atau route handler yang butuh auth.
 */
export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("Unauthorized: user not authenticated");
  }

  return user;
}

/**
 * Wajib punya tenant aktif:
 * - Pastikan user login
 * - Pastikan user punya tenant
 * - Pastikan tenant dalam status aktif
 */
export async function requireTenant() {
  const user = await requireUser();

  if (!user.tenantId || !user.tenant) {
    throw new Error("Forbidden: user has no tenant");
  }

  if (!user.tenant.isActive) {
    throw new Error("Forbidden: tenant is inactive");
  }

  return {
    user,
    tenant: user.tenant,
  };
}

/**
 * Wajib memiliki role tertentu (single atau multiple).
 * Contoh:
 * - await requireRole("SUPER_ADMIN")
 * - await requireRole(["ADMIN", "SUPER_ADMIN"])
 */
export async function requireRole(allowed: Role | Role[]) {
  const user = await requireUser();
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

  if (!allowedRoles.includes(user.role)) {
    throw new Error("Forbidden: insufficient role");
  }

  return user;
}

