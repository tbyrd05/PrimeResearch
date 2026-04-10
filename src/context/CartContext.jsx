import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);
const STORAGE_KEY = 'prime-research-cart';

function parsePrice(price) {
  return Number.parseFloat(String(price || '$0').replace(/[^0-9.]/g, '')) || 0;
}

function formatPrice(value) {
  return `$${value.toFixed(2)}`;
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const value = useMemo(() => ({
    items,
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
    subtotal: items.reduce((total, item) => total + (parsePrice(item.price) * item.quantity), 0),
    formattedSubtotal: formatPrice(items.reduce((total, item) => total + (parsePrice(item.price) * item.quantity), 0)),
    addItem(product, option, quantity = 1) {
      if (option?.inStock === false) {
        return;
      }

      const safeQuantity = Math.max(1, Number(quantity) || 1);
      setItems((current) => {
        const existing = current.find((item) => item.productId === product.id && item.size === option.size);
        if (existing) {
          return current.map((item) =>
            item.productId === product.id && item.size === option.size
              ? { ...item, quantity: item.quantity + safeQuantity }
              : item
          );
        }

        return [
          ...current,
          {
            productId: product.id,
            name: product.name,
            size: option.size,
            price: option.price,
            quantity: safeQuantity,
          },
        ];
      });
    },
    updateQuantity(productId, size, quantity) {
      const safeQuantity = Math.max(1, Number(quantity) || 1);
      setItems((current) =>
        current.map((item) =>
          item.productId === productId && item.size === size
            ? { ...item, quantity: safeQuantity }
            : item
        )
      );
    },
    removeItem(productId, size) {
      setItems((current) => current.filter((item) => !(item.productId === productId && item.size === size)));
    },
    clearCart() {
      setItems([]);
    },
    formatPrice,
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
