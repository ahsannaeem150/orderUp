import axios from "axios";
import {useReviews} from "../context/ReviewContext";
import {useState} from "react";

export const useFetchReviews = (itemId) => {
    const {getReviews, cacheReviews} = useReviews();
    const [reviewsLoading, setReviewsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchReviews = async () => {
        try {
            setReviewsLoading(true);
            const response = await axios.get(`/restaurant/item/${itemId}/reviews`);
            const reviews = response.data.reviews;
            cacheReviews(itemId, reviews);
            return reviews;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setReviewsLoading(false);
        }
    };

    return {
        reviews: getReviews(itemId) || [],
        fetchReviews,
        reviewsLoading,
        error,
    };
};
