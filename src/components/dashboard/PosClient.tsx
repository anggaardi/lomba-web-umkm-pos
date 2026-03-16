"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import { 
  ShoppingCart, 
  Loader2, 
  Printer, 
  X, 
  CheckCircle2, 
  Star, 
  Clock, 
  Bike, 
  ChevronRight, 
  Banknote, 
  ShoppingBag, 
  Utensils, 
  Minus, 
  Plus,
  ChevronDown,
  AlertTriangle
} from "lucide-react";
import { useSession } from "next-auth/react";

type PosProduct = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  categoryId?: string | null;
  recipes: {
    ingredientId: string;
    quantity: number;
  }[];
};

type PosIngredient = {
  id: string;
  name: string;
  stock: number;
  unit: string;
};

type PosBranch = {
  id: string;
  name: string;
  address: string;
};

type PosCategory = {
  id: string;
  name: string;
  image?: string | null;
};

type PosConfig = {
  taxPercent: number;
  serviceChargePercent: number;
  receiptHeader?: string;
  receiptFooter?: string;
};

type PosClientProps = {
  initialProducts: PosProduct[];
  categories: PosCategory[];
  ingredients: PosIngredient[];
  branches: PosBranch[];
  defaultBranchId: string;
  posConfig: PosConfig;
  tenant: {
    name: string;
    address: string;
    whatsappNumber: string;
  };
};

type CartItem = {
  product: PosProduct;
  quantity: number;
};

type LastTransaction = {
  id: string;
  orderNumber: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  taxAmount: number;
  serviceAmount: number;
  totalAmount: number;
  paymentMethod: string;
  amountReceived: number;
  changeAmount: number;
  createdAt: string;
};

