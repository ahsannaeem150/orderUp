import { View, Text, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useContext, useState } from "react";
import { AuthContext } from "../context/authContext";
import FormField from "../components/FormField";
import { StyleSheet } from "react-native";
import CustomButton from "../components/CustomButtons";
import { router } from "expo-router";
import axios from "axios";

const SignIn = () => {
  //GlobalState
  const { state, setState, updateState } = useContext(AuthContext);
  //Local State
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLoginButtonPress = async () => {
    try {
      setLoading(true);
      if (!email || !password) {
        Alert.alert("Please enter email and password");
      }
      //API call to SIGN IN
      const { data } = await axios.post("/auth/login", {
        email,
        password,
      });
      if (!data.success) {
        Alert.alert(data.message);
        return;
      }
      console.log("SIGN IN LOG Data => ", data);
      //Set the user to Global state
      setState({ user: data.user, token: data.token });
      updateState({ user: data.user, token: data.token });
      setLoading(false);

      //Store the token in AsyncStorage
      router.replace("(home)");
      console.log(data && data.message);
      alert(data && data.message);
    } catch (error) {
      console.log(error?.response?.data?.message);
      Alert.alert(error?.response?.data?.message);
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
        Sign In
      </Text>
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
        title={"LOGIN"}
        otherStyles={{ marginTop: 30 }}
        onPress={() => handleLoginButtonPress()}
      />
      <View style={styles.container}>
        <Text style={styles.text}>Don't have an account?</Text>
        <TouchableOpacity onPress={() => router.navigate("sign-up")}>
          <Text style={styles.link}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SignIn;
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
