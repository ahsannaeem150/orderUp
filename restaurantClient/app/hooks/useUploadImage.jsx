import React, { useContext, useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { AuthContext } from "../context/authContext";

// Reusable function for uploading images
const useUploadImage = () => {
  const { state, setState } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);

  const uploadImage = async (routePath) => {
    try {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;

        // Convert the image URI to a file
        const file = {
          uri,
          type: `image/${uri.split(".").pop()}`,
          name: `photo.${uri.split(".").pop()}`,
        };

        setSelectedImage(file);
        // Create FormData object
        const formData = new FormData();
        formData.append("image", file);

        // Upload the image using dynamic routePath
        const response = await axios.put(routePath, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        console.log("Upload Success:", response.data);

        // Update the context state (for example, after uploading a restaurant's logo)
        setState({ ...state, restaurant: response.data.restaurant });
        return response.data;
      }
    } catch (error) {
      console.log(
        "Error uploading image:",
        error.response?.data?.message || error.message
      );
      throw error;
    }
  };

  return { uploadImage, selectedImage };
};

// Button component using the upload function
const UploadImageButton = ({ routePath, style, children }) => {
  const { uploadImage } = useUploadImage();

  return (
    <TouchableOpacity style={style} onPress={() => uploadImage(routePath)}>
      {children}
    </TouchableOpacity>
  );
};

export default UploadImageButton;
export { useUploadImage };
