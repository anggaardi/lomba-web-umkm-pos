"use client";

import { useState } from "react";
import { Store, ShoppingCart, ShoppingBag, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: any; // Decimal from Prisma
  image: string | null;
}

interface Tenant {
  id: string;
  name: string;
  whatsappNumber: string;
  address: string | null;
  slug: string;
}

export default function MarketplaceUI({ tenant, initialProducts }: { tenant: Tenant, initialProducts: Product[] }) {
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [customerName, setCustomerName] = useState("");

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!customerName) {
      alert("Silakan masukkan nama Anda");
      return;
    }

    setIsLoading(true);

    try {
      // 1. Catat Order Intent ke DB kita
      const response = await fetch("/api/order/intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerWhatsapp: "", // Diisi nanti jika perlu
          totalAmount,
          orderDetails: cart.map(item => ({
            productId: item.product.id,
            name: item.product.name,
            quantity: item.quantity,
            price: Number(item.product.price)
          })),
          tenantId: tenant.id
        }),
      });

      const { orderId } = await response.json();

      // 2. Generate WhatsApp Message
      const message = `Halo ${tenant.name}! Saya ingin memesan:\n\n` +
        cart.map(item => `- ${item.product.name} (x${item.quantity})`).join("\n") +
        `\n\nTotal: Rp ${totalAmount.toLocaleString()}\n` +
        `Atas Nama: ${customerName}\n` +
        `Order ID: ${orderId}\n\n` +
        `Mohon info pembayarannya ya, terima kasih!`;

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/${tenant.whatsappNumber}?text=${encodedMessage}`;

      // 3. Buka WhatsApp
      window.open(waUrl, "_blank");
    } catch (err) {
      console.error("Checkout error:", err);
      alert("Terjadi kesalahan saat memproses pesanan");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="bg-blue-600 p-2 rounded-lg mr-3 shadow-md">
              <Store className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">{tenant.name}</h1>
          </div>
          <div className="relative p-2 bg-gray-100 rounded-full">
            <ShoppingCart className="h-6 w-6 text-gray-600" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl font-black mb-4 leading-tight">Selamat Datang di {tenant.name}</h2>
          <p className="text-blue-100 text-lg max-w-2xl mx-auto font-medium opacity-90">
            {tenant.address || "Belanja online jadi lebih mudah dan cepat melalui WhatsApp Marketplace kami."}
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center mb-8">
          <ShoppingBag className="h-6 w-6 text-blue-600 mr-2" />
          <h3 className="text-2xl font-bold text-gray-900">Menu Kami</h3>
        </div>
        
        {initialProducts.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl shadow-sm border border-gray-100">
            <p className="text-gray-500 font-medium">Belum ada produk yang tersedia saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {initialProducts.map((product) => (
              <div key={product.id} className="group bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="aspect-square bg-gray-50 relative overflow-hidden">
                  {/* Placeholder for Product Image */}
                  <div className="absolute inset-0 flex items-center justify-center text-gray-200 group-hover:scale-110 transition-transform duration-500">
                    <Store className="h-16 w-16" />
                  </div>
                  <div className="absolute bottom-2 right-2">
                    <button 
                      onClick={() => addToCart(product)}
                      className="p-3 bg-blue-600 text-white rounded-xl shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                    >
                      <ShoppingCart className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-blue-600 transition-colors">{product.name}</h4>
                  <p className="text-sm text-gray-500 mb-4 line-clamp-2 min-h-[40px] leading-relaxed">{product.description || "Rasakan kenikmatan menu andalan kami yang satu ini."}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-blue-600 text-xl">Rp {Number(product.price).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Sticky Bottom Bar for Checkout */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 inset-x-0 bg-white/80 backdrop-blur-md border-t p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center space-x-4">
              <input
                type="text"
                placeholder="Masukkan Nama Anda..."
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium"
              />
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Pesanan</p>
                <p className="text-2xl font-black text-gray-900 tracking-tight">Rp {totalAmount.toLocaleString()}</p>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={isLoading}
                className="flex-1 bg-green-600 text-white font-black py-4 px-8 rounded-2xl flex items-center justify-center shadow-lg hover:bg-green-700 active:scale-95 transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin h-6 w-6 mr-2" />
                ) : (
                  <svg className="h-6 w-6 mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.588-5.946 0-6.556 5.332-11.888 11.888-11.888 3.176 0 6.161 1.237 8.404 3.48s3.481 5.229 3.481 8.404c0 6.556-5.332 11.888-11.888 11.888-2.01 0-3.986-.51-5.731-1.472l-6.253 1.641zm6.052-4.144c1.657.983 3.324 1.477 5.093 1.477 5.409 0 9.811-4.402 9.811-9.811 0-5.409-4.402-9.811-9.811-9.811-2.617 0-5.078 1.019-6.929 2.871s-2.871 4.312-2.871 6.929c0 1.834.536 3.633 1.55 5.215l-1.012 3.693 3.791-.994z"/>
                  </svg>
                )}
                {isLoading ? "Memproses..." : "Pesan via WhatsApp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
