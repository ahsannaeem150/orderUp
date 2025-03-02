import axios from "axios";
import { useState } from "react";
import { useItems } from "../context/ItemContext";
export const useFetchItems = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { cacheItems, getItem, itemsCache } = useItems();

  const fetchItem = async (itemId) => {
    try {
      setLoading(true);
      setError(null);

      // Check cache first
      if (itemsCache[itemId]) {
        return itemsCache[itemId];
      }

      // Fetch from API if not in cache
      const response = await axios.get(`/restaurant/items/${itemId}`);
      const itemData = response.data.item;

      // Cache the item
      cacheItems([itemData]);

      return itemData;
    } catch (error) {
      setError(error.message);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchItemsBatch = async (itemIds) => {
    setLoading(true);
    const neededIds = itemIds.filter((id) => !itemsCache[id]);

    if (neededIds.length > 0) {
      const response = await axios.post("/restaurant/items/batch", {
        ids: neededIds,
      });
      cacheItems(response.data);
    }
    setLoading(false);
    return itemIds.map((id) => itemsCache[id]);
  };

  return {
    getItem,
    itemsCache,
    fetchItem,
    fetchItemsBatch,
    loading,
    error,
  };
};
