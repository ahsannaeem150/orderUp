// context/OrderContext.js
import { createContext, useCallback, useContext, useState } from "react";
import axios from "axios";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [activeOrders, setActiveOrders] = useState({});
  const [historicalOrders, setHistoricalOrders] = useState({});
  const [currentOrder, setCurrentOrder] = useState(null);

  const fetchOrder = useCallback(async (orderId, isHistorical = false) => {
    try {
      const endpoint = isHistorical
        ? `/user/history/order/${orderId}`
        : `/user/orders/${orderId}`;

      const response = await axios.get(endpoint);
      const order = response.data;

      if (isHistorical) {
        setHistoricalOrders((prev) => ({ ...prev, [orderId]: order }));
      } else {
        setActiveOrders((prev) => ({ ...prev, [orderId]: order }));
      }

      return order;
    } catch (error) {
      console.error("Order fetch error:", error);
      throw error;
    }
  }, []);

  const fetchActiveOrders = useCallback(async (userId) => {
    try {
      const response = await axios.get(`/user/orders/active/${userId}`);
      const ordersMap = response.data.reduce((acc, order) => {
        acc[order._id] = order;
        return acc;
      }, {});
      setActiveOrders(ordersMap);
    } catch (error) {
      console.error("Active orders fetch error:", error);
      throw error;
    }
  }, []);

  const fetchHistoricalOrders = useCallback(async (userId) => {
    try {
      const response = await axios.get(`/user/${userId}/history/orders`);
      const ordersMap = response.data.reduce((acc, order) => {
        acc[order._id] = order;
        return acc;
      }, {});
      setHistoricalOrders(ordersMap);
    } catch (error) {
      console.error("Historical orders fetch error:", error);
      throw error;
    }
  }, []);

  const moveToHistory = useCallback(({ orderId, status }) => {
    setActiveOrders((prev) => {
      const newActive = { ...prev };
      newActive[orderId] = { ...newActive[orderId], status };
      setHistoricalOrders((prev) => ({
        ...prev,
        [orderId]: newActive[orderId],
      }));
      return newActive;
    });
  }, []);

  const updateOrdersBatch = useCallback((orders, isHistorical = false) => {
    const ordersMap = orders.reduce((acc, order) => {
      acc[order._id] = order;
      return acc;
    }, {});

    if (isHistorical) {
      setHistoricalOrders((prev) => ({ ...prev, ...ordersMap }));
    } else {
      setActiveOrders((prev) => ({ ...prev, ...ordersMap }));
    }
  }, []);

  return (
    <OrderContext.Provider
      value={{
        activeOrders,
        historicalOrders,
        fetchOrder,
        fetchActiveOrders,
        fetchHistoricalOrders,
        moveToHistory,
        updateOrdersBatch,
        currentOrder,
        setActiveOrders,
        setCurrentOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => useContext(OrderContext);