export function PosClient({
  initialProducts,
  categories,
  ingredients,
  defaultBranchId,
  posConfig,
  tenant,
}: PosClientProps) {
  const { data: session } = useSession();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | "all">(
    "all"
  );
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    defaultBranchId
  );
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "QRIS" | "DEBIT">(
    "CASH"
  );
  const [applyTax, setApplyTax] = useState(posConfig.taxPercent > 0);
  const [applyService, setApplyService] = useState(
    posConfig.serviceChargePercent > 0
  );
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [showReceipt, setShowReceipt] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<LastTransaction | null>(null);

  // New states for redesign
  const [tableNumber, setTableNumber] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [orderType, setOrderType] = useState<"DINE_IN" | "AWAY" | "GRAB">("DINE_IN");
  const [isNewOrderPanelCollapsed, setIsNewOrderPanelCollapsed] = useState(false);
  const [productLimit, setProductLimit] = useState(12);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);

  const quickAmounts = [50000, 100000, 150000, 200000];

  const addToCart = (product: PosProduct) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const virtualIngredientStock = useMemo(() => {
    const stockMap = new Map(ingredients.map((ing) => [ing.id, ing.stock]));
    cart.forEach((item) => {
      item.product.recipes.forEach((recipe) => {
        const currentStock = stockMap.get(recipe.ingredientId) || 0;
        stockMap.set(recipe.ingredientId, currentStock - recipe.quantity * item.quantity);
      });
    });
    return stockMap;
  }, [ingredients, cart]);

  const productAvailability = useMemo(() => {
    const availabilityMap = new Map<string, number>();
    initialProducts.forEach((product) => {
      if (product.recipes.length === 0) {
        availabilityMap.set(product.id, 999);
        return;
      }
      let maxPortions = Infinity;
      product.recipes.forEach((recipe) => {
        const remainingStock = virtualIngredientStock.get(recipe.ingredientId) || 0;
        const possiblePortions = Math.floor(remainingStock / recipe.quantity);
        maxPortions = Math.min(maxPortions, possiblePortions);
      });
      availabilityMap.set(product.id, maxPortions < 0 ? 0 : maxPortions);
    });
    return availabilityMap;
  }, [initialProducts, virtualIngredientStock]);

  const taxAmount = applyTax && posConfig.taxPercent > 0 ? (subtotal * posConfig.taxPercent) / 100 : 0;
  const serviceAmount = applyService && posConfig.serviceChargePercent > 0 ? (subtotal * posConfig.serviceChargePercent) / 100 : 0;
  const totalAmount = subtotal + taxAmount + serviceAmount;
  const changeAmount = paymentMethod === "CASH" ? Math.max(0, amountReceived - totalAmount) : 0;

  const filteredProducts = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return initialProducts.filter((product) => {
      const matchCategory = selectedCategoryId === "all" || (product.categoryId && product.categoryId === selectedCategoryId);
      if (!matchCategory) return false;
      if (!term) return true;
      const name = product.name.toLowerCase();
      const desc = (product.description || "").toLowerCase();
      return name.includes(term) || desc.includes(term);
    });
  }, [initialProducts, searchTerm, selectedCategoryId]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, productLimit);
  }, [filteredProducts, productLimit]);

  // Reset limit when filters change
  useEffect(() => {
    setProductLimit(12);
  }, [searchTerm, selectedCategoryId]);

  // Infinite Scroll Logic
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && filteredProducts.length > productLimit && !isLoadingMore) {
          setIsLoadingMore(true);
          // Simulate loading delay for better UX
          setTimeout(() => {
            setProductLimit((prev) => prev + 12);
            setIsLoadingMore(false);
          }, 600);
        }
      },
      { threshold: 1.0, rootMargin: "100px" }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [filteredProducts.length, productLimit, isLoadingMore]);

  const handleSubmit = async () => {
    if (cart.length === 0) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch("/api/pos/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: cart.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
          branchId: selectedBranchId,
          paymentMethod,
          applyTax: applyTax && posConfig.taxPercent > 0,
          applyServiceCharge: applyService && posConfig.serviceChargePercent > 0,
          tableNumber,
          customerName,
          orderType
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Gagal membuat transaksi");
      }
      const data = await response.json();
      setLastTransaction({
        id: data.transaction.id,
        orderNumber: data.transaction.id.slice(-6).toUpperCase(),
        items: cart.map(item => ({ name: item.product.name, quantity: item.quantity, price: item.product.price })),
        subtotal,
        taxAmount,
        serviceAmount,
        totalAmount,
        paymentMethod,
        amountReceived: paymentMethod === "CASH" ? amountReceived : totalAmount,
        changeAmount,
        createdAt: new Date().toLocaleString('id-ID'),
      });
      setSuccessMessage("Transaksi berhasil disimpan.");
      setCart([]);
      setAmountReceived(0);
      setTableNumber("");
      setCustomerName("");
      setShowPaymentModal(false);
      setShowReceipt(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan saat menyimpan transaksi");
      // Sembunyikan error setelah 5 detik agar tidak mengganggu UI selamanya
      setTimeout(() => setError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateAndSubmit = () => {
    if (cart.length === 0) {
      setError("Keranjang belanja masih kosong.");
      return;
    }
    if (paymentMethod === "CASH" && amountReceived < totalAmount) {
      setError(`Uang yang diterima kurang Rp ${(totalAmount - amountReceived).toLocaleString()}`);
      return;
    }
    handleSubmit();
  };

  const handlePrint = () => window.print();

  const categoryImages: Record<string, string> = {
    "FOOD": "https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=200&auto=format&fit=crop",
    "DRINK": "https://images.unsplash.com/photo-1544145945-f904253d0c7b?q=80&w=200&auto=format&fit=crop",
    "PASTA": "https://images.unsplash.com/photo-1473093226795-af9932fe5855?q=80&w=200&auto=format&fit=crop",
    "DESSERT": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?q=80&w=200&auto=format&fit=crop",
    "SOUP": "https://images.unsplash.com/photo-1547592110-803993f2851d?q=80&w=200&auto=format&fit=crop",
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 relative font-sans xl:h-[calc(100vh-120px)] xl:overflow-hidden">
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #receipt-content,
          #receipt-content * {
            visibility: visible;
          }
          #receipt-content {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 80mm !important;
            margin: 0 !important;
            padding: 5mm !important;
          }
          @page {
            size: 80mm auto;
            margin: 0;
          }
        }
      `}</style>

      {/* Modal Payment */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-8 space-y-8">
              {/* Header */}
              <div className="flex items-center gap-3">
                <div className="w-[3px] h-6 bg-orange-500 rounded-full"></div>
                <h3 className="text-lg font-bold tracking-wider text-gray-800 uppercase">
                  PEMBAYARAN
                </h3>
              </div>

              {/* Payment Methods */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { id: "CASH" as const, label: "Cash", icon: Banknote },
                  { id: "QRIS" as const, label: "QRIS", icon: ShoppingBag },
                  { id: "DEBIT" as const, label: "GRAB", icon: Bike },
                ].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    className={`flex flex-col items-center justify-center py-6 rounded-2xl border-2 transition-all ${
                      paymentMethod === method.id
                        ? "bg-orange-50 border-orange-500 text-orange-500 shadow-sm"
                        : "bg-white border-gray-100 text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    <method.icon
                      className={`h-8 w-8 mb-3 ${
                        paymentMethod === method.id
                          ? "text-orange-500"
                          : "text-gray-300"
                      }`}
                      strokeWidth={1.5}
                    />
                    <span className="text-xs font-bold">{method.label}</span>
                  </button>
                ))}
              </div>

              {/* Amount Input */}
              <div className="space-y-4">
                <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
                  UANG DITERIMA
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <span className="text-gray-400 font-bold text-sm">Rp</span>
                  </div>
                  <input
                    type="number"
                    value={amountReceived || ""}
                    onChange={(e) => setAmountReceived(Number(e.target.value))}
                    placeholder="Masukan Nominal..."
                    className="w-full bg-gray-50 border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold text-gray-700 placeholder:text-gray-300 focus:ring-2 focus:ring-orange-100 focus:border-orange-200 transition-all"
                  />
                </div>

                {/* Quick Amounts */}
                <div className="grid grid-cols-4 gap-2">
                  {quickAmounts.map((amt) => (
                    <button
                      key={amt}
                      onClick={() => setAmountReceived(amt)}
                      className="py-2.5 rounded-xl border border-gray-100 text-[10px] font-bold text-gray-500 hover:bg-orange-50 hover:border-orange-100 hover:text-orange-500 transition-all"
                    >
                      {amt / 1000}K
                    </button>
                  ))}
                </div>
              </div>

              {/* Change Display */}
              <div className="bg-orange-50/50 rounded-2xl p-6 border border-orange-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Banknote className="h-5 w-5 text-orange-500" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                      Kembalian
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Masukan uang diterima
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg font-black text-orange-500">
                    {paymentMethod === "CASH"
                      ? `Rp ${changeAmount.toLocaleString()}`
                      : "Rp -"}
                  </span>
                </div>
              </div>

              {/* Submit / Cancel Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={validateAndSubmit}
                  disabled={isSubmitting}
                  className="w-full py-5 rounded-[1.5rem] font-bold text-sm text-white bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-500/20 flex items-center justify-center gap-3 transform active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      <CheckCircle2 className="h-5 w-5" />
                      <span>Konfirmasi Pembayaran</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="w-full py-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Receipt */}
      {showReceipt && lastTransaction && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 print:p-0 print:bg-white print:static animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200 print:shadow-none print:rounded-none print:max-w-none">
            <div className="bg-[#FF724C] p-5 flex items-center justify-between text-white print:hidden">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-bold text-lg">Berhasil</span>
              </div>
              <button
                onClick={() => setShowReceipt(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div
              className="p-8 space-y-4 font-mono text-sm text-gray-800 print:p-0"
              id="receipt-content"
            >
              <div className="text-center space-y-1">
                <h2 className="text-xl font-bold uppercase">{tenant.name}</h2>
                <p className="text-xs leading-tight opacity-70">
                  {tenant.address}
                </p>
                <p className="text-xs opacity-70">
                  WA: {tenant.whatsappNumber}
                </p>
                {posConfig.receiptHeader && (
                  <p className="text-xs italic pt-2 border-t border-gray-100 mt-2">
                    {posConfig.receiptHeader}
                  </p>
                )}
              </div>
              <div className="border-t border-dashed border-gray-300 pt-4 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Order: #{lastTransaction.orderNumber}</span>
                  <span>{lastTransaction.createdAt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Metode: {lastTransaction.paymentMethod}</span>
                </div>
              </div>
              <div className="border-t border-dashed border-gray-300 pt-4 space-y-3">
                {lastTransaction.items.map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between font-bold text-sm">
                      <span>{item.name}</span>
                    </div>
                    <div className="flex justify-between text-xs opacity-70">
                      <span>
                        {item.quantity} x {item.price.toLocaleString()}
                      </span>
                      <span>
                        {(item.quantity * item.price).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-dashed border-gray-300 pt-4 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{lastTransaction.subtotal.toLocaleString()}</span>
                </div>
                {lastTransaction.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Pajak ({posConfig.taxPercent}%)</span>
                    <span>{lastTransaction.taxAmount.toLocaleString()}</span>
                  </div>
                )}
                {lastTransaction.serviceAmount > 0 && (
                  <div className="flex justify-between">
                    <span>Service ({posConfig.serviceChargePercent}%)</span>
                    <span>
                      {lastTransaction.serviceAmount.toLocaleString()}
                    </span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-base pt-3 border-t border-gray-100">
                  <span>TOTAL</span>
                  <span>Rp {lastTransaction.totalAmount.toLocaleString()}</span>
                </div>
              </div>
              <div className="border-t border-dashed border-gray-300 pt-4 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Bayar</span>
                  <span>{lastTransaction.amountReceived.toLocaleString()}</span>
                </div>
                {lastTransaction.paymentMethod === "CASH" && (
                  <div className="flex justify-between font-bold text-emerald-600">
                    <span>Kembali</span>
                    <span>{lastTransaction.changeAmount.toLocaleString()}</span>
                  </div>
                )}
              </div>
              <div className="text-center pt-8 space-y-1 italic text-xs border-t border-dashed border-gray-300 opacity-60">
                <p className="whitespace-pre-line">{posConfig.receiptFooter}</p>
                <p className="not-italic font-bold pt-2">SmartBizFNB</p>
              </div>
            </div>
            <div className="p-6 bg-gray-50 border-t flex gap-4 print:hidden">
              <button
                onClick={handlePrint}
                className="flex-1 inline-flex items-center justify-center px-4 py-3 bg-gray-900 text-white rounded-xl font-bold text-sm hover:bg-black transition-all transform active:scale-95"
              >
                <Printer className="h-4 w-4 mr-2" />
                Struk
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                className="flex-1 px-4 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all transform active:scale-95"
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area - Scrollable on Desktop */}
      <div className="xl:col-span-3 space-y-6 xl:overflow-y-auto xl:pr-4 xl:pb-10 scrollbar-thin scrollbar-thumb-gray-200">
        {/* Restored Banner - More compact */}
        <div className="relative h-48 md:h-60 w-full overflow-hidden rounded-[2rem] shadow-lg group">
          <img
            src="https://images.unsplash.com/photo-1513104890138-7c749659a591?q=80&w=1200&auto=format&fit=crop"
            alt="Promotion Banner"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-8">
            <h3 className="text-white text-2xl font-bold mb-1">
              Paling Laris Minggu Ini!
            </h3>
            <p className="text-white/90 text-sm">
              Nikmati diskon spesial untuk kategori Pizza.
            </p>
          </div>
        </div>

        {/* Restored 'Categories of' section - More compact */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-800">Categories of</h2>
            <button className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-orange-500 transition-colors group">
              View All
              <div className="flex items-center justify-center w-5 h-5 rounded-full bg-orange-500 text-white transition-transform group-hover:translate-x-1">
                <ChevronRight className="h-3 w-3" />
              </div>
            </button>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            <button
              onClick={() => setSelectedCategoryId("all")}
              className={`shrink-0 relative w-32 h-20 rounded-xl overflow-hidden group transition-all ${
                selectedCategoryId === "all" ? "ring-2 ring-orange-500" : ""
              }`}
            >
              <div className="absolute inset-0 bg-gray-800 transition-opacity group-hover:opacity-80"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-black text-sm tracking-widest uppercase">
                  ALL
                </span>
              </div>
            </button>
            {categories.map((cat: PosCategory) => {
              const imageUrl =
                cat.image ||
                categoryImages[cat.name.toUpperCase()] ||
                "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=200&auto=format&fit=crop";
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className={`shrink-0 relative w-32 h-20 rounded-xl overflow-hidden group transition-all ${
                    selectedCategoryId === cat.id
                      ? "ring-2 ring-orange-500"
                      : ""
                  }`}
                >
                  <img
                    src={imageUrl}
                    className="absolute inset-0 w-full h-full object-cover"
                    alt={cat.name}
                  />
                  <div className="absolute inset-0 bg-black/40 transition-opacity group-hover:opacity-60"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-white font-black text-sm tracking-widest uppercase">
                      {cat.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid - Improved density and colors */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Orders Menu</h2>
          {initialProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-20 text-center border border-dashed border-gray-200">
              <p className="text-gray-400 font-medium italic">
                Belum ada produk tersedia.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {displayedProducts.map((product) => {
                const availablePortions =
                  productAvailability.get(product.id) || 0;
                const isOutOfStock = availablePortions <= 0;
                return (
                  <button
                    key={product.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(product)}
                    className={`group relative bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md hover:-translate-y-1 text-left w-full flex flex-col ${
                      isOutOfStock
                        ? "opacity-60 grayscale cursor-not-allowed"
                        : "cursor-pointer active:scale-95"
                    }`}
                  >
                    <div className="relative aspect-[4/3] w-full overflow-hidden p-2">
                      <img
                        src={
                          product.image ||
                          "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop"
                        }
                        alt={product.name}
                        className="w-full h-full object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3 pt-1 space-y-1 flex-1 flex flex-col">
                      <h4 className="text-sm font-bold text-gray-800 line-clamp-1 leading-tight group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h4>
                      <p className="text-[10px] font-bold text-emerald-500">
                        {availablePortions} Tersedia
                      </p>
                      <div className="pt-1">
                        <p className="text-sm font-black text-orange-500">
                          IDR {product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}

              {/* Product Skeletons when loading more */}
              {isLoadingMore &&
                Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={`skeleton-${i}`}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 w-full flex flex-col animate-pulse"
                  >
                    <div className="relative aspect-[4/3] w-full p-2">
                      <div className="w-full h-full bg-gray-100 rounded-xl"></div>
                    </div>
                    <div className="p-3 pt-1 space-y-2 flex-1 flex flex-col">
                      <div className="h-3.5 bg-gray-100 rounded w-3/4"></div>
                      <div className="h-2.5 bg-gray-50 rounded w-1/2"></div>
                      <div className="pt-1 mt-auto">
                        <div className="h-3.5 bg-gray-100 rounded w-1/3"></div>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}

          {/* Infinite Scroll Trigger & Loading State */}
          <div
            ref={observerTarget}
            className="h-20 flex items-center justify-center"
          >
            {filteredProducts.length > productLimit ? (
              !isLoadingMore && (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <ChevronDown className="h-5 w-5 animate-bounce" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Gulir untuk memuat lebih banyak
                  </span>
                </div>
              )
            ) : filteredProducts.length > 0 ? (
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Semua produk telah ditampilkan
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {/* Right Sidebar - Viewport Locked on Desktop */}
      <div className="xl:col-span-1 flex flex-col h-full xl:min-h-0 gap-4 xl:pb-4">
        {/* Restored NEW ORDER PANEL - More compact */}
        <div className="bg-white rounded-[1.5rem] shadow-lg overflow-hidden border border-gray-50 shrink-0">
          <button
            onClick={() =>
              setIsNewOrderPanelCollapsed(!isNewOrderPanelCollapsed)
            }
            className="w-full bg-linear-to-r from-orange-400 to-orange-500 p-4 text-white text-left"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  New Order
                </h3>
              </div>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${
                  isNewOrderPanelCollapsed ? "rotate-180" : ""
                }`}
              />
            </div>
          </button>

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              isNewOrderPanelCollapsed ? "max-h-0" : "max-h-[400px]"
            }`}
          >
            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Table
                  </label>
                  <input
                    type="text"
                    placeholder="No Table"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    className="w-full bg-orange-50 border-0 rounded-lg px-3 py-2 text-xs font-bold text-orange-600 placeholder:text-orange-200 focus:ring-1 focus:ring-orange-100"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1">
                    Name
                  </label>
                  <input
                    type="text"
                    placeholder="Customer"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full bg-orange-50 border-0 rounded-lg px-3 py-2 text-xs font-bold text-orange-600 placeholder:text-orange-200 focus:ring-1 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest ml-1 mb-1.5 block">
                  Order Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "DINE_IN", label: "Dine in", icon: Utensils },
                    { id: "AWAY", label: "Away", icon: ShoppingBag },
                    { id: "GRAB", label: "Grab", icon: Bike },
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => {
                        setOrderType(type.id as "DINE_IN" | "AWAY" | "GRAB");
                        setIsNewOrderPanelCollapsed(true);
                      }}
                      className={`flex flex-col items-center justify-center py-2 rounded-lg border transition-all ${
                        orderType === type.id
                          ? "bg-orange-50 border-orange-200 text-orange-500 shadow-sm"
                          : "bg-white border-gray-100 text-gray-400 hover:border-orange-100 hover:bg-orange-50/30"
                      }`}
                    >
                      <type.icon
                        className={`h-3.5 w-3.5 mb-1 ${
                          orderType === type.id
                            ? "text-orange-500"
                            : "text-gray-400"
                        }`}
                      />
                      <span className="text-[9px] font-bold">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-[1.5rem] shadow-lg overflow-hidden flex flex-col flex-1 border border-gray-50 min-h-0 relative">
          {/* Item Pesanan Header */}
          <div className="p-5 pb-3 flex items-center justify-between shrink-0 border-b border-gray-50">
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-6 bg-orange-500 rounded-full"></div>
              <h3 className="text-sm font-bold tracking-wider text-gray-600 uppercase">
                ITEM PESANAN
              </h3>
            </div>
            <div className="px-3 py-1.5 bg-red-50 text-orange-500 text-[10px] font-bold rounded-full">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} item
            </div>
          </div>

          {/* Cart Items List - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 scrollbar-thin scrollbar-thumb-gray-100 hover:scrollbar-thumb-gray-200">
            {cart.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40">
                <ShoppingBag className="h-10 w-10 mb-2 text-gray-200" />
                <p className="text-xs font-bold italic text-gray-400 uppercase tracking-widest">
                  Belum ada pesanan
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center gap-4 group"
                >
                  <div className="h-14 w-14 rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100">
                    <img
                      src={
                        item.product.image ||
                        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=100&auto=format&fit=crop"
                      }
                      className="w-full h-full object-cover"
                      alt={item.product.name}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-gray-800 leading-tight mb-1">
                      {item.product.name}
                    </p>
                    <p className="text-xs font-bold text-orange-500">
                      IDR {item.product.price.toLocaleString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                      className="h-6 w-6 flex items-center justify-center rounded-full bg-gray-400 text-white font-bold hover:bg-gray-500 transition-colors shadow-sm active:scale-90"
                    >
                      <Minus className="h-3 w-3" strokeWidth={4} />
                    </button>
                    <span className="w-4 text-center text-xs font-bold text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      className="h-6 w-6 flex items-center justify-center rounded-full bg-orange-500 text-white font-bold hover:bg-orange-600 transition-colors shadow-sm active:scale-90"
                    >
                      <Plus className="h-3 w-3" strokeWidth={4} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Section - Fixed at the bottom of sidebar */}
          <div className="p-6 bg-white border-t border-gray-100 space-y-4 shrink-0 shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
            <div className="space-y-2 font-bold">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-gray-500 uppercase tracking-tighter">
                  Subtotal
                </span>
                <span className="text-gray-800">
                  IDR {subtotal.toLocaleString()}
                </span>
              </div>
              {applyService && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 uppercase tracking-tighter">
                    Service
                  </span>
                  <span className="text-gray-800">
                    IDR {serviceAmount.toLocaleString()}
                  </span>
                </div>
              )}
              {applyTax && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-500 uppercase tracking-tighter">
                    Pajak ({posConfig.taxPercent}%)
                  </span>
                  <span className="text-gray-800">
                    IDR {taxAmount.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm font-bold text-gray-900 pt-3 mt-1 border-t border-gray-50">
                <span className="uppercase tracking-wider">Total</span>
                <span className="text-lg text-orange-600">
                  IDR {totalAmount.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Error Message and Button */}
            <div className="pt-2">
              {error && (
                <div className="mb-3 p-2 bg-red-50 border border-red-100 rounded-xl animate-bounce">
                  <p className="text-[10px] font-bold text-red-500 text-center">
                    {error}
                  </p>
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  if (cart.length === 0) {
                    setError("Keranjang belanja masih kosong.");
                    return;
                  }
                  setShowPaymentModal(true);
                  setError(null);
                }}
                disabled={isSubmitting || cart.length === 0}
                className="w-full py-4 rounded-2xl font-bold text-sm text-white bg-linear-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-orange-500/30 flex items-center justify-center gap-3 transform active:scale-[0.98]"
              >
                <Banknote className="h-5 w-5" />
                <span>Lanjut Pembayaran</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Bottom Bar for Mobile - Always Visible */}
      <div className="xl:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center justify-between gap-4 max-w-2xl mx-auto">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Total Tagihan
            </span>
            <span className="text-lg font-black text-gray-900 leading-none">
              IDR {totalAmount.toLocaleString()}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              if (cart.length === 0) {
                setError("Keranjang belanja masih kosong.");
                return;
              }
              setShowPaymentModal(true);
              setError(null);
            }}
            disabled={isSubmitting || cart.length === 0}
            className="flex-1 py-4 px-6 rounded-2xl font-bold text-sm text-white bg-gradient-to-r from-orange-400 to-orange-600 hover:from-orange-500 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-orange-500/30 flex items-center justify-center gap-2 transform active:scale-[0.98]"
          >
            <Banknote className="h-5 w-5" />
            <span>
              Bayar ({cart.reduce((sum, item) => sum + item.quantity, 0)})
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
