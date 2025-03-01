import axios from "axios";
import { useState } from "react";
import { Buffer } from "buffer";

export const useFetchRestaurants = (routePath) => {
  const [restaurants, setRestaurants] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get(routePath);
      setRestaurants(response.data.restaurants);
    } catch (error) {
      setError(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { restaurants, fetchRestaurants, loading, error };
};
