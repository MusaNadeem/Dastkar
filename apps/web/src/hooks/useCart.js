// Cart state (CLAUDE.md Sprint 2). Local state for MVP; persisted cart is a nice-to-have.
// TODO (Sprint 2): implement add/remove/updateQty with stock clamping + totals.
import { useState } from 'react';

export function useCart() {
  const [items, setItems] = useState([]); // [{ productId, title, price, qty, stock }]

  const add = (_product) => {/* clamp qty to stock, dedupe by productId */};
  const remove = (_productId) => {/* ... */};
  const updateQty = (_productId, _qty) => {/* 1 <= qty <= stock */};
  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);

  return { items, add, remove, updateQty, total };
}
