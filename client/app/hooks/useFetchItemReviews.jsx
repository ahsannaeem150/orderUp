import axios from "axios";
import { useState } from "react";
import { Buffer } from "buffer";

export const useFetchReviews = (routePath) => {
  const [reviews, setReviews] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    try {
      const response = await axios.get(routePath);
      const reviewWithImages = response.data.reviews.map((review) => {
        if (review.image?.data) {
          const base64Data = Buffer.from(review.image.data, "binary").toString(
            "base64"
          );
          const mimeType = review.image.contentType;
          return { ...review, image: `data:${mimeType};base64,${base64Data}` };
        }
        return review;
      });
      setReviews(reviewWithImages);
      setError(null);
    } catch (error) {
      setError(error);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { reviews, fetchReviews, loading, error };
};
