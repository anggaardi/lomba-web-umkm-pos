import Link from "next/link";
import { Store, ArrowRight, ShieldCheck, Zap, Globe } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center border-b sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center" href="/">
          <Store className="h-6 w-6 text-blue-600" />
          <span className="ml-2 text-xl font-bold tracking-tight">
            UMKM-Flow
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium hover:text-blue-600 transition-colors"
            href="/login"
          >
            Masuk
          </Link>
          <Link
            className="text-sm font-bold text-white bg-blue-600 px-4 py-2 rounded-full hover:bg-blue-700 transition-all shadow-sm"
            href="/register"
          >
            Mulai Sekarang
          </Link>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-linear-to-b from-blue-50 to-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="flex flex-col items-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none text-gray-900">
                  Digitalisasi UMKM Jadi Lebih{" "}
                  <span className="text-blue-600 italic">Smart</span>
                </h1>
                <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl/relaxed lg:text-2xl/relaxed mt-4">
                  Sistem manajemen bisnis terpadu untuk UMKM F&B. Dari POS
                  Kasir, Smart Inventory, hingga Marketplace WhatsApp otomatis.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                <Link
                  href="/register"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-blue-600 rounded-full hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  Daftar Sekarang
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-100 rounded-full hover:bg-gray-50 transition-all shadow-sm"
                >
                  Lihat Demo
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-white">
          <div className="container px-4 md:px-6 mx-auto">
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-center space-y-3 text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:shadow-md">
                <div className="p-3 bg-blue-100 rounded-full">
                  <Zap className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">POS Kasir Terpadu</h3>
                <p className="text-gray-500">
                  Input transaksi cepat dengan sistem Point of Sale yang
                  intuitif untuk staff kasir Anda.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:shadow-md">
                <div className="p-3 bg-green-100 rounded-full">
                  <ShieldCheck className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold">Smart Inventory</h3>
                <p className="text-gray-500">
                  Stok bahan baku terpotong otomatis berdasarkan resep setiap
                  kali ada penjualan (Smart Recipe).
                </p>
              </div>
              <div className="flex flex-col items-center space-y-3 text-center p-6 rounded-2xl bg-gray-50 border border-gray-100 transition-all hover:shadow-md">
                <div className="p-3 bg-purple-100 rounded-full">
                  <Globe className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Digital Marketplace</h3>
                <p className="text-gray-500">
                  Buka toko online otomatis untuk pelanggan Anda dengan fitur
                  checkout langsung ke WhatsApp.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-gray-50">
        <p className="text-xs text-gray-500">
          © 2026 UMKM-Flow. Arena Inovasi Digital UMKM.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-xs hover:underline underline-offset-4 text-gray-500"
            href="#"
          >
            Syarat & Ketentuan
          </Link>
          <Link
            className="text-xs hover:underline underline-offset-4 text-gray-500"
            href="#"
          >
            Kebijakan Privasi
          </Link>
        </nav>
      </footer>
    </div>
  );
}
