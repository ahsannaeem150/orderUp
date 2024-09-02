import {
  View,
  Text,
  Alert,
  ScrollView,
  TouchableOpacity,
  Image,
} from "react-native";
import React, { useState, useContext } from "react";
import FormField from "../components/FormField";
import CustomButton from "../components/CustomButtons";
import axios from "axios";
import { StyleSheet } from "react-native";
import { useUploadImage } from "../hooks/useSeparateUploadImage";
import { AuthContext } from "../context/authContext";
import { router } from "expo-router";
import { useFetchItems } from "../hooks/useFetchItems";

const AddItemDetail = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Food");
  const [availability, setAvailability] = useState(true);
  const { state } = useContext(AuthContext);
  const { selectImage, selectedImage } = useUploadImage();
  const { fetchItems } = useFetchItems(
    `/auth/restaurant/${state.restaurant._id}/items`
  );

  const handleAddItemButtonPress = async () => {
    try {
      if (!name) return Alert.alert("Please enter Item Name");
      if (!price) return Alert.alert("Please enter Item Price");
      if (!description) return Alert.alert("Please enter Item Description");
      if (!selectedImage) return Alert.alert("Please select an image");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", parseFloat(price));
      formData.append("category", category);
      formData.append("availability", availability.toString());

      formData.append("image", selectedImage);

      const { data } = await axios.post(
        `/auth/restaurant/${state.restaurant._id}/menuitems`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      router.replace("/home");
      Alert.alert("Item added successfully!");
      console.log("Return data", data);
    } catch (error) {
      console.error(error);
      Alert.alert(error.response?.data?.message || "Error adding item");
    }
  };

  return (
    <ScrollView>
      <View style={styles.container}>
        <Text style={styles.title}>Add Item</Text>
        <FormField
          title={"Item Name"}
          value={name}
          handleChangeText={(text) => setName(text)}
          isPassword={false}
          placeHolder={"Enter Item Name"}
        />
        <FormField
          title={"Description"}
          value={description}
          handleChangeText={(text) => setDescription(text)}
          isPassword={false}
          placeHolder={"Enter Item Description"}
        />
        <FormField
          title={"Price"}
          value={price}
          handleChangeText={(text) => setPrice(text)}
          isPassword={false}
          placeHolder={"Enter Price"}
          keyboardType="numeric"
        />
        <FormField
          title={"Category"}
          value={category}
          handleChangeText={(text) => setCategory(text)}
          isPassword={false}
          placeHolder={"Enter Category (e.g. Food, Drink)"}
        />

        {/* Select Image Button */}
        <TouchableOpacity onPress={selectImage} style={styles.coverImage}>
          <View style={styles.coverImageContainer}>
            {selectedImage ? (
              <Image
                source={{ uri: selectedImage.uri }}
                resizeMode="contain"
                style={styles.image}
              />
            ) : (
              <Text style={styles.placeholderText}>Add Image</Text>
            )}
          </View>
        </TouchableOpacity>

        {/* Add Item Button */}
        <CustomButton
          title={"Add Item"}
          otherStyles={{ marginTop: 30 }}
          onPress={handleAddItemButtonPress}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    marginTop: 100,
    alignItems: "center",
    marginBottom: 50,
  },
  title: {
    fontFamily: "Poppins-ExtraBold",
    fontSize: 20,
    marginBottom: 20,
  },
  coverImage: {
    width: "80%",
    height: 100,
    borderWidth: 2,
    borderColor: "#d9d9d9",
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "white",
  },
  coverImageContainer: {
    width: "80%",
    height: "80%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 16,
    color: "#999",
  },
  image: {
    width: "100%",
    height: "100%",
  },
});

export default AddItemDetail;
