// context/OrderContext.js
import { createContext, useCallback, useContext, useState } from "react";
import axios from "axios";
import { AuthContext } from "./authContext";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const { state } = useContext(AuthContext);
  const [activeOrders, setActiveOrders] = useState({});
  const [historicalOrders, setHistoricalOrders] = useState({});
  const [currentOrder, setCurrentOrder] = useState(null);

  // Fetch single order (works for both active/historical)
  const fetchOrder = useCallback(async (orderId, isHistorical = false) => {
    try {
      const endpoint = isHistorical
        ? `/restaurant/${state.restaurant._id}/orders/history/${orderId}`
        : `/restaurant/${state.restaurant._id}/orders/${orderId}`;

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

  // Fetch all active orders for user
  const fetchActiveOrders = useCallback(async (restaurantId) => {
    try {
      const response = await axios.get(
        `/restaurant/${restaurantId}/orders/active`
      );
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

  // Fetch user's historical orders
  const fetchHistoricalOrders = useCallback(async (restaurantId) => {
    try {
      const response = await axios.get(
        `/restaurant/${restaurantId}/orders/history`
      );
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

  // Move order to history (client-side)
  const moveToHistory = useCallback(({ orderId, status }) => {
    setActiveOrders((prev) => {
      const newActive = { ...prev };
      newActive[orderId] = { ...newActive[orderId], status };
      //setting historic order
      setHistoricalOrders((prev) => ({
        ...prev,
        [orderId]: newActive[orderId],
      }));
      return newActive;
    });
  }, []);

  // Batch update orders (optional)
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
