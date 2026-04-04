"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ExternalLink,
  Plus,
  Search,
  RefreshCw,
  Edit,
  Trash2,
  X,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Tenant = {
  id: string;
  name: string;
  slug: string;
  whatsappNumber: string | null;
  isActive: boolean;
  createdAt: string; 
};

interface TenantsClientProps {
  tenants: Tenant[];
}

const defaultForm = {
  shopName: "",
  slug: "",
  whatsappNumber: "",
  adminName: "",
  adminEmail: "",
  adminPassword: "",
};

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function TenantsClient({ tenants: initialTenants }: TenantsClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // List state
  const [tenants, setTenants] = useState<Tenant[]>(initialTenants);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("Name");
  const [statusFilter, setStatusFilter] = useState("All");

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(defaultForm);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Delete state
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // --- Computed filtered list ---
  const filteredTenants = tenants.filter((t) => {
    const value = activeTab === "Code" ? t.slug : t.name;
    const matchSearch = value.toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      statusFilter === "All"
        ? true
        : statusFilter === "Active"
        ? t.isActive
        : !t.isActive;
    return matchSearch && matchStatus;
  });

  // --- Form handlers ---
  function handleShopNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    const name = e.target.value;
    setForm((prev) => ({
      ...prev,
      shopName: name,
      slug: slugify(name),
    }));
  }

  function handleFieldChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function openModal() {
    setForm(defaultForm);
    setFormError("");
    setFormSuccess("");
    setShowModal(true);
  }

  function closeModal() {
    if (isSubmitting) return;
    setShowModal(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/admin/corporates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.message || "Terjadi kesalahan");
        return;
      }

      // Tambahkan tenant baru ke list lokal
      setTenants((prev) => [data.tenant, ...prev]);
      setFormSuccess(`Corporate "${data.tenant.name}" berhasil dibuat!`);

      setTimeout(() => {
        setShowModal(false);
        setFormSuccess("");
      }, 1500);
    } catch {
      setFormError("Gagal terhubung ke server. Coba lagi.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleRefresh() {
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleToggleStatus(tenant: Tenant) {
    const newStatus = !tenant.isActive;
    setTenants((prev) =>
      prev.map((t) => (t.id === tenant.id ? { ...t, isActive: newStatus } : t))
    );

    try {
      const res = await fetch(`/api/admin/corporates/${tenant.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!res.ok) {
        // Revert on error
        setTenants((prev) =>
          prev.map((t) =>
            t.id === tenant.id ? { ...t, isActive: tenant.isActive } : t
          )
        );
      }
    } catch {
      setTenants((prev) =>
        prev.map((t) =>
          t.id === tenant.id ? { ...t, isActive: tenant.isActive } : t
        )
      );
    }
  }

  async function handleDelete(tenantId: string) {
    if (!confirm("Yakin ingin menghapus corporate ini? Semua data akan ikut terhapus.")) return;
    setDeletingId(tenantId);
    try {
      const res = await fetch(`/api/admin/corporates/${tenantId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTenants((prev) => prev.filter((t) => t.id !== tenantId));
      } else {
        alert("Gagal menghapus corporate.");
      }
    } catch {
      alert("Gagal terhubung ke server.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Corporate Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage all corporate tenants and their configurations
          </p>
        </div>
        <button
          onClick={openModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark text-white rounded-lg text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Corporate
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Search Type Tabs */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg">
              <button
                onClick={() => setActiveTab("Code")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === "Code"
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Code
              </button>
              <button
                onClick={() => setActiveTab("Name")}
                className={cn(
                  "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                  activeTab === "Name"
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                Name
              </button>
            </div>

            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-4 pr-10 py-2 w-full sm:w-64 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-3 ml-0 sm:ml-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Status
              </span>
              <div className="flex items-center p-1 bg-slate-100 rounded-lg">
                {["All", "Active", "Inactive"].map((s) => (
                  <button
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={cn(
                      "px-4 py-1.5 text-sm font-medium rounded-md transition-all",
                      statusFilter === s
                        ? "bg-white text-primary shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-600">
              Total Results:{" "}
              <span className="font-bold text-slate-900">{filteredTenants.length}</span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={isPending}
              className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors disabled:opacity-50"
              title="Refresh data"
            >
              <RefreshCw className={cn("w-4 h-4", isPending && "animate-spin")} />
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F8FAFC] text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">NO</th>
                <th className="px-6 py-4">CODE</th>
                <th className="px-6 py-4">CORPORATE NAME</th>
                <th className="px-6 py-4">PRIMARY DOMAIN</th>
                <th className="px-6 py-4">STATUS</th>
                <th className="px-6 py-4">JOIN DATE</th>
                <th className="px-6 py-4 text-center">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTenants.map((tenant, index) => {
                const code = tenant.slug.substring(0, 3).toUpperCase();
                return (
                  <tr
                    key={tenant.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-md">
                        {code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded bg-primary-light text-primary">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-slate-800">{tenant.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 w-fit rounded-full text-slate-500 text-xs">
                        {tenant.slug}.umkmflow.com
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleStatus(tenant)}
                        title="Klik untuk toggle status"
                        className="cursor-pointer"
                      >
                        {tenant.isActive ? (
                          <div className="flex items-center gap-1.5 px-3 py-1 w-fit bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold hover:bg-emerald-100 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            ACTIVE
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 px-3 py-1 w-fit bg-slate-100 text-slate-600 rounded-full text-xs font-bold hover:bg-slate-200 transition-colors">
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            INACTIVE
                          </div>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {new Date(tenant.createdAt).toLocaleDateString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleToggleStatus(tenant)}
                          className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-blue-600 hover:border-blue-200 transition-colors"
                          title="Toggle status"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(tenant.id)}
                          disabled={deletingId === tenant.id}
                          className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:border-red-200 transition-colors disabled:opacity-50"
                          title="Hapus corporate"
                        >
                          {deletingId === tenant.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredTenants.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    No corporate tenants found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Corporate Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-light text-primary">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Add Corporate</h2>
                  <p className="text-xs text-slate-500">
                    Buat tenant baru beserta akun admin-nya
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                disabled={isSubmitting}
                className="p-2 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
              {/* Success / Error Alert */}
              {formSuccess && (
                <div className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                  {formSuccess}
                </div>
              )}
              {formError && (
                <div className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  {formError}
                </div>
              )}

              {/* Section: Info Perusahaan */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Informasi Perusahaan
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nama Corporate <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="shopName"
                      value={form.shopName}
                      onChange={handleShopNameChange}
                      placeholder="contoh: Kopi Senja"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Slug / URL Toko <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
                      <span className="px-3 py-2.5 bg-slate-50 text-slate-400 text-sm border-r border-slate-200 shrink-0">
                        umkmflow.com/
                      </span>
                      <input
                        type="text"
                        name="slug"
                        value={form.slug}
                        onChange={handleFieldChange}
                        placeholder="kopi-senja"
                        required
                        pattern="^[a-z0-9-]+$"
                        title="Hanya huruf kecil, angka, dan tanda hubung"
                        className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-white"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Hanya huruf kecil, angka, dan tanda hubung (-)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nomor WhatsApp <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      name="whatsappNumber"
                      value={form.whatsappNumber}
                      onChange={handleFieldChange}
                      placeholder="contoh: 081234567890"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Section: Akun Admin */}
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Akun Admin Corporate
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nama Admin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="adminName"
                      value={form.adminName}
                      onChange={handleFieldChange}
                      placeholder="contoh: Budi Santoso"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email Admin <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      name="adminEmail"
                      value={form.adminEmail}
                      onChange={handleFieldChange}
                      placeholder="admin@kopigems.com"
                      required
                      className="w-full px-3 py-2.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Password Admin <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="adminPassword"
                        value={form.adminPassword}
                        onChange={handleFieldChange}
                        placeholder="Minimal 6 karakter"
                        required
                        minLength={6}
                        className="w-full px-3 py-2.5 pr-10 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((p) => !p)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !!formSuccess}
                  className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-dark text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      Buat Corporate
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
