import React, { useContext, useState } from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { AntDesign } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import axios from "axios";
import { AuthContext } from "../context/authContext";
import colors from "../../constants/colors";

const UploadImageButton = ({ style }) => {
  const { state, setState, updateState } = useContext(AuthContext);

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

        const file = {
          uri,
          type: `image/${uri.split(".").pop()}`,
          name: `photo.${uri.split(".").pop()}`,
        };

        const formData = new FormData();
        formData.append("image", file);

        const response = await axios.put(
          `/${state.user._id}/profile/image`,
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
      <AntDesign name="edit" size={16} color={colors.textInverted} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 28,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
  },
});

export default UploadImageButton;
