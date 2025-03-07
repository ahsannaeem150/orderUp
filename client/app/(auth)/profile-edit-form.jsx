import { View, Text, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../context/authContext";
import FormField from "../components/FormField";
import { StyleSheet } from "react-native";
import CustomButton from "../components/CustomButtons";
import { router } from "expo-router";
import axios from "axios";

const ProfileEditForm = () => {
  //GlobalState
  const { state, setState, updateState } = useContext(AuthContext);
  //Local State
  const [username, setUsername] = useState(state.user?.name);
  const [phone, setPhone] = useState(state.user?.phone);
  const [city, setCity] = useState(state.user?.address?.city);
  const [address, setAddress] = useState(state.user?.address?.address);

  const handleUpdateButtonPress = async () => {
    try {
      if (!username) {
        Alert.alert("Please enter Username");
        return;
      }
      //   API call to UPDATE
      const formData = {
        name: username,
        phone,
        address: {
          city,
          address,
        },
      };
      const { data } = await axios.put(
        `/${state.user._id}/profile/update`,
        formData
      );
      if (!data.success) {
        Alert.alert("Fail", data.message);
        return;
      }
      console.log("Data sent => ", data);
      //Set the user to Global state
      setState({ user: data.user, token: state.token });
      updateState({ user: data.user, token: state.token });
      console.log("State", state);
      router.navigate("/profile");
    } catch (error) {
      console.log(error);
      Alert.alert("Failed", error.response?.data.message);
    } finally {
    }
  };
  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text
        style={{
          fontFamily: "Poppins-ExtraBold",
          fontSize: 20,
          marginBottom: 20,
        }}
      >
        Update Profile
      </Text>
      <FormField
        title={"Email"}
        value={username}
        handleChangeText={(text) => setUsername(text)}
        isPassword={false}
        placeHolder={"Enter Username"}
      />
      <FormField
        title={"Phone"}
        value={phone}
        handleChangeText={(text) => setPhone(text)}
        placeHolder={"Enter Phone"}
        otherStyle={{ marginTop: 10 }}
      />
      <FormField
        title={"City"}
        value={city}
        handleChangeText={(text) => setCity(text)}
        placeHolder={"Enter City"}
        otherStyle={{ marginTop: 10 }}
      />
      <FormField
        title={"Address"}
        value={address}
        handleChangeText={(text) => setAddress(text)}
        placeHolder={"Enter Address"}
        otherStyle={{ marginTop: 10 }}
      />
      <CustomButton
        title={"Update"}
        otherStyles={{ marginTop: 30 }}
        onPress={() => handleUpdateButtonPress()}
      />
    </View>
  );
};

export default ProfileEditForm;
const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    paddingTop: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontSize: 18,
    color: "black",
    fontFamily: "Poppins-Regular",
  },
  link: {
    fontSize: 18,
    color: "blue",
    fontFamily: "Poppins-SemiBold",
    marginLeft: 8,
  },
});
