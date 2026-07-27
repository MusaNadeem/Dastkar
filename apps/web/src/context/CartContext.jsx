// Cart = local state persisted to localStorage (per the MVP plan: client-side cart).
import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const KEY = 'dastkar_cart';

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(items));
  }, [items]);

  const add = (product, qty = 1) => {
    setItems((prev) => {
      const stock = product.stockQuantity ?? 99;
      const existing = prev.find((i) => i.productId === product.id);
      if (existing) {
        return prev.map((i) =>
          i.productId === product.id ? { ...i, qty: Math.min(stock, i.qty + qty) } : i
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          title: product.title,
          price: Number(product.price),
          image: product.imageUrls?.[0] || null,
          shopName: product.shops?.name || '',
          stock,
          qty: Math.min(stock, qty),
        },
      ];
    });
  };

  const setQty = (productId, qty) =>
    setItems((prev) =>
      prev.map((i) => (i.productId === productId ? { ...i, qty: Math.max(1, Math.min(i.stock, qty)) } : i))
    );
  const remove = (productId) => setItems((prev) => prev.filter((i) => i.productId !== productId));
  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((s, i) => s + i.price * i.qty, 0);

  const value = useMemo(() => ({ items, add, setQty, remove, clear, count, total }), [items, count, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
