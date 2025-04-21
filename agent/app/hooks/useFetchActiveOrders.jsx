import axios from "axios";
import { useState } from "react";
import { Buffer } from "buffer";

export const useFetchActiveOrders = (routePath) => {
  const [activeOrders, setActiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchActiveOrders = async () => {
    try {
      const response = await axios.get(routePath);

      if (response.data.length === 0) {
        setActiveOrders([]);
      } else {
        const ordersResponse = response.data.map((order) => {
          if (order.restaurant?.logo?.data) {
            return {
              ...order,
              restaurant: {
                ...order.restaurant,
              },
            };
          }
          return order;
        });
        console.log(ordersResponse);
        setActiveOrders(ordersResponse);
      }
      setError(null);
    } catch (error) {
      setError("Failed to fetch active orders");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { activeOrders, fetchActiveOrders, loading, error };
};
