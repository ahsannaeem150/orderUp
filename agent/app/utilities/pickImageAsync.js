import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
export const pickImageAsync = async () => {
  const [selectedImage, setSelectedImage] = useState(null);
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Sorry, we need camera roll permissions to make this work!");
      return;
    } else {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: false,
        quality: 1,
      });
      if (!result.canceled) {
        setSelectedImage(result.assets[0].uri);
      }
    }
  } catch (error) {
    console.log(error);
  }
};
