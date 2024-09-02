import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useState } from "react";
import FormField from "../components/FormField";
import { StyleSheet } from "react-native";
import CustomButton from "../components/CustomButtons";
import { router } from "expo-router";
import axios from "axios";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignUpButtonPress = async () => {
    try {
      setLoading(true);
      if (!username || !email || !password) {
        Alert.alert("Please enter email and password");
      }
      // API call to sign up
      const { data } = await axios.post("/auth/register", {
        name: username,
        email,
        password,
        profilePicture: "66d1b047b588f463a39a8938",
      });
      console.log(data && data.message);
      alert(data && data.message);
      router.navigate("sign-in");
    } catch (error) {
      console.error(error);
      alert(error.response.data.message);
    } finally {
      setLoading(false);
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
        Sign Up
      </Text>
      <FormField
        title={"Username"}
        value={username}
        handleChangeText={(text) => setUsername(text)}
        isPassword={false}
        placeHolder={"Enter Username"}
      />
      <FormField
        title={"Email"}
        value={email}
        handleChangeText={(text) => setEmail(text)}
        isPassword={false}
        placeHolder={"Enter Email"}
      />
      <FormField
        title={"Password"}
        value={password}
        handleChangeText={(text) => setPassword(text)}
        isPassword={true}
        placeHolder={"Enter Password"}
        otherStyle={{ marginTop: 10 }}
      />
      <CustomButton
        title={"Sign Up"}
        otherStyles={{ marginTop: 30 }}
        onPress={() => {
          handleSignUpButtonPress();
        }}
      />
      <View style={styles.container}>
        <Text style={styles.text}>Already have an account?</Text>
        <TouchableOpacity onPress={() => router.navigate("sign-in")}>
          <Text style={styles.link}>Sign In</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignUp;
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
