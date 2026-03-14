import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth";
import { 
  TrendingUp, 
  Users, 
  Package, 
  ShoppingCart,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Building2,
  Globe,
  Activity,
  ExternalLink
} from "lucide-react";

export default async function DashboardPage() {
  const session = await getCurrentSession();

  if (!session) {
    redirect("/login");
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN";
  
  // 1. Ambil data Tenant untuk Owner
  const tenant = !isSuperAdmin ? await prisma.tenant.findUnique({
    where: { id: session.user.tenantId || "" }
  }) : null;

  // Default stats for Owner/Staff
  let stats = [
    { label: "Total Penjualan", value: "Rp 0", icon: TrendingUp, trend: "+0%", trendUp: true },
    { label: "Total Transaksi", value: "0", icon: ShoppingCart, trend: "+0%", trendUp: true },
    { label: "Produk Aktif", value: "0", icon: Package, trend: "0", trendUp: true },
    { label: "Staff", value: "0", icon: Users, trend: "0", trendUp: true },
  ];

  if (isSuperAdmin) {
    const tenantCount = await prisma.tenant.count();
    const userCount = await prisma.user.count();
    
    stats = [
      { label: "Total UMKM", value: tenantCount.toString(), icon: Building2, trend: "+12%", trendUp: true },
      { label: "Total Pengguna", value: userCount.toString(), icon: Users, trend: "+5%", trendUp: true },
      { label: "Pendapatan Platform", value: "Rp 0", icon: TrendingUp, trend: "+0%", trendUp: true },
      { label: "Status Sistem", value: "Online", icon: Activity, trend: "100%", trendUp: true },
    ];
  } else {
    const tenantId = session.user.tenantId;
    if (tenantId) {
      const productCount = await prisma.product.count({ where: { tenantId } });
      const transactionCount = await prisma.transaction.count({ where: { tenantId } });
      const staffCount = await prisma.user.count({ where: { tenantId, role: "STAFF" } });
      
      stats = [
        { label: "Total Penjualan", value: "Rp 0", icon: TrendingUp, trend: "+0%", trendUp: true },
        { label: "Total Transaksi", value: transactionCount.toString(), icon: ShoppingCart, trend: "+0%", trendUp: true },
        { label: "Produk Aktif", value: productCount.toString(), icon: Package, trend: "0", trendUp: true },
        { label: "Staff", value: staffCount.toString(), icon: Users, trend: "0", trendUp: true },
      ];
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900">
            {isSuperAdmin ? "Platform Overview" : `Selamat Datang, ${session.user.name}`}
          </h1>
          {!isSuperAdmin && tenant && (
            <Link 
              href={`/s/${tenant.slug}`} 
              target="_blank"
              className="flex items-center text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-lg transition-all"
            >
              Lihat Toko Online
              <ExternalLink className="ml-2 h-4 w-4" />
            </Link>
          )}
        </div>
        <p className="text-gray-600 font-medium">
          {isSuperAdmin 
            ? "Ringkasan performa platform UMKM-Flow hari ini." 
            : `Kelola bisnis ${tenant?.name || "UMKM"} Anda dari sini.`}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 rounded-lg">
                <stat.icon className="h-6 w-6 text-blue-600" />
              </div>
              <div className={`flex items-center text-xs font-medium ${stat.trendUp ? "text-green-600" : "text-red-600"}`}>
                {stat.trend}
                {stat.trendUp ? <ArrowUpRight className="ml-1 h-3 w-3" /> : <ArrowDownRight className="ml-1 h-3 w-3" />}
              </div>
            </div>
            <p className="text-sm font-semibold text-gray-600">{stat.label}</p>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity / Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b flex items-center justify-between">
            <h3 className="font-bold text-gray-900">
              {isSuperAdmin ? "Tenant Terbaru" : "Transaksi Terbaru"}
            </h3>
            <button className="text-sm font-semibold text-blue-600 hover:text-blue-500 transition-colors">Lihat Semua</button>
          </div>
          <div className="p-6">
            {isSuperAdmin ? (
              <div className="space-y-4">
                {/* Placeholder for Tenant List */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Building2 className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">Kedai Kopi Senja</p>
                      <p className="text-xs text-gray-600 font-medium">Mendaftar pada 5 Maret 2026</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Active</span>
                </div>
                <div className="flex items-center justify-center py-12 text-center text-gray-400 italic">
                  Belum ada tenant lain yang mendaftar hari ini.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="p-4 bg-gray-50 rounded-full mb-4">
                  <ShoppingCart className="h-8 w-8 text-gray-400" />
                </div>
                <p className="text-gray-600 font-bold">Belum ada transaksi hari ini.</p>
                <Link
                  href="/dashboard/pos"
                  className="mt-4 inline-flex items-center text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-lg hover:bg-blue-700 transition-all"
                >
                  Mulai Jualan di POS
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="font-bold text-gray-900">Aksi Cepat</h3>
          </div>
          <div className="p-6 space-y-3">
            {isSuperAdmin ? (
              <>
                <button className="w-full flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-left">
                  <Building2 className="h-5 w-5 mr-3 text-blue-600" />
                  Review Pendaftaran Baru
                </button>
                <button className="w-full flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-left">
                  <Globe className="h-5 w-5 mr-3 text-blue-600" />
                  Broadcasting Pengumuman
                </button>
                <button className="w-full flex items-center p-3 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors text-sm font-medium text-left">
                  <Activity className="h-5 w-5 mr-3 text-blue-600" />
                  Cek Log Server
                </button>
              </>
            ) : (
              <>
                <button className="w-full flex items-center p-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-all text-sm font-bold text-gray-800 text-left group">
                  <Package className="h-5 w-5 mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
                  Tambah Produk Baru
                </button>
                <button className="w-full flex items-center p-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-all text-sm font-bold text-gray-800 text-left group">
                  <Users className="h-5 w-5 mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
                  Undang Staff Kasir
                </button>
                <button className="w-full flex items-center p-3 rounded-lg border border-gray-100 hover:bg-blue-50 hover:border-blue-100 transition-all text-sm font-bold text-gray-800 text-left group">
                  <BarChart3 className="h-5 w-5 mr-3 text-blue-600 group-hover:scale-110 transition-transform" />
                  Buka Laporan Laba Rugi
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
