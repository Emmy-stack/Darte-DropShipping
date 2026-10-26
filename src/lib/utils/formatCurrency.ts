/**
 * Format a numeric value in Nigerian Naira (NGN)
 * Example: 12500 -> "₦12,500"
 */
export function formatNaira(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₦0";
  }
  return `₦${Math.round(amount).toLocaleString("en-NG")}`;
}

/**
 * Calculate potential profit dynamically
 * Suggested Selling Price - Supplier Cost
 */
export function calculateProfit(sellingPrice: number, costPrice: number): number {
  return Math.max(0, sellingPrice - costPrice);
}

/**
 * Calculate profit margin percentage
 * ((Selling Price - Supplier Cost) / Selling Price) * 100
 */
export function calculateMarginPercentage(sellingPrice: number, costPrice: number): number {
  if (!sellingPrice || sellingPrice <= 0) return 0;
  const profit = sellingPrice - costPrice;
  return Math.round((profit / sellingPrice) * 100);
}
