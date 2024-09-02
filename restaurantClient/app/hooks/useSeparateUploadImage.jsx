import React, { useContext, useState } from "react";
import { TouchableOpacity, StyleSheet, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { AuthContext } from "../context/authContext";

// Reusable function for uploading images
const useUploadImage = () => {
  const { state, setState } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);

  // Function to select the image
  const selectImage = async () => {
    try {
      // Request permissions to access the camera roll
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera roll permissions to make this work!");
        return;
      }

      // Launch the image picker
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;

        // Convert the image URI to a file object
        const file = {
          uri,
          type: `image/${uri.split(".").pop()}`,
          name: `photo.${uri.split(".").pop()}`,
        };

        // Set the selected image file to state
        setSelectedImage(file);
      }
    } catch (error) {
      console.log("Error selecting image:", error.message);
      throw error;
    }
  };

  // Function to upload the selected image
  const uploadImage = async (routePath) => {
    try {
      if (!selectedImage) {
        alert("No image selected!");
        return;
      }

      // Create FormData object
      const formData = new FormData();
      formData.append("image", selectedImage);

      // Upload the image using the dynamic routePath
      const response = await axios.put(routePath, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload Success:", response.data);

      // Update the context state (e.g., after uploading the restaurant's logo)
      setState({ ...state, restaurant: response.data.restaurant });

      return response.data;
    } catch (error) {
      console.log(
        "Error uploading image:",
        error.response?.data?.message || error.message
      );
      throw error;
    }
  };

  return { selectImage, uploadImage, selectedImage };
};

// Button component using the upload function
const UploadImageButton = ({ routePath, style, children }) => {
  const { selectImage, uploadImage, selectedImage } = useUploadImage();

  return (
    <TouchableOpacity style={style} onPress={selectImage}>
      {selectedImage ? (
        <Text style={{ fontSize: 16, color: "#999" }}>Image Selected</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
};

export default UploadImageButton;
export { useUploadImage };
