import { View, Text, TouchableOpacity, Alert, ScrollView } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import FormField from "../components/FormField";
import { StyleSheet } from "react-native";
import CustomButton from "../components/CustomButtons";
import { router } from "expo-router";
import axios from "axios";
import { AuthContext } from "../context/authContext";
const SignUpDetail = () => {
  const { state, setState } = useContext(AuthContext);
  const [name, setName] = useState(state.restaurant.name);
  const [username, setUsername] = useState(state.restaurant.name);
  const [email, setEmail] = useState(state.restaurant.email);
  const [password, setPassword] = useState(state.restaurant.password);
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  const handleSignUpButtonPress = async () => {
    try {
      if (!name) {
        return Alert.alert("Please enter Name");
      }
      if (!phone) {
        return Alert.alert("Please enter Phone number");
      }
      if (!city) {
        return Alert.alert("Please enter city");
      }
      if (!address) {
        return Alert.alert("Please enter address");
      }

      //   API call to sign up
      const { data } = await axios.post("/auth/register/restaurant", {
        name: username,
        email,
        password,
        logo: "66d1b047b588f463a39a8938",
        thumbnail: "66d22427146a2944b59386ec",
        phone,
        city,
        address,
      });

      console.log("Return data", data.restaurant);
      setState({
        restaurant: data.restaurant,
        token: "",
      });
      router.push("sign-in");
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    } finally {
    }
  };
  useEffect(() => {
    console.log("State=> , ", state);
  }, [state]);
  return (
    <ScrollView>
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          marginTop: 100,
          alignItems: "center",
          marginBottom: 50,
        }}
      >
        <Text
          style={{
            fontFamily: "Poppins-ExtraBold",
            fontSize: 20,
            marginBottom: 20,
          }}
        >
          Sign Up
        </Text>
        <FormField
          title={"Name"}
          value={name}
          handleChangeText={(text) => setName(text)}
          isPassword={false}
          placeHolder={"Enter Phone"}
        />
        <FormField
          title={"Phone"}
          value={phone}
          handleChangeText={(text) => setPhone(text)}
          isPassword={false}
          placeHolder={"Enter Phone"}
        />
        <FormField
          title={"City"}
          value={city}
          handleChangeText={(text) => setCity(text)}
          isPassword={false}
          placeHolder={"Enter City"}
        />
        <FormField
          title={"Address"}
          value={address}
          handleChangeText={(text) => setAddress(text)}
          placeHolder={"Enter Address"}
          otherStyle={{ marginTop: 10 }}
        />
        <CustomButton
          title={"Sign Up"}
          otherStyles={{ marginTop: 30 }}
          onPress={() => {
            handleSignUpButtonPress();
          }}
        />
      </View>
    </ScrollView>
  );
};

export default SignUpDetail;
