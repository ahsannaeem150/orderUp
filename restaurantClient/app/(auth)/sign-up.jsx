import { View, Text, TouchableOpacity, Alert } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import FormField from "../components/FormField";
import { StyleSheet } from "react-native";
import CustomButton from "../components/CustomButtons";
import { router } from "expo-router";
import axios from "axios";
import { AuthContext } from "../context/authContext";

const SignUp = () => {
  const { state, setState } = useContext(AuthContext);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignUpButtonPress = async () => {
    try {
      if (!username) {
        return Alert.alert("Please enter username");
      }
      if (!email) {
        return Alert.alert("Please enter email");
      }
      if (!password) {
        return Alert.alert("Please enter password");
      }
      setState({
        restaurant: {
          name: username,
          email,
          password,
        },
        token: "",
      });
      router.push("sign-up-detail");
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
