import axios from "axios";
import { useState } from "react";
import { Buffer } from "buffer";

export const useFetchRestaurants = (routePath) => {
  const [restaurants, setRestaurants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const convertTobase64 = (image) => {
    if (image?.data) {
      const base64Data = Buffer.from(image.data, "binary").toString("base64");
      const mimeType = image.contentType;
      return { base64Data, mimeType };
    }
    return null;
  };

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(routePath);
      const restaurantWithImages = response.data.restaurants.map(
        (restaurant) => {
          let processedRestaurant = { ...restaurant };

          if (restaurant.logo?.data) {
            const { base64Data: logoBase64Data, mimeType: logoMimeType } =
              convertTobase64(restaurant.logo);
            processedRestaurant.logo = `data:${logoMimeType};base64,${logoBase64Data}`;
          }

          if (restaurant.thumbnail?.data) {
            const {
              base64Data: thumbnailBase64Data,
              mimeType: thumbnailMimeType,
            } = convertTobase64(restaurant.thumbnail);
            processedRestaurant.thumbnail = `data:${thumbnailMimeType};base64,${thumbnailBase64Data}`;
          }

          return processedRestaurant;
        }
      );
      console.log("FETCHING");
      setRestaurants(restaurantWithImages);
      setError(null);
    } catch (error) {
      setError(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { restaurants, fetchRestaurants, loading, error };
};
