import axios from "axios";
import { useState } from "react";
import { Buffer } from "buffer";

export const useFetchItem = (routePath) => {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItem = async () => {
    try {
      const response = await axios.get(routePath);
      const fetchedItem = response.data.item;
      if (fetchedItem.image?.data) {
        const base64Data = Buffer.from(
          fetchedItem.image.data,
          "binary"
        ).toString("base64");
        const mimeType = fetchedItem.image.contentType;
        const itemWithImage = {
          ...fetchedItem,
          image: `data:${mimeType};base64,${base64Data}`,
        };
        setItem(itemWithImage);
        console.log("ITEM WITH IMAGE", itemWithImage);
      } else {
        setItem(fetchedItem);
      }

      setError(null);
    } catch (error) {
      setError(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { item, fetchItem, loading, error };
};
