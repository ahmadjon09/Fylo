/**
 * Production-grade calculation utilities
 * All monetary values handled as numbers with 2-decimal precision at display layer,
 * but stored as float with high precision.
 */

export const calcUnitCost = ({ purchasePrice, intlShipping, localShipping, quantity }) => {
  const q = Number(quantity);
  if (!q || q <= 0) return 0;
  const total = Number(purchasePrice || 0) + Number(intlShipping || 0) + Number(localShipping || 0);
  return total / q;
};

export const calcSaleMetrics = ({ unitCost, sellingPrice, quantity }) => {
  const qty = Number(quantity) || 0;
  const cost = Number(unitCost) * qty;
  const revenue = Number(sellingPrice) * qty;
  const profit = revenue - cost;
  return { cost, revenue, profit };
};

export const round2 = (n) => Math.round((Number(n) + Number.EPSILON) * 100) / 100;

export const sanitizeNumber = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
