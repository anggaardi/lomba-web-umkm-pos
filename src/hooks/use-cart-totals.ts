import { useMemo } from "react";
import type { CartItem, PosConfig } from "@/types/pos";

export function useCartTotals(
  cart: CartItem[],
  posConfig: PosConfig,
  applyTax: boolean,
  applyService: boolean,
  paymentMethod: "CASH" | "QRIS" | "DEBIT",
  amountReceived: number
) {
  const subtotal = useMemo(
    () => cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0),
    [cart]
  );

  const taxAmount = useMemo(
    () =>
      applyTax && posConfig.taxPercent > 0
        ? (subtotal * posConfig.taxPercent) / 100
        : 0,
    [applyTax, posConfig.taxPercent, subtotal]
  );

  const serviceAmount = useMemo(
    () =>
      applyService && posConfig.serviceChargePercent > 0
        ? (subtotal * posConfig.serviceChargePercent) / 100
        : 0,
    [applyService, posConfig.serviceChargePercent, subtotal]
  );

  const totalAmount = useMemo(
    () => subtotal + taxAmount + serviceAmount,
    [subtotal, taxAmount, serviceAmount]
  );

  const changeAmount = useMemo(
    () => (paymentMethod === "CASH" ? Math.max(0, amountReceived - totalAmount) : 0),
    [paymentMethod, amountReceived, totalAmount]
  );

  return { subtotal, taxAmount, serviceAmount, totalAmount, changeAmount };
}
