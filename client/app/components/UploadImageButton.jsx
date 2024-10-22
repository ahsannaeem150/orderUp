import React, { useContext, useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { AuthContext } from "../context/authContext";

const UploadImageButton = ({ style }) => {
  const { state, setState, updateState } = useContext(AuthContext);
  const [selectedImage, setSelectedImage] = useState(null);

  const pickImageAsync = async () => {
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
        setSelectedImage(uri);

        // Convert the image URI to a file
        const file = {
          uri,
          type: `image/${uri.split(".").pop()}`,
          name: `photo.${uri.split(".").pop()}`,
        };

        // Create FormData object
        const formData = new FormData();
        formData.append("image", file);

        // Upload the image
        const response = await axios.put(
          `/auth/${state.user._id}/profile/image`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );

        console.log("Returned User=>", response.data.user);
        setState({ ...state, user: response.data.user });
        updateState({ ...state, user: response.data.user });
      }
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  };

  return (
    <TouchableOpacity style={[styles.button, style]} onPress={pickImageAsync}>
      <MaterialIcons name="add" size={20} color="black" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 30,
    height: 30,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "blue", // Change based on your design
  },
});

export default UploadImageButton;
