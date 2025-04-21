import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import mongoose from "mongoose";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  const [orders, setOrders] = useState({});
  const [currentOrder, setCurrentOrder] = useState({
    _id: null,
    menu: [],
  });

  const fetchOrders = async (ids) => {
    try {
      const validIds = ids.filter(
        (id) => id && mongoose.Types.ObjectId.isValid(id) && !orders[id]
      );

      if (validIds.length === 0) return;

      const response = await axios.post("/orders/batch", {
        ids: validIds,
      });

      const newOrders = response.data.reduce((acc, order) => {
        acc[order._id] = order;
        return acc;
      }, {});

      setOrders((prev) => ({ ...prev, ...newOrders }));
    } catch (error) {
      console.error("Batch fetch error:", error);
      throw error; // Propagate error to components
    }
  };

  const cacheOrders = (orders) => {
    setOrders((prev) => ({
      ...prev,
      ...orders.reduce((acc, r) => {
        acc[r._id] = r;
        return acc;
      }, {}),
    }));
  };

  const getOrder = (id) => orders[id] || null;

  return (
    <OrderContext.Provider
      value={{
        cacheOrders,
        fetchOrders,
        getOrder,
        currentOrder,
        setCurrentOrder,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => useContext(OrderContext);
