"use client";

import { useState } from "react";
import { Store, ShoppingCart, ShoppingBag, Loader2 } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: string | number; // Decimal from Prisma
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
  const [customerName, setCustomerName] = useState("Tamu Meja 12");
  const [isCartOpen, setIsCartOpen] = useState(false);

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

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev.map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      });
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter(item => item.product.id !== productId));
  };

  const subtotalAmount = cart.reduce((sum, item) => sum + (Number(item.product.price) * item.quantity), 0);
  const serviceAmount = Math.round(subtotalAmount * 0.05);
  const taxAmount = Math.round(subtotalAmount * 0.11);
  const totalAmount = subtotalAmount + serviceAmount + taxAmount;
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
          <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
            <ShoppingCart className="h-6 w-6 text-gray-600" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 rounded-full flex items-center justify-center animate-pulse">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-linear-to-r from-blue-600 to-blue-700 text-white py-16 px-4">
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

      {/* Cart Full View */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-[#F9F9F9] z-50 overflow-y-auto">
          {/* Top Bar for Cart */}
          <div className="px-6 pt-8 pb-4 flex items-center justify-between">
            <div className="flex items-center space-x-2 text-[#9A3412] font-semibold">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 10 0 4m0-4a2 2 0 11 0 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
              </svg>
              <span>Meja 12</span>
            </div>
            <div className="flex items-center space-x-4 text-gray-500">
              <button onClick={() => setIsCartOpen(false)} className="hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="px-6 pb-32 max-w-lg mx-auto">
            <h2 className="text-[32px] font-bold text-gray-900 tracking-tight mb-1">Pesanan Anda</h2>
            <p className="text-gray-600 mb-8">{tenant.name} — <span className="text-[#C2410B] font-semibold">Meja 12</span></p>

            {cart.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl">
                <p className="text-gray-500">Keranjang masih kosong</p>
                <button onClick={() => setIsCartOpen(false)} className="mt-4 text-[#C2410B] font-semibold">
                  Kembali ke Menu
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item.product.id} className="flex gap-4 border-b border-gray-100 pb-6">
                    <div className="w-24 h-24 bg-gray-200 rounded-2xl overflow-hidden shrink-0 relative">
                      {item.product.image ? (
                        <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <Store className="w-8 h-8 opacity-50" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-1 gap-2">
                          <h3 className="font-bold text-gray-900 text-lg leading-tight">{item.product.name}</h3>
                          <span className="font-bold text-gray-900 whitespace-nowrap">Rp {Number(item.product.price).toLocaleString('id-ID')}</span>
                        </div>
                        <p className="text-sm text-gray-500 line-clamp-2 leading-snug">{item.product.description || "Menu pilihan terbaik dari kedai kami."}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center bg-[#F3F3F3] rounded-full px-1">
                          <button 
                            onClick={() => updateQuantity(item.product.id, -1)}
                            className="w-8 h-8 flex items-center justify-center text-[#C2410B] text-xl pb-0.5"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-semibold text-gray-900">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.product.id, 1)}
                            className="w-8 h-8 flex items-center justify-center text-[#C2410B] text-xl pb-0.5"
                          >
                            +
                          </button>
                        </div>
                        <button 
                          onClick={() => removeFromCart(item.product.id)}
                          className="flex items-center text-red-500 text-sm font-semibold tracking-wide"
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          HAPUS
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Summary Card */}
                <div className="bg-[#F6F6F6] rounded-[24px] p-6 mt-8">
                  <h3 className="font-bold text-lg text-gray-900 mb-4">Ringkasan Pesanan</h3>
                  
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-semibold text-gray-900">Rp {subtotalAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>Service (5%)</span>
                      <span className="font-semibold text-gray-900">Rp {serviceAmount.toLocaleString('id-ID')}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>PPN (11%)</span>
                      <span className="font-semibold text-gray-900">Rp {taxAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-900 text-lg">Total<br/>Pembayaran</span>
                      <span className="font-extrabold text-[#C2410B] text-2xl">Rp {totalAmount.toLocaleString('id-ID')}</span>
                    </div>
                  </div>

                  <div className="bg-[#F0EEEB] rounded-xl p-4 flex gap-3 text-[#7B6149]">
                    <div className="w-5 h-5 rounded-full bg-[#C2410B] text-white flex items-center justify-center shrink-0 mt-0.5">
                      <span className="italic font-serif text-sm font-bold">i</span>
                    </div>
                    <p className="text-[11px] font-bold tracking-wider leading-relaxed">
                      PESANAN AKAN LANGSUNG TERHUBUNG KE POS SISTEM KASIR MEJA 12
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action */}
          {cart.length > 0 && (
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-white via-white to-transparent">
              <div className="max-w-lg mx-auto bg-white p-2 rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
                <button 
                  onClick={handleCheckout}
                  disabled={isLoading}
                  className="w-full bg-[#C2410B] text-white font-bold text-lg py-5 rounded-[24px] flex items-center justify-center hover:bg-[#A33609] active:scale-[0.98] transition-all"
                >
                  {isLoading ? (
                    <Loader2 className="animate-spin h-6 w-6" />
                  ) : (
                    <>
                      Lanjut ke Pembayaran
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
