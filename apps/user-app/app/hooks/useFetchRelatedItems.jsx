import { useState, useEffect } from "react";
import axios from "axios";

export const useFetchRelatedItems = (itemId) => {
  const [relatedItems, setRelatedItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedItems = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/recommendations/${itemId}`);
        setRelatedItems(data.recommendations);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (itemId) {
      fetchRelatedItems();
    }
  }, [itemId]);

  return { relatedItems, loading, error };
};
