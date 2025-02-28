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
        const ordersWithLogo = response.data.map((order) => {
          if (order.restaurant?.logo?.data) {
            const base64Data = Buffer.from(
              order.restaurant.logo.data,
              "binary"
            ).toString("base64");
            const mimeType = order.restaurant.logo.contentType;
            return {
              ...order,
              restaurant: {
                ...order.restaurant,
                logo: `data:${mimeType};base64,${base64Data}`,
              },
            };
          }
          return order;
        });
        setActiveOrders(ordersWithLogo);
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
