import React, { createContext, useContext, useState } from "react";
import axios from "axios";
import mongoose from "mongoose";

const RestaurantContext = createContext();

export const RestaurantProvider = ({ children }) => {
  const [restaurants, setRestaurants] = useState({});
  const [currentRestaurant, setCurrentRestaurant] = useState({
    _id: null,
    menu: [],
  });

  const fetchRestaurants = async (ids) => {
    try {
      // Filter valid MongoDB IDs and check cache
      const validIds = ids.filter(
        (id) => id && mongoose.Types.ObjectId.isValid(id) && !restaurants[id]
      );

      if (validIds.length === 0) return;

      const response = await axios.post("/restaurants/batch", {
        restaurantIds: validIds,
      });

      const newRestaurants = response.data.reduce((acc, restaurant) => {
        acc[restaurant._id] = restaurant;
        return acc;
      }, {});

      setRestaurants((prev) => ({ ...prev, ...newRestaurants }));
    } catch (error) {
      console.error("Batch fetch error:", error);
      throw error;
    }
  };

  const cacheRestaurants = (restaurants) => {
    setRestaurants((prev) => ({
      ...prev,
      ...restaurants.reduce((acc, r) => {
        acc[r._id] = r;
        return acc;
      }, {}),
    }));
  };

  const getRestaurant = (id) => restaurants[id] || null;

  return (
    <RestaurantContext.Provider
      value={{
        cacheRestaurants,
        fetchRestaurants,
        getRestaurant,
        currentRestaurant,
        setCurrentRestaurant,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
};

export const useRestaurant = () => useContext(RestaurantContext);
