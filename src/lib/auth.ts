import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import type { Role } from "@prisma/client";
import { NextResponse } from "next/server";

export class AuthError extends Error {
  constructor(public message: string, public status: number = 401) {
    super(message);
    this.name = "AuthError";
  }

  toResponse() {
    return NextResponse.json({ error: this.message }, { status: this.status });
  }
}

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
 * Wajib login: melempar AuthError jika tidak ada user yang login.
 */
export async function requireUser() {
  const user = await getCurrentUser();

  if (!user) {
    throw new AuthError("Unauthorized: user not authenticated", 401);
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
    throw new AuthError("Forbidden: user has no tenant", 403);
  }

  if (!user.tenant.isActive) {
    throw new AuthError("Forbidden: tenant is inactive", 403);
  }

  return {
    user,
    tenant: user.tenant,
  };
}

/**
 * Wajib memiliki role tertentu (single atau multiple).
 */
export async function requireRole(allowed: Role | Role[]) {
  const user = await requireUser();
  const allowedRoles = Array.isArray(allowed) ? allowed : [allowed];

  if (!allowedRoles.includes(user.role)) {
    throw new AuthError("Forbidden: insufficient role", 403);
  }

  return user;
}

/**
 * Helper to handle auth errors in route handlers
 */
export function handleAuthError(error: unknown) {
  if (error instanceof AuthError) {
    return error.toResponse();
  }
  console.error("Internal Error:", error);
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
