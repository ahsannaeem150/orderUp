import axios from "axios";
import { useState } from "react";
import { Buffer } from "buffer";

export const useFetchItems = (routePath) => {
  const [items, setItems] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    try {
      const response = await axios.get(routePath);
      const itemWithImages = response.data.items.map((item) => {
        if (item.image?.data) {
          const base64Data = Buffer.from(item.image.data, "binary").toString(
            "base64"
          );
          const mimeType = item.image.contentType;
          return { ...item, image: `data:${mimeType};base64,${base64Data}` };
        }
        return item;
      });
      setItems(itemWithImages);
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
