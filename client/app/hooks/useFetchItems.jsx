import axios from "axios";
import { useState } from "react";
import { useItems } from "../context/ItemContext";
export const useFetchItems = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cacheItems, getItem } = useItems();

  const fetchItemDetails = async (itemIds) => {
    try {
      const response = await axios.post("/restaurant/items/batch", {
        ids: itemIds,
      });
      cacheItems(response.data);
      return response.data;
    } catch (error) {
      setError("Failed to load items");
      throw error;
    }
  };

  const fetchItemsByRestaurant = async (restaurantId) => {
    try {
      console.log("[FETCH] Starting item fetch for restaurant:", restaurantId);
      setLoading(true);
      setError(null);

      // Get FULL items directly from the first request
      const response = await axios.get(`/restaurant/${restaurantId}/items`);
      console.log("[GET] Received response:", response.data);

      // Cache the complete items directly
      cacheItems(response.data.items);
    } catch (error) {
      console.error("[ERROR] Fetch failed:", error);
      setError(error.message);
    } finally {
      console.log("[FETCH] Finalizing load");
      setLoading(false);
    }
  };

  return {
    fetchItems: fetchItemsByRestaurant,
    getItem,
    loading,
    error,
  };
};
