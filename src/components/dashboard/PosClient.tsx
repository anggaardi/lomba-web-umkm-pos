"use client";

import { useMemo } from "react";
import type { PosClientProps, PosProduct } from "@/types/pos";
import { usePosState, useProductAvailability, useCartTotals } from "@/hooks";
import {
  CategoryFilter,
  ProductGrid,
  NewOrderPanel,
  CartPanel,
  PaymentModal,
  ReceiptModal,
  MobileBottomBar,
} from "@/components/pos";

export function PosClient({
  initialProducts,
  categories,
  ingredients,
  defaultBranchId,
  posConfig,
  tenant,
}: PosClientProps) {
  const state = usePosState(defaultBranchId, posConfig);
  const { productAvailability } = useProductAvailability(
    initialProducts,
    ingredients,
    state.cart
  );
  const { subtotal, taxAmount, serviceAmount, totalAmount, changeAmount } =
    useCartTotals(
      state.cart,
      posConfig,
      state.applyTax,
      state.applyService,
      state.paymentMethod,
      state.amountReceived
    );

  const filteredProducts = useMemo(() => {
    const term = state.searchTerm.trim().toLowerCase();
    return initialProducts.filter((product) => {
      const matchCategory =
        state.selectedCategoryId === "all" ||
        (product.categoryId && product.categoryId === state.selectedCategoryId);
      if (!matchCategory) return false;
      if (!term) return true;
      const name = product.name.toLowerCase();
      const desc = (product.description || "").toLowerCase();
      return name.includes(term) || desc.includes(term);
    });
  }, [initialProducts, state.searchTerm, state.selectedCategoryId]);

  const addToCart = (product: PosProduct) => {
    state.setCart((prev) => {
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

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      state.setCart((prev) =>
        prev.filter((item) => item.product.id !== productId)
      );
      return;
    }
    state.setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const handleSubmit = async () => {
    if (state.cart.length === 0) return;
    state.setIsSubmitting(true);
    state.setError(null);
    try {
      const response = await fetch("/api/pos/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: state.cart.map((item) => ({
            productId: item.product.id,
            quantity: item.quantity,
          })),
          branchId: state.selectedBranchId,
          paymentMethod: state.paymentMethod,
          applyTax: state.applyTax && posConfig.taxPercent > 0,
          applyServiceCharge:
            state.applyService && posConfig.serviceChargePercent > 0,
          tableNumber: state.tableNumber,
          customerName: state.customerName,
          orderType: state.orderType,
        }),
      });
      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Gagal membuat transaksi");
      }
      const data = await response.json();
      state.setLastTransaction({
        id: data.transaction.id,
        orderNumber:
          data.transaction.transactionNumber ||
          data.transaction.id.slice(-6).toUpperCase(),
        items: state.cart.map((item) => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
        })),
        subtotal,
        taxAmount,
        serviceAmount,
        totalAmount,
        paymentMethod: state.paymentMethod,
        amountReceived:
          state.paymentMethod === "CASH" ? state.amountReceived : totalAmount,
        changeAmount,
        createdAt: new Date().toLocaleString("id-ID"),
      });
      state.setCart([]);
      state.setAmountReceived(0);
      state.setTableNumber("");
      state.setCustomerName("");
      state.setShowPaymentModal(false);
      state.setShowReceipt(true);
    } catch (e) {
      state.setError(
        e instanceof Error
          ? e.message
          : "Terjadi kesalahan saat menyimpan transaksi"
      );
      setTimeout(() => state.setError(null), 5000);
    } finally {
      state.setIsSubmitting(false);
    }
  };

  const validateAndSubmit = () => {
    if (state.cart.length === 0) {
      state.setError("Keranjang belanja masih kosong.");
      return;
    }
    if (
      state.paymentMethod === "CASH" &&
      state.amountReceived < totalAmount
    ) {
      state.setError(
        `Uang yang diterima kurang Rp ${(totalAmount - state.amountReceived).toLocaleString()}`
      );
      return;
    }
    handleSubmit();
  };

  const handleCheckout = () => {
    if (state.cart.length === 0) {
      state.setError("Keranjang belanja masih kosong.");
      return;
    }
    state.setShowPaymentModal(true);
    state.setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 relative font-sans lg:h-[calc(100vh-120px)] lg:overflow-hidden">
      <PaymentModal
        isOpen={state.showPaymentModal}
        onClose={() => state.setShowPaymentModal(false)}
        paymentMethod={state.paymentMethod}
        onPaymentMethodChange={state.setPaymentMethod}
        amountReceived={state.amountReceived}
        onAmountReceivedChange={state.setAmountReceived}
        changeAmount={changeAmount}
        isSubmitting={state.isSubmitting}
        onSubmit={validateAndSubmit}
      />

      <ReceiptModal
        isOpen={state.showReceipt}
        onClose={() => state.setShowReceipt(false)}
        transaction={state.lastTransaction}
        posConfig={posConfig}
        tenant={tenant}
      />

      {/* Main Content */}
      <div className="lg:col-span-3 space-y-6 lg:overflow-y-auto lg:pr-4 lg:pb-10 scrollbar-thin scrollbar-thumb-gray-200">
        {/* Banner */}
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

        <CategoryFilter
          categories={categories}
          selectedCategoryId={state.selectedCategoryId}
          onSelectCategory={state.setSelectedCategoryId}
        />

        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-800">Orders Menu</h2>
          <ProductGrid
            products={filteredProducts}
            productAvailability={productAvailability}
            onAddToCart={addToCart}
          />
        </div>
      </div>

      {/* Right Sidebar */}
      <div className="lg:col-span-1 flex flex-col h-full lg:min-h-0 gap-4 lg:pb-4">
        <NewOrderPanel
          isCollapsed={state.isNewOrderPanelCollapsed}
          onToggleCollapse={() =>
            state.setIsNewOrderPanelCollapsed(!state.isNewOrderPanelCollapsed)
          }
          tableNumber={state.tableNumber}
          onTableNumberChange={state.setTableNumber}
          customerName={state.customerName}
          onCustomerNameChange={state.setCustomerName}
          orderType={state.orderType}
          onOrderTypeChange={state.setOrderType}
        />

        <CartPanel
          cart={state.cart}
          onUpdateQuantity={updateQuantity}
          subtotal={subtotal}
          taxAmount={taxAmount}
          serviceAmount={serviceAmount}
          totalAmount={totalAmount}
          applyTax={state.applyTax}
          applyService={state.applyService}
          posConfig={posConfig}
          error={state.error}
          isSubmitting={state.isSubmitting}
          onCheckout={handleCheckout}
        />
      </div>

      <MobileBottomBar
        totalAmount={totalAmount}
        cartItemCount={state.cart.reduce(
          (sum, item) => sum + item.quantity,
          0
        )}
        isSubmitting={state.isSubmitting}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
