import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import { Buffer } from "buffer"; // Ensure to install buffer if not already present

const useFetchImage = (routePath) => {
  const { state } = useContext(AuthContext);
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchImage = async () => {
    if (!state?.restaurant?._id) return;

    setLoading(true);
    setError(null);

    try {
      const image = await axios.get(routePath, {
        responseType: "arraybuffer",
      });

      if (image) {
        const base64Data = Buffer.from(image.data, "binary").toString("base64");
        const mimeType = image.headers["content-type"];
        setImageUri(`data:${mimeType};base64,${base64Data}`);
      }
    } catch (error) {
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImage();
  }, [state]);

  return { imageUri, loading, error, fetchImage };
};

export default useFetchImage;
