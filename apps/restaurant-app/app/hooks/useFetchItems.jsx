import axios from "axios";
import { useState } from "react";

export const useFetchItems = (routePath) => {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get(routePath);
      const items = response.data.items;
      setItems(items);
      setError(null);
    } catch (error) {
      setError(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { items, fetchItems, loading, error };
};
