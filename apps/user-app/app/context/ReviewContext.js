import { createContext, useContext, useState } from "react";

const ReviewContext = createContext();

export const ReviewProvider = ({ children }) => {
  const [reviewsCache, setReviewsCache] = useState({});

  const getReviews = (itemId) => reviewsCache[itemId] || [];

  const cacheReviews = (itemId, reviews) => {
    setReviewsCache((prev) => ({
      ...prev,
      [itemId]: reviews,
    }));
  };

  return (
    <ReviewContext.Provider value={{ getReviews, cacheReviews, reviewsCache }}>
      {children}
    </ReviewContext.Provider>
  );
};

export const useReviews = () => useContext(ReviewContext);
