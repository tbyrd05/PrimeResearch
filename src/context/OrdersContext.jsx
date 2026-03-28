import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const OrdersContext = createContext(null);
const ORDERS_KEY = 'prime-research-orders';
const SENT_CLEANUP_KEY = 'prime-research-sent-cleanup-v1';

function readOrders() {
  const stored = window.localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const existingOrders = readOrders();
    const didCleanupSentOrders = window.localStorage.getItem(SENT_CLEANUP_KEY) === 'done';

    if (didCleanupSentOrders) {
      return existingOrders;
    }

    const cleanedOrders = existingOrders.filter((order) => order.status !== 'Sent');
    window.localStorage.setItem(SENT_CLEANUP_KEY, 'done');
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(cleanedOrders));
    return cleanedOrders;
  });

  useEffect(() => {
    window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders]);

  const value = useMemo(() => ({
    orders,
    placeOrder(order) {
      setOrders((current) => [{ ...order, status: order.status || 'Pending' }, ...current]);
    },
    updateOrderStatus(orderId, status) {
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, status } : order))
      );
    },
  }), [orders]);

  return <OrdersContext.Provider value={value}>{children}</OrdersContext.Provider>;
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
