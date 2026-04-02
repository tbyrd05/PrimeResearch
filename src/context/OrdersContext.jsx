import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const OrdersContext = createContext(null);
const ORDERS_KEY = 'prime-research-orders';
const SENT_CLEANUP_KEY = 'prime-research-sent-cleanup-v1';
const ORDER_RESET_KEY = 'prime-research-order-reset-v1';

function readOrders() {
  const stored = window.localStorage.getItem(ORDERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function mergeOrder(currentOrders, incomingOrder) {
  const existingIndex = currentOrders.findIndex((order) => order.id === incomingOrder.id);
  const normalizedOrder = {
    ...incomingOrder,
    status: incomingOrder.status || 'Pending',
    paymentStatus: incomingOrder.paymentStatus || 'Awaiting Confirmation',
    accountEmail: incomingOrder.accountEmail || incomingOrder.customer?.email?.toLowerCase?.() || '',
  };

  if (existingIndex === -1) {
    return [normalizedOrder, ...currentOrders];
  }

  return currentOrders.map((order, index) => (
    index === existingIndex
      ? {
          ...order,
          ...normalizedOrder,
          customer: normalizedOrder.customer || order.customer,
          items: normalizedOrder.items || order.items,
          nowPayments: normalizedOrder.nowPayments || order.nowPayments,
          payment: normalizedOrder.payment || order.payment,
        }
      : order
  ));
}

export function OrdersProvider({ children }) {
  const [orders, setOrders] = useState(() => {
    const existingOrders = readOrders();
    const didCleanupSentOrders = window.localStorage.getItem(SENT_CLEANUP_KEY) === 'done';
    const didResetOrders = window.localStorage.getItem(ORDER_RESET_KEY) === 'done';

    if (!didResetOrders) {
      window.localStorage.setItem(ORDER_RESET_KEY, 'done');
      window.localStorage.setItem(ORDERS_KEY, JSON.stringify([]));
      return [];
    }

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
      setOrders((current) => mergeOrder(current, order));
    },
    upsertOrder(order) {
      setOrders((current) => mergeOrder(current, order));
    },
    updateOrderPayment(orderId, updates) {
      setOrders((current) =>
        current.map((order) => (order.id === orderId ? { ...order, ...updates } : order))
      );
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
